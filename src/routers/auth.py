#!/usr/bin/env python3
"""
Enhanced Authentication Router with Environment Configuration
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
import requests
import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import logging
import re

from ..database_management.database import get_db
from ..database_management.schemas import UserCreate, User
from ..repositories.user_rep import UserRepository
from .hashing import Hash
from config import get_settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
settings = get_settings()

# Security
security = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]
    expires_at: datetime

class GoogleAuthRequest(BaseModel):
    credential: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# JWT Token Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token with enhanced security"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access_token"
    })
    
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)  # Refresh token valid for 7 days
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh_token"
    })
    
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def verify_token(token: str, token_type: str = "access_token") -> dict:
    """Verify JWT token with enhanced validation"""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        
        # Verify token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Check expiration
        if payload.get("exp") < datetime.utcnow().timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

def validate_email_domain(email: str) -> bool:
    """Validate if email belongs to allowed domains"""
    domain = email.split('@')[1].lower()
    return domain in [d.lower() for d in settings.allowed_email_domains]

def is_admin_email(email: str) -> bool:
    """Check if email is admin"""
    return email.lower() in [e.lower() for e in settings.super_admin_emails]

def verify_google_token(credential: str) -> Dict[str, Any]:
    """Verify Google ID token and extract user information"""
    try:
        # Google's token verification endpoint
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        response = requests.get(url)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google token"
            )
        
        token_info = response.json()
        
        # Verify the token is for our application
        if token_info.get('aud') != settings.google_client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token not issued for this application"
            )
        
        # Extract user information
        return {
            'email': token_info.get('email'),
            'name': token_info.get('name'),
            'picture': token_info.get('picture'),
            'email_verified': token_info.get('email_verified', False)
        }
        
    except requests.RequestException as e:
        logger.error(f"Error verifying Google token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to verify Google token"
        )
    except Exception as e:
        logger.error(f"Unexpected error in Google token verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )

# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
) -> User:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        payload = verify_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        
        user_repo = UserRepository(db)
        user = user_repo.get_user_by_id(user_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

# Optional authentication (for public endpoints that benefit from user context)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db=Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise None"""
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials, db)
    except:
        return None

# Admin dependency
async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user is admin"""
    if not is_admin_email(current_user.email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# Routes
@router.post("/google-login", response_model=Token)
async def google_login(auth_request: GoogleAuthRequest, db=Depends(get_db)):
    """Enhanced Google OAuth login with comprehensive validation"""
    try:
        # Verify Google token and get user info
        google_user = verify_google_token(auth_request.credential)
        email = google_user['email']
        name = google_user['name']
        
        # Validate email is verified
        if not google_user.get('email_verified', False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not verified with Google"
            )
        
        # Validate email domain
        if not validate_email_domain(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email must be from allowed domains: {', '.join(settings.allowed_email_domains)}"
            )
        
        user_repo = UserRepository(db)
        
        # Try to get existing user
        user = user_repo.get_user_by_email(email)
        
        if not user:
            # Create new user
            try:
                
                user_create = UserCreate(
                    name=name,
                    email=email,
                    password="google_oauth_user",  # Placeholder for OAuth users
                    google_id=auth_request.id_token[:50]  # Store part of the token as ID
                )
                
                user = user_repo.create_user(user_create)
                logger.info(f"Created new user: {email}")
                
            except Exception as e:
                logger.error(f"Error creating user: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user account"
                )
        
        # Create tokens
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=access_token_expires
        )
        
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "email": user.email}
        )
        
        # Determine user role
        is_admin = is_admin_email(user.email)
        
        response_data = Token(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "is_admin": is_admin,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            expires_at=datetime.utcnow() + access_token_expires
        )
        
        logger.info(f"Successful Google login: {email}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_request: RefreshTokenRequest, db=Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        payload = verify_token(refresh_request.refresh_token, "refresh_token")
        user_id = payload.get("sub")
        
        user_repo = UserRepository(db)
        user = user_repo.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "is_admin": is_admin_email(user.email)
            },
            expires_at=datetime.utcnow() + access_token_expires
        )
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )

@router.post("/register", response_model=User)
async def register_user(user: UserCreate, db=Depends(get_db)):
    """Register new user with enhanced validation"""
    try:
        # Validate email domain
        if not validate_email_domain(user.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email must be from allowed domains: {', '.join(settings.allowed_email_domains)}"
            )
        
        user_repo = UserRepository(db)
        
        # Check if user already exists
        if user_repo.get_user_by_email(user.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        new_user = user_repo.create_user(user)
        logger.info(f"New user registered: {user.email}")
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login_user(login_request: LoginRequest, db=Depends(get_db)):
    """Login with email and password"""
    try:
        user_repo = UserRepository(db)
        user = user_repo.get_user_by_email(login_request.email)
        
        if not user or not Hash.verify(user.hashed_password, login_request.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create tokens
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "is_admin": is_admin_email(user.email)
            },
            expires_at=datetime.utcnow() + access_token_expires
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/logout")
async def logout():
    """Logout endpoint (client should delete token)"""
    return {"message": "Successfully logged out"}

@router.get("/validate")
async def validate_token_endpoint(current_user: User = Depends(get_current_user)):
    """Validate current token"""
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "is_admin": is_admin_email(current_user.email)
        }
    }