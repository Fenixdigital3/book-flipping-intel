
"""
Scraper service for coordinating web scraping operations.

This module manages scraping tasks and data persistence.
"""

from sqlalchemy.orm import Session
from typing import List, Dict, Any
import asyncio
from ..models.book import Book
from ..models.price import Price
from ..models.store import Store
from ..scrapers.amazon_scraper import AmazonScraper

class ScraperService:
    """Service class for coordinating scraping operations."""
    
    @staticmethod
    async def scrape_book_by_isbn(db: Session, isbn: str) -> Dict[str, Any]:
        """
        Scrape a book by ISBN across all active stores.
        
        Args:
            db: Database session
            isbn: Book ISBN to scrape
            
        Returns:
            Dict: Scraping results summary
        """
        results = {
            "isbn": isbn,
            "stores_scraped": [],
            "books_found": 0,
            "prices_updated": 0,
            "errors": []
        }
        
        # Get active stores
        stores = db.query(Store).filter(Store.is_active == True, Store.scraping_enabled == True).all()
        
        for store in stores:
            try:
                if store.code == "amazon":
                    scraper = AmazonScraper()
                    book_data = await scraper.scrape_book(isbn)
                    
                    if book_data:
                        # Save or update book
                        book = ScraperService._save_book_data(db, book_data)
                        
                        # Save price data
                        if book and "price" in book_data:
                            ScraperService._save_price_data(db, book.id, store.id, book_data)
                            results["prices_updated"] += 1
                        
                        results["books_found"] += 1
                
                results["stores_scraped"].append(store.name)
                
                # Respect rate limiting
                await asyncio.sleep(store.rate_limit_delay)
                
            except Exception as e:
                results["errors"].append(f"{store.name}: {str(e)}")
        
        return results
    
    @staticmethod
    async def scrape_search_results(
        db: Session, 
        query: str, 
        max_results: int = 20
    ) -> Dict[str, Any]:
        """
        Scrape search results for a query across stores.
        
        Args:
            db: Database session
            query: Search query
            max_results: Maximum results per store
            
        Returns:
            Dict: Scraping results summary
        """
        results = {
            "query": query,
            "stores_scraped": [],
            "books_found": 0,
            "prices_updated": 0,
            "errors": []
        }
        
        # Get active stores
        stores = db.query(Store).filter(Store.is_active == True, Store.scraping_enabled == True).all()
        
        for store in stores:
            try:
                if store.code == "amazon":
                    scraper = AmazonScraper()
                    search_results = await scraper.search_books(query, max_results)
                    
                    for book_data in search_results:
                        # Save or update book
                        book = ScraperService._save_book_data(db, book_data)
                        
                        # Save price data
                        if book and "price" in book_data:
                            ScraperService._save_price_data(db, book.id, store.id, book_data)
                            results["prices_updated"] += 1
                        
                        results["books_found"] += 1
                
                results["stores_scraped"].append(store.name)
                
                # Respect rate limiting
                await asyncio.sleep(store.rate_limit_delay)
                
            except Exception as e:
                results["errors"].append(f"{store.name}: {str(e)}")
        
        return results
    
    @staticmethod
    def _save_book_data(db: Session, book_data: Dict[str, Any]) -> Book:
        """
        Save or update book data in database.
        
        Args:
            db: Database session
            book_data: Scraped book data
            
        Returns:
            Book: Saved book instance
        """
        isbn = book_data.get("isbn")
        if not isbn:
            return None
        
        # Check if book exists
        book = db.query(Book).filter(Book.isbn == isbn).first()
        
        if not book:
            # Create new book
            book = Book(
                isbn=isbn,
                title=book_data.get("title", ""),
                author=book_data.get("author", ""),
                publisher=book_data.get("publisher"),
                publication_year=book_data.get("publication_year"),
                category=book_data.get("category"),
                description=book_data.get("description"),
                image_url=book_data.get("image_url"),
                pages=book_data.get("pages"),
                weight=book_data.get("weight"),
                dimensions=book_data.get("dimensions")
            )
            db.add(book)
        else:
            # Update existing book with new information
            if book_data.get("title"):
                book.title = book_data["title"]
            if book_data.get("author"):
                book.author = book_data["author"]
            if book_data.get("description"):
                book.description = book_data["description"]
            if book_data.get("image_url"):
                book.image_url = book_data["image_url"]
        
        db.commit()
        db.refresh(book)
        return book
    
    @staticmethod
    def _save_price_data(
        db: Session, 
        book_id: int, 
        store_id: int, 
        book_data: Dict[str, Any]
    ) -> Price:
        """
        Save or update price data in database.
        
        Args:
            db: Database session
            book_id: Book ID
            store_id: Store ID
            book_data: Scraped book data with price info
            
        Returns:
            Price: Saved price instance
        """
        # Check if price record exists
        price = db.query(Price).filter(
            Price.book_id == book_id,
            Price.store_id == store_id,
            Price.condition == book_data.get("condition", "new")
        ).first()
        
        if not price:
            # Create new price
            price = Price(
                book_id=book_id,
                store_id=store_id,
                price=book_data.get("price", 0),
                original_price=book_data.get("original_price"),
                availability=book_data.get("availability"),
                condition=book_data.get("condition", "new"),
                shipping_cost=book_data.get("shipping_cost", 0),
                url=book_data.get("url")
            )
            # Calculate total cost
            price.total_cost = price.price + price.shipping_cost
            db.add(price)
        else:
            # Update existing price
            price.price = book_data.get("price", price.price)
            price.original_price = book_data.get("original_price")
            price.availability = book_data.get("availability")
            price.shipping_cost = book_data.get("shipping_cost", 0)
            price.total_cost = price.price + price.shipping_cost
            price.url = book_data.get("url")
        
        db.commit()
        db.refresh(price)
        return price
