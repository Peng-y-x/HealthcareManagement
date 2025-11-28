from flask import Flask, jsonify, request, send_from_directory
from flask_login import LoginManager, login_required, current_user
from flask_cors import CORS
from db import init_app, execute_query, execute_one, execute_update, call_procedure
from models import User
from auth import auth_bp
import os

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')

# Configuration
# Use environment variable if available, otherwise use a default for development
# IMPORTANT: In production, always set a strong SECRET_KEY environment variable
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production-12345')

# Enable CORS for React frontend (Vite dev server)
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])

# Initialize database
init_app(app)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

# User loader callback for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(int(user_id))

# Unauthorized handler - return JSON instead of redirect
@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'success': False, 'error': 'Authentication required'}), 401

# Register authentication blueprint
app.register_blueprint(auth_bp)

# Get all patients (protected route - requires login)
@app.route('/api/patients', methods=['GET'])
@login_required
def get_patients():
    try:
        query = "SELECT * FROM Patient"
        patients = execute_query(query)
        return jsonify({'success': True, 'data': patients, 'count': len(patients)}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    

@app.route('/api/physicians', methods=['GET'])
@login_required
def get_physicians():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 3, type=int)

        offset = (page - 1) * page_size

        count_query = "SELECT COUNT(*) as total FROM physician"
        count_result = execute_one(count_query)
        total = count_result['total'] if count_result else 0

        query = """
            SELECT
                p.PhysicianID,
                p.Name,
                p.PhoneNumber,
                p.Department,
                c.Name as clinic,
                c.Address as cl_address
            FROM physician p
            LEFT JOIN WorksAt w ON p.PhysicianID = w.PhysicianID
            LEFT JOIN Clinic c ON w.ClinicID = c.ClinicID
            LIMIT %s OFFSET %s
        """
        physicians = execute_query(query, (page_size, offset))

        total_pages = (total + page_size - 1) // page_size

        return jsonify({
            'success': True,
            'data': physicians,
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': total_pages
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/appointments', methods=['GET'])
@login_required
def get_appointments():
    """Get appointments for the logged-in patient"""
    try:
        if current_user.user_type != 'patient':
            return jsonify({'success': False, 'error': 'Patient access required'}), 403

        query = """
            SELECT
                a.AppointmentID,
                c.Name AS clinic_name,
                p.Name AS physician_name,
                a.AppointmentDate,
                a.AppointmentTime
            FROM Appointment a
            JOIN Clinic c ON c.ClinicID = a.ClinicID
            JOIN Physician p ON p.PhysicianID = a.PhysicianID
            WHERE a.PatientID = %s
            ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
        """
        appointments = execute_query(query, (current_user.reference_id,))

        return jsonify({
            'success': True,
            'data': appointments,
            'count': len(appointments)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# Get patient by ID
@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    try:
        query = "SELECT * FROM Patient WHERE PatientID = %s"
        patient = execute_one(query, (patient_id,))
        
        if not patient:
            return jsonify({'success': False, 'error': 'Patient not found'}), 404
        
        return jsonify({'success': True, 'data': patient}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Create new patient
@app.route('/api/patients', methods=['POST'])
def create_patient():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PatientID', 'Name', 'Email', 'DOB', 'BloodType', 'PhoneNumber', 'Address']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        query = """
            INSERT INTO Patient (PatientID, Name, Email, DOB, BloodType, PhoneNumber, Address)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        execute_update(query, (
            data['PatientID'],
            data['Name'],
            data['Email'],
            data['DOB'],
            data['BloodType'],
            data['PhoneNumber'],
            data['Address']
        ))
        
        return jsonify({'success': True, 'message': 'Patient created successfully', 'PatientID': data['PatientID']}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# ==================== SERVE REACT APP ====================
# Serve React App (for production)
# This catch-all route should NOT match /api or /auth routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    # Don't serve static files for API or auth routes
    if path.startswith('api/') or path.startswith('auth/'):
        return jsonify({'success': False, 'error': 'Not found'}), 404

    # Serve static files if they exist
    if app.static_folder and path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)

    # Otherwise serve index.html for client-side routing
    if app.static_folder:
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({'success': False, 'error': 'Static folder not configured'}), 500

# ==================== RUN APP ====================
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
