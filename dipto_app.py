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

@app.route("/api/filter", methods = ["GET"])
def filter():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['Table', 'Column', 'Value']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            select * from %s where %s = %s
        """

        filtered = execute_query(query, (
                data['Table'],
                data['Column'],
                data['Value']
            ))
    
        return jsonify({'success': True, 'data': filtered}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# @app.route("/api/physicians", methods = ["GET"])
# def get_physician():
#     try:
#         data = request.json
        
#         # Validate that data is not None
#         if not data:
#             return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
#         # Validate required fields
#         required_fields = ['PhysicianID']
#         for field in required_fields:
#             if field not in data:
#                 return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
#         query = """
#             select * from Physician where PhysicianID = %s
#         """

#         physician = execute_query(query, (
#                 data['PhysicianID']
#             ))

#         return jsonify({'success': True, 'data': physician}), 200
    
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/appointements", methods = ["POST"])
def make_appointment():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PatientID', 'ClinicID',  'PhysicianID', 'AppointmentDate', 'AppointementTime']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
    #query = """
        #INSERT INTO Appointment (AppointmentID, ClinicID,  PhysicianID, AppointmentDate, AppointementTime)
        #VALUES (%s, %s, %s, %s, %s, %s, %s)
    #"""

    #execute_query(query, (
            #data['AppointmentID'],
            #data['ClinicID'],
            #data['PhysicianID'],
            #data['AppointmentDate'],
            #data['AppointementTime']
        #))

        call_procedure('sp_BookAppointment', (
                data['PatientID'],
                data['PhysicianID'],
                data['ClinicID'],
                data['AppointmentDate'],
                data['AppointementTime']
            ))
        jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    
# @app.route("/api/appointements", methods = ["GET"])
# def get_appointement():
#     try:
#         data = request.json
        
#         # Validate that data is not None
#         if not data:
#             return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
#         # Validate required fields
#         required_fields = ['AppointmentID']
#         for field in required_fields:
#             if field not in data:
#                 return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
#         query = """
#             select * from Appointment where AppointmentID = %s
#         """

#         appointment = execute_query(query, (
#                 data['AppointmentID']
#             ))

#         return jsonify({'success': True, 'data': appointment}), 200
    
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 400
    
@app.route("/api/healthreports", methods = ["GET"])
def get_healthreports_for_patient():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PatientID']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            select * from HealthReport where PatientID = %s
        """

        health_reports = execute_query(query, (
                data['PatientID']
            ))

        return jsonify({'success': True, 'data': health_reports}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/billing", methods = ["POST"])
def add_bill_for_patient():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['BillingID', 'PatientID', 'AppointmentID', 'InsuranceID', 'TotalAmount', 'PaymentStatus', 'BillingDate', 'DueDate']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            INSERT INTO Billing (BillingID, PatientID, AppointmentID,  InsuranceID, TotalAmount, PaymentStatus, BillingDate, DueDate)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        execute_update(query, (
                data['BillingID'],
                data['PatientID'],
                data['AppointmentID'],
                data['InsuranceID'],
                data['TotalAmount'],
                data['PaymentStatus'],
                data['BillingID'],
                data['DueDate']
            ))

        jsonify({'success': True}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/billing", methods = ["POST"])
def pay_bill():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['BillingID']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            update Billing set PaymentStatus = true where BillingID = %s
        """

        execute_update(query, (
                data['BillingID']
            ))

        jsonify({'success': True}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/billing", methods = ["GET"])
def get_bills_for_patient():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PatientID']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            select * from Billing where PatientID = %s
        """

        bills = execute_query(query, (
                data['PatientID']
            ))

        return jsonify({'success': True, 'data': bills}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/prescription", methods = ["POST"])
def write_prescription():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PrescriptionID', 'ReportID', 'PhysicianID', 'Dosage', 'Frequency', 'StartDate', 'EndDate', 'Instructions']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            INSERT INTO Prescription (PrescriptionID, ReportID, PhysicianID, Dosage, Frequency, StartDate, EndDate, Instructions)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        execute_update(query, (
                data['PrescriptionID'],
                data['ReportID'],
                data['PhysicianID'],
                data['Dosage'],
                data['Frequency'],
                data['StartDate'],
                data['EndDate'],
                data['Instructions']
            ))

        jsonify({'success': True}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/prescription", methods = ["GET"])
def get_prescriptions_for_patient():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PatientID']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            select * from Prescription where PatientID = %s
        """

        prescriptions = execute_query(query, (
                data['PatientID']
            ))

        return jsonify({'success': True, 'data': prescriptions}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/history", methods = ["POST"])
def write_history():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['HistoryID', 'PatientID', 'HealthCondition', 'DiagnosisDate', 'TreatmentReceived', 'Outcome', 'OngoingCare']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            INSERT INTO MedicalHistory (HistoryID, PatientID, HealthCondition, DiagnosisDate, TreatmentReceived, Outcome, OngoingCare)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        execute_update(query, (
                data['HistoryID'],
                data['PatientID'],
                data['HealthCondition'],
                data['DiagnosisDate'],
                data['TreatmentReceived'],
                data['Outcome'],
                data['OngoingCare']
            ))

        jsonify({'success': True}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/history", methods = ["POST"])
def update_history():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['HistoryID', 'Column', 'Value']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            update MedicalHistory set %s = %s where HistoryID = %s
        """

        execute_update(query, (
                data['Column'],
                data['Value'],
                data['HistoryID']
            ))

        jsonify({'success': True}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/history", methods = ["GET"])
def get_history_for_patient():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PatientID']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            select * from MedicalHistory where PatientID = %s
        """

        history = execute_query(query, (
                data['PatientID']
            ))

        return jsonify({'success': True, 'data': history}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/report", methods = ["POST"])
def write_report():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['ReportID', 'PhysicianID', 'PatientID', 'ReportDate', 'Weight', 'Height']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            INSERT INTO HealthReport (ReportID, PhysicianID, PatientID, ReportDate, Weight, Height)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        execute_update(query, (
                data['ReportID'],
                data['PhysicianID'],
                data['PatientID'],
                data['ReportDate'],
                data['Weight'],
                data['Height']
            ))

        jsonify({'success': True}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/clinic", methods = ["POST"])
def add_clinic():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['ClinicID', 'Name', 'Address']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            INSERT INTO Clinic (ClinicID, Name, Address)
            VALUES (%s, %s, %s)
        """

        execute_update(query, (
                data['ClinicID'],
                data['Name'],
                data['Address']
            ))

        jsonify({'success': True}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/clinic", methods = ["GET"])
def get_clinic():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['ClinicID']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            select * from Clinic where ClinicID = %s
        """

        clinics = execute_query(query, (
                data['ClinicID']
            ))

        return jsonify({'success': True, 'data': clinics}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/worksat", methods = ["POST"])
def add_worksat():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['ClinicID', 'PhysicianID', 'ScheduleID', 'DateJoined', 'HourlyRate']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            INSERT INTO WorksAT (ClinicID, PhysicianID, ScheduleID, DateJoined, HourlyRate)
            VALUES (%s, %s, %s)
        """

        execute_update(query, (
                data['ClinicID'],
                data['PhysicianID'],
                data['ScheduleID,'],
                data['DateJoined'],
                data['HourlyRate']
            ))

        jsonify({'success': True}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/report", methods = ["GET"])
def get_worksat_by_physician():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PhysicianID']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        query = """
            select * from WorksAt where PhysicianID = %s
        """

        works = execute_query(query, (
                data['PhysicianID']
            ))

        return jsonify({'success': True, 'data': works}), 200
    
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
