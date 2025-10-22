"""
Tests for Signed Document Routes
"""
import pytest
from io import BytesIO

class TestApplySignature:
    """Test applying signature to document"""
    
    def test_apply_signature_success(self, client, auth_headers, test_signature_data):
        """Test successfully applying signature to document"""
        # Upload a document
        file_content = b"Test PDF content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        doc_response = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files=files
        )
        document_id = doc_response.json()["id"]
        
        # Create a signature
        sig_response = client.post(
            "/api/signatures/create",
            headers=auth_headers,
            json=test_signature_data
        )
        signature_id = sig_response.json()["id"]
        
        # Apply signature to document
        apply_data = {
            "document_id": document_id,
            "signature_id": signature_id,
            "signature_position_x": 100,
            "signature_position_y": 200
        }
        response = client.post(
            "/api/signed/apply",
            headers=auth_headers,
            json=apply_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["document_id"] == document_id
        assert data["signature_id"] == signature_id
        assert data["signature_position_x"] == 100
        assert data["signature_position_y"] == 200
        assert "signed_file_path" in data
        assert "id" in data
    
    def test_apply_signature_invalid_document(self, client, auth_headers, test_signature_data):
        """Test applying signature to non-existent document"""
        # Create a signature
        sig_response = client.post(
            "/api/signatures/create",
            headers=auth_headers,
            json=test_signature_data
        )
        signature_id = sig_response.json()["id"]
        
        # Try to apply to non-existent document
        apply_data = {
            "document_id": 99999,
            "signature_id": signature_id,
            "signature_position_x": 100,
            "signature_position_y": 200
        }
        response = client.post(
            "/api/signed/apply",
            headers=auth_headers,
            json=apply_data
        )
        
        assert response.status_code == 404
        assert "Document not found" in response.json()["detail"]
    
    def test_apply_signature_invalid_signature(self, client, auth_headers):
        """Test applying non-existent signature to document"""
        # Upload a document
        file_content = b"Test PDF content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        doc_response = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files=files
        )
        document_id = doc_response.json()["id"]
        
        # Try to apply non-existent signature
        apply_data = {
            "document_id": document_id,
            "signature_id": 99999,
            "signature_position_x": 100,
            "signature_position_y": 200
        }
        response = client.post(
            "/api/signed/apply",
            headers=auth_headers,
            json=apply_data
        )
        
        assert response.status_code == 404
        assert "Signature not found" in response.json()["detail"]
    
    def test_apply_signature_no_auth(self, client):
        """Test applying signature without authentication"""
        apply_data = {
            "document_id": 1,
            "signature_id": 1,
            "signature_position_x": 100,
            "signature_position_y": 200
        }
        response = client.post("/api/signed/apply", json=apply_data)
        
        assert response.status_code == 401


class TestGetSignedDocument:
    """Test getting signed document details"""
    
    def test_get_signed_document_success(self, client, auth_headers, test_signature_data):
        """Test getting signed document by ID"""
        # Upload document, create signature, and apply
        file_content = b"Test content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        doc_response = client.post("/api/documents/upload", headers=auth_headers, files=files)
        document_id = doc_response.json()["id"]
        
        sig_response = client.post("/api/signatures/create", headers=auth_headers, json=test_signature_data)
        signature_id = sig_response.json()["id"]
        
        apply_response = client.post(
            "/api/signed/apply",
            headers=auth_headers,
            json={
                "document_id": document_id,
                "signature_id": signature_id,
                "signature_position_x": 100,
                "signature_position_y": 200
            }
        )
        signed_doc_id = apply_response.json()["id"]
        
        # Get signed document
        response = client.get(f"/api/signed/{signed_doc_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == signed_doc_id
        assert data["document_id"] == document_id
        assert data["signature_id"] == signature_id
    
    def test_get_signed_document_not_found(self, client, auth_headers):
        """Test getting non-existent signed document"""
        response = client.get("/api/signed/99999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Signed document not found" in response.json()["detail"]
    
    def test_get_signed_document_no_auth(self, client):
        """Test getting signed document without authentication"""
        response = client.get("/api/signed/1")
        
        assert response.status_code == 401


class TestDownloadSignedDocument:
    """Test downloading signed document"""
    
    def test_download_signed_document_success(self, client, auth_headers, test_signature_data):
        """Test downloading signed document"""
        # Upload document, create signature, and apply
        file_content = b"Test content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        doc_response = client.post("/api/documents/upload", headers=auth_headers, files=files)
        document_id = doc_response.json()["id"]
        
        sig_response = client.post("/api/signatures/create", headers=auth_headers, json=test_signature_data)
        signature_id = sig_response.json()["id"]
        
        apply_response = client.post(
            "/api/signed/apply",
            headers=auth_headers,
            json={
                "document_id": document_id,
                "signature_id": signature_id,
                "signature_position_x": 100,
                "signature_position_y": 200
            }
        )
        signed_doc_id = apply_response.json()["id"]
        
        # Download signed document
        response = client.get(f"/api/signed/{signed_doc_id}/download", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/octet-stream"
    
    def test_download_signed_document_not_found(self, client, auth_headers):
        """Test downloading non-existent signed document"""
        response = client.get("/api/signed/99999/download", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_download_signed_document_no_auth(self, client):
        """Test downloading without authentication"""
        response = client.get("/api/signed/1/download")
        
        assert response.status_code == 401


class TestListSignedVersions:
    """Test listing signed versions of a document"""
    
    def test_list_signed_versions_empty(self, client, auth_headers):
        """Test listing signed versions when none exist"""
        # Upload a document
        file_content = b"Test content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        doc_response = client.post("/api/documents/upload", headers=auth_headers, files=files)
        document_id = doc_response.json()["id"]
        
        # List signed versions
        response = client.get(f"/api/signed/document/{document_id}/list", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_signed_versions_with_data(self, client, auth_headers, test_signature_data):
        """Test listing signed versions after creating some"""
        # Upload document
        file_content = b"Test content"
        files = {"file": ("test.pdf", BytesIO(file_content), "application/pdf")}
        doc_response = client.post("/api/documents/upload", headers=auth_headers, files=files)
        document_id = doc_response.json()["id"]
        
        # Create signature
        sig_response = client.post("/api/signatures/create", headers=auth_headers, json=test_signature_data)
        signature_id = sig_response.json()["id"]
        
        # Apply signature twice (two versions)
        for i in range(2):
            client.post(
                "/api/signed/apply",
                headers=auth_headers,
                json={
                    "document_id": document_id,
                    "signature_id": signature_id,
                    "signature_position_x": 100 + i,
                    "signature_position_y": 200 + i
                }
            )
        
        # List signed versions
        response = client.get(f"/api/signed/document/{document_id}/list", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
    
    def test_list_signed_versions_invalid_document(self, client, auth_headers):
        """Test listing signed versions for non-existent document"""
        response = client.get("/api/signed/document/99999/list", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_list_signed_versions_no_auth(self, client):
        """Test listing signed versions without authentication"""
        response = client.get("/api/signed/document/1/list")
        
        assert response.status_code == 401
