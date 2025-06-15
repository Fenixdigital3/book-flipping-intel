
"""
Book model for storing book information.

This module defines the SQLAlchemy model for books with all relevant metadata.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Book(Base):
    """
    Book model representing a book in the database.
    
    Attributes:
        id (int): Primary key
        isbn (str): International Standard Book Number
        title (str): Book title
        author (str): Book author(s)
        publisher (str): Book publisher
        publication_year (int): Year of publication
        category (str): Book category/genre
        description (str): Book description
        image_url (str): URL to book cover image
        pages (int): Number of pages
        weight (str): Book weight for shipping calculations
        dimensions (str): Book dimensions
        is_active (bool): Whether book is actively tracked
        created_at (datetime): Record creation timestamp
        updated_at (datetime): Record last update timestamp
    """
    
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(13), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False, index=True)
    author = Column(String(300), nullable=False)
    publisher = Column(String(200))
    publication_year = Column(Integer)
    category = Column(String(100), index=True)
    description = Column(Text)
    image_url = Column(String(500))
    pages = Column(Integer)
    weight = Column(String(50))  # e.g., "1.2 lbs"
    dimensions = Column(String(100))  # e.g., "8.5 x 5.5 x 1.2 inches"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    prices = relationship("Price", back_populates="book")
    
    def __repr__(self):
        return f"<Book(isbn='{self.isbn}', title='{self.title}')>"
