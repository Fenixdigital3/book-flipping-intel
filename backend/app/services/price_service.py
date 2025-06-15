
"""
Price service for price analysis and arbitrage calculations.

This module handles price-related business operations.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from typing import List, Optional
from decimal import Decimal
from ..models.book import Book
from ..models.price import Price
from ..models.store import Store
from ..schemas.price import PriceResponse, PriceComparison, ArbitrageOpportunity

class PriceService:
    """Service class for price-related operations."""
    
    @staticmethod
    def get_book_prices(db: Session, book_id: int) -> List[PriceResponse]:
        """
        Get all current prices for a specific book.
        
        Args:
            db: Database session
            book_id: Book ID
            
        Returns:
            List[PriceResponse]: List of current prices
        """
        prices = db.query(Price).options(joinedload(Price.store))\
                   .filter(Price.book_id == book_id, Price.is_active == True)\
                   .all()
        
        result = []
        for price in prices:
            price_response = PriceResponse(
                id=price.id,
                price=price.price,
                original_price=price.original_price,
                currency=price.currency,
                availability=price.availability,
                condition=price.condition,
                shipping_cost=price.shipping_cost,
                total_cost=price.total_cost,
                url=price.url,
                store_name=price.store.name,
                store_code=price.store.code,
                last_updated=price.last_updated,
                is_active=price.is_active
            )
            result.append(price_response)
        
        return result
    
    @staticmethod
    def compare_prices(db: Session, book_id: int) -> Optional[PriceComparison]:
        """
        Compare prices across stores and calculate arbitrage opportunities.
        
        Args:
            db: Database session
            book_id: Book ID
            
        Returns:
            PriceComparison: Price comparison with profit calculations
        """
        # Get book and prices
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            return None
            
        prices = PriceService.get_book_prices(db, book_id)
        if not prices:
            return None
        
        # Calculate price statistics
        price_values = [float(p.price) for p in prices]
        lowest_price = Decimal(str(min(price_values)))
        highest_price = Decimal(str(max(price_values)))
        price_spread = highest_price - lowest_price
        
        # Find best buy/sell stores
        best_buy_price = min(prices, key=lambda p: float(p.price))
        best_sell_price = max(prices, key=lambda p: float(p.price))
        
        # Calculate profit metrics
        potential_profit = highest_price - lowest_price
        profit_margin = float(potential_profit / lowest_price) if lowest_price > 0 else 0.0
        arbitrage_opportunity = potential_profit >= Decimal("5.00") and profit_margin >= 0.20
        
        return PriceComparison(
            book_id=book_id,
            book_title=book.title,
            book_isbn=book.isbn,
            prices=prices,
            lowest_price=lowest_price,
            highest_price=highest_price,
            price_spread=price_spread,
            potential_profit=potential_profit,
            profit_margin=profit_margin,
            best_buy_store=best_buy_price.store_name,
            best_sell_store=best_sell_price.store_name,
            arbitrage_opportunity=arbitrage_opportunity
        )
    
    @staticmethod
    def find_arbitrage_opportunities(
        db: Session,
        min_profit: float = 5.0,
        min_margin: float = 0.2,
        limit: int = 50
    ) -> List[ArbitrageOpportunity]:
        """
        Find current arbitrage opportunities based on thresholds.
        
        Args:
            db: Database session
            min_profit: Minimum profit amount in dollars
            min_margin: Minimum profit margin as decimal
            limit: Maximum number of opportunities to return
            
        Returns:
            List[ArbitrageOpportunity]: List of profitable opportunities
        """
        # Subquery to get min/max prices per book
        price_stats = db.query(
            Price.book_id,
            func.min(Price.price).label('min_price'),
            func.max(Price.price).label('max_price')
        ).filter(Price.is_active == True)\
         .group_by(Price.book_id)\
         .having(func.max(Price.price) - func.min(Price.price) >= min_profit)\
         .subquery()
        
        # Get books with profitable spreads
        opportunities_query = db.query(
            Book,
            price_stats.c.min_price,
            price_stats.c.max_price
        ).join(price_stats, Book.id == price_stats.c.book_id)
        
        results = []
        for book, min_price, max_price in opportunities_query.limit(limit * 2).all():
            profit = float(max_price - min_price)
            margin = profit / float(min_price) if min_price > 0 else 0
            
            if profit >= min_profit and margin >= min_margin:
                # Get the actual store details for min/max prices
                min_price_record = db.query(Price).options(joinedload(Price.store))\
                    .filter(Price.book_id == book.id, Price.price == min_price, Price.is_active == True)\
                    .first()
                
                max_price_record = db.query(Price).options(joinedload(Price.store))\
                    .filter(Price.book_id == book.id, Price.price == max_price, Price.is_active == True)\
                    .first()
                
                if min_price_record and max_price_record:
                    opportunity = ArbitrageOpportunity(
                        book_id=book.id,
                        book_title=book.title,
                        book_author=book.author,
                        book_isbn=book.isbn,
                        buy_price=min_price,
                        sell_price=max_price,
                        profit=Decimal(str(profit)),
                        profit_margin=margin,
                        buy_store=min_price_record.store.name,
                        sell_store=max_price_record.store.name,
                        buy_url=min_price_record.url,
                        sell_url=max_price_record.url,
                        last_updated=max(min_price_record.last_updated, max_price_record.last_updated)
                    )
                    results.append(opportunity)
                    
                    if len(results) >= limit:
                        break
        
        return results
