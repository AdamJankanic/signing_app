"""
Signature Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import base64
import uuid
from pathlib import Path

from app.database import get_db
from app.models import User, Signature
from app.schemas import SignatureCreate, SignatureResponse, MessageResponse
from app.utils.auth import get_current_user
from app.utils.file_handler import delete_file
from app.config import get_settings

router = APIRouter()
settings = get_settings()

@router.post("/create", response_model=SignatureResponse, status_code=status.HTTP_201_CREATED)
async def create_signature(
    signature_data: SignatureCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create/save a new signature"""
    
    # Validate signature type
    if signature_data.signature_type not in ["drawn", "typed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signature type must be 'drawn' or 'typed'"
        )
    
    # Decode base64 signature data and save as file
    try:
        # Remove data URL prefix if present (e.g., "data:image/png;base64,")
        signature_base64 = signature_data.signature_data
        if "base64," in signature_base64:
            signature_base64 = signature_base64.split("base64,")[1]
        
        # Decode base64 to bytes
        signature_bytes = base64.b64decode(signature_base64)
        
        # Create upload directory if it doesn't exist
        upload_dir = Path(settings.upload_dir) / "signatures"
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}.png"
        file_path = upload_dir / unique_filename
        
        # Write file to disk
        with open(file_path, "wb") as f:
            f.write(signature_bytes)
        
        # Store relative path for database
        relative_path = f"uploads/signatures/{unique_filename}"
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid signature data: {str(e)}"
        )
    
    # Create signature record with file path
    new_signature = Signature(
        user_id=current_user.id,
        signature_data=relative_path,  # Store file path instead of base64
        signature_type=signature_data.signature_type
    )
    
    db.add(new_signature)
    db.commit()
    db.refresh(new_signature)
    
    return new_signature

@router.get("/my", response_model=List[SignatureResponse])
async def get_my_signatures(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all signatures for current user"""
    signatures = db.query(Signature).filter(
        Signature.user_id == current_user.id
    ).order_by(Signature.created_at.desc()).all()
    
    return signatures

@router.get("/{signature_id}", response_model=SignatureResponse)
async def get_signature(
    signature_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get signature by ID"""
    
    signature = db.query(Signature).filter(
        Signature.id == signature_id,
        Signature.user_id == current_user.id
    ).first()
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature not found"
        )
    
    return signature

@router.delete("/{signature_id}", response_model=MessageResponse)
async def delete_signature(
    signature_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a signature"""
    
    signature = db.query(Signature).filter(
        Signature.id == signature_id,
        Signature.user_id == current_user.id
    ).first()
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature not found"
        )
    
    # Delete file from disk
    delete_file(signature.signature_data)
    
    # Delete from database
    db.delete(signature)
    db.commit()
    
    return {"message": "Signature deleted successfully"}
