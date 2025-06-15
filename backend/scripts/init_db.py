
"""
Database initialization script.

This script creates the database tables and optionally seeds initial data.
"""

import asyncio
from sqlalchemy import create_engine
from app.database import Base, DATABASE_URL
from app.models.store import Store

def create_tables():
    """Create all database tables."""
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def seed_stores():
    """Seed initial store data."""
    from sqlalchemy.orm import sessionmaker
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if stores already exist
        if db.query(Store).first():
            print("Stores already exist, skipping seed...")
            return
        
        # Create initial stores
        stores = [
            Store(
                name="Amazon US",
                code="amazon",
                base_url="https://www.amazon.com",
                search_url_template="https://www.amazon.com/s?k={query}",
                is_active=True,
                scraping_enabled=True,
                rate_limit_delay=1,
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                notes="Primary US marketplace for books"
            ),
            Store(
                name="Barnes & Noble",
                code="barnes_noble",
                base_url="https://www.barnesandnoble.com",
                search_url_template="https://www.barnesandnoble.com/s/{query}",
                is_active=False,  # Not implemented yet
                scraping_enabled=False,
                rate_limit_delay=2,
                notes="Major US bookstore chain - future implementation"
            )
        ]
        
        for store in stores:
            db.add(store)
        
        db.commit()
        print("Store data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding stores: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database...")
    create_tables()
    seed_stores()
    print("Database initialization complete!")
