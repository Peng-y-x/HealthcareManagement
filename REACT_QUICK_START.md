# React Frontend - Quick Start

## Setup Instructions

### 1. Install Dependencies

Navigate to the react-frontend directory:
```bash
cd react-frontend
npm install
```

### 2. Start Backend (Flask)

In one terminal:
```bash
cd ..
pip install -r requirements.txt
python app.py
```
Flask runs on: `http://localhost:5000`

### 3. Start Frontend (React)

In another terminal:
```bash
cd react-frontend
npm start
```
React runs on: `http://localhost:3000`

## Features

- **Login**: `/login`
- **Register**: `/register` (choose Patient or Physician)
- **Dashboard**: `/dashboard` (protected route)

## API Endpoints Used

- `POST /auth/api/login` - Login
- `POST /auth/api/logout` - Logout
- `GET /auth/api/current-user` - Get logged-in user
- `POST /auth/register/patient` - Register patient
- `POST /auth/register/physician` - Register physician
- `GET /api/patients` - Get all patients (protected)

## File Structure

```
react-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Login.js          # Login form
│   │   ├── Register.js       # Registration (Patient/Physician)
│   │   ├── Dashboard.js      # User dashboard
│   │   └── PrivateRoute.js   # Protected route wrapper
│   ├── services/
│   │   └── api.js            # API calls with axios
│   ├── App.js                # Main app with routing
│   ├── App.css               # Styles
│   └── index.js              # Entry point
└── package.json
```

## Usage

1. Go to `http://localhost:3000`
2. Click "Register here"
3. Select "Patient" or "Physician"
4. Fill in the form and submit
5. Login with your credentials
6. View your dashboard

## Notes

- CORS is enabled for `http://localhost:3000`
- Sessions are cookie-based
- React proxies API requests to Flask backend
