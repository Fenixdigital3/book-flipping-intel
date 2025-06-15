"""
Book-related API routes.

This module handles all book search, retrieval, and management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.book import Book
from ..services.book_service import BookService
from ..schemas.book import BookResponse, BookSearch

router = APIRouter()

@router.get("/search", response_model=List[BookResponse])
async def search_books(
    q: Optional[str] = Query(None, description="Search query"),
    isbn: Optional[str] = Query(None, description="ISBN search"),
    author: Optional[str] = Query(None, description="Author search"),
    category: Optional[str] = Query(None, description="Category filter"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    limit: int = Query(50, le=100, description="Number of results to return"),
    offset: int = Query(0, description="Number of results to skip"),
    order_by: Optional[str] = Query(None, description="Sort by field (title, author, lowest_price, highest_price, price_spread)"),
    order_direction: Optional[str] = Query("asc", description="Sort direction (asc, desc)"),
    db: Session = Depends(get_db)
):
    """
    Search books with various filters, pagination, and sorting.
    
    Args:
        q: General search query
        isbn: ISBN search
        author: Author search
        category: Category filter
        min_price: Minimum price filter
        max_price: Maximum price filter
        limit: Number of results to return
        offset: Number of results to skip
        order_by: Field to sort by
        order_direction: Sort direction
        db: Database session
        
    Returns:
        List[BookResponse]: List of books matching search criteria
    """
    try:
        books = BookService.search_books(
            db=db,
            query=q,
            isbn=isbn,
            author=author,
            category=category,
            min_price=min_price,
            max_price=max_price,
            limit=limit,
            offset=offset,
            order_by=order_by,
            order_direction=order_direction
        )
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: int, db: Session = Depends(get_db)):
    """
    Get a specific book by ID.
    
    Args:
        book_id: Book ID
        db: Database session
        
    Returns:
        BookResponse: Book details with current prices
    """
    book = BookService.get_book_with_prices(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.get("/isbn/{isbn}", response_model=BookResponse)
async def get_book_by_isbn(isbn: str, db: Session = Depends(get_db)):
    """
    Get a book by ISBN.
    
    Args:
        isbn: Book ISBN
        db: Database session
        
    Returns:
        BookResponse: Book details with current prices
    """
    book = BookService.get_book_by_isbn(db, isbn)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.get("/", response_model=List[BookResponse])
async def list_books(
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """
    List books with pagination.
    
    Args:
        limit: Number of results to return
        offset: Number of results to skip
        db: Database session
        
    Returns:
        List[BookResponse]: List of books
    """
    books = BookService.list_books(db, limit=limit, offset=offset)
    return books
