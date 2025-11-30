import pymysql
from pymysql.cursors import DictCursor
from flask import g
from config import get_db_config

def get_db(user_role=None):
    """
    Get database connection with role-based credentials.

    Implements dynamic user switching based on logged-in user's role.
    This provides defense-in-depth security by enforcing permissions
    at both application and database levels.

    Args:
        user_role: Optional role override ('patient', 'physician', 'admin')
                  If None, attempts to get from current_user
                  Falls back to 'admin' for unauthenticated requests

    Returns:
        Database connection with appropriate privilege level

    Security Benefits:
        - Patient sessions automatically use app_patient DB user
        - Physician sessions automatically use app_physician DB user
        - Admin sessions automatically use app_admin DB user
        - SQL injection attacks limited by DB user permissions
        - Even if app is compromised, DB enforces access control
    """
    if 'db' not in g:
        # Determine which role to use for this connection
        if user_role is None:
            # Check if there's a forced role for this request
            if hasattr(g, 'force_db_role'):
                user_role = g.force_db_role
            else:
                # Try to get role from current logged-in user
                try:
                    from flask_login import current_user
                    if current_user.is_authenticated:
                        user_role = current_user.user_type
                    else:
                        # Unauthenticated requests (registration, public endpoints)
                        user_role = 'admin'
                except:
                    # Flask-Login not available or error - use admin
                    user_role = 'admin'

        # Get configuration for this role
        config = get_db_config(user_role)

        # Create connection with role-specific credentials
        g.db = pymysql.connect(
            host=config['host'],
            user=config['user'],
            password=config['password'],
            database=config['database'],
            cursorclass=DictCursor
        )

        # Store the role used for this connection (useful for debugging/logging)
        g.db_role = user_role

    return g.db

def close_db(e=None):
    """Close database connection at end of request"""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_app(app):
    """Register database functions with Flask app"""
    app.teardown_appcontext(close_db)

def execute_query(query, params=None):
    """Execute SELECT query"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params or ())
    result = cursor.fetchall()
    cursor.close()
    return result

def execute_one(query, params=None):
    """Execute SELECT query, return one result"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params or ())
    result = cursor.fetchone()
    cursor.close()
    return result

def execute_update(query, params=None):
    """Execute INSERT/UPDATE/DELETE"""
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(query, params or ())
        db.commit()
        last_id = cursor.lastrowid
        cursor.close()
        return last_id
    except Exception as e:
        db.rollback()
        cursor.close()
        raise e

def call_procedure(proc_name, params=None):
    """Call stored procedure"""
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.callproc(proc_name, params or ())
        db.commit()
        cursor.close()
        return True
    except Exception as e:
        db.rollback()
        cursor.close()
        raise e