
"""
Pydantic schemas for book-related API responses.

This module defines the data models for API serialization.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .price import PriceResponse

class BookBase(BaseModel):
    """Base book schema with common fields."""
    isbn: str
    title: str
    author: str
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    pages: Optional[int] = None
    weight: Optional[str] = None
    dimensions: Optional[str] = None

class BookResponse(BookBase):
    """Book response schema with prices and metadata."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    current_prices: List[PriceResponse] = []
    lowest_price: Optional[float] = None
    highest_price: Optional[float] = None
    price_spread: Optional[float] = None
    
    class Config:
        from_attributes = True

class BookSearch(BaseModel):
    """Book search request schema."""
    query: Optional[str] = None
    isbn: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
