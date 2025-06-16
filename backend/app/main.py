
"""
BookFlipFinder FastAPI Backend - Contest Submission
A complete book arbitrage API with CRUD operations and in-memory storage.
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Pydantic Models
class BookBase(BaseModel):
    """Base book model with common fields."""
    title: str = Field(..., min_length=1, max_length=500)
    author: str = Field(..., min_length=1, max_length=300)
    isbn: str = Field(..., min_length=10, max_length=13)
    publisher: Optional[str] = Field(None, max_length=200)
    publication_year: Optional[int] = Field(None, ge=1000, le=2030)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., ge=0)

class BookCreate(BookBase):
    """Model for creating a new book."""
    pass

class BookUpdate(BaseModel):
    """Model for updating an existing book."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    author: Optional[str] = Field(None, min_length=1, max_length=300)
    isbn: Optional[str] = Field(None, min_length=10, max_length=13)
    publisher: Optional[str] = Field(None, max_length=200)
    publication_year: Optional[int] = Field(None, ge=1000, le=2030)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)

class BookResponse(BookBase):
    """Model for book responses with additional metadata."""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# In-memory storage
books_db: Dict[str, Dict[str, Any]] = {}

# FastAPI app
app = FastAPI(
    title="BookFlipFinder API",
    description="Book arbitrage intelligence platform for contest submission",
    version="1.0.0"
)

# Utility functions
def get_current_timestamp() -> datetime:
    """Get current UTC timestamp."""
    return datetime.utcnow()

def create_book_record(book_data: BookCreate) -> Dict[str, Any]:
    """Create a new book record with metadata."""
    book_id = str(uuid.uuid4())
    timestamp = get_current_timestamp()
    
    return {
        "id": book_id,
        "title": book_data.title,
        "author": book_data.author,
        "isbn": book_data.isbn,
        "publisher": book_data.publisher,
        "publication_year": book_data.publication_year,
        "category": book_data.category,
        "description": book_data.description,
        "price": book_data.price,
        "created_at": timestamp,
        "updated_at": timestamp
    }

# Health check endpoint
@app.get("/healthz")
async def health_check():
    """Railway health check endpoint."""
    return {"status": "ok", "service": "bookflipfinder-api"}

# Book CRUD endpoints
@app.post("/books", response_model=BookResponse, status_code=201)
async def create_book(book: BookCreate):
    """
    Create a new book record.
    
    Args:
        book: Book data to create
        
    Returns:
        BookResponse: Created book with metadata
        
    Raises:
        HTTPException: 400 if ISBN already exists
    """
    # Check if ISBN already exists
    for existing_book in books_db.values():
        if existing_book["isbn"] == book.isbn:
            raise HTTPException(
                status_code=400, 
                detail=f"Book with ISBN {book.isbn} already exists"
            )
    
    book_record = create_book_record(book)
    books_db[book_record["id"]] = book_record
    
    return BookResponse(**book_record)

@app.get("/books", response_model=List[BookResponse])
async def list_books(
    limit: int = Query(10, ge=1, le=100, description="Number of books to return"),
    offset: int = Query(0, ge=0, description="Number of books to skip"),
    category: Optional[str] = Query(None, description="Filter by category"),
    author: Optional[str] = Query(None, description="Filter by author")
):
    """
    List books with optional filtering and pagination.
    
    Args:
        limit: Maximum number of books to return
        offset: Number of books to skip
        category: Optional category filter
        author: Optional author filter
        
    Returns:
        List[BookResponse]: List of books matching criteria
    """
    books_list = list(books_db.values())
    
    # Apply filters
    if category:
        books_list = [book for book in books_list if book.get("category") == category]
    
    if author:
        books_list = [book for book in books_list if book.get("author") == author]
    
    # Apply pagination
    paginated_books = books_list[offset:offset + limit]
    
    return [BookResponse(**book) for book in paginated_books]

@app.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str):
    """
    Get a specific book by ID.
    
    Args:
        book_id: Book ID to retrieve
        
    Returns:
        BookResponse: Book details
        
    Raises:
        HTTPException: 404 if book not found
    """
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return BookResponse(**books_db[book_id])

@app.put("/books/{book_id}", response_model=BookResponse)
async def update_book(book_id: str, book_update: BookUpdate):
    """
    Update an existing book.
    
    Args:
        book_id: Book ID to update
        book_update: Updated book data
        
    Returns:
        BookResponse: Updated book details
        
    Raises:
        HTTPException: 404 if book not found, 400 if ISBN conflict
    """
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    
    book_record = books_db[book_id].copy()
    
    # Check for ISBN conflicts if updating ISBN
    if book_update.isbn:
        for existing_id, existing_book in books_db.items():
            if existing_id != book_id and existing_book["isbn"] == book_update.isbn:
                raise HTTPException(
                    status_code=400, 
                    detail=f"ISBN {book_update.isbn} already exists"
                )
    
    # Update fields
    update_data = book_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        book_record[field] = value
    
    book_record["updated_at"] = get_current_timestamp()
    books_db[book_id] = book_record
    
    return BookResponse(**book_record)

@app.delete("/books/{book_id}")
async def delete_book(book_id: str):
    """
    Delete a book by ID.
    
    Args:
        book_id: Book ID to delete
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: 404 if book not found
    """
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    
    deleted_book = books_db.pop(book_id)
    return {"message": f"Book '{deleted_book['title']}' deleted successfully"}

# Development info endpoint
@app.get("/info")
async def get_api_info():
    """Get API information and statistics."""
    return {
        "name": "BookFlipFinder API",
        "version": "1.0.0",
        "total_books": len(books_db),
        "endpoints": {
            "health": "/healthz",
            "books": "/books",
            "create_book": "POST /books",
            "get_book": "GET /books/{id}",
            "update_book": "PUT /books/{id}",
            "delete_book": "DELETE /books/{id}"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
