# Authentication Integration Guide

This guide explains the complete authentication system integrated between the React frontend and Flask backend.

## Architecture Overview

The application now has a fully integrated authentication system with:
- **Backend**: Flask with Flask-Login for session management
- **Frontend**: React with Context API for auth state management
- **Session-based authentication** using cookies

## Backend (Flask)

### Auth Endpoints

All authentication endpoints are under `/auth` prefix:

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/login` | POST | User login | No |
| `/auth/logout` | POST | User logout | Yes |
| `/auth/current-user` | GET | Get current user info | Yes |
| `/auth/register/patient` | POST | Register as patient | No |
| `/auth/register/physician` | POST | Register as physician | No |

### Login Request Example

```javascript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": false  // optional
}
```

### Registration Examples

**Patient Registration:**
```javascript
POST /auth/register/patient
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone_number": "1234567890",
  "dob": "1990-01-01",
  "blood_type": "A+",
  "address": "123 Main St"
}
```

**Physician Registration:**
```javascript
POST /auth/register/physician
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "password123",
  "name": "Dr. Jane Smith",
  "phone_number": "0987654321",
  "department": "Cardiology"
}
```

## Frontend (React)

### Authentication Context

The `AuthContext` ([frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)) provides:

```javascript
const {
  user,              // Current user object
  loading,           // Auth check loading state
  isAuthenticated,   // Boolean - is user logged in
  isPatient,         // Boolean - is user a patient
  isPhysician,       // Boolean - is user a physician
  login,             // Function to login
  logout,            // Function to logout
  registerPatient,   // Function to register patient
  registerPhysician  // Function to register physician
} = useAuth();
```

### Using Authentication in Components

```javascript
import { useAuth } from '../../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please login</p>;
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```javascript
// Patient-only route
<Route
  path="/appointments"
  element={
    <ProtectedRoute requirePatient>
      <Appointments/>
    </ProtectedRoute>
  }
/>

// Physician-only route
<Route
  path="/admin"
  element={
    <ProtectedRoute requirePhysician>
      <DataFiltering/>
    </ProtectedRoute>
  }
/>
```

## Route Protection

### Current Route Configuration

| Route | Access Level |
|-------|-------------|
| `/` | Public |
| `/login` | Public (redirects if authenticated) |
| `/register` | Public (redirects if authenticated) |
| `/physicians` | Public |
| `/booking` | Patient only |
| `/reports` | Patient only |
| `/appointments` | Patient only |
| `/admin` | Physician only |

## User Types and Roles

The system supports two user types:

1. **Patient**
   - Can book appointments
   - Can view health reports
   - Can view their appointments
   - Linked to Patient table in database

2. **Physician**
   - Can access admin panel
   - Can view data filtering
   - Linked to Physician table in database

## Navigation Bar Integration

The NavBar ([frontend/src/components/NavBar/NavBar.jsx](frontend/src/components/NavBar/NavBar.jsx)) now shows:

**When NOT authenticated:**
- Home
- Register
- Login
- Physicians

**When authenticated as Patient:**
- Home
- Physicians
- Make Appointment
- Health Reports
- Appointments
- User email and Logout button

**When authenticated as Physician:**
- Home
- Physicians
- Admin
- User email and Logout button

## Session Management

- Sessions are stored in cookies
- Flask-Login manages session lifecycle
- Frontend checks authentication on app load
- Sessions persist across page refreshes
- `credentials: 'include'` required in all fetch requests

## Important Files

### Backend
- [auth.py](auth.py) - Authentication routes and logic
- [models.py](models.py) - User model with password hashing
- [app.py](app.py) - Flask app with CORS and session config

### Frontend
- [context/AuthContext.jsx](frontend/src/context/AuthContext.jsx) - Auth state management
- [components/ProtectedRoute/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute/ProtectedRoute.jsx) - Route protection
- [pages/Login/Login.jsx](frontend/src/pages/Login/Login.jsx) - Login page
- [pages/Register/Register.jsx](frontend/src/pages/Register/Register.jsx) - Registration page
- [router/Router.jsx](frontend/src/router/Router.jsx) - Route configuration
- [components/NavBar/NavBar.jsx](frontend/src/components/NavBar/NavBar.jsx) - Navigation with auth

## Testing the Integration

### 1. Start the Backend
```bash
python app.py
```
Backend runs on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

### 3. Test Registration
1. Go to `http://localhost:3000/register`
2. Choose "Patient" or "Physician"
3. Fill in the form
4. Click "Register"
5. Should redirect to login page on success

### 4. Test Login
1. Go to `http://localhost:3000/login`
2. Enter your email and password
3. Click "Login"
4. Should redirect to home page
5. NavBar should show user email and logout button

### 5. Test Protected Routes
- Try accessing `/booking` without login → redirects to `/login`
- Login as patient → can access `/booking`, `/reports`, `/appointments`
- Try accessing `/admin` as patient → redirects to home
- Login as physician → can access `/admin`

### 6. Test Logout
1. Click "Logout" button in NavBar
2. Should clear session
3. Protected routes should now redirect to login

## Troubleshooting

### CORS Issues
Make sure Flask CORS is configured in [app.py](app.py:15):
```python
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])
```

### Session Not Persisting
Ensure all fetch requests include:
```javascript
credentials: 'include'
```

### 401 Unauthorized
- Check if user is logged in
- Verify session cookie is being sent
- Check Flask-Login configuration

### Registration Fails
- Verify database connection
- Check if email already exists
- Ensure all required fields are provided
- Password must be at least 8 characters

## Security Notes

- Passwords are hashed using Werkzeug's security utilities
- Session cookies are HTTP-only
- CORS is restricted to localhost:3000 in development
- Always use HTTPS in production
- Set strong SECRET_KEY in production environment variables

## Next Steps

To enhance the auth system:
1. Add email verification
2. Add password reset functionality
3. Add remember me token persistence
4. Add user profile editing
5. Add 2FA (two-factor authentication)
6. Add OAuth social login
