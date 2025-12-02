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
- **Database**: MySQL with role-based access control
- **Authentication**: Flask-Login with session management
- **Security**: Dynamic user switching, Principle of Least Privilege
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
- 🔒 **[SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md)** - Role-based database security setup
- 🔧 **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - Complete feature overview
- 🔐 **[AUTH_INTEGRATION_GUIDE.md](AUTH_INTEGRATION_GUIDE.md)** - Authentication system details
- 🌐 **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Frontend setup guide
- 🐛 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solutions to common issues

## Prerequisites

- Python 3.x
- Node.js and npm
- MySQL 5.7+ or 8.0+
- pip (Python package manager)
- MySQL root access (for creating role-based users)

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

**Step 3.1**: Create database and tables
```bash
mysql -u root -p HealthSystem < COMMANDS.sql
```

**Step 3.2**: Create role-based MySQL users
```sql
-- Connect as root
mysql -u root -p

-- Create app users with different privilege levels
CREATE USER 'app_patient'@'localhost' IDENTIFIED BY 'P@t1ent$ecur3P@ss2024!';
CREATE USER 'app_physician'@'localhost' IDENTIFIED BY 'Phy$1c1@nS3cur3P@ss2024!';
CREATE USER 'app_admin'@'localhost' IDENTIFIED BY 'Adm1n$ecur3P@ss2024!';

-- Grant appropriate permissions (see SECURITY_IMPLEMENTATION.md for details)
GRANT SELECT ON HealthSystem.* TO 'app_patient'@'localhost';
GRANT ALL PRIVILEGES ON HealthSystem.* TO 'app_admin'@'localhost';

FLUSH PRIVILEGES;
```

See [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) for complete permission setup.

### 4. Configure Database

Edit [config.py](config.py) with your MySQL credentials:
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
healthcare-management/
├── app.py                         # Flask application entry point
├── auth.py                        # Authentication routes
├── models.py                      # Database models
├── db.py                          # Database connection (role-based)
├── config.py                      # Configuration (role credentials)
├── requirements.txt               # Python dependencies
├── COMMANDS.sql                   # Database schema
├── SECURITY_IMPLEMENTATION.md     # Security setup guide
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

### Core Files

**[db.py](db.py)** - Database connection manager with dynamic user switching
- `get_db(user_role)`: Automatically switches credentials based on user's role
- `execute_query()`, `execute_one()`, `execute_update()`: Safe query execution
- `call_procedure()`: Stored procedure support
- Implements defense-in-depth by enforcing DB-level permissions

**[config.py](config.py)** - Security-enhanced configuration
- `DATABASE_CONFIG`: Base connection settings
- `DB_CREDENTIALS`: Separate credentials for patient/physician/admin roles
- `get_db_config(user_role)`: Returns appropriate config per role
- Implements Principle of Least Privilege at database layer

## API Endpoints

### Authentication Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/login` | POST | User login | No |
| `/auth/logout` | POST | User logout | Yes |
| `/auth/current-user` | GET | Get current user info with profile | Yes |
| `/auth/register/patient` | POST | Register new patient | No |
| `/auth/register/physician` | POST | Register new physician | No |

### Patient Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/patients` | GET | Get all patients | Yes |
| `/api/patients/<id>` | GET | Get patient by ID | No |
| `/api/patients` | POST | Create new patient | No |
| `/api/data/patients` | GET | Get all patients for data filtering (Physician/Admin) | Yes |

### Physician Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/physicians` | GET | Get physicians with pagination | Yes |
| `/api/physician/patients` | GET | Get patients for current physician (Physician/Admin) | Yes |
| `/api/data/physicians` | GET | Get all physicians for data filtering (Physician/Admin) | Yes |

### Appointment Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/appointments` | GET | Get appointments for logged-in user | Yes |
| `/api/appointments` | POST | Create new appointment | Yes |
| `/api/appointments/<id>` | DELETE | Delete/cancel appointment | Yes |
| `/api/booked-timeslots` | GET | Get booked time slots for physician/clinic | Yes |

