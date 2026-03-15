"""Shared pytest fixtures for the backend test suite."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User
from app.auth import hash_password
from app.main import app

# ── In-memory SQLite for tests ────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh in-memory DB for each test function."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """TestClient with in-memory DB, no ML model required."""
    app.dependency_overrides[get_db] = override_get_db
    # seed admin
    Base.metadata.create_all(bind=engine)
    existing = db_session.query(User).filter(User.login == "admin").first()
    if existing is None:
        admin = User(
            first_name="Admin",
            last_name="System",
            login="admin",
            password_hash=hash_password("admin"),
            role="admin",
        )
        db_session.add(admin)
        db_session.commit()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def auth_headers(client: TestClient, username: str = "admin", password: str = "admin") -> dict:
    """Helper: login and return Authorization header with Bearer token."""
    resp = client.post("/auth/login", data={"username": username, "password": password})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
