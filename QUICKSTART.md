# Quick Start Guide

## Backend Setup

1. Navigate to the server directory:

```powershell
cd server
```

2. Install dependencies (if not already installed):

```powershell
pip install -r requirements.txt
```

3. Run the FastAPI server:

```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000
API Documentation (Swagger): http://localhost:8000/docs

## Frontend Setup

1. Open a new terminal and navigate to the client directory:

```powershell
cd client
```

2. Install dependencies (if not already installed):

```powershell
pnpm install
```

3. Run the Next.js development server:

```powershell
pnpm dev
```

The application will be available at: http://localhost:3000

## Using the Application

1. **Register/Login**: When you first open the app, you'll see a login screen. Click "Sign In / Register" and create a new account.

2. **Upload Documents**:

   - Click the "Upload Document" button (floating button at bottom-right or in the empty state)
   - Drag and drop a PDF file or click to browse
   - The file will be uploaded to `server/uploads/documents/`
   - Click "Upload & Continue"

3. **Manage Documents**:

   - View all your uploaded documents in the dashboard
   - Documents are fetched from the backend API
   - Click the eye icon to view/download
   - Click the trash icon to delete a document

4. **Document Status**:
   - Green badge: Document is signed
   - Yellow badge: Document is unsigned
   - Click the pen icon on unsigned documents to sign them

## Backend Endpoints Used

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `GET /api/documents/` - List all user documents
- `POST /api/documents/upload` - Upload a new document
- `DELETE /api/documents/{id}` - Delete a document
- `GET /uploads/documents/{filename}` - Access uploaded files

## Troubleshooting

### CORS Issues

The backend is configured to allow requests from:

- http://localhost:3000 (Next.js)
- http://localhost:5173 (Vite)

### Authentication Issues

- JWT tokens are stored in localStorage
- Tokens expire after 24 hours by default
- If you get 401 errors, try logging out and back in

### File Upload Issues

- Maximum file size: 10MB
- Allowed file types: PDF, PNG, JPG, JPEG
- Files are stored in `server/uploads/documents/`
- Make sure the uploads directory exists
