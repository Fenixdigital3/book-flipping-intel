"""
BookFlipFinder FastAPI Backend - Contest Submission
A complete book arbitrage API with CRUD operations, authentication,
and in-memory storage.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# ----------------------------
# Pydantic Models
# ----------------------------

class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    author: str = Field(..., min_length=1, max_length=300)
    isbn: str = Field(..., min_length=10, max_length=13)
    publisher: Optional[str] = Field(None, max_length=200)
    publication_year: Optional[int] = Field(None, ge=1000, le=2030)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., ge=0)

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    author: Optional[str] = Field(None, min_length=1, max_length=300)
    isbn: Optional[str] = Field(None, min_length=10, max_length=13)
    publisher: Optional[str] = Field(None, max_length=200)
    publication_year: Optional[int] = Field(None, ge=1000, le=2030)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)

class BookResponse(BookBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserAuth(BaseModel):
    email: EmailStr
    password: str

# ----------------------------
# In-Memory Storage
# ----------------------------

books_db: Dict[str, Dict[str, Any]] = {}

users_db: Dict[str, Dict[str, str]] = {
    # Pre-populate demo account
    "demo@bookflipfinder.com": {"password": "demo123456"}
}

# ----------------------------
# FastAPI App & Middleware
# ----------------------------

app = FastAPI(
    title="BookFlipFinder API",
    description="Book arbitrage intelligence platform for contest submission",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend domain in prod if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Utility Functions
# ----------------------------

def get_current_timestamp() -> datetime:
    return datetime.utcnow()

def create_book_record(book_data: BookCreate) -> Dict[str, Any]:
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

# ----------------------------
# Authentication Endpoints
# ----------------------------

@app.post("/login")
async def login(creds: UserAuth):
    user = users_db.get(creds.email)
    if not user or user["password"] != creds.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "token": "fake-jwt-token"}

@app.post("/register")
async def register(creds: UserAuth):
    if creds.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    users_db[creds.email] = {"password": creds.password}
    return {"message": "Registration successful"}

# ----------------------------
# Health Check Endpoint
# ----------------------------

@app.get("/healthz")
async def health_check():
    return {"status": "ok", "service": "bookflipfinder-api"}

# ----------------------------
# Book CRUD Endpoints
# ----------------------------

@app.post("/books", response_model=BookResponse, status_code=201)
async def create_book(book: BookCreate):
    for existing in books_db.values():
        if existing["isbn"] == book.isbn:
            raise HTTPException(status_code=400, detail=f"Book with ISBN {book.isbn} already exists")
    record = create_book_record(book)
    books_db[record["id"]] = record
    return BookResponse(**record)

@app.get("/books", response_model=List[BookResponse])
async def list_books(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = Query(None),
    author: Optional[str] = Query(None)
):
    items = list(books_db.values())
    if category:
        items = [b for b in items if b.get("category") == category]
    if author:
        items = [b for b in items if b.get("author") == author]
    paginated = items[offset : offset + limit]
    return [BookResponse(**b) for b in paginated]

@app.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookResponse(**books_db[book_id])

@app.put("/books/{book_id}", response_model=BookResponse)
async def update_book(book_id: str, book_update: BookUpdate):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    record = books_db[book_id].copy()
    update_data = book_update.dict(exclude_unset=True)
    if "isbn" in update_data:
        for eid, eb in books_db.items():
            if eid != book_id and eb["isbn"] == update_data["isbn"]:
                raise HTTPException(status_code=400, detail=f"ISBN {update_data['isbn']} already exists")
    for k, v in update_data.items():
        record[k] = v
    record["updated_at"] = get_current_timestamp()
    books_db[book_id] = record
    return BookResponse(**record)

@app.delete("/books/{book_id}")
async def delete_book(book_id: str):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Book not found")
    deleted = books_db.pop(book_id)
    return {"message": f"Book '{deleted['title']}' deleted successfully"}

# ----------------------------
# API Info Endpoint
# ----------------------------

@app.get("/info")
async def get_api_info():
    return {
        "name": "BookFlipFinder API",
        "version": "1.0.0",
        "total_books": len(books_db),
        "endpoints": {
            "health": "/healthz",
            "books": "/books",
            "login": "/login",
            "register": "/register",
            "info": "/info"
        }
    }
