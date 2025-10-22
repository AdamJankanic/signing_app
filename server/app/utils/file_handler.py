"""
File Handling Utilities
"""
import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.config import get_settings

settings = get_settings()

def validate_file_type(filename: str) -> bool:
    """Validate file type based on extension"""
    file_ext = os.path.splitext(filename)[1].lower()
    return file_ext in settings.allowed_document_types

async def save_uploaded_file(file: UploadFile, contents: bytes, subfolder: str) -> tuple:
    """
    Save uploaded file to disk
    
    Args:
        file: UploadFile object
        contents: File contents as bytes
        subfolder: Subfolder name (e.g., 'documents' or 'signatures')
    
    Returns:
        tuple: (file_path, unique_filename)
    """
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.upload_dir) / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = upload_dir / unique_filename
    
    # Write file to disk
    with open(file_path, "wb") as f:
        f.write(contents)
    
    return str(file_path), unique_filename

def delete_file(file_path: str) -> bool:
    """Delete file from disk"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
        return False

def get_file_size(file_path: str) -> int:
    """Get file size in bytes"""
    try:
        return os.path.getsize(file_path)
    except Exception:
        return 0
