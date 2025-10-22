"""
Integration Tests - Full Workflow
"""
import pytest
from io import BytesIO

class TestFullWorkflow:
    """Test complete user workflow from registration to signed document"""
    
    def test_complete_signature_workflow(self, client):
        """Test the entire workflow: register, login, upload, sign, download"""
        
        # Step 1: Register a new user
        user_data = {
            "username": "workflowuser",
            "email": "workflow@example.com",
            "password": "password123"
        }
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 201
        
        # Step 2: Login to get token
        login_response = client.post("/api/auth/login", json={
            "username": user_data["username"],
            "password": user_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Step 3: Upload a document
        file_content = b"Test document content"
        files = {"file": ("contract.pdf", BytesIO(file_content), "application/pdf")}
        upload_response = client.post(
            "/api/documents/upload",
            headers=headers,
            files=files
        )
        assert upload_response.status_code == 201
        document_id = upload_response.json()["id"]
        
        # Step 4: Create a signature
        signature_data = {
            "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "signature_type": "drawn"
        }
        sig_response = client.post(
            "/api/signatures/create",
            headers=headers,
            json=signature_data
        )
        assert sig_response.status_code == 201
        signature_id = sig_response.json()["id"]
        
        # Step 5: Apply signature to document
        apply_response = client.post(
            "/api/signed/apply",
            headers=headers,
            json={
                "document_id": document_id,
                "signature_id": signature_id,
                "signature_position_x": 150,
                "signature_position_y": 250
            }
        )
        assert apply_response.status_code == 201
        signed_doc_id = apply_response.json()["id"]
        
        # Step 6: Verify document is marked as signed
        doc_response = client.get(f"/api/documents/{document_id}", headers=headers)
        assert doc_response.json()["is_signed"] is True
        
        # Step 7: Download signed document
        download_response = client.get(
            f"/api/signed/{signed_doc_id}/download",
            headers=headers
        )
        assert download_response.status_code == 200
        
        # Step 8: List all signatures
        list_sig_response = client.get("/api/signatures/my", headers=headers)
        assert len(list_sig_response.json()) == 1
        
        # Step 9: List all documents
        list_doc_response = client.get("/api/documents/", headers=headers)
        assert len(list_doc_response.json()) == 1
        
        # Step 10: Get user info
        me_response = client.get("/api/auth/me", headers=headers)
        assert me_response.json()["username"] == user_data["username"]
    
    def test_multiple_signatures_workflow(self, client):
        """Test applying multiple signatures to the same document"""
        
        # Register and login
        user_data = {"username": "multiuser", "email": "multi@example.com", "password": "password123"}
        client.post("/api/auth/register", json=user_data)
        login_response = client.post("/api/auth/login", json={
            "username": user_data["username"],
            "password": user_data["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Upload document
        files = {"file": ("doc.pdf", BytesIO(b"content"), "application/pdf")}
        doc_response = client.post("/api/documents/upload", headers=headers, files=files)
        document_id = doc_response.json()["id"]
        
        # Create two different signatures
        sig_data = {
            "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "signature_type": "drawn"
        }
        
        signature_ids = []
        for i in range(2):
            sig_response = client.post("/api/signatures/create", headers=headers, json=sig_data)
            signature_ids.append(sig_response.json()["id"])
        
        # Apply both signatures to the same document
        for sig_id in signature_ids:
            apply_response = client.post(
                "/api/signed/apply",
                headers=headers,
                json={
                    "document_id": document_id,
                    "signature_id": sig_id,
                    "signature_position_x": 100,
                    "signature_position_y": 200
                }
            )
            assert apply_response.status_code == 201
        
        # List signed versions
        versions_response = client.get(
            f"/api/signed/document/{document_id}/list",
            headers=headers
        )
        assert len(versions_response.json()) == 2
