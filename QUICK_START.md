# Quick Start Guide

Get the application running in 3 simple steps!

## Prerequisites

- Python 3.x installed
- Node.js and npm installed
- MySQL database running
- Database `HealthSystem` created with tables (see [COMMANDS.sql](COMMANDS.sql))
- MySQL users created for role-based access (see setup below)

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
mysql -u root -p HealthSystem < COMMANDS.sql
```

Or manually execute the SQL from [COMMANDS.sql](COMMANDS.sql)

### 3. Configure Database Connection

The application uses **role-based database access** for enhanced security.

**Step 3.1**: Create MySQL users with appropriate permissions:
```sql
-- Connect as root
mysql -u root -p

-- Create app users
CREATE USER 'app_patient'@'localhost' IDENTIFIED BY 'P@t1ent$ecur3P@ss2024!';
CREATE USER 'app_physician'@'localhost' IDENTIFIED BY 'Phy$1c1@nS3cur3P@ss2024!';
CREATE USER 'app_admin'@'localhost' IDENTIFIED BY 'Adm1n$ecur3P@ss2024!';

-- Grant permissions (see SECURITY_IMPLEMENTATION.md for detailed permissions)
GRANT SELECT ON HealthSystem.* TO 'app_patient'@'localhost';
GRANT ALL PRIVILEGES ON HealthSystem.* TO 'app_admin'@'localhost';
-- (More specific grants needed - see SECURITY_IMPLEMENTATION.md)

FLUSH PRIVILEGES;
```

**Step 3.2**: Edit [config.py](config.py) with your credentials:
```python
# Base database configuration
DATABASE_CONFIG = {
    'host': 'localhost',
    'database': 'HealthSystem',
}

# Role-based credentials (Principle of Least Privilege)
DB_CREDENTIALS = {
    'patient': {
        'user': 'app_patient',
        'password': 'P@t1ent$ecur3P@ss2024!'  # Change this
    },
    'physician': {
        'user': 'app_physician',
        'password': 'Phy$1c1@nS3cur3P@ss2024!'  # Change this
    },
    'admin': {
        'user': 'app_admin',
        'password': 'Adm1n$ecur3P@ss2024!'  # Change this
    }
}
```

See [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) for complete setup instructions.

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
3. Ensure database `HealthSystem` exists
4. Ensure MySQL users (`app_patient`, `app_physician`, `app_admin`) are created with proper permissions
5. Test connection: `mysql -u app_admin -p HealthSystem`

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
healthcare-management/
├── app.py                 # Flask application (Backend)
├── auth.py                # Authentication routes
├── models.py              # Database models
├── db.py                  # Database connection (role-based access)
├── config.py              # Database configuration (role credentials)
├── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/              # React source code
│   ├── dist/             # Built files (production)
│   ├── package.json      # Node dependencies
│   └── vite.config.js    # Vite configuration
├── COMMANDS.sql          # Database schema
└── SECURITY_IMPLEMENTATION.md  # Security setup guide
```

### Key Files Explained

**[db.py](db.py)**: Database connection manager with **dynamic user switching**
- `get_db(user_role)`: Automatically switches DB credentials based on logged-in user's role
- `execute_query()`: Execute SELECT queries
- `execute_one()`: Execute SELECT, return single result
- `execute_update()`: Execute INSERT/UPDATE/DELETE with transaction support
- `call_procedure()`: Call stored procedures
- **Security**: Patient sessions use `app_patient` DB user, physicians use `app_physician`, admins use `app_admin`

**[config.py](config.py)**: Security-enhanced database configuration
- `DATABASE_CONFIG`: Base connection settings (host, database name)
- `DB_CREDENTIALS`: Role-specific MySQL credentials for 3 different users
- `get_db_config(user_role)`: Returns appropriate config for each role
- **Security**: Implements Principle of Least Privilege at database level

---

## Security Features

This application implements **defense-in-depth security**:

1. **Role-Based Database Access**: Each user role connects with different MySQL credentials
   - Patients use `app_patient` (limited SELECT/INSERT)
   - Physicians use `app_physician` (medical records access)
   - Admins use `app_admin` (full privileges)

2. **Dynamic User Switching**: [db.py](db.py) automatically selects correct DB user based on Flask session

3. **Database-Level Protection**: Even if app is compromised, MySQL enforces access control

## Next Steps

- Read [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) for complete security setup
- Read [AUTH_INTEGRATION_GUIDE.md](AUTH_INTEGRATION_GUIDE.md) for authentication details
- Read [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) for complete feature list