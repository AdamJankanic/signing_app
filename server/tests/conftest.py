"""
Test Configuration and Fixtures
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import User, Document, Signature, SignedDocument

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database session"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user_data():
    """Test user data"""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }

@pytest.fixture
def test_user(client, test_user_data):
    """Create a test user and return user data with token"""
    # Register user
    response = client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 201
    
    # Login to get token
    login_response = client.post("/api/auth/login", json={
        "username": test_user_data["username"],
        "password": test_user_data["password"]
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    return {
        "user": response.json(),
        "token": token,
        "credentials": test_user_data
    }

@pytest.fixture
def auth_headers(test_user):
    """Get authorization headers for authenticated requests"""
    return {"Authorization": f"Bearer {test_user['token']}"}

@pytest.fixture
def test_document_file():
    """Create a test document file"""
    from io import BytesIO
    content = b"Test PDF content"
    return ("test_document.pdf", BytesIO(content), "application/pdf")

@pytest.fixture
def test_signature_data():
    """Test signature data (base64 encoded)"""
    return {
        "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "signature_type": "drawn"
    }
