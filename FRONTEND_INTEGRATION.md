# Frontend Integration Guide

This guide explains how the React frontend is integrated with the Flask backend.

## Architecture

- **Backend**: Flask (Python) running on `http://localhost:5000`
- **Frontend**: React (Vite) - Development on `http://localhost:3000`, Production served by Flask

## Development Mode

Run both servers separately for development with hot-reloading:

### 1. Start Flask Backend
```bash
# From project root
python app.py
```
Backend runs on `http://localhost:5000`

### 2. Start React Frontend
```bash
# From project root
cd frontend
npm install  # First time only
npm run dev
```
Frontend runs on `http://localhost:3000`

### How it works in Development:
- Vite dev server proxies API requests (`/api/*` and `/auth/*`) to Flask backend
- CORS is configured to allow requests from `http://localhost:3000`
- Changes to React code hot-reload automatically
- Flask debug mode reloads on Python code changes

## Production Mode

Build and serve the React app through Flask:

### 1. Build React Frontend
```bash
cd frontend
npm run build
```
This creates optimized files in `frontend/dist/`

### 2. Start Flask Backend
```bash
# From project root
python app.py
```

### How it works in Production:
- Flask serves the built React app from `frontend/dist/`
- All routes serve `index.html` for client-side routing
- API endpoints (`/api/*` and `/auth/*`) work normally
- Access everything at `http://localhost:5000`

## API Integration

The frontend can call backend APIs using relative paths:

```javascript
// Example API call
fetch('/api/patients')
  .then(response => response.json())
  .then(data => console.log(data));

// Authentication
fetch('/auth/login', {
  method: 'POST',
  credentials: 'include',  // Important for session cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## Configuration Files

### Vite Config ([frontend/vite.config.js](frontend/vite.config.js))
- Proxies `/api` and `/auth` to `http://localhost:5000`
- Sets dev server port to 3000
- Configures build output to `dist/`

### Flask App ([app.py](app.py))
- Serves static files from `frontend/dist/`
- Handles client-side routing with catch-all route
- CORS enabled for development

## File Structure

```
priceless-galileo/
├── app.py                  # Flask backend
├── frontend/
│   ├── dist/              # Built files (gitignored)
│   ├── src/               # React source code
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
├── models.py              # Database models
├── auth.py                # Authentication routes
└── db.py                  # Database connection
```

## Authentication

The application includes a complete authentication system with login, registration, and protected routes.

For detailed information about the authentication system, see [AUTH_INTEGRATION_GUIDE.md](AUTH_INTEGRATION_GUIDE.md).

Quick overview:
- **Login**: `/login` - Users can log in with email/password
- **Register**: `/register` - Support for both Patient and Physician registration
- **Protected Routes**: Some routes require authentication and specific user types
- **Session Management**: Cookie-based sessions with Flask-Login

## Notes

- The old `react-frontend/` folder is deprecated
- `frontend/` is now the default and only React frontend
- Built files in `frontend/dist/` are gitignored
- Make sure Flask has `SECRET_KEY` environment variable set
- Always include `credentials: 'include'` in fetch requests for authentication to work
