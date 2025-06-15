
"""
Scheduler service tests.

This module tests the scheduler functionality.
"""

import pytest
from unittest.mock import Mock, patch
from app.scheduler.scheduler_service import SchedulerService

def test_scheduler_initialization():
    """Test scheduler service initialization."""
    scheduler = SchedulerService()
    assert scheduler.scheduler is None
    assert scheduler.is_running is False

def test_scheduler_status_when_stopped():
    """Test scheduler status when not running."""
    scheduler = SchedulerService()
    status = scheduler.get_status()
    
    assert status["status"] == "stopped"
    assert status["jobs"] == []

@patch('app.scheduler.scheduler_service.AsyncIOScheduler')
def test_scheduler_start(mock_scheduler_class):
    """Test scheduler start functionality."""
    mock_scheduler = Mock()
    mock_scheduler_class.return_value = mock_scheduler
    
    scheduler = SchedulerService()
    scheduler.start()
    
    # Verify scheduler was created and started
    mock_scheduler_class.assert_called_once()
    mock_scheduler.add_job.assert_called_once()
    mock_scheduler.start.assert_called_once()
    assert scheduler.is_running is True

@patch('app.scheduler.scheduler_service.AsyncIOScheduler')
def test_scheduler_stop(mock_scheduler_class):
    """Test scheduler stop functionality."""
    mock_scheduler = Mock()
    mock_scheduler_class.return_value = mock_scheduler
    
    scheduler = SchedulerService()
    scheduler.start()
    scheduler.stop()
    
    # Verify scheduler was shut down
    mock_scheduler.shutdown.assert_called_once_with(wait=True)
    assert scheduler.scheduler is None
    assert scheduler.is_running is False

@patch('app.scheduler.scheduler_service.AsyncIOScheduler')
def test_scheduler_prevents_duplicate_start(mock_scheduler_class):
    """Test that starting scheduler twice doesn't create duplicate instances."""
    mock_scheduler = Mock()
    mock_scheduler_class.return_value = mock_scheduler
    
    scheduler = SchedulerService()
    scheduler.start()
    scheduler.start()  # Second start should be ignored
    
    # Should only create scheduler once
    assert mock_scheduler_class.call_count == 1
