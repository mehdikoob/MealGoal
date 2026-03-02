"""Tests for the health check endpoint."""


def test_health_returns_200(client):
    r = client.get("/api/health")
    assert r.status_code == 200


def test_health_body(client):
    r = client.get("/api/health")
    body = r.json()
    assert body["status"] == "healthy"
    assert "timestamp" in body
