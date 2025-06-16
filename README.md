
# BookFlipFinder

**BookFlipFinder** is a web-based book arbitrage intelligence platform that helps individual book resellers find profitable books to flip by analyzing pricing data from major online bookstores. This FastAPI backend provides complete CRUD (Create, Read, Update, Delete) operations for book management with comprehensive testing coverage.

---

## 🚀 Live Backend

**Deployed Backend URL:** https://bookflip-backend-production.up.railway.app

**Health Check:** https://bookflip-backend-production.up.railway.app/healthz

**API Documentation:** https://bookflip-backend-production.up.railway.app/docs

---

## 🧰 Tech Stack

| Component       | Technology            |
|----------------|-----------------------|
| Backend        | Python 3.11, FastAPI |
| Database       | In-memory storage     |
| Testing        | Pytest               |
| Deployment     | Railway              |
| Documentation  | OpenAPI/Swagger      |

---

## ⚙️ Setup & Installation

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd BookFlipFinder
   ```

2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Access the API:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/healthz

---

## 🧪 Running Tests

### Prerequisites
Ensure pytest is installed:
```bash
pip install -r requirements.txt
```

### Run All Tests
```bash
# From the root directory
pytest backend/tests/ -v

# With coverage (if pytest-cov is installed)
pytest backend/tests/ --cov=backend.app
```

### Run Specific Test Categories
```bash
# Run only health check tests
pytest backend/tests/test_main.py::TestHealthCheck -v

# Run only book creation tests
pytest backend/tests/test_main.py::TestCreateBook -v

# Run only CRUD tests
pytest backend/tests/test_main.py::TestCreateBook backend/tests/test_main.py::TestListBooks backend/tests/test_main.py::TestGetBook backend/tests/test_main.py::TestUpdateBook backend/tests/test_main.py::TestDeleteBook -v
```

### Test Coverage
The test suite includes:
- ✅ **Health Check Tests**: Success and failure scenarios
- ✅ **Authentication Tests**: Login, register, invalid credentials
- ✅ **Book Creation Tests**: Success, duplicate ISBN, invalid data
- ✅ **Book Listing Tests**: Empty database, pagination, filtering
- ✅ **Book Retrieval Tests**: Success, not found, edge cases
- ✅ **Book Update Tests**: Success, not found, ISBN conflicts
- ✅ **Book Deletion Tests**: Success, not found, double deletion
- ✅ **Edge Case Tests**: Long titles, invalid years, special characters

---

## 📚 API Usage Examples

### Health Check
```bash
curl -X GET "https://bookflip-backend-production.up.railway.app/healthz"
```

**Response:**
```json
{
  "status": "ok",
  "service": "bookflipfinder-api"
}
```

### Authentication

#### Register a New User
```bash
curl -X POST "https://bookflip-backend-production.up.railway.app/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

#### Login
```bash
curl -X POST "https://bookflip-backend-production.up.railway.app/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@bookflipfinder.com",
    "password": "demo123456"
  }'
```

### Create a Book
```bash
curl -X POST "https://bookflip-backend-production.up.railway.app/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "publisher": "Scribner",
    "publication_year": 1925,
    "category": "Classic Literature",
    "description": "A classic American novel",
    "price": 12.99
  }'
```

### List All Books
```bash
curl -X GET "https://bookflip-backend-production.up.railway.app/books"
```

### List Books with Pagination
```bash
curl -X GET "https://bookflip-backend-production.up.railway.app/books?limit=10&offset=0"
```

### List Books with Category Filter
```bash
curl -X GET "https://bookflip-backend-production.up.railway.app/books?category=Classic%20Literature"
```

### Get a Specific Book
```bash
curl -X GET "https://bookflip-backend-production.up.railway.app/books/{book_id}"
```

### Update a Book
```bash
curl -X PUT "https://bookflip-backend-production.up.railway.app/books/{book_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby - Updated Edition",
    "price": 15.99
  }'
```

### Delete a Book
```bash
curl -X DELETE "https://bookflip-backend-production.up.railway.app/books/{book_id}"
```

### Get API Information
```bash
curl -X GET "https://bookflip-backend-production.up.railway.app/info"
```

