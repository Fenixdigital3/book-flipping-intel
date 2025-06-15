
"""
Unit tests for price history service.

This module tests the price history functionality.
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock
from backend.app.services.price_history_service import PriceHistoryService
from backend.app.models.book import Book
from backend.app.models.price import Price
from backend.app.models.store import Store

class TestPriceHistoryService:
    """Test cases for PriceHistoryService."""
    
    def test_get_price_history_success(self):
        """Test successful price history retrieval."""
        # Mock database session
        mock_db = Mock()
        
        # Mock book
        mock_book = Book(
            id=1,
            isbn="1234567890",
            title="Test Book",
            author="Test Author"
        )
        
        # Mock store
        mock_store = Store(
            id=1,
            name="Amazon",
            code="AMZN"
        )
        
        # Mock prices with store relationship
        mock_price = Mock()
        mock_price.store = mock_store
        mock_price.last_updated = datetime.utcnow()
        mock_price.price = Decimal("15.99")
        mock_price.original_price = Decimal("19.99")
        mock_price.availability = "in_stock"
        mock_price.condition = "new"
        
        # Setup mock queries
        mock_db.query.return_value.filter.return_value.first.return_value = mock_book
        mock_db.query.return_value.options.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [mock_price]
        
        # Test the service
        result = PriceHistoryService.get_price_history(mock_db, 1)
        
        # Assertions
        assert result is not None
        assert result.book_id == 1
        assert result.book_title == "Test Book"
        assert result.total_points == 1
        assert len(result.history) == 1
        assert result.history[0].retailer == "Amazon"
        assert result.history[0].price == Decimal("15.99")
    
    def test_get_price_history_book_not_found(self):
        """Test price history when book doesn't exist."""
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = PriceHistoryService.get_price_history(mock_db, 999)
        assert result is None
    
    def test_get_price_statistics_success(self):
        """Test successful price statistics calculation."""
        mock_db = Mock()
        
        # Mock prices with varying values for statistics
        base_time = datetime.utcnow()
        mock_prices = []
        for i, price_val in enumerate([10.0, 12.0, 11.0, 13.0, 12.5]):
            mock_price = Mock()
            mock_price.price = Decimal(str(price_val))
            mock_price.last_updated = base_time - timedelta(days=i)
            mock_prices.append(mock_price)
        
        mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = mock_prices
        
        result = PriceHistoryService.get_price_statistics(mock_db, 1, 30)
        
        # Assertions
        assert result is not None
        assert "average_price" in result
        assert "volatility" in result
        assert "trend_direction" in result
        assert result["data_points"] == 5
        assert result["period_days"] == 30
    
    def test_get_price_statistics_no_data(self):
        """Test price statistics when no data available."""
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []
        
        result = PriceHistoryService.get_price_statistics(mock_db, 1, 30)
        assert result == {}

