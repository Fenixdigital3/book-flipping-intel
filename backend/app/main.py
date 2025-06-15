
"""
FastAPI application for Book Arbitrage Intelligence Platform.

This module initializes the FastAPI app and includes all route handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from .routes import books, prices, scraper
from .database import engine, Base

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Book Arbitrage Intelligence API",
    description="API for scraping and analyzing book prices across online stores",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route handlers
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(prices.router, prefix="/api/prices", tags=["prices"])
app.include_router(scraper.router, prefix="/api/scraper", tags=["scraper"])

@app.get("/")
async def root():
    """Root endpoint returning API information."""
    return {
        "message": "Book Arbitrage Intelligence API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "book-arbitrage-api"}