### Health Report Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/healthreports` | GET | Get health reports for patient or physician | Yes |
| `/api/healthreports` | POST | Create new health report with prescriptions (Physician/Admin) | Yes |
| `/api/healthreports/<id>/download` | GET | Get health report for PDF download (Physician/Admin) | Yes |
| `/api/patient/healthreports/<id>/download` | GET | Get health report for patient PDF download (Patient) | Yes |
| `/api/data/healthreports` | GET | Get all health reports for data filtering (Physician/Admin) | Yes |

### Prescription Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/prescription` | GET | Get prescriptions for patient | Yes |
| `/api/prescription` | POST | Create new prescription | Yes |
| `/api/data/prescriptions` | GET | Get all prescriptions for data filtering (Physician/Admin) | Yes |

### Medical History Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/history` | GET | Get medical history for patient | Yes |
| `/api/history` | POST | Create medical history entry | Yes |
| `/api/history` | PUT | Update medical history entry | Yes |

### Billing Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/billing` | GET | Get bills for patient | Yes |
| `/api/billing` | POST | Create new bill | Yes |
| `/api/billing/pay` | POST | Mark bill as paid | Yes |

### Clinic Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/clinics` | GET | Get all clinics or specific clinic by ID | Yes |
| `/api/clinics` | POST | Create new clinic | Yes |
| `/api/clinic/create` | POST | Create new clinic (Admin) | Yes |
| `/api/data/clinics` | GET | Get all clinics for data filtering (Physician/Admin) | Yes |

### Work Assignment Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/worksat` | GET | Get work assignments for physician | Yes |
| `/api/worksat` | POST | Create work assignment | Yes |
| `/api/workassignment/check` | GET | Check if work assignment exists | Yes |
| `/api/workassignment/create` | POST | Create work assignment (Admin) | Yes |
| `/api/workassignment/update` | PUT | Update work assignment (Admin) | Yes |
| `/api/workassignment/delete` | DELETE | Delete work assignment (Admin) | Yes |
| `/api/data/workassignments` | GET | Get all work assignments for data filtering (Physician/Admin) | Yes |

### Schedule Endpoints
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/schedule/create` | POST | Create new schedule | Yes |

### Data Filtering Endpoint
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/filter` | GET | Filter data from any table by column/value | Yes |

## Environment Variables

Create a `.env` file (optional, defaults are set):
```bash
SECRET_KEY=your-secret-key-here
```

Generate a secure key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Security Features

### Application-Level Security
- Passwords hashed using Werkzeug security (bcrypt-compatible)
- Session-based authentication with HTTP-only cookies
- CORS configured for development
- Role-based access control in Flask routes

### Database-Level Security (Defense-in-Depth)
- **Dynamic User Switching**: [db.py](db.py) automatically uses appropriate MySQL credentials
  - Patient sessions → `app_patient` DB user (limited SELECT/INSERT)
  - Physician sessions → `app_physician` DB user (medical records access)
  - Admin sessions → `app_admin` DB user (full privileges)
- **Principle of Least Privilege**: Each role has minimum required permissions
- **SQL Injection Protection**: Even if app is compromised, database enforces access control
- **Audit Trail Ready**: Different DB users enable connection-level logging

### Best Practices
- **Always set a strong SECRET_KEY in production**
- Change default passwords in [config.py](config.py)
- Use SSL/TLS for MySQL connections in production
- Regularly review MySQL user permissions
- Monitor database access logs

See [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) for complete security setup.

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
- **Database connection errors**:
  - Verify [config.py](config.py) credentials match created MySQL users
  - Test: `mysql -u app_admin -p HealthSystem`
  - Ensure all three users (`app_patient`, `app_physician`, `app_admin`) are created
- **Permission errors**: Check MySQL GRANT statements (see [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md))
- **Port conflicts**: Kill processes on ports 5000/3000

## License

This project is for educational purposes.

## Support

For issues and questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [QUICK_START.md](QUICK_START.md)
3. Check browser console and Flask logs

---
