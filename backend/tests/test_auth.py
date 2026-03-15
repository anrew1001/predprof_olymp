"""Test suite for authentication endpoints."""
import pytest
from fastapi.testclient import TestClient


def test_login_success(client: TestClient) -> None:
    """Test successful login with admin credentials."""
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 0


def test_login_wrong_password(client: TestClient) -> None:
    """Test login with wrong password."""
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_login_unknown_user(client: TestClient) -> None:
    """Test login with non-existent user."""
    response = client.post(
        "/auth/login",
        data={"username": "nonexistent", "password": "anypassword"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_login_missing_username(client: TestClient) -> None:
    """Test login with missing username field."""
    response = client.post(
        "/auth/login",
        data={"password": "admin"},
    )
    assert response.status_code == 422


def test_login_missing_password(client: TestClient) -> None:
    """Test login with missing password field."""
    response = client.post(
        "/auth/login",
        data={"username": "admin"},
    )
    assert response.status_code == 422


def test_token_type_is_bearer(client: TestClient) -> None:
    """Test that returned token type is 'bearer'."""
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["token_type"].lower() == "bearer"
