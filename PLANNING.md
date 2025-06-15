
# PLANNING.md

## Project Name: Book Arbitrage Intelligence Platform

### Summary

A full-stack platform designed for individual book resellers to identify profitable resale opportunities by aggregating and analyzing real-time and historical pricing and stock data from major online bookstores (starting with US-based retailers like Amazon and Barnes & Noble).

* * *

## Purpose

To give online book arbitrage sellers a competitive edge by:

* Centralizing multi-retailer price and availability data.
* Providing actionable insights based on user-defined profit and turnover criteria.
* Enabling efficient sourcing decisions via a user-friendly web interface.

* * *

## Core Features

* **Multi-source Book Scraping**: Scrape book listings from major US online bookstores (Amazon, B&N, etc.) using resilient browser-based scrapers.
* **Real-time & Historical Tracking**: Store timestamped price and stock data to allow trend and profitability analysis over time.
* **Profitability Engine**: Compute per-book profit potential using configurable rules (purchase price, target margin, platform fees, estimated demand).
* **Search Interface**: Allow users to search/filter based on ISBN, profit margin, turnaround time, or historical pricing stability.
* **Modular Retailer Support**: Easily add/remove scraper modules per book retailer without affecting core logic.

* * *

## Architecture

### Frontend (React, Loveable.dev)

* Built with React and Tailwind (Loveable.dev compatible).
* UI components: search bar, filter sidebar, results table, trend graph modal.
* Communicates with backend via REST API.

### Backend (FastAPI, Python)

* FastAPI REST service exposing:
  * Book search/filter endpoints
  * Book detail (price history, profitability)
  * Admin-only scraper management endpoints
* Uses SQLModel ORM for type-safe DB access.

### Database (PostgreSQL)

* Core tables:
  * `books`: unique ISBN + metadata
  * `retailers`: book sources (Amazon, etc.)
  * `prices`: time-series of retailer prices + stock data
  * `profitability`: computed insights per snapshot

### Scraper Engine (Python, Playwright)

* Retailer-specific scraper modules, all inheriting a base interface.
* Controlled by scheduler, logs each scrape, and handles anti-bot measures.

### Scheduler (APScheduler or Celery + Redis)

* Scrapes default every 6 hours (configurable).
* Runs async to avoid blocking core API.

### DevOps (Dockerized)

* Local dev and deployment via Docker Compose.
* Production ready for Loveable.dev, Railway, Render, or Fly.io.

* * *

## Data Flow Overview

1. Scheduler triggers scraping module for each retailer.
2. Scraper fetches data → standardizes it → stores in `books`, `prices`.
3. Profitability engine computes margin/demand signals per book.
4. User frontend fetches filtered data via FastAPI and renders it.

* * *

## Technology Stack

| Layer | Tech |
| --- | --- |
| Frontend | React, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL + SQLModel |
| Scraping | Playwright, Async Python |
| Scheduling | APScheduler or Celery |
| DevOps | Docker, Docker Compose |
| Hosting | Loveable.dev-compatible |

* * *

## Constraints

* Must respect anti-bot practices and implement delays and retries in scrapers.
* Data must be stored efficiently (indexing on ISBN, timestamp).
* User interface must remain responsive with large result sets.
* No actual purchasing—only data collection and recommendation.

* * *

## Key Decisions

* Playwright chosen for scraping due to dynamic content rendering needs.
* SQLModel chosen for modern type-safe ORM over SQLAlchemy Core.
* All logic containerized from day one for consistent environment and deployability.
* Global rules for AI assistant (task tracking, test coverage, modularization) strictly enforced.

* * *

## Future Enhancements

* Add user auth and saved search alerts.
* Expand to international bookstores.
* Provide resale channel integrations (Amazon Seller API, eBay listings).
