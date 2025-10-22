"""
Database Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    signatures = relationship("Signature", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    """Document model"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    is_signed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="documents")
    signed_documents = relationship("SignedDocument", back_populates="document", cascade="all, delete-orphan")

class Signature(Base):
    """Signature model"""
    __tablename__ = "signatures"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    signature_data = Column(Text, nullable=False)  # Base64 encoded signature image
    signature_type = Column(String(20), nullable=False)  # 'drawn' or 'typed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="signatures")
    signed_documents = relationship("SignedDocument", back_populates="signature", cascade="all, delete-orphan")

class SignedDocument(Base):
    """Signed Document model - junction table with metadata"""
    __tablename__ = "signed_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    signature_id = Column(Integer, ForeignKey("signatures.id"), nullable=False)
    signed_file_path = Column(String(500), nullable=False)
    signature_position_x = Column(Integer, default=0)
    signature_position_y = Column(Integer, default=0)
    signed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="signed_documents")
    signature = relationship("Signature", back_populates="signed_documents")
