
"""
Health check endpoint tests.

This module tests the basic health and status endpoints.
"""

from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    """Test the health check endpoint returns success."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "book-arbitrage-api"}

def test_root_endpoint(client: TestClient):
    """Test the root endpoint returns API information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Book Arbitrage Intelligence API"
    assert data["version"] == "1.0.0"
    assert data["docs"] == "/docs"
