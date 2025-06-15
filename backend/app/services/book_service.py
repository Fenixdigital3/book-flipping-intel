
"""
Book service for business logic operations.

This module handles book-related business operations and database queries.
"""

from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..models.book import Book
from ..models.price import Price
from ..schemas.book import BookResponse
from .book_query_builder import BookQueryBuilder
from .book_response_mapper import BookResponseMapper


class BookService:
    """Service class for book-related operations."""
    
    @staticmethod
    def search_books(
        db: Session,
        query: Optional[str] = None,
        isbn: Optional[str] = None,
        author: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        limit: int = 50,
        offset: int = 0,
        order_by: Optional[str] = None,
        order_direction: str = "asc"
    ) -> List[BookResponse]:
        """
        Search books with various filters, pagination, and sorting.
        
        Args:
            db: Database session
            query: General search query
            isbn: ISBN search
            author: Author search
            category: Category filter
            min_price: Minimum price filter
            max_price: Maximum price filter
            limit: Number of results to return
            offset: Number of results to skip
            order_by: Field to sort by
            order_direction: Sort direction (asc/desc)
            
        Returns:
            List[BookResponse]: List of books matching criteria
        """
        # Build the search query
        db_query = BookQueryBuilder.build_search_query(
            db=db,
            query=query,
            isbn=isbn,
            author=author,
            category=category,
            min_price=min_price,
            max_price=max_price,
            order_by=order_by,
            order_direction=order_direction
        )
        
        # Apply pagination and execute query
        books = db_query.offset(offset).limit(limit).all()
        
        # Convert to response objects
        result = BookResponseMapper.books_to_responses(books)
        
        # Handle price-based sorting after conversion
        if order_by in ["lowest_price", "highest_price", "price_spread"]:
            result = BookResponseMapper.sort_responses_by_price(
                result, order_by, order_direction
            )
        
        return result
    
    @staticmethod
    def get_book_with_prices(db: Session, book_id: int) -> Optional[BookResponse]:
        """
        Get a book by ID with all current prices.
        
        Args:
            db: Database session
            book_id: Book ID
            
        Returns:
            BookResponse: Book with prices or None if not found
        """
        book = db.query(Book).options(
            joinedload(Book.prices).joinedload(Price.store)
        ).filter(Book.id == book_id, Book.is_active == True).first()
        
        if not book:
            return None
            
        return BookResponseMapper.book_to_response(book)
    
    @staticmethod
    def get_book_by_isbn(db: Session, isbn: str) -> Optional[BookResponse]:
        """
        Get a book by ISBN with all current prices.
        
        Args:
            db: Database session
            isbn: Book ISBN
            
        Returns:
            BookResponse: Book with prices or None if not found
        """
        book = db.query(Book).options(
            joinedload(Book.prices).joinedload(Price.store)
        ).filter(Book.isbn == isbn, Book.is_active == True).first()
        
        if not book:
            return None
            
        return BookResponseMapper.book_to_response(book)
    
    @staticmethod
    def list_books(db: Session, limit: int = 20, offset: int = 0) -> List[BookResponse]:
        """
        List books with pagination.
        
        Args:
            db: Database session
            limit: Number of results to return
            offset: Number of results to skip
            
        Returns:
            List[BookResponse]: List of books
        """
        books = db.query(Book).options(
            joinedload(Book.prices).joinedload(Price.store)
        ).filter(Book.is_active == True)\
         .offset(offset)\
         .limit(limit)\
         .all()
        
        return BookResponseMapper.books_to_responses(books)
