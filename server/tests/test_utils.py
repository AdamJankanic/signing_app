"""
Tests for Utility Functions
"""
import pytest
from app.utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token
)
from app.utils.file_handler import validate_file_type
from datetime import timedelta

class TestAuthUtils:
    """Test authentication utilities"""
    
    def test_password_hashing(self):
        """Test password hashing and verification"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False
    
    def test_create_access_token(self):
        """Test JWT token creation"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_create_access_token_with_expiry(self):
        """Test JWT token creation with custom expiry"""
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta)
        
        assert token is not None
        assert isinstance(token, str)


class TestFileHandlerUtils:
    """Test file handler utilities"""
    
    def test_validate_pdf_file_type(self):
        """Test PDF file validation"""
        assert validate_file_type("document.pdf") is True
        assert validate_file_type("document.PDF") is True
    
    def test_validate_image_file_types(self):
        """Test image file validation"""
        assert validate_file_type("image.png") is True
        assert validate_file_type("image.jpg") is True
        assert validate_file_type("image.jpeg") is True
        assert validate_file_type("image.PNG") is True
    
    def test_validate_invalid_file_types(self):
        """Test invalid file type validation"""
        assert validate_file_type("document.txt") is False
        assert validate_file_type("document.docx") is False
        assert validate_file_type("document.exe") is False
        assert validate_file_type("document") is False
