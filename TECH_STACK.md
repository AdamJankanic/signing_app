# Technology Stack - Team 2 Hackathon

## 🎯 Selected Stack

### **Backend: FastAPI (Python)**

- **Framework:** FastAPI 0.104.x
- **Server:** Uvicorn (ASGI server)
- **Database ORM:** SQLAlchemy 2.0.x
- **Database:** SQLite (development) / PostgreSQL (optional)
- **Authentication:** JWT with python-jose
- **Password Hashing:** Passlib with bcrypt
- **File Upload:** FastAPI's UploadFile with python-multipart
- **PDF Processing:** PyPDF2
- **Image Processing:** Pillow

### **Frontend: React.js**

- **Framework:** React 18.2.x
- **Styling:** TailwindCSS 3.x
- **Routing:** React Router DOM 6.x
- **HTTP Client:** Axios 1.x
- **Signature Canvas:** react-signature-canvas 1.x

---

## 📁 Project Structure

```
hackathon/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Helper functions
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                   # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # Database configuration
│   │   ├── auth.py          # Authentication utilities
│   │   ├── routes/          # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   └── signatures.py
│   │   └── utils/           # Helper functions
│   ├── uploads/             # Uploaded files storage
│   ├── venv/                # Python virtual environment
│   ├── requirements.txt
│   └── .env                 # Environment variables
│
├── docs/                     # Documentation
├── specs/                    # Project specifications
├── AGENTS.md                 # AI agent instructions
├── ROADMAP.md               # Project roadmap
├── TECH_STACK.md            # This file
└── README.md                # Project README

```

---

## 🚀 Quick Start Commands

### **Backend Setup (FastAPI)**

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn[standard] python-multipart python-jose[cryptography] passlib[bcrypt] sqlalchemy pydantic pydantic-settings python-dotenv PyPDF2 Pillow

# Or install from requirements.txt
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload

# Server will be available at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### **Frontend Setup (React)**

```bash
# Create React app (if not exists)
npx create-react-app client

# Navigate to client directory
cd client

# Install dependencies
npm install


# Run development server
npm run dev

# App will be available at: http://localhost:3000
```

---

## 🔧 Configuration Files

### **Backend: requirements.txt**

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
sqlalchemy==2.0.23
pydantic==2.4.2
pydantic-settings==2.0.3
python-dotenv==1.0.0
PyPDF2==3.0.1
Pillow==10.1.0
```

### **Backend: .env**

```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### **Frontend: package.json (dependencies)**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-signature-canvas": "^1.0.6"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.5",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## 🔌 API Endpoints

### **Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### **Documents**

- `GET /api/documents` - List user's documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document

### **Signatures**

- `POST /api/signatures/create` - Save signature
- `GET /api/signatures/my` - Get user's signatures
- `POST /api/signatures/apply` - Apply signature to document

### **Signed Documents**

- `GET /api/signed/{id}` - Get signed document
- `GET /api/signed/{id}/download` - Download signed document

---

## 📊 Database Schema

### **Users Table**

```python
id: Integer (Primary Key)
username: String (Unique)
email: String (Unique)
hashed_password: String
created_at: DateTime
```

### **Documents Table**

```python
id: Integer (Primary Key)
user_id: Integer (Foreign Key -> Users)
filename: String
file_path: String
file_type: String
created_at: DateTime
is_signed: Boolean
```

### **Signatures Table**

```python
id: Integer (Primary Key)
user_id: Integer (Foreign Key -> Users)
signature_data: Text (Base64 encoded image)
created_at: DateTime
```

### **SignedDocuments Table**

```python
id: Integer (Primary Key)
document_id: Integer (Foreign Key -> Documents)
signature_id: Integer (Foreign Key -> Signatures)
signed_at: DateTime
signed_file_path: String
```

---

## 🔐 Security Features

- **Password Hashing:** bcrypt via passlib
- **JWT Authentication:** python-jose with HS256 algorithm
- **CORS:** FastAPI CORS middleware configured
- **File Validation:** File type and size checking
- **Input Validation:** Pydantic schemas for request validation

---

## 🧪 Testing

### **Backend Testing**

- Use FastAPI's automatic interactive docs: `http://localhost:8000/docs`
- Or use Postman/Thunder Client/Insomnia

### **Frontend Testing**

- Manual testing in browser
- Test with React DevTools

---

## 📝 Development Notes

**FastAPI Advantages:**

- ✅ Automatic API documentation (Swagger UI)
- ✅ Built-in request validation with Pydantic
- ✅ Async support for better performance
- ✅ Type hints for better IDE support
- ✅ Fast development speed

**React Advantages:**

- ✅ Component-based architecture
- ✅ Rich ecosystem of libraries
- ✅ Great for interactive UIs (signature canvas)
- ✅ Fast rendering with Virtual DOM

**Development Tips:**

- Start with backend API and test with `/docs`
- Build frontend components incrementally
- Use environment variables for configuration
- Keep it simple - this is a prototype!

---

## 🎯 Next Steps

1. ✅ Set up backend FastAPI project
2. ✅ Set up frontend React project
3. ⏳ Implement authentication (JWT)
4. ⏳ Create document upload functionality
5. ⏳ Build signature canvas component
6. ⏳ Integrate frontend with backend
7. ⏳ Test complete workflow
8. ⏳ Polish UI and add error handling

---

**Good luck with the hackathon! 🚀**
