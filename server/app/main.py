"""
FastAPI Main Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.routes import auth, documents, signatures, signed_documents

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Electronic Signature API",
    description="""
    ## Simple Electronic Signature Application (Hackathon Prototype)
    
    This API allows users to:
    * 📝 **Register and authenticate** with JWT tokens
    * 📄 **Upload documents** (PDF, PNG, JPG)
    * ✍️ **Create digital signatures** (drawn or typed)
    * 🖊️ **Apply signatures to documents**
    * ⬇️ **Download signed documents**
    * 🔍 **Verify document signatures**
    
    ### Authentication
    Most endpoints require authentication. Use the `/api/auth/login` endpoint to get a JWT token,
    then click the **Authorize** button above and enter: `Bearer YOUR_TOKEN`
    
    ### Quick Start
    1. Register a new user at `/api/auth/register`
    2. Login to get your access token at `/api/auth/login`
    3. Upload a document at `/api/documents/upload`
    4. Create a signature at `/api/signatures/create`
    5. Apply signature to document at `/api/signed/apply`
    6. Download the signed document at `/api/signed/{id}/download`
    """,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "User registration, login, and authentication operations"
        },
        {
            "name": "Documents",
            "description": "Upload, manage, and view documents"
        },
        {
            "name": "Signatures",
            "description": "Create, save, and manage digital signatures"
        },
        {
            "name": "Signed Documents",
            "description": "Apply signatures to documents and download signed versions"
        }
    ],
    contact={
        "name": "Hackathon Team",
        "email": "team@hackathon.com"
    },
    license_info={
        "name": "MIT License",
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite and React default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads/documents", exist_ok=True)
os.makedirs("uploads/signatures", exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(signatures.router, prefix="/api/signatures", tags=["Signatures"])
app.include_router(signed_documents.router, prefix="/api/signed", tags=["Signed Documents"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Electronic Signature API",
        "version": "0.1.0",
        "status": "running",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_json": "/openapi.json"
        },
        "endpoints": {
            "health": "/health",
            "authentication": "/api/auth",
            "documents": "/api/documents",
            "signatures": "/api/signatures",
            "signed_documents": "/api/signed"
        },
        "instructions": "Visit /docs for interactive API documentation (Swagger UI)"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
