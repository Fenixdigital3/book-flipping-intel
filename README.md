
# BookFlipFinder

**BookFlipFinder** is a web-based tool that helps individual book resellers find profitable books to flip by scraping real-time and historical pricing data from major online bookstores like Amazon, Barnes & Noble, and others. It provides actionable insights based on profit margins and desired resale speeds, enabling smarter, faster sourcing decisions.

---

## 🚀 Features

- 🔍 Scrapes and stores prices, availability, and stock levels from major online book retailers.
- 📊 Tracks book pricing historically and in real-time.
- 💰 Calculates book resale profitability based on margin and demand trends.
- 🔎 Allows users to search and filter books by profit margin, resale velocity, and retailer.
- 📤 Exportable results (CSV support planned).
- 📈 Price trend graphs (upcoming).

---

## 🧰 Tech Stack

| Layer       | Technology            |
|-------------|------------------------|
| Frontend    | React, Tailwind CSS    |
| Backend     | Python, FastAPI        |
| Database    | PostgreSQL + SQLModel  |
| Scraping    | Playwright (headless)  |
| Scheduler   | APScheduler / Celery   |
| Testing     | Pytest                 |
| Deployment  | Docker, Loveable.dev   |

---

## ⚙️ Getting Started

### Backend
```bash
cd backend
cp .env.example .env
docker-compose up --build
```
