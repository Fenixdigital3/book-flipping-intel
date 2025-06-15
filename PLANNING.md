
# Book Arbitrage Intelligence Platform - Architecture

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL
- **Web Scraping**: Python requests + BeautifulSoup4
- **State Management**: TanStack Query for API calls

## Architecture Overview
```
Frontend (React)     Backend (FastAPI)     Database (PostgreSQL)
     |                      |                      |
  API Calls  <-->  REST Endpoints  <-->  SQLAlchemy ORM
     |                      |                      |
Book Search UI      Scraper Services        Book Data Tables
Profit Calculator   Price Comparison       Historical Prices
Dashboard Views     Stock Monitoring       User Analytics
```

## Core Components

### Backend Services
1. **Book Scraper Service**: Scrapes Amazon US for book data
2. **Price Analysis Service**: Calculates profit margins and opportunities
3. **Database Service**: Manages book data, prices, and historical records
4. **API Routes**: REST endpoints for frontend communication

### Frontend Components
1. **Dashboard**: Overview of profitable opportunities
2. **Book Search**: Search and filter book database
3. **Price Comparison**: Side-by-side price analysis
4. **Profit Calculator**: Real-time arbitrage calculations

### Database Schema
- **books**: ISBN, title, author, category, etc.
- **prices**: Current and historical pricing data
- **stores**: Store information and scraping metadata
- **opportunities**: Calculated arbitrage opportunities

## File Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── models/              # SQLAlchemy models
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic
│   ├── scrapers/            # Web scraping modules
│   └── database.py          # Database configuration
└── requirements.txt

frontend/
├── src/
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── services/            # API service calls
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Helper functions
```

## Environment Variables
- DATABASE_URL: PostgreSQL connection string
- AMAZON_API_KEYS: For enhanced scraping (if available)
- SCRAPING_DELAY: Rate limiting for ethical scraping
