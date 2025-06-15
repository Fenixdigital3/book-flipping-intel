
"""
Unit tests for alert preferences functionality.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.models.alert_preference import AlertPreference


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_alerts.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Test data
TEST_USER_ID = "test-user-123"
TEST_PREFERENCES = {
    "user_id": TEST_USER_ID,
    "profit_margin_threshold": 25.5,
    "min_stock": 2,
    "include_retailers": ["Amazon", "Barnes & Noble"],
    "alert_frequency": "daily",
    "is_active": True
}


class TestAlertPreferences:
    """Test alert preferences API endpoints."""

    def test_create_alert_preferences_success(self):
        """Test successful creation of alert preferences."""
        response = client.post("/api/alerts/preferences", json=TEST_PREFERENCES)
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == TEST_USER_ID
        assert data["profit_margin_threshold"] == 25.5
        assert data["min_stock"] == 2
        assert data["include_retailers"] == ["Amazon", "Barnes & Noble"]
        assert data["alert_frequency"] == "daily"
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data

    def test_get_alert_preferences_success(self):
        """Test successful retrieval of alert preferences."""
        response = client.get(f"/api/alerts/preferences/{TEST_USER_ID}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == TEST_USER_ID
        assert data["profit_margin_threshold"] == 25.5

    def test_update_alert_preferences_success(self):
        """Test successful update of alert preferences."""
        update_data = {
            "profit_margin_threshold": 30.0,
            "alert_frequency": "hourly"
        }
        
        response = client.put(f"/api/alerts/preferences/{TEST_USER_ID}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["profit_margin_threshold"] == 30.0
        assert data["alert_frequency"] == "hourly"
        # Other fields should remain unchanged
        assert data["min_stock"] == 2

    def test_create_duplicate_preferences_failure(self):
        """Test failure when creating duplicate preferences for same user."""
        response = client.post("/api/alerts/preferences", json=TEST_PREFERENCES)
        
        assert response.status_code == 400
        assert "already exist" in response.json()["detail"]

    def test_get_nonexistent_preferences_failure(self):
        """Test failure when getting preferences for nonexistent user."""
        response = client.get("/api/alerts/preferences/nonexistent-user")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    def test_update_nonexistent_preferences_failure(self):
        """Test failure when updating preferences for nonexistent user."""
        update_data = {"profit_margin_threshold": 40.0}
        
        response = client.put("/api/alerts/preferences/nonexistent-user", json=update_data)
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    def test_delete_alert_preferences_success(self):
        """Test successful deletion of alert preferences."""
        response = client.delete(f"/api/alerts/preferences/{TEST_USER_ID}")
        
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]
        
        # Verify deletion
        get_response = client.get(f"/api/alerts/preferences/{TEST_USER_ID}")
        assert get_response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__])
