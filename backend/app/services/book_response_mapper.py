
"""
Book response mapper utility for converting Book models to API responses.

This module handles the conversion of SQLAlchemy Book models to BookResponse
objects with calculated price statistics.
"""

from typing import List
from ..models.book import Book
from ..schemas.book import BookResponse


class BookResponseMapper:
    """Utility class for converting Book models to API responses."""
    
    @staticmethod
    def books_to_responses(books: List[Book]) -> List[BookResponse]:
        """
        Convert a list of Book models to BookResponse objects.
        
        Args:
            books: List of Book model instances
            
        Returns:
            List[BookResponse]: List of book responses with calculated prices
        """
        result = []
        for book in books:
            book_response = BookResponseMapper.book_to_response(book)
            result.append(book_response)
        return result
    
    @staticmethod
    def book_to_response(book: Book) -> BookResponse:
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
        price_responses = BookResponseMapper._convert_prices_to_responses(active_prices)
        
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
    
    @staticmethod
    def _convert_prices_to_responses(active_prices):
        """Convert Price models to response format."""
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
        return price_responses
    
    @staticmethod
    def sort_responses_by_price(
        responses: List[BookResponse], 
        order_by: str, 
        order_direction: str
    ) -> List[BookResponse]:
        """
        Sort book responses by price-based fields.
        
        Args:
            responses: List of BookResponse objects
            order_by: Field to sort by (lowest_price, highest_price, price_spread)
            order_direction: Sort direction (asc/desc)
            
        Returns:
            Sorted list of BookResponse objects
        """
        reverse_sort = order_direction.lower() == "desc"
        
        if order_by == "lowest_price":
            return sorted(responses, key=lambda x: x.lowest_price or float('inf'), reverse=reverse_sort)
        elif order_by == "highest_price":
            return sorted(responses, key=lambda x: x.highest_price or 0, reverse=reverse_sort)
        elif order_by == "price_spread":
            return sorted(responses, key=lambda x: x.price_spread or 0, reverse=reverse_sort)
        
        return responses
