"""Tests for user creation endpoint."""
from .conftest import VALID_USER


def test_create_user_success(client):
    r = client.post("/api/users", json=VALID_USER)
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_create_user_returns_user_object(client):
    r = client.post("/api/users", json=VALID_USER)
    user = r.json().get("user", {})
    assert user["email"] == VALID_USER["email"]
    assert user["nom"] == VALID_USER["nom"]
    assert user["plan"] == "free"
    assert "trial_ends_at" in user
    assert "password_hash" not in user  # sensitive field must be stripped


def test_create_user_duplicate_email(client):
    client.post("/api/users", json=VALID_USER)
    r = client.post("/api/users", json=VALID_USER)
    assert r.status_code == 400
    assert "existe" in r.json()["detail"].lower()


def test_create_user_password_too_short(client):
    data = {**VALID_USER, "password": "short"}
    r = client.post("/api/users", json=data)
    assert r.status_code == 422  # Pydantic validation error


def test_create_user_invalid_email(client):
    data = {**VALID_USER, "email": "not-an-email"}
    r = client.post("/api/users", json=data)
    assert r.status_code == 422
