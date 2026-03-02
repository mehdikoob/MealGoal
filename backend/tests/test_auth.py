"""Tests for authentication endpoints."""
import uuid
from datetime import datetime, timedelta

import pytest

from .conftest import VALID_USER


def _register(client):
    """Helper: create a user and return the token."""
    r = client.post("/api/users", json=VALID_USER)
    assert r.status_code == 200
    return r.json()["access_token"]


# ── Login ──────────────────────────────────────────────────────────────────────

def test_login_success(client):
    _register(client)
    r = client.post("/api/auth/login", json={
        "email": VALID_USER["email"],
        "password": VALID_USER["password"],
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    _register(client)
    r = client.post("/api/auth/login", json={
        "email": VALID_USER["email"],
        "password": "wrongpassword",
    })
    assert r.status_code == 401


def test_login_unknown_email(client):
    r = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "password123",
    })
    assert r.status_code == 401


# ── /api/auth/me ───────────────────────────────────────────────────────────────

def test_get_me_with_valid_token(client):
    token = _register(client)
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == VALID_USER["email"]


def test_get_me_without_token(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 403  # HTTPBearer returns 403 when no token


# ── Forgot password ────────────────────────────────────────────────────────────

def test_forgot_password_unknown_email_returns_200(client):
    """Anti-enumeration: always return 200 regardless of whether email exists."""
    r = client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
    assert r.status_code == 200
    assert "message" in r.json()


def test_forgot_password_known_email_returns_200(client):
    _register(client)
    r = client.post("/api/auth/forgot-password", json={"email": VALID_USER["email"]})
    assert r.status_code == 200


def test_forgot_password_creates_token_in_db(client):
    from server import reset_tokens_collection
    _register(client)
    client.post("/api/auth/forgot-password", json={"email": VALID_USER["email"]})
    token_doc = reset_tokens_collection.find_one({"email": VALID_USER["email"]})
    assert token_doc is not None
    assert token_doc["used"] is False


# ── Reset password ─────────────────────────────────────────────────────────────

def test_reset_password_invalid_token(client):
    r = client.post("/api/auth/reset-password", json={
        "token": "invalid-token",
        "new_password": "newpassword123",
    })
    assert r.status_code == 400


def test_reset_password_valid_flow(client):
    from server import reset_tokens_collection, users_collection
    _register(client)
    user = users_collection.find_one({"email": VALID_USER["email"]})

    token = str(uuid.uuid4())
    reset_tokens_collection.insert_one({
        "token": token,
        "user_id": user["id"],
        "email": user["email"],
        "expires_at": datetime.utcnow() + timedelta(hours=1),
        "used": False,
        "created_at": datetime.utcnow().isoformat(),
    })

    r = client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": "brandnewpass99",
    })
    assert r.status_code == 200

    # Old password no longer works
    r = client.post("/api/auth/login", json={
        "email": VALID_USER["email"],
        "password": VALID_USER["password"],
    })
    assert r.status_code == 401

    # New password works
    r = client.post("/api/auth/login", json={
        "email": VALID_USER["email"],
        "password": "brandnewpass99",
    })
    assert r.status_code == 200


def test_reset_password_token_cannot_be_reused(client):
    from server import reset_tokens_collection, users_collection
    _register(client)
    user = users_collection.find_one({"email": VALID_USER["email"]})

    token = str(uuid.uuid4())
    reset_tokens_collection.insert_one({
        "token": token,
        "user_id": user["id"],
        "email": user["email"],
        "expires_at": datetime.utcnow() + timedelta(hours=1),
        "used": False,
        "created_at": datetime.utcnow().isoformat(),
    })

    client.post("/api/auth/reset-password", json={"token": token, "new_password": "pass00001"})
    # Second use should fail
    r = client.post("/api/auth/reset-password", json={"token": token, "new_password": "pass00002"})
    assert r.status_code == 400


def test_reset_password_expired_token(client):
    from server import reset_tokens_collection, users_collection
    _register(client)
    user = users_collection.find_one({"email": VALID_USER["email"]})

    token = str(uuid.uuid4())
    reset_tokens_collection.insert_one({
        "token": token,
        "user_id": user["id"],
        "email": user["email"],
        "expires_at": datetime.utcnow() - timedelta(hours=2),  # already expired
        "used": False,
        "created_at": datetime.utcnow().isoformat(),
    })

    r = client.post("/api/auth/reset-password", json={"token": token, "new_password": "newpassword123"})
    assert r.status_code == 400
