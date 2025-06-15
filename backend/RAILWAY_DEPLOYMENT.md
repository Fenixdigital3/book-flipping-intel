
# Railway Deployment Guide for BookFlipFinder Backend

## Prerequisites
- GitHub repository with your code
- Railway account (railway.app)

## Deployment Steps

### 1. Setup Railway Project
1. Go to railway.app and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your BookFlipFinder repository
4. Choose the `backend` folder as the root directory

### 2. Configure Environment Variables
In your Railway project dashboard, add these environment variables:

**Required:**
- `JWT_SECRET`: A secure random string (e.g., generate with `openssl rand -hex 32`)
- `DATABASE_URL`: Railway will auto-generate this when you add PostgreSQL
- `TOKEN_EXPIRY_MINUTES`: 30
- `DEBUG`: false

**Optional:**
- `CORS_ORIGINS`: https://your-frontend-domain.lovable.app
- `SCRAPER_RATE_LIMIT`: 1

### 3. Add PostgreSQL Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically set the `DATABASE_URL` environment variable

### 4. Deploy
1. Railway will automatically detect FastAPI and deploy
2. Your backend will be available at: `https://your-project-name.up.railway.app`

### 5. Update Frontend
Update your frontend environment variables:
- `VITE_API_BASE_URL`: https://your-project-name.up.railway.app

### 6. Test Deployment
Test these endpoints:
- GET `/health` - Should return `{"status": "healthy"}`
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/books/search` - Book search

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that all dependencies are in requirements.txt
2. **Database connection fails**: Ensure DATABASE_URL is set correctly
3. **CORS errors**: Add your frontend domain to CORS_ORIGINS
4. **JWT errors**: Ensure JWT_SECRET is set

### Logs:
View logs in Railway dashboard under "Deployments" tab.

## Health Checks
Railway will automatically monitor:
- `/health` endpoint
- `/healthz` endpoint (Railway-specific)

Both should return 200 OK for healthy status.
