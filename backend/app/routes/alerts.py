
"""
Alert preferences API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from ..database import get_db
from ..models.alert_preference import (
    AlertPreference, 
    AlertPreferenceCreate, 
    AlertPreferenceUpdate, 
    AlertPreferenceResponse
)
from ..models.user import User
from ..auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/preferences", response_model=AlertPreferenceResponse)
async def get_alert_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get alert preferences for the current user.
    
    Args:
        current_user (User): Current authenticated user
        db (Session): Database session
        
    Returns:
        AlertPreferenceResponse: User's alert preferences
        
    Raises:
        HTTPException: 404 if preferences not found
    """
    preferences = db.query(AlertPreference).filter(
        AlertPreference.user_id == current_user.id
    ).first()
    
    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert preferences not found for this user"
        )
    
    return preferences


@router.post("/preferences", response_model=AlertPreferenceResponse)
async def create_alert_preferences(
    preferences_data: AlertPreferenceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create new alert preferences for the current user.
    
    Args:
        preferences_data (AlertPreferenceCreate): Preference data to create
        current_user (User): Current authenticated user
        db (Session): Database session
        
    Returns:
        AlertPreferenceResponse: Created alert preferences
        
    Raises:
        HTTPException: 400 if preferences already exist for user
    """
    try:
        # Create new preferences with current user's ID
        preferences_dict = preferences_data.dict()
        preferences_dict['user_id'] = current_user.id
        
        preferences = AlertPreference(**preferences_dict)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
        
        return preferences
        
    except IntegrityError as e:
        db.rollback()
        if "unique_user_alert_preference" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Alert preferences already exist for this user. Use PUT to update."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create alert preferences"
        )


@router.put("/preferences", response_model=AlertPreferenceResponse)
async def update_alert_preferences(
    preferences_update: AlertPreferenceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update existing alert preferences for the current user.
    
    Args:
        preferences_update (AlertPreferenceUpdate): Updated preference data
        current_user (User): Current authenticated user
        db (Session): Database session
        
    Returns:
        AlertPreferenceResponse: Updated alert preferences
        
    Raises:
        HTTPException: 404 if preferences not found
    """
    preferences = db.query(AlertPreference).filter(
        AlertPreference.user_id == current_user.id
    ).first()
    
    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert preferences not found for this user"
        )
    
    # Update only provided fields
    update_data = preferences_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(preferences, field, value)
    
    db.commit()
    db.refresh(preferences)
    
    return preferences


@router.delete("/preferences")
async def delete_alert_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete alert preferences for the current user.
    
    Args:
        current_user (User): Current authenticated user
        db (Session): Database session
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: 404 if preferences not found
    """
    preferences = db.query(AlertPreference).filter(
        AlertPreference.user_id == current_user.id
    ).first()
    
    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert preferences not found for this user"
        )
    
    db.delete(preferences)
    db.commit()
    
    return {"message": "Alert preferences deleted successfully"}
