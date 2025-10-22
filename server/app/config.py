"""
Configuration Settings
"""
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    app_name: str = "Electronic Signature API"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # Database settings
    database_url: str = "sqlite:///./electronic_signature.db"
    # For PostgreSQL: "postgresql://user:password@localhost/dbname"
    
    # Security settings
    secret_key: str = "hackathon-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    
    # File upload settings
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_document_types: list = [".pdf", ".png", ".jpg", ".jpeg"]
    upload_dir: str = "uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    """Get cached settings instance"""
    return Settings()
