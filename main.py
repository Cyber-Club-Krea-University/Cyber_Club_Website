#!/usr/bin/env python3
"""
Enhanced Cyber Club Website - Main Application
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
from pathlib import Path

# Import configuration and database
from config import get_settings
from src.database_management.database import engine, Base
from src.routers import auth, project_router, user_router

# Import enhanced routers (we'll create these)
# from src.routers import admin_router, notification_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting Cyber Club Application...")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    # Load initial data if needed
    try:
        from seed_projects import seed_database
        seed_database()
        logger.info("✅ Sample data loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Sample data loading failed: {e}")
    
    logger.info("🎉 Application startup complete!")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down Cyber Club Application...")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A comprehensive platform for Cyber Club project management and collaboration",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.krea.edu.in", "*.krea.ac.in"]
)

# Custom middleware for logging and security
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and add security headers"""
    # Log request
    logger.info(f"{request.method} {request.url}")
    
    # Process request
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Log response
    logger.info(f"Response: {response.status_code}")
    
    return response

# Setup templates and static files
templates = Jinja2Templates(directory="views")
app.mount("/static", StaticFiles(directory="views/static"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(project_router.router)
app.include_router(user_router.router)

# Health check endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serve the main application page"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "app_name": settings.app_name,
        "app_version": settings.app_version
    })

# API Information endpoints
@app.get("/api/info")
async def api_info():
    """Get API information"""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "description": "Cyber Club project management and collaboration platform",
        "documentation": "/docs",
        "health_check": "/health",
        "features": [
            "User Authentication (Google OAuth)",
            "Project Management",
            "Application System",
            "Member Management",
            "Real-time Notifications",
            "Admin Dashboard"
        ]
    }

@app.get("/api/stats")
async def api_stats():
    """Get application statistics"""
    from src.database_management.database import get_db
    from src.database_management.tables import User, Project, ProjectApplication
    from sqlalchemy import func
    
    db = next(get_db())
    
    try:
        total_users = db.query(func.count(User.id)).scalar()
        total_projects = db.query(func.count(Project.id)).scalar()
        total_applications = db.query(func.count(ProjectApplication.id)).scalar()
        active_projects = db.query(func.count(Project.id)).filter(
            Project.status.in_(["planning", "active"])
        ).scalar()
        
        return {
            "total_users": total_users,
            "total_projects": total_projects,
            "active_projects": active_projects,
            "total_applications": total_applications,
            "success_rate": round((total_projects / max(total_users, 1)) * 100, 2)
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {
            "error": "Could not retrieve statistics"
        }
    finally:
        db.close()

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Handle 404 errors"""
    if request.url.path.startswith("/api/"):
        return {"error": "Endpoint not found", "path": request.url.path}
    return templates.TemplateResponse("index.html", {
        "request": request,
        "app_name": settings.app_name
    })

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {exc}")
    return {"error": "Internal server error", "detail": "Please try again later"}

# Configuration endpoint for frontend
@app.get("/api/config")
async def get_config():
    """Get frontend configuration"""
    return {
        "app_name": settings.app_name,
        "allowed_email_domains": settings.allowed_email_domains,
        "google_client_id": settings.google_client_id if settings.google_client_id else None,
        "features": {
            "notifications": True,
            "real_time_updates": True,
            "file_uploads": False,  # To be implemented
            "video_calls": False    # To be implemented
        }
    }

if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
