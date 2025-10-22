# Electronic Signature API - Backend

FastAPI backend for Electronic Signature application (Hackathon Prototype)

## 🚀 Quick Start

### 1. Setup Virtual Environment

```bash
cd server
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update values if needed:

```bash
cp .env.example .env
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload
```

Server will start at: `http://localhost:8000`

## 📚 API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Project Structure

```
server/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── routes/              # API endpoints
│   │   ├── auth.py          # Authentication routes
│   │   ├── documents.py     # Document management
│   │   ├── signatures.py    # Signature management
│   │   └── signed_documents.py  # Signed document operations
│   └── utils/               # Utility functions
│       ├── auth.py          # Auth helpers (JWT, hashing)
│       ├── file_handler.py  # File operations
│       └── signature_processor.py  # Signature processing
├── uploads/                 # File storage
│   ├── documents/
│   ├── signatures/
│   └── signed_documents/
├── .env                     # Environment variables
├── requirements.txt         # Python dependencies
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Documents
- `GET /api/documents/` - List user's documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document

### Signatures
- `POST /api/signatures/create` - Save signature
- `GET /api/signatures/my` - Get user's signatures
- `GET /api/signatures/{id}` - Get signature by ID
- `DELETE /api/signatures/{id}` - Delete signature

### Signed Documents
- `POST /api/signed/apply` - Apply signature to document
- `GET /api/signed/{id}` - Get signed document details
- `GET /api/signed/{id}/download` - Download signed document
- `GET /api/signed/document/{id}/list` - List all signed versions

## 🗄️ Database Schema

### Users
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `password_hash`: Hashed password
- `created_at`: Timestamp

### Documents
- `id`: Primary key
- `user_id`: Foreign key to Users
- `filename`: Stored filename
- `original_filename`: Original filename
- `file_path`: Path to file
- `file_type`: File extension
- `file_size`: File size in bytes
- `is_signed`: Boolean flag
- `created_at`: Timestamp

### Signatures
- `id`: Primary key
- `user_id`: Foreign key to Users
- `signature_data`: Base64 encoded signature
- `signature_type`: 'drawn' or 'typed'
- `created_at`: Timestamp

### SignedDocuments
- `id`: Primary key
- `document_id`: Foreign key to Documents
- `signature_id`: Foreign key to Signatures
- `signed_file_path`: Path to signed file
- `signature_position_x`: X coordinate
- `signature_position_y`: Y coordinate
- `signed_at`: Timestamp

## 🧪 Testing API with cURL

### Register User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Upload Document (with token)
```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/document.pdf"
```

## 🔧 Configuration

Edit `.env` file to configure:

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `MAX_UPLOAD_SIZE`: Maximum file size (bytes)
- `ALLOWED_DOCUMENT_TYPES`: Allowed file extensions

## 📝 Development Notes

### Adding New Endpoints

1. Create route function in appropriate file under `app/routes/`
2. Define request/response schemas in `app/schemas.py`
3. Add database models if needed in `app/models.py`
4. Import and include router in `app/main.py`

### Database Migrations

For hackathon prototype, database is auto-created on startup.

For production, use Alembic:
```bash
pip install alembic
alembic init migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 🐛 Troubleshooting

**CORS Errors**: Update allowed origins in `app/main.py`

**Database Locked**: Close other connections or use PostgreSQL

**File Upload Fails**: Check `uploads/` directory permissions

**Import Errors**: Ensure virtual environment is activated

## 📦 Dependencies

Main dependencies:
- `fastapi`: Web framework
- `uvicorn`: ASGI server
- `sqlalchemy`: ORM
- `pydantic`: Data validation
- `python-jose`: JWT handling
- `passlib`: Password hashing
- `PyPDF2`: PDF processing
- `Pillow`: Image processing

See `requirements.txt` for full list.

## 🚀 Deployment (Production)

1. Use PostgreSQL instead of SQLite
2. Set strong `SECRET_KEY` in `.env`
3. Set `DEBUG=False`
4. Use gunicorn or similar production server
5. Set up HTTPS
6. Configure proper CORS origins
7. Set up file storage (S3, etc.)
8. Add rate limiting
9. Add logging and monitoring

For hackathon demo, local development server is sufficient.
