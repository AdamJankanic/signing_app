"""
Signed Document Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Document, Signature, SignedDocument
from app.schemas import SignedDocumentCreate, SignedDocumentResponse, MessageResponse
from app.utils.auth import get_current_user
from app.utils.signature_processor import apply_signature_to_document

router = APIRouter()


@router.post("/apply", response_model=SignedDocumentResponse, status_code=status.HTTP_201_CREATED)
async def apply_signature(
        signed_doc_data: SignedDocumentCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Apply signature to a document"""

    # Verify document exists and belongs to user
    document = db.query(Document).filter(
        Document.id == signed_doc_data.document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Verify signature exists and belongs to user
    signature = db.query(Signature).filter(
        Signature.id == signed_doc_data.signature_id,
        Signature.user_id == current_user.id
    ).first()

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature not found"
        )

    # Apply signature to document
    # Note: signature.signature_data now contains file path, not base64
    # We need to read the signature file
    from pathlib import Path
    signature_file_path = Path(signature.signature_data)
    
    if not signature_file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signature file not found"
        )
    
    # Read signature file as base64 for processing
    import base64
    with open(signature_file_path, "rb") as f:
        signature_bytes = f.read()
        signature_base64 = base64.b64encode(signature_bytes).decode('utf-8')
    
    signed_file_path = await apply_signature_to_document(
        document.file_path,
        signature_base64,
        signed_doc_data.signature_position_x,
        signed_doc_data.signature_position_y
    )

    # Create signed document record
    signed_document = SignedDocument(
        document_id=document.id,
        signature_id=signature.id,
        signed_file_path=signed_file_path,
        signature_position_x=signed_doc_data.signature_position_x,
        signature_position_y=signed_doc_data.signature_position_y
    )

    db.add(signed_document)

    # Update document status
    document.is_signed = True

    db.commit()
    db.refresh(signed_document)

    return signed_document


@router.get("/{signed_document_id}", response_model=SignedDocumentResponse)
async def get_signed_document(
        signed_document_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get signed document details"""

    signed_doc = db.query(SignedDocument).join(Document).filter(
        SignedDocument.id == signed_document_id,
        Document.user_id == current_user.id
    ).first()

    if not signed_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signed document not found"
        )

    return signed_doc


@router.get("/{signed_document_id}/download")
async def download_signed_document(
        signed_document_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Download signed document"""

    signed_doc = db.query(SignedDocument).join(Document).filter(
        SignedDocument.id == signed_document_id,
        Document.user_id == current_user.id
    ).first()

    if not signed_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signed document not found"
        )

    # Get original document for filename
    document = db.query(Document).filter(Document.id == signed_doc.document_id).first()

    return FileResponse(
        path=signed_doc.signed_file_path,
        filename=f"signed_{document.original_filename}",
        media_type="application/octet-stream"
    )


@router.get("/document/{document_id}/list", response_model=List[SignedDocumentResponse])
async def list_signed_versions(
        document_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """List all signed versions of a document"""

    # Verify document belongs to user
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    signed_docs = db.query(SignedDocument).filter(
        SignedDocument.document_id == document_id
    ).all()

    return signed_docs
