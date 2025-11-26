from flask_login import UserMixin
from db import execute_one, execute_update, execute_query
import bcrypt

class User(UserMixin):
    """User class for Flask-Login authentication"""

    def __init__(self, user_id, email, user_type, reference_id, active=True):
        self.id = user_id
        self.email = email
        self.user_type = user_type
        self.reference_id = reference_id
        self.active = active

    def get_id(self):
        """Return user ID as string (required by Flask-Login)"""
        return str(self.id)

    @property
    def is_active(self):
        """Return whether user is active (required by Flask-Login)"""
        return self.active

    @property
    def is_patient(self):
        """Check if user is a patient"""
        return self.user_type == 'patient'

    @property
    def is_physician(self):
        """Check if user is a physician"""
        return self.user_type == 'physician'

    @property
    def is_admin(self):
        """Check if user is an admin"""
        return self.user_type == 'admin'

    @staticmethod
    def get_by_id(user_id):
        """Load user by ID (required by Flask-Login)"""
        query = """
            SELECT UserID, Email, UserType, ReferenceID, IsActive
            FROM User
            WHERE UserID = %s
        """
        result = execute_one(query, (user_id,))

        if result:
            return User(
                user_id=result['UserID'],
                email=result['Email'],
                user_type=result['UserType'],
                reference_id=result['ReferenceID'],
                active=result['IsActive']
            )
        return None

    @staticmethod
    def get_by_email(email):
        """Load user by email"""
        query = """
            SELECT UserID, Email, UserType, ReferenceID, IsActive
            FROM User
            WHERE Email = %s
        """
        result = execute_one(query, (email,))

        if result:
            return User(
                user_id=result['UserID'],
                email=result['Email'],
                user_type=result['UserType'],
                reference_id=result['ReferenceID'],
                active=result['IsActive']
            )
        return None

    @staticmethod
    def verify_password(email, password):
        """Verify user password and return User object if valid"""
        query = "SELECT UserID, Email, PasswordHash, UserType, ReferenceID, IsActive FROM User WHERE Email = %s"
        result = execute_one(query, (email,))

        if result and bcrypt.checkpw(password.encode('utf-8'), result['PasswordHash'].encode('utf-8')):
            # Update last login
            update_query = "UPDATE User SET LastLogin = NOW() WHERE UserID = %s"
            execute_update(update_query, (result['UserID'],))

            return User(
                user_id=result['UserID'],
                email=result['Email'],
                user_type=result['UserType'],
                reference_id=result['ReferenceID'],
                active=result['IsActive']
            )
        return None

    @staticmethod
    def create_user(email, password, user_type, reference_id=None):
        """Create a new user with hashed password"""
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Insert user
        query = """
            INSERT INTO User (Email, PasswordHash, UserType, ReferenceID, IsActive)
            VALUES (%s, %s, %s, %s, TRUE)
        """

        try:
            user_id = execute_update(query, (email, password_hash, user_type, reference_id))
            return User.get_by_id(user_id)
        except Exception as e:
            raise e

    @staticmethod
    def email_exists(email):
        """Check if email already exists"""
        query = "SELECT COUNT(*) as count FROM User WHERE Email = %s"
        result = execute_one(query, (email,))
        return result['count'] > 0

    def get_profile_data(self):
        """Get user's profile data based on user type"""
        if self.user_type == 'patient':
            query = """
                SELECT p.*, u.Email
                FROM Patient p
                JOIN User u ON u.ReferenceID = p.PatientID AND u.UserType = 'patient'
                WHERE p.PatientID = %s
            """
            return execute_one(query, (self.reference_id,))
        elif self.user_type == 'physician':
            query = """
                SELECT ph.*, u.Email
                FROM Physician ph
                JOIN User u ON u.ReferenceID = ph.PhysicianID AND u.UserType = 'physician'
                WHERE ph.PhysicianID = %s
            """
            return execute_one(query, (self.reference_id,))
        return None

    def __repr__(self):
        return f'<User {self.email} ({self.user_type})>'
