#!/usr/bin/env python3
"""
Configuration management for Cyber Club Application
"""
import os
from typing import List, Union, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        env_parse_none_str='',  # Don't parse empty strings as None
        extra='ignore'  # Ignore extra fields
    )
    
    # JWT Authentication
    jwt_secret_key: str = "cyber-club-super-secret-key-2024-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours
    
    # Database
    database_url: str = "sqlite:///./site.db"
    
    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    
    # Application
    app_name: str = "Cyber Club Website"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # Email Domains (as string to be parsed)
    allowed_email_domains: Union[str, List[str]] = "krea.edu.in,krea.ac.in"
    
    # Admin Configuration
    admin_email: str = "admin@krea.edu.in"
    super_admin_emails: Union[str, List[str]] = "admin@krea.edu.in,president@krea.edu.in"
    
    # CORS (as string to be parsed)
    cors_origins: Union[str, List[str]] = "http://localhost:3000,http://localhost:8000,https://yourdomain.com"
    
    # Security
    bcrypt_rounds: int = 12
    
    # Logging
    log_level: str = "INFO"
    
    @field_validator('allowed_email_domains', mode='before')
    @classmethod
    def parse_email_domains(cls, v):
        if isinstance(v, str):
            return [domain.strip() for domain in v.split(',') if domain.strip()]
        return v
    
    @field_validator('super_admin_emails', mode='before')
    @classmethod
    def parse_admin_emails(cls, v):
        if isinstance(v, str):
            return [email.strip() for email in v.split(',') if email.strip()]
        return v
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    return settings 