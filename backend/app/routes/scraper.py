
"""
Scraper-related API routes.

This module handles scraping operations and status endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.scraper_service import ScraperService
from ..scrapers.amazon_scraper import AmazonScraper

router = APIRouter()

@router.post("/scrape/isbn/{isbn}")
async def scrape_book_by_isbn(
    isbn: str, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Trigger scraping for a specific ISBN across all active stores.
    
    Args:
        isbn: Book ISBN to scrape
        background_tasks: FastAPI background tasks
        db: Database session
        
    Returns:
        dict: Scraping task status
    """
    # Add scraping task to background
    background_tasks.add_task(ScraperService.scrape_book_by_isbn, db, isbn)
    
    return {
        "message": f"Started scraping for ISBN {isbn}",
        "isbn": isbn,
        "status": "initiated"
    }

@router.post("/scrape/search/{query}")
async def scrape_search_results(
    query: str,
    background_tasks: BackgroundTasks,
    max_results: int = 20,
    db: Session = Depends(get_db)
):
    """
    Scrape search results for a query across stores.
    
    Args:
        query: Search query
        background_tasks: FastAPI background tasks
        max_results: Maximum number of results to scrape
        db: Database session
        
    Returns:
        dict: Scraping task status
    """
    # Add scraping task to background
    background_tasks.add_task(
        ScraperService.scrape_search_results, 
        db, 
        query, 
        max_results
    )
    
    return {
        "message": f"Started scraping search results for '{query}'",
        "query": query,
        "max_results": max_results,
        "status": "initiated"
    }

@router.get("/status")
async def get_scraper_status():
    """
    Get current scraper status and statistics.
    
    Returns:
        dict: Scraper status information
    """
    return {
        "status": "active",
        "scrapers": {
            "amazon": {
                "enabled": True,
                "last_run": None,
                "rate_limit": "1 request/second"
            }
        },
        "queue_size": 0,
        "total_scraped_today": 0
    }

@router.post("/test/amazon")
async def test_amazon_scraper(isbn: str = "9780262033848"):
    """
    Test Amazon scraper with a sample ISBN.
    
    Args:
        isbn: ISBN to test (defaults to a popular CS book)
        
    Returns:
        dict: Test results
    """
    try:
        scraper = AmazonScraper()
        result = await scraper.scrape_book(isbn)
        return {
            "status": "success",
            "isbn": isbn,
            "result": result
        }
    except Exception as e:
        return {
            "status": "error",
            "isbn": isbn,
            "error": str(e)
        }
