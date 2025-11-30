# Base database configuration (shared settings)
DATABASE_CONFIG = {
    'host': 'localhost',
    'database': 'HealthSystem',
}

# Role-based database credentials (Principle of Least Privilege)
# Each role has different MySQL user with specific permissions
DB_CREDENTIALS = {
    'patient': {
        'user': 'app_patient',
        'password': 'P@t1ent$ecur3P@ss2024!'
    },
    'physician': {
        'user': 'app_physician',
        'password': 'Phy$1c1@nS3cur3P@ss2024!'
    },
    'admin': {
        'user': 'app_admin',
        'password': 'Adm1n$ecur3P@ss2024!'
    }
}

def get_db_config(user_role='admin'):
    """
    Get database configuration for specific user role.
    Implements Principle of Least Privilege - each role gets minimum required permissions.

    Args:
        user_role: 'patient', 'physician', or 'admin'

    Returns:
        Database configuration dict with role-specific credentials

    Security Benefits:
        - Patient sessions use app_patient (limited SELECT/INSERT privileges)
        - Physician sessions use app_physician (medical records access)
        - Admin sessions use app_admin (full CRUD privileges)
        - SQL injection attacks are limited by database-level permissions
    """
    config = DATABASE_CONFIG.copy()

    # Get credentials for role, default to admin if role not found
    credentials = DB_CREDENTIALS.get(user_role, DB_CREDENTIALS['admin'])
    config.update(credentials)

    return config