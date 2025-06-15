
"""
Price history API routes.

This module handles historical price data endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..services.price_history_service import PriceHistoryService
from ..schemas.price_history import PriceHistoryResponse

router = APIRouter()

@router.get("/history/{book_id}", response_model=PriceHistoryResponse)
async def get_price_history(
    book_id: int,
    retailer: Optional[str] = Query(None, description="Filter by retailer name"),
    start_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date (ISO format)"),
    interval: Optional[str] = Query(None, description="Grouping interval (daily, weekly)"),
    limit: int = Query(1000, le=5000, description="Maximum number of data points"),
    db: Session = Depends(get_db)
):
    """
    Get historical price data for a specific book.
    
    Args:
        book_id: Book ID
        retailer: Filter by retailer/store name (optional)
        start_date: Start date for history (optional)
        end_date: End date for history (optional)
        interval: Grouping interval - daily, weekly (optional)
        limit: Maximum number of data points (default 1000, max 5000)
        db: Database session
        
    Returns:
        PriceHistoryResponse: Historical price data with trends
    """
    history = PriceHistoryService.get_price_history(
        db=db,
        book_id=book_id,
        retailer=retailer,
        start_date=start_date,
        end_date=end_date,
        interval=interval,
        limit=limit
    )
    
    if not history:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return history

@router.get("/statistics/{book_id}")
async def get_price_statistics(
    book_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get price statistics and trends for a book over a specified period.
    
    Args:
        book_id: Book ID
        days: Number of days to analyze (1-365, default 30)
        db: Database session
        
    Returns:
        dict: Price statistics including volatility and trend analysis
    """
    stats = PriceHistoryService.get_price_statistics(db, book_id, days)
    
    if not stats:
        raise HTTPException(status_code=404, detail="No price data found for this book")
    
    return {
        "book_id": book_id,
        "statistics": stats
    }

