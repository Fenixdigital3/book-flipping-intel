
"""
Price-related API routes.

This module handles price comparison and analysis endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..services.price_service import PriceService
from ..schemas.price import PriceResponse, PriceComparison

router = APIRouter()

@router.get("/book/{book_id}", response_model=List[PriceResponse])
async def get_book_prices(book_id: int, db: Session = Depends(get_db)):
    """
    Get all current prices for a specific book.
    
    Args:
        book_id: Book ID
        db: Database session
        
    Returns:
        List[PriceResponse]: List of current prices across stores
    """
    prices = PriceService.get_book_prices(db, book_id)
    return prices

@router.get("/compare/{book_id}", response_model=PriceComparison)
async def compare_prices(book_id: int, db: Session = Depends(get_db)):
    """
    Compare prices across stores for a book and calculate arbitrage opportunities.
    
    Args:
        book_id: Book ID
        db: Database session
        
    Returns:
        PriceComparison: Price comparison with profit calculations
    """
    comparison = PriceService.compare_prices(db, book_id)
    if not comparison:
        raise HTTPException(status_code=404, detail="No prices found for this book")
    return comparison

@router.get("/opportunities")
async def get_arbitrage_opportunities(
    min_profit: Optional[float] = Query(5.0, description="Minimum profit threshold"),
    min_margin: Optional[float] = Query(0.2, description="Minimum profit margin (20%)"),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    """
    Get current arbitrage opportunities based on profit thresholds.
    
    Args:
        min_profit: Minimum profit amount in dollars
        min_margin: Minimum profit margin as decimal (0.2 = 20%)
        limit: Number of opportunities to return
        db: Database session
        
    Returns:
        List of profitable arbitrage opportunities
    """
    opportunities = PriceService.find_arbitrage_opportunities(
        db, 
        min_profit=min_profit,
        min_margin=min_margin,
        limit=limit
    )
    return opportunities
