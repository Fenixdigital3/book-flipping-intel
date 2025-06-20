

# TASK.md

## Active

* [ ] Design and implement search interface in frontend:
  * [ ] Filter UI (profit margin, turnaround time)
  * [ ] Search bar (ISBN, keyword)
  * [ ] Result list with price comparison and trend button

## Backlog

* [ ] Add scrapers for Barnes & Noble, ThriftBooks, BookOutlet.
* [ ] Create scraper plugin interface and auto-discovery mechanism.
* [ ] Implement profitability scoring algorithm:
  * [ ] Margin calculation
  * [ ] Stock change frequency → demand proxy
* [ ] Implement export to CSV/Excel for search results.
* [ ] Add user auth module (basic email/password or OAuth).
* [ ] Deploy to Loveable.dev or Railway.
* [ ] Add pagination and sorting to frontend search results.
* [ ] Implement historical trend graph modal in frontend (e.g., Recharts).
* [ ] Optimize DB queries and indexing.

## Completed

* [x] Build initial REST API endpoints for:
  * [x] Book list with filters _(Completed 2025-06-15)_
  * [x] Book detail with historical price trend _(Completed 2025-06-15)_
* [x] Set up scheduler (APScheduler) to trigger Amazon scraper every 6 hours. _(Completed 2025-06-15)_
* [x] Scaffold Amazon US scraper using Playwright with headless browser and anti-bot tactics. _(Completed 2025-06-15)_
* [x] Define and migrate PostgreSQL schema: books, retailers, prices, profitability. _(Completed 2025-06-15)_
* [x] Initialize backend project with FastAPI and SQLModel. _(Completed 2025-06-15)_
* [x] Initialize frontend project with React (Loveable.dev-compatible) and Tailwind CSS. _(Completed 2025-06-15)_
* [x] Project planning finalized (`PLANNING.md`)
* [x] Directory structure and scaffolding strategy defined
* [x] Golden rules and prompting workflow integrated

## Discovered During Work

* [x] Added dedicated `/api/prices/history/{book_id}` endpoint for historical price trends _(Completed 2025-06-15)_
* [x] Added `/api/prices/statistics/{book_id}` endpoint for price analytics and volatility _(Completed 2025-06-15)_
* [ ] [Add scraper retry/timeout logging module]
* [ ] [Evaluate need for rotating proxies on Amazon]
* [ ] [Dynamic sitemap or robots.txt parser for future compliance]

