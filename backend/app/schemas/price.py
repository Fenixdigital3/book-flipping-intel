
"""
Pydantic schemas for price-related API responses.

This module defines the data models for price API serialization.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class PriceBase(BaseModel):
    """Base price schema with common fields."""
    price: Decimal
    original_price: Optional[Decimal] = None
    currency: str = "USD"
    availability: Optional[str] = None
    condition: str = "new"
    shipping_cost: Decimal = Decimal("0.00")
    total_cost: Optional[Decimal] = None
    url: Optional[str] = None

class PriceResponse(PriceBase):
    """Price response schema with store information."""
    id: int
    store_name: str
    store_code: str
    last_updated: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class PriceComparison(BaseModel):
    """Price comparison schema with arbitrage analysis."""
    book_id: int
    book_title: str
    book_isbn: str
    prices: List[PriceResponse]
    lowest_price: Decimal
    highest_price: Decimal
    price_spread: Decimal
    potential_profit: Decimal
    profit_margin: float
    best_buy_store: str
    best_sell_store: str
    arbitrage_opportunity: bool
    
class ArbitrageOpportunity(BaseModel):
    """Arbitrage opportunity schema."""
    book_id: int
    book_title: str
    book_author: str
    book_isbn: str
    buy_price: Decimal
    sell_price: Decimal
    profit: Decimal
    profit_margin: float
    buy_store: str
    sell_store: str
    buy_url: Optional[str] = None
    sell_url: Optional[str] = None
    last_updated: datetime
