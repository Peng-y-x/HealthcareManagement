from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from models import User
from db import execute_update, execute_one
from functools import wraps

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


def patient_required(f):
    """Decorator to require patient role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_patient:
            return jsonify({'success': False, 'error': 'Patient access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


def physician_required(f):
    """Decorator to require physician role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_physician:
            return jsonify({'success': False, 'error': 'Physician access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


# API endpoints for authentication
@auth_bp.route('/login', methods=['POST'])
def api_login():
    """API endpoint for login"""
    data = request.json

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    user = User.verify_password(data['email'], data['password'])

    if user:
        if not user.is_active:
            return jsonify({'success': False, 'error': 'Account deactivated'}), 403

        login_user(user, remember=data.get('remember_me', False))
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'reference_id': user.reference_id
            }
        }), 200
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401


@auth_bp.route('/logout', methods=['POST'])
@login_required
def api_logout():
    """API endpoint for logout"""
    logout_user()
    return jsonify({'success': True, 'message': 'Logout successful'}), 200


@auth_bp.route('/current-user', methods=['GET'])
@login_required
def api_current_user():
    """API endpoint to get current user info"""
    profile = current_user.get_profile_data()
    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'user_type': current_user.user_type,
            'reference_id': current_user.reference_id,
            'profile': profile
        }
    }), 200


@auth_bp.route('/register/patient', methods=['POST'])
def register_patient():
    """Patient registration API endpoint"""
    data = request.json

    if not data:
        return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400

    # Validate required fields
    required_fields = ['email', 'password', 'name', 'phone_number', 'dob', 'blood_type', 'address']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400

    # Validate password length
    if len(data['password']) < 8:
        return jsonify({'success': False, 'error': 'Password must be at least 8 characters'}), 400

    # Check if email already exists
    if User.email_exists(data['email']):
        return jsonify({'success': False, 'error': 'Email already registered'}), 400

    try:
        # Get max PatientID and increment
        result = execute_one("SELECT MAX(PatientID) as max_id FROM Patient")
        new_patient_id = (result['max_id'] or 0) + 1

        # Create patient record
        patient_query = """
            INSERT INTO Patient (PatientID, Name, DOB, BloodType, PhoneNumber, Address)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        execute_update(patient_query, (
            new_patient_id,
            data['name'],
            data['dob'],
            data['blood_type'],
            data['phone_number'],
            data['address']
        ))

        # Create user account
        user = User.create_user(
            email=data['email'],
            password=data['password'],
            user_type='patient',
            reference_id=new_patient_id
        )

        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user_id': user.id
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@auth_bp.route('/register/physician', methods=['POST'])
def register_physician():
    """Physician registration API endpoint"""
    data = request.json

    if not data:
        return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400

    # Validate required fields
    required_fields = ['email', 'password', 'name', 'phone_number', 'department', 'clinic_name', 'clinic_address']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400

    # Validate password length
    if len(data['password']) < 8:
        return jsonify({'success': False, 'error': 'Password must be at least 8 characters'}), 400

    # Check if email already exists
    if User.email_exists(data['email']):
        return jsonify({'success': False, 'error': 'Email already registered'}), 400

    try:
        # check if the clinic exists
        clinic_row = execute_one(
            "SELECT ClinicID FROM Clinic WHERE Name = %s AND Address= %s",
            (data['clinic_name'], data['clinic_address'])
        )
        if clinic_row:
            clinic_id = clinic_row['ClinicID']
        else:
            # clinic doesn't exist, create a new clinic
            result = (execute_one('SELECT MAX(ClinicID) as max_id FROM Clinic'))
            new_clinic_id = (result['max_id'] or 0) + 1
            execute_update(
                "INSERT INTO Clinic (ClinicID, Name, Address) VALUES (%s, %s, %s)",
                (new_clinic_id, data['clinic_name'], data['clinic_address'])
            )
            clinic_id = new_clinic_id
        # Get max PhysicianID and increment
        result = execute_one("SELECT MAX(PhysicianID) as max_id FROM Physician")
        new_physician_id = (result['max_id'] or 0) + 1

        # Create physician record
        physician_query = """
            INSERT INTO Physician (PhysicianID, Name, PhoneNumber, Department)
            VALUES (%s, %s, %s, %s)
        """
        execute_update(physician_query, (
            new_physician_id,
            data['name'],
            data['phone_number'],
            data['department']
        ))

        # add works at
        execute_update(
            "INSERT INTO WorksAt (PhysicianID, ClinicID) VALUES (%s, %s)",
            (new_physician_id, clinic_id)
        )
        # Create user account
        user = User.create_user(
            email=data['email'],
            password=data['password'],
            user_type='physician',
            reference_id=new_physician_id
        )

        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user_id': user.id
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
