
"""
Pydantic schemas for price history API responses.

This module defines the data models for historical price data serialization.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class PriceHistoryPoint(BaseModel):
    """Individual price history data point."""
    retailer: str
    timestamp: datetime
    price: Decimal
    original_price: Optional[Decimal] = None
    availability: Optional[str] = None
    condition: str = "new"
    
    class Config:
        from_attributes = True

class PriceHistoryResponse(BaseModel):
    """Price history response schema."""
    book_id: int
    book_title: str
    book_isbn: str
    total_points: int
    date_range: dict
    history: List[PriceHistoryPoint]
    
    class Config:
        from_attributes = True

