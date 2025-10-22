"""
Tests for Document Routes
"""
import pytest
from io import BytesIO

class TestDocumentUpload:
    """Test document upload"""
    
    def test_upload_document_success(self, client, auth_headers):
        """Test successful document upload"""
        file_content = b"Test PDF content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        
        response = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["original_filename"] == "test.pdf"
        assert data["file_type"] == ".pdf"
        assert data["is_signed"] == False
        assert "id" in data
        assert "file_path" in data
    
    def test_upload_document_no_auth(self, client):
        """Test upload without authentication"""
        file_content = b"Test PDF content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        
        response = client.post("/api/documents/upload", files=files)
        
        assert response.status_code == 401
    
    def test_upload_invalid_file_type(self, client, auth_headers):
        """Test upload with invalid file type"""
        file_content = b"Test content"
        files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
        
        response = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 400
        assert "File type not allowed" in response.json()["detail"]
    
    def test_upload_image_document(self, client, auth_headers):
        """Test upload image document"""
        # Simple 1x1 PNG image
        file_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        files = {"file": ("test.png", BytesIO(file_content), "image/png")}
        
        response = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["file_type"] == ".png"


class TestDocumentList:
    """Test listing documents"""
    
    def test_list_documents_empty(self, client, auth_headers):
        """Test listing documents when none exist"""
        response = client.get("/api/documents/", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_documents_with_uploads(self, client, auth_headers):
        """Test listing documents after uploading"""
        # Upload two documents
        for i in range(2):
            file_content = f"Test content {i}".encode()
            files = {"file": (f"test{i}.pdf", BytesIO(file_content), "application/pdf")}
            client.post("/api/documents/upload", headers=auth_headers, files=files)
        
        # List documents
        response = client.get("/api/documents/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
    
    def test_list_documents_no_auth(self, client):
        """Test listing documents without authentication"""
        response = client.get("/api/documents/")
        
        assert response.status_code == 401


class TestDocumentGet:
    """Test getting single document"""
    
    def test_get_document_success(self, client, auth_headers):
        """Test getting document by ID"""
        # Upload a document first
        file_content = b"Test content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        upload_response = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files=files
        )
        document_id = upload_response.json()["id"]
        
        # Get the document
        response = client.get(f"/api/documents/{document_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == document_id
        assert data["original_filename"] == "test.pdf"
    
    def test_get_document_not_found(self, client, auth_headers):
        """Test getting non-existent document"""
        response = client.get("/api/documents/99999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Document not found" in response.json()["detail"]
    
    def test_get_document_no_auth(self, client):
        """Test getting document without authentication"""
        response = client.get("/api/documents/1")
        
        assert response.status_code == 401


class TestDocumentDelete:
    """Test deleting documents"""
    
    def test_delete_document_success(self, client, auth_headers):
        """Test successful document deletion"""
        # Upload a document first
        file_content = b"Test content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        upload_response = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files=files
        )
        document_id = upload_response.json()["id"]
        
        # Delete the document
        response = client.delete(f"/api/documents/{document_id}", headers=auth_headers)
        
        assert response.status_code == 200
        assert "message" in response.json()
        
        # Verify it's deleted
        get_response = client.get(f"/api/documents/{document_id}", headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_delete_document_not_found(self, client, auth_headers):
        """Test deleting non-existent document"""
        response = client.delete("/api/documents/99999", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_delete_document_no_auth(self, client):
        """Test deleting document without authentication"""
        response = client.delete("/api/documents/1")
        
        assert response.status_code == 401
