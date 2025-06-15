
"""
Scheduler service for managing periodic scraping tasks.

This module handles scheduling and execution of background scraping operations.
"""

import asyncio
import logging
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..services.scraper_service import ScraperService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SchedulerService:
    """Service for managing scheduled scraping tasks."""
    
    def __init__(self):
        self.scheduler: Optional[AsyncIOScheduler] = None
        self.is_running = False
    
    def start(self):
        """Start the scheduler with configured jobs."""
        if self.scheduler is not None:
            logger.warning("Scheduler is already running")
            return
        
        self.scheduler = AsyncIOScheduler()
        
        # Schedule Amazon scraper every 6 hours
        self.scheduler.add_job(
            func=self._run_periodic_amazon_scraping,
            trigger=IntervalTrigger(hours=6),
            id='amazon_scraper_periodic',
            name='Amazon Scraper - Every 6 Hours',
            replace_existing=True,
            max_instances=1  # Prevent overlapping executions
        )
        
        # Start the scheduler
        self.scheduler.start()
        self.is_running = True
        logger.info("Scheduler started successfully")
        logger.info("Amazon scraper scheduled to run every 6 hours")
    
    def stop(self):
        """Stop the scheduler."""
        if self.scheduler is not None:
            self.scheduler.shutdown(wait=True)
            self.scheduler = None
            self.is_running = False
            logger.info("Scheduler stopped")
    
    def get_status(self) -> dict:
        """Get scheduler status and job information."""
        if not self.scheduler:
            return {"status": "stopped", "jobs": []}
        
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            })
        
        return {
            "status": "running" if self.is_running else "stopped",
            "jobs": jobs
        }
    
    async def _run_periodic_amazon_scraping(self):
        """Run periodic Amazon scraping task."""
        logger.info("Starting periodic Amazon scraping task")
        
        db: Session = SessionLocal()
        try:
            # Define popular book categories/searches to scrape periodically
            search_queries = [
                "python programming",
                "data science",
                "machine learning",
                "web development",
                "javascript",
                "artificial intelligence"
            ]
            
            total_results = 0
            
            for query in search_queries:
                try:
                    logger.info(f"Scraping search results for: {query}")
                    result = await ScraperService.scrape_search_results(
                        db=db,
                        query=query,
                        max_results=10  # Limit results per query to avoid overwhelming
                    )
                    
                    total_results += result.get("books_found", 0)
                    logger.info(f"Found {result.get('books_found', 0)} books for query: {query}")
                    
                    # Add delay between searches to respect rate limits
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error scraping query '{query}': {e}")
                    continue
            
            logger.info(f"Periodic scraping completed. Total books processed: {total_results}")
            
        except Exception as e:
            logger.error(f"Error in periodic scraping task: {e}")
        finally:
            db.close()

# Global scheduler instance
scheduler_service = SchedulerService()
