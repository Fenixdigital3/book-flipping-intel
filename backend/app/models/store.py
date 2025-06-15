
"""
Store model for managing different online bookstores.

This module defines the SQLAlchemy model for store information.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Store(Base):
    """
    Store model representing online bookstores.
    
    Attributes:
        id (int): Primary key
        name (str): Store name (e.g., "Amazon", "Barnes & Noble")
        code (str): Store code for internal reference
        base_url (str): Base URL of the store
        search_url_template (str): URL template for search queries
        is_active (bool): Whether store is actively scraped
        scraping_enabled (bool): Whether scraping is enabled for this store
        rate_limit_delay (int): Delay between requests in seconds
        user_agent (str): User agent string for scraping
        notes (str): Additional notes about the store
        created_at (datetime): Record creation timestamp
        updated_at (datetime): Record last update timestamp
    """
    
    __tablename__ = "stores"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True, index=True)
    base_url = Column(String(200), nullable=False)
    search_url_template = Column(String(500))  # Template with placeholders for search terms
    is_active = Column(Boolean, default=True)
    scraping_enabled = Column(Boolean, default=True)
    rate_limit_delay = Column(Integer, default=1)  # seconds between requests
    user_agent = Column(String(300))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    prices = relationship("Price", back_populates="store")
    
    def __repr__(self):
        return f"<Store(code='{self.code}', name='{self.name}')>"
