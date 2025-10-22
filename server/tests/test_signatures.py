"""
Tests for Signature Routes
"""
import pytest

class TestSignatureCreate:
    """Test signature creation"""
    
    def test_create_signature_success(self, client, auth_headers, test_signature_data):
        """Test successful signature creation"""
        response = client.post(
            "/api/signatures/create",
            headers=auth_headers,
            json=test_signature_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["signature_type"] == test_signature_data["signature_type"]
        assert data["signature_data"] == test_signature_data["signature_data"]
        assert "id" in data
        assert "created_at" in data
    
    def test_create_signature_typed(self, client, auth_headers):
        """Test creating typed signature"""
        typed_signature = {
            "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "signature_type": "typed"
        }
        
        response = client.post(
            "/api/signatures/create",
            headers=auth_headers,
            json=typed_signature
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["signature_type"] == "typed"
    
    def test_create_signature_invalid_type(self, client, auth_headers):
        """Test creating signature with invalid type"""
        invalid_signature = {
            "signature_data": "base64data",
            "signature_type": "invalid"
        }
        
        response = client.post(
            "/api/signatures/create",
            headers=auth_headers,
            json=invalid_signature
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_create_signature_no_auth(self, client, test_signature_data):
        """Test creating signature without authentication"""
        response = client.post("/api/signatures/create", json=test_signature_data)
        
        assert response.status_code == 401


class TestSignatureList:
    """Test listing signatures"""
    
    def test_list_signatures_empty(self, client, auth_headers):
        """Test listing signatures when none exist"""
        response = client.get("/api/signatures/my", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_signatures_with_data(self, client, auth_headers, test_signature_data):
        """Test listing signatures after creating some"""
        # Create two signatures
        for i in range(2):
            client.post("/api/signatures/create", headers=auth_headers, json=test_signature_data)
        
        # List signatures
        response = client.get("/api/signatures/my", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
    
    def test_list_signatures_no_auth(self, client):
        """Test listing signatures without authentication"""
        response = client.get("/api/signatures/my")
        
        assert response.status_code == 401


class TestSignatureGet:
    """Test getting single signature"""
    
    def test_get_signature_success(self, client, auth_headers, test_signature_data):
        """Test getting signature by ID"""
        # Create a signature first
        create_response = client.post(
            "/api/signatures/create",
            headers=auth_headers,
            json=test_signature_data
        )
        signature_id = create_response.json()["id"]
        
        # Get the signature
        response = client.get(f"/api/signatures/{signature_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == signature_id
        assert data["signature_type"] == test_signature_data["signature_type"]
    
    def test_get_signature_not_found(self, client, auth_headers):
        """Test getting non-existent signature"""
        response = client.get("/api/signatures/99999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Signature not found" in response.json()["detail"]
    
    def test_get_signature_no_auth(self, client):
        """Test getting signature without authentication"""
        response = client.get("/api/signatures/1")
        
        assert response.status_code == 401


class TestSignatureDelete:
    """Test deleting signatures"""
    
    def test_delete_signature_success(self, client, auth_headers, test_signature_data):
        """Test successful signature deletion"""
        # Create a signature first
        create_response = client.post(
            "/api/signatures/create",
            headers=auth_headers,
            json=test_signature_data
        )
        signature_id = create_response.json()["id"]
        
        # Delete the signature
        response = client.delete(f"/api/signatures/{signature_id}", headers=auth_headers)
        
        assert response.status_code == 200
        assert "message" in response.json()
        
        # Verify it's deleted
        get_response = client.get(f"/api/signatures/{signature_id}", headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_delete_signature_not_found(self, client, auth_headers):
        """Test deleting non-existent signature"""
        response = client.delete("/api/signatures/99999", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_delete_signature_no_auth(self, client):
        """Test deleting signature without authentication"""
        response = client.delete("/api/signatures/1")
        
        assert response.status_code == 401
