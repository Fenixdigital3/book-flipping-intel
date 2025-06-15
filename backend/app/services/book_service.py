"""
Book service for business logic operations.

This module handles book-related business operations and database queries.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func, desc, asc
from typing import List, Optional
from ..models.book import Book
from ..models.price import Price
from ..models.store import Store
from ..schemas.book import BookResponse

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
        # Base query with eager loading of prices
        db_query = db.query(Book).options(
            joinedload(Book.prices).joinedload(Price.store)
        )
        
        # Apply filters
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
        
        # Price filters require subquery
        if min_price or max_price:
            price_subquery = db.query(Price.book_id).filter(Price.is_active == True)
            if min_price:
                price_subquery = price_subquery.filter(Price.price >= min_price)
            if max_price:
                price_subquery = price_subquery.filter(Price.price <= max_price)
            
            db_query = db_query.filter(Book.id.in_(price_subquery))
        
        # Apply active filter
        db_query = db_query.filter(Book.is_active == True)
        
        # Apply sorting
        if order_by:
            order_func = desc if order_direction.lower() == "desc" else asc
            
            if order_by == "title":
                db_query = db_query.order_by(order_func(Book.title))
            elif order_by == "author":
                db_query = db_query.order_by(order_func(Book.author))
            elif order_by == "publication_year":
                db_query = db_query.order_by(order_func(Book.publication_year))
            elif order_by in ["lowest_price", "highest_price", "price_spread"]:
                # For price-based sorting, we'll sort after fetching due to calculated fields
                pass
            else:
                # Default to title if unknown sort field
                db_query = db_query.order_by(order_func(Book.title))
        else:
            # Default sort by title
            db_query = db_query.order_by(asc(Book.title))
        
        # Apply pagination
        books = db_query.offset(offset).limit(limit).all()
        
        # Convert to response objects with price calculations
        result = []
        for book in books:
            book_response = BookService._book_to_response(book)
            result.append(book_response)
        
        # Handle price-based sorting after conversion
        if order_by in ["lowest_price", "highest_price", "price_spread"]:
            reverse_sort = order_direction.lower() == "desc"
            
            if order_by == "lowest_price":
                result.sort(key=lambda x: x.lowest_price or float('inf'), reverse=reverse_sort)
            elif order_by == "highest_price":
                result.sort(key=lambda x: x.highest_price or 0, reverse=reverse_sort)
            elif order_by == "price_spread":
                result.sort(key=lambda x: x.price_spread or 0, reverse=reverse_sort)
        
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
            
        return BookService._book_to_response(book)
    
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
            
        return BookService._book_to_response(book)
    
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
        
        result = []
        for book in books:
            book_response = BookService._book_to_response(book)
            result.append(book_response)
        
        return result
    
    @staticmethod
    def _book_to_response(book: Book) -> BookResponse:
        """
        Convert Book model to BookResponse with price calculations.
        
        Args:
            book: Book model instance
            
        Returns:
            BookResponse: Book response with calculated prices
        """
        # Get active prices
        active_prices = [p for p in book.prices if p.is_active]
        
        # Calculate price statistics
        prices = [float(p.price) for p in active_prices]
        lowest_price = min(prices) if prices else None
        highest_price = max(prices) if prices else None
        price_spread = (highest_price - lowest_price) if (lowest_price and highest_price) else None
        
        # Convert prices to response format
        price_responses = []
        for price in active_prices:
            price_response = {
                "id": price.id,
                "price": price.price,
                "original_price": price.original_price,
                "currency": price.currency,
                "availability": price.availability,
                "condition": price.condition,
                "shipping_cost": price.shipping_cost,
                "total_cost": price.total_cost,
                "url": price.url,
                "store_name": price.store.name,
                "store_code": price.store.code,
                "last_updated": price.last_updated,
                "is_active": price.is_active
            }
            price_responses.append(price_response)
        
        return BookResponse(
            id=book.id,
            isbn=book.isbn,
            title=book.title,
            author=book.author,
            publisher=book.publisher,
            publication_year=book.publication_year,
            category=book.category,
            description=book.description,
            image_url=book.image_url,
            pages=book.pages,
            weight=book.weight,
            dimensions=book.dimensions,
            is_active=book.is_active,
            created_at=book.created_at,
            updated_at=book.updated_at,
            current_prices=price_responses,
            lowest_price=lowest_price,
            highest_price=highest_price,
            price_spread=price_spread
        )