---

## 🏗️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthz` | Health check endpoint |
| GET | `/info` | API information and statistics |
| POST | `/register` | Register a new user |
| POST | `/login` | Login user |
| POST | `/books` | Create a new book |
| GET | `/books` | List books with optional filtering |
| GET | `/books/{book_id}` | Get a specific book |
| PUT | `/books/{book_id}` | Update a book |
| DELETE | `/books/{book_id}` | Delete a book |

---

## 📊 Data Models

### Book Model
```json
{
  "id": "string (UUID)",
  "title": "string (1-500 chars)",
  "author": "string (1-300 chars)",
  "isbn": "string (10-13 chars)",
  "publisher": "string (optional, max 200 chars)",
  "publication_year": "integer (1000-2030)",
  "category": "string (optional, max 100 chars)",
  "description": "string (optional)",
  "price": "float (>= 0)",
  "created_at": "datetime (ISO format)",
  "updated_at": "datetime (ISO format)"
}
```

### User Authentication Model
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

---

## 🔧 Configuration

### Environment Variables
No environment variables are required for basic operation. The application uses in-memory storage and runs on default settings.

### Optional Configuration
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

---

## 🚢 Deployment

### Railway Deployment

This backend is deployed on [Railway](https://railway.app/).

**Start Command for Railway:**
```
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

**Deployment Process:**
1. Connect your GitHub repository to Railway
2. Railway automatically detects the Python application
3. Set the start command to: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Railway builds and deploys the application
5. The application is available at the provided Railway URL

**Redeployment:**
This backend is deployed on [Railway](https://railway.app/). To redeploy, push changes to the connected branch (e.g., `main`) and Railway will automatically rebuild and redeploy your backend.

**Railway Configuration:**
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Port:** Railway automatically assigns a port via the `$PORT` environment variable

### Manual Deployment Steps
1. Ensure your code is in a Git repository
2. Create a Railway account at https://railway.app
3. Create a new project and connect your repository
4. Set the start command to: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Railway will automatically detect and deploy your FastAPI application
6. Access your deployed API at the provided Railway URL

---

## 🛠️ Development

### Project Structure
```
backend/
├── __init__.py              # Python package initialization
├── app/
│   ├── __init__.py         # App package initialization
│   └── main.py             # FastAPI application
├── tests/
│   └── test_main.py        # Comprehensive test suite
├── requirements.txt        # Python dependencies
└── Procfile               # Railway deployment config
```

### Adding New Features
1. Implement new endpoints in `backend/app/main.py`
2. Add corresponding tests in `backend/tests/test_main.py`
3. Update this README with new API documentation
4. Test locally before deploying

### Code Quality
- Follow PEP 8 style guidelines
- Add docstrings to all functions
- Include type hints
- Write tests for all new functionality
- Validate input data using Pydantic models

---

## 📋 Contest Submission Checklist

- ✅ **FastAPI Backend**: Complete with Book CRUD operations
- ✅ **Python Package Structure**: Proper `__init__.py` files in `backend/` and `backend/app/`
- ✅ **All Endpoints Working**: Create, Read, Update, Delete books + Authentication
- ✅ **Comprehensive Tests**: Success, failure, and edge cases covered for all endpoints
- ✅ **Health Check**: `/healthz` endpoint implemented and tested
- ✅ **Live Deployment**: Backend deployed and accessible on Railway
- ✅ **Complete Documentation**: Setup, usage, testing, and deployment instructions
- ✅ **API Examples**: cURL commands for all endpoints
- ✅ **In-Memory Storage**: No external database dependencies
- ✅ **Input Validation**: Pydantic models with proper validation
- ✅ **Error Handling**: Appropriate HTTP status codes and error messages
- ✅ **CORS Support**: Cross-origin requests enabled for frontend integration

---

## 📝 License

This project is created for contest submission purposes.

---

## 🔗 Links

- **Live API**: https://bookflip-backend-production.up.railway.app
- **API Documentation**: https://bookflip-backend-production.up.railway.app/docs
- **Health Check**: https://bookflip-backend-production.up.railway.app/healthz
- **Railway Platform**: https://railway.app
