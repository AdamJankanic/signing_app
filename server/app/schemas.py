"""
Pydantic Schemas for Request/Response Models
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# ===== User Schemas =====
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

# ===== Document Schemas =====
class DocumentBase(BaseModel):
    filename: str
    file_type: str

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    original_filename: str
    file_path: str
    file_size: int
    is_signed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===== Signature Schemas =====
class SignatureBase(BaseModel):
    signature_type: str = Field(..., pattern="^(drawn|typed)$")

class SignatureCreate(SignatureBase):
    signature_data: str  # Base64 encoded image

class SignatureResponse(SignatureBase):
    id: int
    user_id: int
    signature_data: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===== Signed Document Schemas =====
class SignedDocumentCreate(BaseModel):
    document_id: int
    signature_id: int
    signature_position_x: int = 0
    signature_position_y: int = 0

class SignedDocumentResponse(BaseModel):
    id: int
    document_id: int
    signature_id: int
    signed_file_path: str
    signature_position_x: int
    signature_position_y: int
    signed_at: datetime
    
    class Config:
        from_attributes = True

# ===== Generic Response Schemas =====
class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
