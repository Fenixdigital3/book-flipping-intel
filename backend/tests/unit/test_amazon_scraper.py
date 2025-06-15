
"""
Amazon scraper tests.

This module tests the Amazon scraper functionality.
"""

import pytest
from app.scrapers.amazon_scraper import AmazonScraper

@pytest.mark.asyncio
async def test_amazon_scraper_init():
    """Test Amazon scraper initialization."""
    scraper = AmazonScraper()
    assert scraper.base_url == "https://www.amazon.com"
    assert scraper.rate_limit == 1
    assert "Mozilla" in scraper.user_agent

@pytest.mark.asyncio
async def test_scrape_book_returns_mock_data():
    """Test that scrape_book returns mock data structure."""
    scraper = AmazonScraper()
    isbn = "9780262033848"
    
    result = await scraper.scrape_book(isbn)
    
    assert result is not None
    assert result["isbn"] == isbn
    assert "title" in result
    assert "author" in result
    assert "price" in result
    assert isinstance(result["price"], (int, float))
    assert "availability" in result

@pytest.mark.asyncio
async def test_search_books_returns_results():
    """Test that search_books returns list of results."""
    scraper = AmazonScraper()
    query = "python programming"
    
    results = await scraper.search_books(query, max_results=5)
    
    assert isinstance(results, list)
    assert len(results) <= 5
    if results:  # If results exist, check structure
        book = results[0]
        assert "isbn" in book
        assert "title" in book
        assert "price" in book
