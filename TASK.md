
# TASK.md

## Active

* [ ] Scaffold Amazon US scraper using Playwright with headless browser and anti-bot tactics.
* [ ] Set up scheduler (APScheduler) to trigger Amazon scraper every 6 hours.
* [ ] Build initial REST API endpoints for:
  * [ ] Book list with filters
  * [ ] Book detail with historical price trend
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

* [x] Define and migrate PostgreSQL schema: books, retailers, prices, profitability. _(Completed 2025-06-15)_
* [x] Initialize backend project with FastAPI and SQLModel. _(Completed 2025-06-15)_
* [x] Initialize frontend project with React (Loveable.dev-compatible) and Tailwind CSS. _(Completed 2025-06-15)_
* [x] Project planning finalized (`PLANNING.md`)
* [x] Directory structure and scaffolding strategy defined
* [x] Golden rules and prompting workflow integrated

## Discovered During Work

* [ ] [Add scraper retry/timeout logging module]
* [ ] [Evaluate need for rotating proxies on Amazon]
* [ ] [Dynamic sitemap or robots.txt parser for future compliance]

