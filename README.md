# Healthcare Management System

A full-stack healthcare management application with patient and physician portals.

## Features

- 🏥 Patient registration and management
- 👨‍⚕️ Physician management and admin panel
- 📅 Appointment booking and tracking
- 📊 Health reports and data filtering
- 🔐 Secure authentication with role-based access control
- 💉 Blood type tracking and patient information

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Flask (Python)
- **Database**: MySQL
- **Authentication**: Flask-Login with session management
- **Styling**: Custom CSS with modern gradients

## Quick Start

### Development Mode

**Terminal 1 - Backend:**
```bash
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

Visit: **http://localhost:3000**

### Production Mode

```bash
cd frontend
npm run build
cd ..
python app.py
```

Visit: **http://localhost:5000**

## Documentation

- 📖 **[QUICK_START.md](QUICK_START.md)** - Get started in 3 steps
- 🔧 **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - Complete feature overview
- 🔐 **[AUTH_INTEGRATION_GUIDE.md](AUTH_INTEGRATION_GUIDE.md)** - Authentication system details
- 🌐 **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Frontend setup guide
- 🐛 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solutions to common issues

## Prerequisites

- Python 3.x
- Node.js and npm
- MySQL database
- pip (Python package manager)

## Installation

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Setup Database
```bash
mysql -u root -p healthsystem < COMMANDS.sql
```

### 4. Configure Database
Edit [config.py](config.py) with your MySQL credentials:
```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'yourpassword',
    'database': 'healthsystem'
}
```

## User Types

### Patient
- Register and manage personal health information
- Book appointments with physicians
- View health reports
- Track appointments

### Physician
- Access admin panel
- View and filter patient data
- Manage appointments
- Access analytics

## Project Structure

```
priceless-galileo/
├── app.py                         # Flask application entry point
├── auth.py                        # Authentication routes
├── models.py                      # Database models
├── db.py                          # Database connection
├── config.py                      # Configuration
├── requirements.txt               # Python dependencies
├── COMMANDS.sql                   # Database schema
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── context/              # Auth context
│   │   └── router/               # Route configuration
│   ├── dist/                     # Production build
│   ├── package.json              # Node dependencies
│   └── vite.config.js            # Vite configuration
└── docs/                         # Documentation files
```

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/login` | POST | User login | No |
| `/auth/logout` | POST | User logout | Yes |
| `/auth/current-user` | GET | Get current user | Yes |
| `/auth/register/patient` | POST | Register patient | No |
| `/auth/register/physician` | POST | Register physician | No |
| `/api/patients` | GET | Get all patients | Yes |
| `/api/patients/<id>` | GET | Get patient by ID | No |
| `/api/patients` | POST | Create patient | No |

## Environment Variables

Create a `.env` file (optional, defaults are set):
```bash
SECRET_KEY=your-secret-key-here
```

Generate a secure key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Security Notes

- Passwords are hashed using Werkzeug security
- Session-based authentication with HTTP-only cookies
- CORS configured for development
- Role-based access control
- **Always set a strong SECRET_KEY in production**

## Development

### Backend (Flask)
- Hot reload enabled with `debug=True`
- Runs on port 5000
- CORS enabled for `http://localhost:3000`

### Frontend (React)
- Vite dev server with HMR
- Runs on port 3000
- Proxy configured for `/api` and `/auth`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions to common issues.

Quick fixes:
- **Login issues**: Restart Flask server
- **Build errors**: Run `npm install` in frontend folder
- **Database errors**: Check [config.py](config.py) credentials
- **Port conflicts**: Kill processes on ports 5000/3000

## License

This project is for educational purposes.

## Support

For issues and questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [QUICK_START.md](QUICK_START.md)
3. Check browser console and Flask logs

---
