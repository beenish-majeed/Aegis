import os
import tempfile
import time
import pytest
from fastapi.testclient import TestClient
from aegis.main import app
from aegis.db import initialize_database, get_user_by_email
from aegis.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    get_jwt_secret,
)


@pytest.fixture
def temp_db(monkeypatch):
    """Fixture to set up an isolated temporary SQLite database for each test."""
    temp_dir = tempfile.mkdtemp()
    db_path = os.path.join(temp_dir, "test_auth.db")
    monkeypatch.setenv("AEGIS_DATABASE_PATH", db_path)
    initialize_database(db_path)
    yield db_path

    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except OSError:
            pass
    if os.path.exists(temp_dir):
        try:
            os.rmdir(temp_dir)
        except OSError:
            pass


@pytest.fixture
def client(temp_db):
    """FastAPI TestClient configured with isolated database."""
    return TestClient(app)


def test_successful_registration(client, temp_db):
    response = client.post(
        "/api/auth/register",
        json={"email": "newuser@example.com", "password": "securepassword123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@example.com"
    assert "id" in data["user"]
    assert "hashed_password" not in data["user"]
    assert "password" not in data["user"]


def test_password_is_hashed_and_never_stored_plaintext(client, temp_db):
    raw_password = "MySuperPassword123!"
    response = client.post(
        "/api/auth/register",
        json={"email": "hashcheck@example.com", "password": raw_password},
    )
    assert response.status_code == 201

    db_user = get_user_by_email("hashcheck@example.com", db_path=temp_db)
    assert db_user is not None
    assert db_user["hashed_password"] != raw_password
    assert db_user["hashed_password"].startswith("$2b$") or db_user["hashed_password"].startswith("$2a$")
    assert verify_password(raw_password, db_user["hashed_password"])


def test_email_normalization(client, temp_db):
    response = client.post(
        "/api/auth/register",
        json={"email": "  MixedCase_User@Example.COM  ", "password": "password123"},
    )
    assert response.status_code == 201
    assert response.json()["user"]["email"] == "mixedcase_user@example.com"

    db_user = get_user_by_email("mixedcase_user@example.com", db_path=temp_db)
    assert db_user is not None


def test_duplicate_email_registration(client, temp_db):
    client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/register",
        json={"email": "DUP@EXAMPLE.COM", "password": "anotherpassword123"},
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_invalid_email(client, temp_db):
    response = client.post(
        "/api/auth/register",
        json={"email": "not-an-email", "password": "password123"},
    )
    assert response.status_code == 400
    assert "Invalid email" in response.json()["detail"]


def test_weak_invalid_password(client, temp_db):
    response = client.post(
        "/api/auth/register",
        json={"email": "weakpass@example.com", "password": "short"},
    )
    assert response.status_code == 400
    assert "at least 8 characters" in response.json()["detail"]


def test_successful_login(client, temp_db):
    client.post(
        "/api/auth/register",
        json={"email": "loginuser@example.com", "password": "validpassword123"},
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "LOGINUSER@EXAMPLE.COM", "password": "validpassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "loginuser@example.com"


def test_incorrect_password(client, temp_db):
    client.post(
        "/api/auth/register",
        json={"email": "loginuser2@example.com", "password": "validpassword123"},
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "loginuser2@example.com", "password": "wrongpassword!"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_nonexistent_user_login(client, temp_db):
    response = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "somepassword123"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_jwt_generation_and_decoding():
    user_id = "user-test-uuid-1234"
    token = create_access_token({"sub": user_id}, expires_seconds=3600)
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload["sub"] == user_id
    assert "exp" in payload
    assert payload["exp"] > time.time()


def test_invalid_jwt_rejection():
    with pytest.raises(Exception):
        decode_access_token("invalid.jwt.token.string")


def test_expired_jwt_rejection():
    expired_token = create_access_token({"sub": "user-expired"}, expires_seconds=-10)
    with pytest.raises(Exception) as exc_info:
        decode_access_token(expired_token)
    assert "expired" in str(exc_info.value.detail).lower()


def test_me_endpoint_valid_token(client, temp_db):
    reg_res = client.post(
        "/api/auth/register",
        json={"email": "me_user@example.com", "password": "password123"},
    )
    token = reg_res.json()["token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me_user@example.com"
    assert "id" in data


def test_me_endpoint_without_token(client, temp_db):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_endpoint_invalid_token(client, temp_db):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.token.value"},
    )
    assert response.status_code == 401


def test_logout_endpoint(client, temp_db):
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
