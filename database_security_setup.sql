FLUSH PRIVILEGES;

--  CREATE DATABASE USERS

-- Drop existing users if they exist (for clean setup)
DROP USER IF EXISTS 'app_patient'@'localhost';
DROP USER IF EXISTS 'app_physician'@'localhost';
DROP USER IF EXISTS 'app_admin'@'localhost';

-- Create Patient Application User
CREATE USER 'app_patient'@'localhost'
IDENTIFIED BY 'P@t1ent$ecur3P@ss2024!'
PASSWORD EXPIRE NEVER;

-- Create Physician Application User
CREATE USER 'app_physician'@'localhost'
IDENTIFIED BY 'Phy$1c1@nS3cur3P@ss2024!'
PASSWORD EXPIRE NEVER;

-- Create Admin Application User
CREATE USER 'app_admin'@'localhost'
IDENTIFIED BY 'Adm1n$ecur3P@ss2024!'
PASSWORD EXPIRE NEVER;



-- SECTION 3: GRANT PRIVILEGES - PATIENT APPLICATION USER

-- Allow connection to HealthSystem database
GRANT USAGE ON HealthSystem.* TO 'app_patient'@'localhost';

-- READ privileges for viewing own data
GRANT SELECT ON HealthSystem.Patient TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.Appointment TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.HealthReport TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.Prescription TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.MedicalHistory TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.Billing TO 'app_patient'@'localhost';

-- READ privileges for reference data (needed for booking appointments)
GRANT SELECT ON HealthSystem.Physician TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.Clinic TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.Schedule TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.WorksAt TO 'app_patient'@'localhost';
GRANT SELECT ON HealthSystem.Insurance TO 'app_patient'@'localhost';

-- READ privileges for views
GRANT SELECT ON HealthSystem.v_BookedTimeSlots TO 'app_patient'@'localhost';

-- WRITE privileges for appointment booking
GRANT INSERT ON HealthSystem.Appointment TO 'app_patient'@'localhost';

-- DELETE privileges for appointment cancellation (own appointments only - enforced by app)
GRANT DELETE ON HealthSystem.Appointment TO 'app_patient'@'localhost';

-- EXECUTE privileges for stored procedures and functions
GRANT EXECUTE ON PROCEDURE HealthSystem.sp_BookAppointment TO 'app_patient'@'localhost';
GRANT EXECUTE ON FUNCTION HealthSystem.fn_GetPatientAge TO 'app_patient'@'localhost';

-- SECTION 4: GRANT PRIVILEGES - PHYSICIAN APPLICATION USER

-- Allow connection to HealthSystem database
GRANT USAGE ON HealthSystem.* TO 'app_physician'@'localhost';

-- READ privileges for all relevant tables
GRANT SELECT ON HealthSystem.Patient TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.Physician TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.Appointment TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.HealthReport TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.Prescription TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.MedicalHistory TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.Clinic TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.Schedule TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.WorksAt TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.Billing TO 'app_physician'@'localhost';
GRANT SELECT ON HealthSystem.Insurance TO 'app_physician'@'localhost';

-- READ privileges for views
GRANT SELECT ON HealthSystem.v_BookedTimeSlots TO 'app_physician'@'localhost';

-- WRITE privileges for medical records management
GRANT INSERT, UPDATE ON HealthSystem.HealthReport TO 'app_physician'@'localhost';
GRANT INSERT, UPDATE ON HealthSystem.Prescription TO 'app_physician'@'localhost';
GRANT INSERT, UPDATE ON HealthSystem.MedicalHistory TO 'app_physician'@'localhost';

-- DELETE privileges for appointment management
GRANT DELETE ON HealthSystem.Appointment TO 'app_physician'@'localhost';

-- EXECUTE privileges for stored procedures and functions
GRANT EXECUTE ON PROCEDURE HealthSystem.sp_BookAppointment TO 'app_physician'@'localhost';
GRANT EXECUTE ON FUNCTION HealthSystem.fn_GetPatientAge TO 'app_physician'@'localhost';

-- GRANT PRIVILEGES - ADMIN APPLICATION USER

-- Allow connection to HealthSystem database
GRANT USAGE ON HealthSystem.* TO 'app_admin'@'localhost';

-- FULL CRUD privileges on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.Patient TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.Physician TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.Appointment TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.HealthReport TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.Prescription TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.MedicalHistory TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.Clinic TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.Schedule TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.WorksAt TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.Billing TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.Insurance TO 'app_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON HealthSystem.User TO 'app_admin'@'localhost';

-- READ privileges for views
GRANT SELECT ON HealthSystem.v_BookedTimeSlots TO 'app_admin'@'localhost';

-- EXECUTE privileges for all stored procedures and functions
GRANT EXECUTE ON PROCEDURE HealthSystem.sp_BookAppointment TO 'app_admin'@'localhost';
GRANT EXECUTE ON FUNCTION HealthSystem.fn_GetPatientAge TO 'app_admin'@'localhost';

FLUSH PRIVILEGES;
