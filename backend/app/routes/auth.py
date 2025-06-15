
"""
Authentication API routes.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models.user import User, UserCreate, UserLogin, UserResponse, Token
from ..auth.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    Args:
        user_data (UserCreate): User registration data
        db (Session): Database session
        
    Returns:
        UserResponse: Created user data
        
    Raises:
        HTTPException: 400 if email already exists
    """
    try:
        # Hash the password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = User(
            email=user_data.email,
            hashed_password=hashed_password
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )


@router.post("/login", response_model=Token)
async def login_user(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login user and return JWT token.
    
    Args:
        user_credentials (UserLogin): Login credentials
        db (Session): Database session
        
    Returns:
        Token: JWT access token
        
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information.
    
    Args:
        current_user (User): Current authenticated user
        
    Returns:
        UserResponse: Current user data
    """
    return current_user
