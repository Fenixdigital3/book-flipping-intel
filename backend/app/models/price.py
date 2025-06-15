
"""
Price model for storing book pricing information across stores.

This module defines the SQLAlchemy model for price tracking.
"""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Price(Base):
    """
    Price model representing book prices across different stores.
    
    Attributes:
        id (int): Primary key
        book_id (int): Foreign key to books table
        store_id (int): Foreign key to stores table
        price (decimal): Current price
        original_price (decimal): Original/MSRP price
        currency (str): Currency code (e.g., USD)
        availability (str): Stock status
        condition (str): Book condition (new, used, etc.)
        shipping_cost (decimal): Shipping cost if applicable
        total_cost (decimal): Total cost including shipping
        url (str): Direct URL to product page
        last_updated (datetime): When price was last scraped
        is_active (bool): Whether this price listing is still active
        created_at (datetime): Record creation timestamp
    """
    
    __tablename__ = "prices"
    
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2))
    currency = Column(String(3), default="USD")
    availability = Column(String(50))  # "in_stock", "out_of_stock", "limited", etc.
    condition = Column(String(20), default="new")  # "new", "used", "refurbished"
    shipping_cost = Column(Numeric(10, 2), default=0)
    total_cost = Column(Numeric(10, 2))  # price + shipping_cost
    url = Column(String(1000))
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    book = relationship("Book", back_populates="prices")
    store = relationship("Store", back_populates="prices")
    
    def __repr__(self):
        return f"<Price(book_id={self.book_id}, store_id={self.store_id}, price={self.price})>"
