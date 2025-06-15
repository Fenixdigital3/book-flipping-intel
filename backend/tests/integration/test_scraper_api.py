
"""
Scraper API integration tests.

This module tests the scraper API endpoints.
"""

from fastapi.testclient import TestClient

def test_scraper_status(client: TestClient):
    """Test scraper status endpoint."""
    response = client.get("/api/scraper/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "scrapers" in data

def test_test_amazon_scraper(client: TestClient):
    """Test Amazon scraper test endpoint."""
    response = client.post("/api/scraper/test/amazon")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "isbn" in data
    
def test_scrape_isbn_endpoint(client: TestClient):
    """Test scraping by ISBN endpoint."""
    isbn = "9780262033848"
    response = client.post(f"/api/scraper/scrape/isbn/{isbn}")
    assert response.status_code == 200
    data = response.json()
    assert data["isbn"] == isbn
    assert data["status"] == "initiated"
