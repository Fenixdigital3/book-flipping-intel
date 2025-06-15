
"""
Price history service for retrieving and analyzing historical price data.

This module handles price history queries and trend analysis.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, desc, asc, func
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.book import Book
from ..models.price import Price
from ..models.store import Store
from ..schemas.price_history import PriceHistoryResponse, PriceHistoryPoint

class PriceHistoryService:
    """Service class for price history operations."""
    
    @staticmethod
    def get_price_history(
        db: Session,
        book_id: int,
        retailer: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        interval: Optional[str] = None,
        limit: int = 1000
    ) -> Optional[PriceHistoryResponse]:
        """
        Get historical price data for a specific book.
        
        Args:
            db: Database session
            book_id: Book ID
            retailer: Filter by retailer/store name
            start_date: Start date for history
            end_date: End date for history
            interval: Grouping interval (daily, weekly)
            limit: Maximum number of data points
            
        Returns:
            PriceHistoryResponse: Historical price data
        """
        # Get book information
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            return None
        
        # Build base query
        query = db.query(Price).options(joinedload(Price.store))\
                  .filter(Price.book_id == book_id)
        
        # Apply filters
        if retailer:
            query = query.join(Store).filter(Store.name.ilike(f"%{retailer}%"))
        
        if start_date:
            query = query.filter(Price.last_updated >= start_date)
        
        if end_date:
            query = query.filter(Price.last_updated <= end_date)
        
        # Order by timestamp and limit
        prices = query.order_by(desc(Price.last_updated)).limit(limit).all()
        
        if not prices:
            return PriceHistoryResponse(
                book_id=book_id,
                book_title=book.title,
                book_isbn=book.isbn,
                total_points=0,
                date_range={},
                history=[]
            )
        
        # Convert to history points
        history_points = []
        for price in prices:
            point = PriceHistoryPoint(
                retailer=price.store.name,
                timestamp=price.last_updated,
                price=price.price,
                original_price=price.original_price,
                availability=price.availability,
                condition=price.condition
            )
            history_points.append(point)
        
        # Calculate date range
        timestamps = [p.timestamp for p in history_points]
        date_range = {
            "start": min(timestamps).isoformat() if timestamps else None,
            "end": max(timestamps).isoformat() if timestamps else None
        }
        
        return PriceHistoryResponse(
            book_id=book_id,
            book_title=book.title,
            book_isbn=book.isbn,
            total_points=len(history_points),
            date_range=date_range,
            history=history_points
        )
    
    @staticmethod
    def get_price_statistics(
        db: Session,
        book_id: int,
        days: int = 30
    ) -> dict:
        """
        Get price statistics for the last N days.
        
        Args:
            db: Database session
            book_id: Book ID
            days: Number of days to analyze
            
        Returns:
            dict: Price statistics including volatility and trends
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get recent prices
        prices = db.query(Price)\
                   .filter(
                       and_(
                           Price.book_id == book_id,
                           Price.last_updated >= cutoff_date,
                           Price.is_active == True
                       )
                   )\
                   .order_by(asc(Price.last_updated))\
                   .all()
        
        if not prices:
            return {}
        
        price_values = [float(p.price) for p in prices]
        
        # Calculate basic statistics
        avg_price = sum(price_values) / len(price_values)
        min_price = min(price_values)
        max_price = max(price_values)
        price_range = max_price - min_price
        
        # Calculate volatility (standard deviation)
        variance = sum((x - avg_price) ** 2 for x in price_values) / len(price_values)
        volatility = variance ** 0.5
        
        # Calculate trend (simple linear regression slope)
        n = len(price_values)
        x_avg = (n - 1) / 2  # Average of indices
        y_avg = avg_price
        
        numerator = sum((i - x_avg) * (price_values[i] - y_avg) for i in range(n))
        denominator = sum((i - x_avg) ** 2 for i in range(n))
        
        trend_slope = numerator / denominator if denominator != 0 else 0
        
        return {
            "period_days": days,
            "data_points": len(prices),
            "average_price": round(avg_price, 2),
            "min_price": min_price,
            "max_price": max_price,
            "price_range": round(price_range, 2),
            "volatility": round(volatility, 2),
            "trend_slope": round(trend_slope, 4),
            "trend_direction": "increasing" if trend_slope > 0.01 else "decreasing" if trend_slope < -0.01 else "stable"
        }

