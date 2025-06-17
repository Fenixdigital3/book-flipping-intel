"""
Alert Preference SQLModel for user notification settings.
"""

from sqlalchemy import Column, ARRAY, String
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

class AlertPreferenceBase(SQLModel):
    """Base alert preference model with shared fields."""
    profit_margin_threshold: Decimal = Field(default=20.00, ge=0, le=100, description="Minimum profit margin percentage")
    min_stock: int = Field(default=1, ge=0, description="Minimum stock quantity required")
    include_retailers: List[str] = Field(
        default=["Amazon", "Barnes & Noble", "ThriftBooks"],
        sa_column=Column(ARRAY(String)),
        description="List of retailers to include in alerts"
    )
    alert_frequency: str = Field(
        default="daily",
        regex="^(immediate|hourly|daily|weekly)$",
        description="How often to send alerts"
    )
    is_active: bool = Field(default=True, description="Whether alerts are enabled")

class AlertPreference(AlertPreferenceBase, table=True):
    """Alert preference database model."""
    __tablename__ = "alert_preferences"
    __table_args__ = {'extend_existing': True}
    
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(description="User ID from auth system")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AlertPreferenceCreate(AlertPreferenceBase):
    """Model for creating alert preferences - user_id will be set from JWT."""
    pass

class AlertPreferenceUpdate(SQLModel):
    """Model for updating alert preferences."""
    profit_margin_threshold: Optional[Decimal] = None
    min_stock: Optional[int] = None
    include_retailers: Optional[List[str]] = None
    alert_frequency: Optional[str] = None
    is_active: Optional[bool] = None

class AlertPreferenceResponse(AlertPreferenceBase):
    """Response model for alert preferences."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
