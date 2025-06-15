
"""
Book query builder utility for constructing complex database queries.

This module handles the construction of SQLAlchemy queries for book searches
with various filters, sorting, and pagination options.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func, desc, asc
from typing import Optional
from ..models.book import Book
from ..models.price import Price


class BookQueryBuilder:
    """Utility class for building book search queries."""
    
    @staticmethod
    def build_search_query(
        db: Session,
        query: Optional[str] = None,
        isbn: Optional[str] = None,
        author: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        order_by: Optional[str] = None,
        order_direction: str = "asc"
    ):
        """
        Build a SQLAlchemy query for book search with filters and sorting.
        
        Args:
            db: Database session
            query: General search query
            isbn: ISBN search
            author: Author search
            category: Category filter
            min_price: Minimum price filter
            max_price: Maximum price filter
            order_by: Field to sort by
            order_direction: Sort direction (asc/desc)
            
        Returns:
            SQLAlchemy query object ready for pagination
        """
        # Base query with eager loading of prices
        db_query = db.query(Book).options(
            joinedload(Book.prices).joinedload(Price.store)
        )
        
        # Apply text-based filters
        db_query = BookQueryBuilder._apply_text_filters(
            db_query, query, isbn, author, category
        )
        
        # Apply price filters
        if min_price or max_price:
            db_query = BookQueryBuilder._apply_price_filters(
                db, db_query, min_price, max_price
            )
        
        # Apply active filter
        db_query = db_query.filter(Book.is_active == True)
        
        # Apply sorting (except for price-based sorting which is done post-query)
        if order_by and order_by not in ["lowest_price", "highest_price", "price_spread"]:
            db_query = BookQueryBuilder._apply_sorting(db_query, order_by, order_direction)
        else:
            # Default sort by title
            db_query = db_query.order_by(asc(Book.title))
        
        return db_query
    
    @staticmethod
    def _apply_text_filters(db_query, query, isbn, author, category):
        """Apply text-based search filters to the query."""
        if query:
            db_query = db_query.filter(
                or_(
                    Book.title.ilike(f"%{query}%"),
                    Book.author.ilike(f"%{query}%"),
                    Book.description.ilike(f"%{query}%")
                )
            )
        
        if isbn:
            db_query = db_query.filter(Book.isbn.ilike(f"%{isbn}%"))
            
        if author:
            db_query = db_query.filter(Book.author.ilike(f"%{author}%"))
            
        if category:
            db_query = db_query.filter(Book.category.ilike(f"%{category}%"))
        
        return db_query
    
    @staticmethod
    def _apply_price_filters(db, db_query, min_price, max_price):
        """Apply price-based filters using a subquery."""
        price_subquery = db.query(Price.book_id).filter(Price.is_active == True)
        
        if min_price:
            price_subquery = price_subquery.filter(Price.price >= min_price)
        if max_price:
            price_subquery = price_subquery.filter(Price.price <= max_price)
        
        return db_query.filter(Book.id.in_(price_subquery))
    
    @staticmethod
    def _apply_sorting(db_query, order_by, order_direction):
        """Apply sorting to the query for non-price fields."""
        order_func = desc if order_direction.lower() == "desc" else asc
        
        if order_by == "title":
            return db_query.order_by(order_func(Book.title))
        elif order_by == "author":
            return db_query.order_by(order_func(Book.author))
        elif order_by == "publication_year":
            return db_query.order_by(order_func(Book.publication_year))
        else:
            # Default to title if unknown sort field
            return db_query.order_by(order_func(Book.title))
