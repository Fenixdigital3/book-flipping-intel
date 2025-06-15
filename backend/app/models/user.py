
"""
User SQLModel for authentication.
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class UserBase(SQLModel):
    """Base user model with shared fields."""
    email: str = Field(unique=True, index=True, description="User email address")


class User(UserBase, table=True):
    """User database model."""
    __tablename__ = "users"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    hashed_password: str = Field(description="Hashed password")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    """Model for creating users."""
    password: str = Field(min_length=6, description="User password")


class UserLogin(SQLModel):
    """Model for user login."""
    email: str
    password: str


class UserResponse(UserBase):
    """Response model for user data."""
    id: str
    created_at: datetime
    updated_at: datetime


class Token(SQLModel):
    """Token response model."""
    access_token: str
    token_type: str = "bearer"


class TokenData(SQLModel):
    """Token data model."""
    email: Optional[str] = None
