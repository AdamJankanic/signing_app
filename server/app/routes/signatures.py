"""
Signature Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Signature
from app.schemas import SignatureCreate, SignatureResponse, MessageResponse
from app.utils.auth import get_current_user

router = APIRouter()

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
    
    # Create signature record
    new_signature = Signature(
        user_id=current_user.id,
        signature_data=signature_data.signature_data,
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
    
    db.delete(signature)
    db.commit()
    
    return {"message": "Signature deleted successfully"}
