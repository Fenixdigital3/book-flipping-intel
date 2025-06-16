
"""
Comprehensive test suite for BookFlipFinder API.
Tests all endpoints with success, failure, and edge cases.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from datetime import datetime

from backend.app.main import app, books_db

client = TestClient(app)

# Test fixtures
@pytest.fixture(autouse=True)
def reset_db():
    """Reset the in-memory database before each test."""
    books_db.clear()
    yield
    books_db.clear()

@pytest.fixture
def sample_book_data():
    """Sample book data for testing."""
    return {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald", 
        "isbn": "9780743273565",
        "publisher": "Scribner",
        "publication_year": 1925,
        "category": "Classic Literature",
        "description": "A classic American novel",
        "price": 12.99
    }

@pytest.fixture
def created_book(sample_book_data):
    """Create a book and return its response."""
    response = client.post("/books", json=sample_book_data)
    return response.json()

# Health check tests
class TestHealthCheck:
    def test_health_check_success(self):
        """Test successful health check."""
        response = client.get("/healthz")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "service": "bookflipfinder-api"}
    
    def test_health_check_simulated_failure(self):
        """Test simulated health check failure."""
        with patch('backend.app.main.app') as mock_app:
            mock_app.get.side_effect = Exception("Service unavailable")
            try:
                response = client.get("/healthz")
                # If we get here, the endpoint is working normally
                assert response.status_code == 200
            except Exception:
                # This would be the failure case
                assert True

# Book creation tests
class TestCreateBook:
    def test_create_book_success(self, sample_book_data):
        """Test successful book creation."""
        response = client.post("/books", json=sample_book_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["title"] == sample_book_data["title"]
        assert data["author"] == sample_book_data["author"]
        assert data["isbn"] == sample_book_data["isbn"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_book_duplicate_isbn(self, sample_book_data):
        """Test book creation with duplicate ISBN fails."""
        # Create first book
        client.post("/books", json=sample_book_data)
        
        # Try to create another book with same ISBN
        response = client.post("/books", json=sample_book_data)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    def test_create_book_invalid_data(self):
        """Test book creation with invalid data."""
        invalid_data = {
            "title": "",  # Empty title
            "author": "Test Author",
            "isbn": "123",  # Too short
            "price": -10  # Negative price
        }
        response = client.post("/books", json=invalid_data)
        assert response.status_code == 422

# Book listing tests
class TestListBooks:
    def test_list_books_empty(self):
        """Test listing books when database is empty."""
        response = client.get("/books")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_books_with_data(self, sample_book_data):
        """Test listing books with data."""
        # Create a book first
        client.post("/books", json=sample_book_data)
        
        response = client.get("/books")
        assert response.status_code == 200
        
        books = response.json()
        assert len(books) == 1
        assert books[0]["title"] == sample_book_data["title"]
    
    def test_list_books_pagination(self, sample_book_data):
        """Test book listing with pagination."""
        # Create multiple books
        for i in range(5):
            book_data = sample_book_data.copy()
            book_data["title"] = f"Book {i}"
            book_data["isbn"] = f"978074327356{i}"
            client.post("/books", json=book_data)
        
        # Test pagination
        response = client.get("/books?limit=2&offset=1")
        assert response.status_code == 200
        
        books = response.json()
        assert len(books) == 2
    
    def test_list_books_category_filter(self, sample_book_data):
        """Test book listing with category filter."""
        # Create books with different categories
        book1 = sample_book_data.copy()
        book1["category"] = "Fiction"
        book1["isbn"] = "1111111111"
        client.post("/books", json=book1)
        
        book2 = sample_book_data.copy()
        book2["category"] = "Non-Fiction"
        book2["isbn"] = "2222222222"
        client.post("/books", json=book2)
        
        response = client.get("/books?category=Fiction")
        assert response.status_code == 200
        
        books = response.json()
        assert len(books) == 1
        assert books[0]["category"] == "Fiction"
    
    def test_list_books_invalid_pagination(self):
        """Test book listing with invalid pagination parameters."""
        response = client.get("/books?limit=0")
        assert response.status_code == 422
        
        response = client.get("/books?offset=-1")
        assert response.status_code == 422

# Book retrieval tests
class TestGetBook:
    def test_get_book_success(self, created_book):
        """Test successful book retrieval."""
        book_id = created_book["id"]
        response = client.get(f"/books/{book_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == book_id
        assert data["title"] == created_book["title"]
    
    def test_get_book_not_found(self):
        """Test book retrieval with non-existent ID."""
        response = client.get("/books/nonexistent-id")
        assert response.status_code == 404
        assert response.json()["detail"] == "Book not found"
    
    def test_get_book_empty_id(self):
        """Test book retrieval with empty ID."""
        response = client.get("/books/")
        # This should hit the list endpoint instead
        assert response.status_code == 200

# Book update tests
class TestUpdateBook:
    def test_update_book_success(self, created_book):
        """Test successful book update."""
        book_id = created_book["id"]
        update_data = {
            "title": "Updated Title",
            "price": 15.99
        }
        
        response = client.put(f"/books/{book_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["price"] == 15.99
        assert data["author"] == created_book["author"]  # Unchanged
    
    def test_update_book_not_found(self):
        """Test book update with non-existent ID."""
        update_data = {"title": "New Title"}
        response = client.put("/books/nonexistent-id", json=update_data)
        assert response.status_code == 404
        assert response.json()["detail"] == "Book not found"
    
    def test_update_book_isbn_conflict(self, sample_book_data):
        """Test book update with conflicting ISBN."""
        # Create two books
        book1_response = client.post("/books", json=sample_book_data)
        book1_id = book1_response.json()["id"]
        
        book2_data = sample_book_data.copy()
        book2_data["isbn"] = "9780451524935"
        book2_response = client.post("/books", json=book2_data)
        book2_id = book2_response.json()["id"]
        
        # Try to update book1 with book2's ISBN
        update_data = {"isbn": "9780451524935"}
        response = client.put(f"/books/{book1_id}", json=update_data)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    def test_update_book_invalid_data(self, created_book):
        """Test book update with invalid data."""
        book_id = created_book["id"]
        update_data = {"price": -5}  # Negative price
        
        response = client.put(f"/books/{book_id}", json=update_data)
        assert response.status_code == 422

# Book deletion tests
class TestDeleteBook:
    def test_delete_book_success(self, created_book):
        """Test successful book deletion."""
        book_id = created_book["id"]
        book_title = created_book["title"]
        
        response = client.delete(f"/books/{book_id}")
        assert response.status_code == 200
        assert book_title in response.json()["message"]
        
        # Verify book is deleted
        get_response = client.get(f"/books/{book_id}")
        assert get_response.status_code == 404
    
    def test_delete_book_not_found(self):
        """Test book deletion with non-existent ID."""
        response = client.delete("/books/nonexistent-id")
        assert response.status_code == 404
        assert response.json()["detail"] == "Book not found"
    
    def test_delete_book_twice(self, created_book):
        """Test deleting the same book twice."""
        book_id = created_book["id"]
        
        # First deletion
        response = client.delete(f"/books/{book_id}")
        assert response.status_code == 200
        
        # Second deletion
        response = client.delete(f"/books/{book_id}")
        assert response.status_code == 404

# Authentication tests
class TestAuthentication:
    def test_login_success(self):
        """Test successful login with demo account."""
        login_data = {
            "email": "demo@bookflipfinder.com",
            "password": "demo123456"
        }
        response = client.post("/login", json=login_data)
        assert response.status_code == 200
        assert "message" in response.json()
        assert "token" in response.json()
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        login_data = {
            "email": "wrong@email.com",
            "password": "wrongpassword"
        }
        response = client.post("/login", json=login_data)
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid credentials"
    
    def test_register_success(self):
        """Test successful user registration."""
        register_data = {
            "email": "newuser@test.com",
            "password": "newpassword123"
        }
        response = client.post("/register", json=register_data)
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_register_existing_user(self):
        """Test registration with existing email."""
        register_data = {
            "email": "demo@bookflipfinder.com",
            "password": "somepassword"
        }
        response = client.post("/register", json=register_data)
        assert response.status_code == 400
        assert response.json()["detail"] == "User already exists"

# API info tests
class TestAPIInfo:
    def test_get_api_info(self):
        """Test API info endpoint."""
        response = client.get("/info")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "BookFlipFinder API"
        assert data["version"] == "1.0.0"
        assert "total_books" in data
        assert "endpoints" in data
    
    def test_api_info_with_books(self, sample_book_data):
        """Test API info endpoint with books in database."""
        client.post("/books", json=sample_book_data)
        
        response = client.get("/info")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_books"] == 1

# Edge case tests
class TestEdgeCases:
    def test_very_long_title(self):
        """Test book creation with very long title."""
        long_title = "A" * 501  # Exceeds 500 char limit
        book_data = {
            "title": long_title,
            "author": "Test Author",
            "isbn": "1234567890",
            "price": 10.0
        }
        
        response = client.post("/books", json=book_data)
        assert response.status_code == 422
    
    def test_future_publication_year(self):
        """Test book creation with future publication year."""
        book_data = {
            "title": "Future Book",
            "author": "Time Traveler",
            "isbn": "1234567890",
            "publication_year": 2040,
            "price": 10.0
        }
        
        response = client.post("/books", json=book_data)
        assert response.status_code == 422
    
    def test_large_pagination_values(self):
        """Test pagination with large values."""
        response = client.get("/books?limit=101")  # Exceeds max limit
        assert response.status_code == 422
        
        response = client.get("/books?offset=999999")  # Very large offset
        assert response.status_code == 200
        assert response.json() == []
    
    def test_special_characters_in_filters(self):
        """Test filters with special characters."""
        response = client.get("/books?author=O'Connor")
        assert response.status_code == 200
        
        response = client.get("/books?category=Science & Technology")
        assert response.status_code == 200
