import pymysql
from pymysql.cursors import DictCursor
from flask import g
from config import DATABASE_CONFIG

def get_db():
    """Get database connection for current request"""
    if 'db' not in g:
        g.db = pymysql.connect(
            host=DATABASE_CONFIG['host'],
            user=DATABASE_CONFIG['user'],
            password=DATABASE_CONFIG['password'],
            database=DATABASE_CONFIG['database'],
            cursorclass=DictCursor
        )
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