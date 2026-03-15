"""Test suite for admin endpoints."""
import pytest
from fastapi.testclient import TestClient


def get_admin_token(client: TestClient) -> str:
    """Helper: login as admin and return Bearer token."""
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def get_user_token(client: TestClient, login: str, password: str) -> str:
    """Helper: login as a user and return Bearer token."""
    response = client.post(
        "/auth/login",
        data={"username": login, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_admin_can_create_user(client: TestClient) -> None:
    """Test that admin can create a new user."""
    token = get_admin_token(client)
    response = client.post(
        "/admin/users",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "login": "johndoe",
            "password": "password123",
            "role": "user",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["login"] == "johndoe"
    assert data["role"] == "user"
    assert "password_hash" not in data  # password should not be returned


def test_admin_can_create_admin_user(client: TestClient) -> None:
    """Test that admin can create another admin user."""
    token = get_admin_token(client)
    response = client.post(
        "/admin/users",
        json={
            "first_name": "Alice",
            "last_name": "Admin",
            "login": "alicead",
            "password": "securepass",
            "role": "admin",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "admin"


def test_duplicate_login_rejected(client: TestClient) -> None:
    """Test that creating a user with duplicate login fails."""
    token = get_admin_token(client)

    # Create first user
    response = client.post(
        "/admin/users",
        json={
            "first_name": "User1",
            "last_name": "One",
            "login": "samelogin",
            "password": "pass1",
            "role": "user",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201

    # Try to create user with same login
    response = client.post(
        "/admin/users",
        json={
            "first_name": "User2",
            "last_name": "Two",
            "login": "samelogin",
            "password": "pass2",
            "role": "user",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_invalid_role_rejected(client: TestClient) -> None:
    """Test that invalid role value is rejected."""
    token = get_admin_token(client)
    response = client.post(
        "/admin/users",
        json={
            "first_name": "Invalid",
            "last_name": "Role",
            "login": "invalidrole",
            "password": "password",
            "role": "superuser",  # invalid role
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422
    assert "role must be" in response.json()["detail"]


def test_non_admin_user_cannot_create_user(client: TestClient) -> None:
    """Test that a regular user cannot create new users."""
    admin_token = get_admin_token(client)

    # Create a regular user
    response = client.post(
        "/admin/users",
        json={
            "first_name": "Regular",
            "last_name": "User",
            "login": "regularuser",
            "password": "password",
            "role": "user",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201

    # Login as regular user
    user_token = get_user_token(client, "regularuser", "password")

    # Try to create another user — should fail
    response = client.post(
        "/admin/users",
        json={
            "first_name": "Another",
            "last_name": "User",
            "login": "anotheruser",
            "password": "password",
            "role": "user",
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 403
    assert "admin role required" in response.json()["detail"]


def test_unauthenticated_cannot_create_user(client: TestClient) -> None:
    """Test that unauthenticated requests cannot create users."""
    response = client.post(
        "/admin/users",
        json={
            "first_name": "Unauth",
            "last_name": "User",
            "login": "unauthuser",
            "password": "password",
            "role": "user",
        },
    )
    assert response.status_code == 401


def test_missing_required_fields(client: TestClient) -> None:
    """Test that missing required fields are rejected."""
    token = get_admin_token(client)
    response = client.post(
        "/admin/users",
        json={
            "first_name": "Incomplete",
            # missing last_name
            "login": "incomp",
            "password": "password",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422
