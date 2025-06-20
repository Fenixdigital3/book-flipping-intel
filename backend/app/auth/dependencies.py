
"""
Authentication dependencies for FastAPI.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from .security import verify_token

security = HTTPBearer()

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user.
    
    Args:
        credentials (HTTPAuthorizationCredentials): JWT token
        db (Session): Database session
        
    Returns:
        User: Current user
        
    Raises:
        HTTPException: If authentication fails
    """
    email = verify_token(credentials.credentials, credentials_exception)
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current active user.
    
    Args:
        current_user (User): Current user from token
        
    Returns:
        User: Current active user
    """
    return current_user
