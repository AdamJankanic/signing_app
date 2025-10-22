"""
Tests for Authentication Routes
"""
import pytest

class TestAuthRegistration:
    """Test user registration"""
    
    def test_register_new_user(self, client, test_user_data):
        """Test successful user registration"""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == test_user_data["username"]
        assert data["email"] == test_user_data["email"]
        assert "password" not in data
        assert "id" in data
        assert "created_at" in data
    
    def test_register_duplicate_username(self, client, test_user_data):
        """Test registration with duplicate username"""
        # Register first user
        client.post("/api/auth/register", json=test_user_data)
        
        # Try to register again with same username
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]
    
    def test_register_duplicate_email(self, client, test_user_data):
        """Test registration with duplicate email"""
        # Register first user
        client.post("/api/auth/register", json=test_user_data)
        
        # Try to register with same email but different username
        duplicate_email_data = test_user_data.copy()
        duplicate_email_data["username"] = "anotheruser"
        response = client.post("/api/auth/register", json=duplicate_email_data)
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email"""
        invalid_data = {
            "username": "testuser",
            "email": "not-an-email",
            "password": "password123"
        }
        response = client.post("/api/auth/register", json=invalid_data)
        
        assert response.status_code == 422  # Validation error
    
    def test_register_short_password(self, client):
        """Test registration with too short password"""
        short_password_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "12345"  # Less than 6 characters
        }
        response = client.post("/api/auth/register", json=short_password_data)
        
        assert response.status_code == 422  # Validation error
    
    def test_register_short_username(self, client):
        """Test registration with too short username"""
        short_username_data = {
            "username": "ab",  # Less than 3 characters
            "email": "test@example.com",
            "password": "password123"
        }
        response = client.post("/api/auth/register", json=short_username_data)
        
        assert response.status_code == 422  # Validation error


class TestAuthLogin:
    """Test user login"""
    
    def test_login_success(self, client, test_user_data):
        """Test successful login"""
        # Register user first
        client.post("/api/auth/register", json=test_user_data)
        
        # Login
        response = client.post("/api/auth/login", json={
            "username": test_user_data["username"],
            "password": test_user_data["password"]
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client, test_user_data):
        """Test login with wrong password"""
        # Register user first
        client.post("/api/auth/register", json=test_user_data)
        
        # Try login with wrong password
        response = client.post("/api/auth/login", json={
            "username": test_user_data["username"],
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent username"""
        response = client.post("/api/auth/login", json={
            "username": "nonexistent",
            "password": "password123"
        })
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]


class TestAuthMe:
    """Test get current user endpoint"""
    
    def test_get_current_user_success(self, client, test_user, auth_headers):
        """Test getting current user info with valid token"""
        response = client.get("/api/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user["credentials"]["username"]
        assert data["email"] == test_user["credentials"]["email"]
        assert "password" not in data
    
    def test_get_current_user_no_token(self, client):
        """Test getting current user without token"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 401


class TestAuthLogout:
    """Test logout endpoint"""
    
    def test_logout_success(self, client, auth_headers):
        """Test successful logout"""
        response = client.post("/api/auth/logout", headers=auth_headers)
        
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_logout_no_token(self, client):
        """Test logout without token"""
        response = client.post("/api/auth/logout")
        
        assert response.status_code == 401
