# Quick Start Guide

Get the application running in 3 simple steps!

## Prerequisites

- Python 3.x installed
- Node.js and npm installed
- MySQL database running
- Database `healthsystem` created with tables (see [COMMANDS.sql](COMMANDS.sql))

## Option 1: Development Mode (Recommended)

### Step 1: Start Flask Backend
Open a terminal and run:
```bash
python app.py
```

You should see:
```
* Running on http://0.0.0.0:5000
```

### Step 2: Start React Frontend
Open a **new** terminal and run:
```bash
cd frontend
npm install   # First time only
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:3000
```

### Step 3: Open in Browser
Visit: **http://localhost:3000**

✅ That's it! The app is running.

---

## Option 2: Production Mode

### Step 1: Build Frontend
```bash
cd frontend
npm install   # First time only
npm run build
cd ..
```

### Step 2: Start Flask
```bash
python app.py
```

### Step 3: Open in Browser
Visit: **http://localhost:5000**

---

## First Time Setup

### 1. Install Dependencies

**Backend**:
```bash
pip install -r requirements.txt
```

**Frontend**:
```bash
cd frontend
npm install
```

### 2. Setup Database

Run the SQL commands:
```bash
mysql -u root -p healthsystem < COMMANDS.sql
```

Or manually execute the SQL from [COMMANDS.sql](COMMANDS.sql)

### 3. Configure Database Connection

Edit [config.py](config.py) with your MySQL credentials:
```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'yourpassword',  # Change this
    'database': 'healthsystem'
}
```

---

## Testing the Application

### 1. Register a New User
1. Go to `/register`
2. Choose "Patient" or "Physician"
3. Fill in the form
4. Click "Register"
5. You'll be redirected to login

### 2. Login
1. Go to `/login`
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to home

### 3. Test Protected Routes

**As Patient**:
- ✅ Can access: `/booking`, `/reports`, `/appointments`
- ❌ Cannot access: `/admin`

**As Physician**:
- ✅ Can access: `/admin`
- ❌ Cannot access: `/booking`, `/reports`, `/appointments`

---

## Default Ports

| Service | Port | URL |
|---------|------|-----|
| Flask Backend | 5000 | http://localhost:5000 |
| React Frontend (Dev) | 3000 | http://localhost:3000 |
| MySQL Database | 3306 | localhost:3306 |

---

## Common Issues

### "Address already in use"
Ports 5000 or 3000 are occupied. Kill the process or use different ports.

### "Cannot connect to database"
1. Check if MySQL is running
2. Verify credentials in [config.py](config.py)
3. Ensure database `healthsystem` exists

### "Module not found"
Install dependencies:
```bash
pip install -r requirements.txt
cd frontend && npm install
```

### Login issues
The SECRET_KEY is now set by default. Just restart Flask:
```bash
python app.py
```

---

## File Structure

```
priceless-galileo/
├── app.py                 # Flask application (Backend)
├── auth.py                # Authentication routes
├── models.py              # Database models
├── db.py                  # Database connection
├── config.py              # Database configuration
├── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/              # React source code
│   ├── dist/             # Built files (production)
│   ├── package.json      # Node dependencies
│   └── vite.config.js    # Vite configuration
└── COMMANDS.sql          # Database schema
```

---

## Next Steps

- Read [AUTH_INTEGRATION_GUIDE.md](AUTH_INTEGRATION_GUIDE.md) for authentication details
- Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if you encounter issues
- Read [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) for complete feature list

---

## Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Look at browser console (F12)
3. Check Flask terminal for errors
4. Verify all services are running

---

**Happy coding! 🚀**
