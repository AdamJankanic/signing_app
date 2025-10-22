# Swagger UI Documentation

## ✅ Swagger UI is Now Enhanced!

FastAPI comes with **Swagger UI built-in** and ready to use. I've enhanced it with better documentation, descriptions, and metadata.

## 🌐 Access Points

### Swagger UI (Interactive API Docs)
**URL**: http://localhost:8000/docs

Features:
- Interactive API testing
- Try out endpoints directly in the browser
- Automatic request/response examples
- Authentication support (click "Authorize" button)
- Detailed parameter descriptions

### ReDoc (Alternative Documentation)
**URL**: http://localhost:8000/redoc

Features:
- Clean, three-panel design
- Better for reading/reviewing
- Print-friendly documentation
- Search functionality

### OpenAPI JSON Schema
**URL**: http://localhost:8000/openapi.json

The raw OpenAPI specification in JSON format.

## 🚀 How to Use Swagger UI

### 1. Start the Server
```bash
cd server
pipenv run uvicorn app.main:app --reload
```

### 2. Open Swagger UI
Navigate to: http://localhost:8000/docs

### 3. Test the API

#### Without Authentication:
1. Expand any endpoint (e.g., `POST /api/auth/register`)
2. Click "Try it out"
3. Fill in the request body
4. Click "Execute"
5. See the response below

#### With Authentication:
1. First, register or login to get a token
2. Click the **"Authorize"** button at the top right
3. Enter: `Bearer YOUR_TOKEN_HERE` (replace with actual token)
4. Click "Authorize"
5. Now you can test protected endpoints

## 📋 What's Been Enhanced

### Main App (`app/main.py`)
- ✅ Detailed API description with quick start guide
- ✅ Tagged endpoints (Authentication, Documents, Signatures, Signed Documents)
- ✅ Contact information
- ✅ License info
- ✅ Enhanced root endpoint with all documentation links

### Authentication Routes (`app/routes/auth.py`)
- ✅ Detailed docstrings for each endpoint
- ✅ Parameter descriptions
- ✅ Usage instructions
- ✅ Response examples

### Enhanced Root Endpoint
Now returns:
```json
{
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
```

## 🎨 Swagger UI Features

### Interactive Features:
- **Try it out**: Test endpoints directly
- **Authorize**: Add JWT token for protected endpoints
- **Schemas**: View all data models
- **Download**: Export OpenAPI spec
- **Dark/Light mode**: Toggle theme

### Organized Sections:
1. **Authentication** - Register, login, user info
2. **Documents** - Upload, list, manage documents
3. **Signatures** - Create and manage signatures
4. **Signed Documents** - Apply signatures and download

## 🧪 Example Workflow in Swagger UI

### Step 1: Register User
1. Open `POST /api/auth/register`
2. Click "Try it out"
3. Enter:
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```
4. Click "Execute"
5. Copy the response (user created)

### Step 2: Login
1. Open `POST /api/auth/login`
2. Click "Try it out"
3. Enter:
   ```json
   {
     "username": "testuser",
     "password": "password123"
   }
   ```
4. Click "Execute"
5. Copy the `access_token` from response

### Step 3: Authorize
1. Click the **"Authorize"** button (top right, with lock icon)
2. In the "Value" field, enter: `Bearer YOUR_ACCESS_TOKEN`
3. Click "Authorize"
4. Click "Close"

### Step 4: Test Protected Endpoints
Now you can test any protected endpoint:
- Get current user info: `GET /api/auth/me`
- Upload document: `POST /api/documents/upload`
- Create signature: `POST /api/signatures/create`
- etc.

## 📸 What You'll See

### Main Page Features:
- API title and description
- All endpoints organized by tags
- "Authorize" button for JWT authentication
- Schemas section at the bottom
- Search functionality

### Each Endpoint Shows:
- HTTP method and path
- Description and parameters
- Request body schema
- Response codes and schemas
- Example values
- "Try it out" button

## 🔧 Customization Options

If you want to customize further, you can modify `app/main.py`:

```python
app = FastAPI(
    title="Your Custom Title",
    description="Your description",
    version="1.0.0",
    docs_url="/docs",           # Change Swagger UI URL
    redoc_url="/redoc",         # Change ReDoc URL
    openapi_url="/openapi.json", # Change OpenAPI spec URL
    # To disable: docs_url=None
)
```

## 🎯 Tips for Demo

### For Presentation:
1. Open Swagger UI at `/docs`
2. Show the organized endpoint structure
3. Demonstrate "Try it out" feature
4. Show authentication workflow
5. Test file upload with actual file
6. Show response examples

### Impress Judges:
- Point out automatic OpenAPI documentation
- Show the "Authorize" feature
- Demonstrate live API testing
- Export OpenAPI spec if needed
- Show alternative docs at `/redoc`

## 🚨 Troubleshooting

**Swagger UI not loading?**
- Check server is running: `http://localhost:8000/health`
- Check for console errors
- Try `/redoc` as alternative

**Changes not appearing?**
- Server should auto-reload with `--reload` flag
- If not, restart: `Ctrl+C` then `pipenv run uvicorn app.main:app --reload`

**Authentication not working?**
- Make sure to include "Bearer " prefix
- Check token is not expired (24 hours default)
- Verify token was copied correctly

## 📚 Additional Resources

- FastAPI Swagger UI docs: https://fastapi.tiangolo.com/tutorial/metadata/
- OpenAPI specification: https://swagger.io/specification/
- Swagger UI documentation: https://swagger.io/tools/swagger-ui/

---

**Note**: Swagger UI is production-ready and perfect for hackathon demos! 🎉
