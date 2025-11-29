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

# Auto-setup database on startup
def setup_database():
    """Setup database and tables if they don't exist"""
    import pymysql
    from config import DATABASE_CONFIG
    import re
    
    try:
        # Connect without specifying database to create it
        conn = pymysql.connect(
            host=DATABASE_CONFIG['host'],
            user=DATABASE_CONFIG['user'],
            password=DATABASE_CONFIG['password']
        )
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DATABASE_CONFIG['database']}")
        cursor.execute(f"USE {DATABASE_CONFIG['database']}")
        
        # Read SQL file
        with open('COMMANDS.sql', 'r') as f:
            sql_content = f.read()
        
        # Split content into sections: before DELIMITER, between DELIMITERs, and after
        # Handle DELIMITER blocks specially
        current_delimiter = ';'
        statements = []
        current_statement = ""
        
        lines = sql_content.split('\n')
        in_delimiter_block = False
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith('--'):
                continue
                
            # Handle DELIMITER changes
            if line.startswith('DELIMITER'):
                if '$$' in line:
                    current_delimiter = '$$'
                    in_delimiter_block = True
                else:
                    current_delimiter = ';'
                    in_delimiter_block = False
                continue
            
            current_statement += line + ' '
            
            # Check if statement is complete
            if line.endswith(current_delimiter):
                # Remove the delimiter from the statement
                statement = current_statement.rstrip(current_delimiter + ' ').strip()
                if statement:
                    statements.append(statement)
                current_statement = ""
        
        # Execute all statements
        for statement in statements:
            if statement:
                try:
                    cursor.execute(statement)
                    conn.commit()
                except pymysql.err.ProgrammingError as e:
                    # Ignore certain expected errors
                    error_msg = str(e).lower()
                    if any(ignore in error_msg for ignore in ['already exists', 'duplicate']):
                        continue
                    else:
                        print(f"SQL Warning: {e}")
                except Exception as e:
                    print(f"SQL Error: {e}")
        
        cursor.close()
        conn.close()
        print("✅ Database setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("Please ensure MySQL is running and credentials are correct in config.py")

# Setup database on startup #SJ
#setup_database()

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
                c.ClinicID,
                c.Name as clinic,
                c.Address as cl_address,
                s.Monday, s.Tuesday, s.Wednesday, s.Thursday, s.Friday, s.Saturday, s.Sunday
            FROM physician p
            LEFT JOIN WorksAt w ON p.PhysicianID = w.PhysicianID
            LEFT JOIN Clinic c ON w.ClinicID = c.ClinicID
            LEFT JOIN Schedule s ON w.ScheduleID = s.ScheduleID
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
                c.Address AS clinic_address,
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
        
        for appointment in appointments:
            if 'AppointmentTime' in appointment and appointment['AppointmentTime'] is not None:
                if hasattr(appointment['AppointmentTime'], 'total_seconds'):
                    total_seconds = int(appointment['AppointmentTime'].total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    appointment['AppointmentTime'] = f"{hours:02d}:{minutes:02d}:00"

        return jsonify({
            'success': True,
            'data': appointments,
            'count': len(appointments)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@login_required
def delete_appointment(appointment_id):
    """Delete an appointment for the logged-in patient"""
    try:
        if current_user.user_type != 'patient':
            return jsonify({'success': False, 'error': 'Patient access required'}), 403

        # Verify the appointment belongs to the current user
        verify_query = """
            SELECT AppointmentID FROM Appointment 
            WHERE AppointmentID = %s AND PatientID = %s
        """
        existing_appointment = execute_query(verify_query, (appointment_id, current_user.reference_id))
        
        if not existing_appointment:
            return jsonify({'success': False, 'error': 'Appointment not found or unauthorized'}), 404
        
        # Delete the appointment
        delete_query = """
            DELETE FROM Appointment 
            WHERE AppointmentID = %s AND PatientID = %s
        """
        execute_update(delete_query, (appointment_id, current_user.reference_id))
        
        return jsonify({'success': True, 'message': 'Appointment cancelled successfully'}), 200
        
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


@app.route("/api/filter", methods=["GET"])
@login_required
def filter_data():
    try:
        table = request.args.get('table')
        column = request.args.get('column')
        value = request.args.get('value')
        
        # Validate required parameters
        if not table or not column or not value:
            return jsonify({'success': False, 'error': 'Missing required parameters: table, column, value'}), 400
        
        # Whitelist allowed tables and columns for security
        allowed_tables = {'Patient', 'Physician', 'Appointment', 'Clinic', 'HealthReport', 'Billing', 'Prescription', 'MedicalHistory'}
        if table not in allowed_tables:
            return jsonify({'success': False, 'error': 'Invalid table name'}), 400
        
        query = f"SELECT * FROM {table} WHERE {column} = %s"
        filtered = execute_query(query, (value,))
    
        return jsonify({'success': True, 'data': filtered}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/appointments", methods=["POST"])
@login_required
def make_appointment():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['PatientID', 'ClinicID', 'PhysicianID', 'AppointmentDate', 'AppointmentTime']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400

        call_procedure('sp_BookAppointment', (
                data['PatientID'],
                data['PhysicianID'],
                data['ClinicID'],
                data['AppointmentDate'],
                data['AppointmentTime']
            ))
        
        return jsonify({'success': True, 'message': 'Appointment booked successfully'}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/healthreports", methods=["GET"])
@login_required
def get_healthreports_for_patient():
    try:
        patient_id = request.args.get('patient_id')
        
        # Validate required parameter
        if not patient_id:
            return jsonify({'success': False, 'error': 'Missing required parameter: patient_id'}), 400
        
        query = """
            SELECT * FROM HealthReport WHERE PatientID = %s
        """

        health_reports = execute_query(query, (patient_id,))

        return jsonify({'success': True, 'data': health_reports}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/billing", methods=["POST"])
@login_required
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
            INSERT INTO Billing (BillingID, PatientID, AppointmentID, InsuranceID, TotalAmount, PaymentStatus, BillingDate, DueDate)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        execute_update(query, (
                data['BillingID'],
                data['PatientID'],
                data['AppointmentID'],
                data['InsuranceID'],
                data['TotalAmount'],
                data['PaymentStatus'],
                data['BillingDate'],
                data['DueDate']
            ))

        return jsonify({'success': True, 'message': 'Bill created successfully'}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/billing/pay", methods=["POST"])
@login_required
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
            UPDATE Billing SET PaymentStatus = 'Paid' WHERE BillingID = %s
        """

        execute_update(query, (data['BillingID'],))

        return jsonify({'success': True, 'message': 'Bill payment processed successfully'}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/billing", methods=["GET"])
@login_required
def get_bills_for_patient():
    try:
        patient_id = request.args.get('patient_id')
        
        # Validate required parameter
        if not patient_id:
            return jsonify({'success': False, 'error': 'Missing required parameter: patient_id'}), 400
        
        query = """
            SELECT * FROM Billing WHERE PatientID = %s
        """

        bills = execute_query(query, (patient_id,))

        return jsonify({'success': True, 'data': bills}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/prescription", methods=["POST"])
@login_required
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

        return jsonify({'success': True, 'message': 'Prescription created successfully'}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/prescription", methods=["GET"])
@login_required
def get_prescriptions_for_patient():
    try:
        patient_id = request.args.get('patient_id')
        
        # Validate required parameter
        if not patient_id:
            return jsonify({'success': False, 'error': 'Missing required parameter: patient_id'}), 400
        
        query = """
            SELECT p.*, hr.PatientID 
            FROM Prescription p 
            JOIN HealthReport hr ON p.ReportID = hr.ReportID 
            WHERE hr.PatientID = %s
        """

        prescriptions = execute_query(query, (patient_id,))

        return jsonify({'success': True, 'data': prescriptions}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/history", methods=["POST"])
@login_required
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

        return jsonify({'success': True, 'message': 'Medical history created successfully'}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/history", methods=["PUT"])
@login_required
def update_history():
    try:
        data = request.json
        
        # Validate that data is not None
        if not data:
            return jsonify({'success': False, 'error': 'Request body cannot be empty'}), 400
        
        # Validate required fields
        required_fields = ['HistoryID']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        # Build dynamic update query
        update_fields = []
        update_values = []
        
        allowed_fields = ['HealthCondition', 'DiagnosisDate', 'TreatmentReceived', 'Outcome', 'OngoingCare']
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                update_values.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'error': 'No valid fields to update'}), 400
        
        update_values.append(data['HistoryID'])
        
        query = f"""
            UPDATE MedicalHistory SET {', '.join(update_fields)} WHERE HistoryID = %s
        """

        execute_update(query, tuple(update_values))

        return jsonify({'success': True, 'message': 'Medical history updated successfully'}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/history", methods=["GET"])
@login_required
def get_history_for_patient():
    try:
        patient_id = request.args.get('patient_id')
        
        # Validate required parameter
        if not patient_id:
            return jsonify({'success': False, 'error': 'Missing required parameter: patient_id'}), 400
        
        query = """
            SELECT * FROM MedicalHistory WHERE PatientID = %s
        """

        history = execute_query(query, (patient_id,))

        return jsonify({'success': True, 'data': history}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/healthreports", methods=["POST"])
@login_required
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

        return jsonify({'success': True, 'message': 'Health report created successfully'}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/clinics", methods=["POST"])
@login_required
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

        return jsonify({'success': True, 'message': 'Clinic created successfully'}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/clinics", methods=["GET"])
@login_required
def get_clinic():
    try:
        clinic_id = request.args.get('clinic_id')
        
        if clinic_id:
            query = """
                SELECT * FROM Clinic WHERE ClinicID = %s
            """
            clinics = execute_query(query, (clinic_id,))
        else:
            query = """
                SELECT * FROM Clinic
            """
            clinics = execute_query(query)

        return jsonify({'success': True, 'data': clinics}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/worksat", methods=["POST"])
@login_required
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
            INSERT INTO WorksAt (ClinicID, PhysicianID, ScheduleID, DateJoined, HourlyRate)
            VALUES (%s, %s, %s, %s, %s)
        """

        execute_update(query, (
                data['ClinicID'],
                data['PhysicianID'],
                data['ScheduleID'],
                data['DateJoined'],
                data['HourlyRate']
            ))

        return jsonify({'success': True, 'message': 'WorksAt record created successfully'}), 201
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route("/api/worksat", methods=["GET"])
@login_required
def get_worksat_by_physician():
    try:
        physician_id = request.args.get('physician_id')
        
        # Validate required parameter
        if not physician_id:
            return jsonify({'success': False, 'error': 'Missing required parameter: physician_id'}), 400
        
        query = """
            SELECT * FROM WorksAt WHERE PhysicianID = %s
        """

        works = execute_query(query, (physician_id,))

        return jsonify({'success': True, 'data': works}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route("/api/booked-timeslots", methods=["GET"])
@login_required
def get_booked_timeslots():
    try:
        physician_id = request.args.get('physician_id')
        clinic_id = request.args.get('clinic_id')
        date = request.args.get('date')  # Optional: filter by specific date
        
        # Build query based on parameters
        if physician_id and clinic_id:
            if date:
                query = """
                    SELECT * FROM v_BookedTimeSlots 
                    WHERE PhysicianID = %s AND ClinicID = %s AND AppointmentDate = %s
                    ORDER BY AppointmentTime
                """
                params = (physician_id, clinic_id, date)
            else:
                query = """
                    SELECT * FROM v_BookedTimeSlots 
                    WHERE PhysicianID = %s AND ClinicID = %s
                    ORDER BY AppointmentDate, AppointmentTime
                """
                params = (physician_id, clinic_id)
        else:
            return jsonify({'success': False, 'error': 'Missing required parameters: physician_id and clinic_id'}), 400

        booked_slots_raw = execute_query(query, params)
        
        # Convert timedelta objects to strings for JSON serialization
        booked_slots = []
        for slot in booked_slots_raw:
            slot_copy = dict(slot)
            # Convert timedelta to string format (HH:MM:SS)
            if 'AppointmentTime' in slot_copy and slot_copy['AppointmentTime'] is not None:
                time_delta = slot_copy['AppointmentTime']
                total_seconds = int(time_delta.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                slot_copy['AppointmentTime'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            
            # Convert date to string format
            if 'AppointmentDate' in slot_copy and slot_copy['AppointmentDate'] is not None:
                slot_copy['AppointmentDate'] = slot_copy['AppointmentDate'].strftime('%Y-%m-%d')
                
            booked_slots.append(slot_copy)

        return jsonify({'success': True, 'data': booked_slots}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


# ==================== DATA FILTERING ENDPOINTS ====================
@app.route('/api/data/patients', methods=['GET'])
@login_required
def get_patients_data():
    """Get all patients for data filtering"""
    try:
        if current_user.user_type != 'physician':
            return jsonify({'success': False, 'error': 'Physician access required'}), 403
        
        query = """
            SELECT p.PatientID as id, p.Name as name, u.Email as email, p.DOB as dob, 
                   p.BloodType as bloodtype, p.PhoneNumber as phone, p.Address as address
            FROM Patient p
            LEFT JOIN User u ON u.ReferenceID = p.PatientID AND u.UserType = 'patient'
            ORDER BY p.Name
        """
        patients = execute_query(query)
        
        return jsonify({'success': True, 'data': patients}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/data/physicians', methods=['GET'])
@login_required 
def get_physicians_data():
    """Get all physicians for data filtering"""
    try:
        if current_user.user_type != 'physician':
            return jsonify({'success': False, 'error': 'Physician access required'}), 403
        
        query = """
            SELECT p.PhysicianID as id, p.Name as name, u.Email as email, 
                   p.PhoneNumber as phone, p.Department as department
            FROM Physician p
            LEFT JOIN User u ON u.ReferenceID = p.PhysicianID AND u.UserType = 'physician'
            ORDER BY p.Name
        """
        physicians = execute_query(query)
        
        return jsonify({'success': True, 'data': physicians}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/data/clinics', methods=['GET'])
@login_required
def get_clinics_data():
    """Get all clinics for data filtering"""
    try:
        if current_user.user_type != 'physician':
            return jsonify({'success': False, 'error': 'Physician access required'}), 403
        
        query = """
            SELECT ClinicID as id, Name as name, Address as address
            FROM Clinic
            ORDER BY Name
        """
        clinics = execute_query(query)
        
        return jsonify({'success': True, 'data': clinics}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/data/healthreports', methods=['GET'])
@login_required
def get_health_reports_data():
    """Get all health reports for data filtering"""
    try:
        if current_user.user_type != 'physician':
            return jsonify({'success': False, 'error': 'Physician access required'}), 403
        
        query = """
            SELECT hr.ReportID as id, hr.ReportDate as reportDate,
                   p.Name as physician, pt.Name as patient,
                   hr.PhysicianID as physicianId, hr.PatientID as patientId,
                   hr.Weight as weight, hr.Height as height
            FROM HealthReport hr
            JOIN Physician p ON p.PhysicianID = hr.PhysicianID
            JOIN Patient pt ON pt.PatientID = hr.PatientID
            ORDER BY hr.ReportDate DESC
        """
        reports = execute_query(query)
        
        return jsonify({'success': True, 'data': reports}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/data/workassignments', methods=['GET'])
@login_required
def get_work_assignments_data():
    """Get all work assignments for data filtering"""
    try:
        if current_user.user_type != 'physician':
            return jsonify({'success': False, 'error': 'Physician access required'}), 403
        
        query = """
            SELECT wa.ClinicID as clinicId, wa.PhysicianID as physicianId,
                   wa.ScheduleID as scheduleId, wa.DateJoined as dateJoined,
                   wa.HourlyRate as hourlyRate
            FROM WorksAt wa
            ORDER BY wa.DateJoined DESC
        """
        assignments = execute_query(query)
        
        # Format hourly rate as currency
        for assignment in assignments:
            if assignment['hourlyRate']:
                assignment['hourlyRate'] = f"${assignment['hourlyRate']}"
        
        return jsonify({'success': True, 'data': assignments}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


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
