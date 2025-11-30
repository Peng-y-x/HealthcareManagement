-- creates the project database

-- creates and uses the database
create database if not exists HealthSystem;
use HealthSystem;

-- 1 patient 
create table if not exists Patient(
PatientID int,
Name varchar(50),
DOB date,
BloodType varchar(4),
PhoneNumber varchar(20),
Address varchar(50),
primary key(PatientID)
);

-- 2 physician 
create table if not exists Physician(
PhysicianID int,
Name varchar(50),
PhoneNumber varchar(20),
Department varchar(20),
primary key(PhysicianID)
);

-- 2.5 user 
create table if not exists User(
UserID int auto_increment,
Email varchar(100) unique not null,
PasswordHash varchar(255) not null,
UserType enum('patient', 'physician', 'admin') not null,
ReferenceID int,
IsActive boolean default true,
CreatedAt timestamp default current_timestamp,
LastLogin timestamp null,
primary key(UserID)
);

-- 3 health report
create table if not exists HealthReport(
ReportID int,
PhysicianID int,
PatientID int,
ReportDate date,
Weight int,
Height int,
foreign key(PhysicianID) references Physician(PhysicianID),
foreign key(PatientID) references Patient(PatientID),
primary key(ReportID)
);

-- 4 clinic
create table if not exists Clinic(
ClinicID int,
Name varchar(50),
Address varchar(50),
primary key(ClinicID)
);

-- 5 schedule
create table if not exists Schedule(
ScheduleID int,
Monday boolean,
Tuesday boolean,
Wednesday boolean,
Thursday boolean,
Friday boolean,
Saturday boolean,
Sunday boolean,
primary key(ScheduleID)
);

-- 6 insurance
create table if not exists Insurance(
InsuranceID int,
CompanyName varchar(50),
CompanyLocation varchar(50),
primary key(InsuranceID)
);

-- 8 appointment
create table if not exists Appointment(
AppointmentID int,
ClinicID int,
PatientID int,
PhysicianID int,
AppointmentDate date,
AppointmentTime time,
foreign key(ClinicID) references Clinic(ClinicID),
foreign key(PatientID) references Patient(PatientID),
foreign key(PhysicianID) references Physician(PhysicianID),
primary key(AppointmentID)
);

-- 7 billing
create table if not exists Billing(
BillingID int,
PatientID int,
AppointmentID int,
InsuranceID int,
TotalAmount int,
PaymentStatus boolean,
BillingDate date,
DueDate date,
foreign key(PatientID) references Patient(PatientID),
foreign key(AppointmentID) references Appointment(AppointmentID),
foreign key(InsuranceID) references Insurance(InsuranceID),
primary key(BillingID)
);

-- 9 prescription
create table if not exists Prescription(
PrescriptionID int,
ReportID int,
PhysicianID int,
DrugName varchar(100),
Dosage varchar(50),
Frequency varchar(50),
StartDate date,
EndDate date,
Instructions varchar(200),
foreign key(ReportID) references HealthReport(ReportID),
foreign key(PhysicianID) references Physician(PhysicianID),
primary key(PrescriptionID)
);

-- 10 medical history
create table if not exists MedicalHistory(
HistoryID int,
PatientID int,
HealthCondition varchar(50),
DiagnosisDate date,
TreatmentReceived boolean,
Outcome varchar(200),
OngoingCare boolean,
foreign key(PatientID) references Patient(PatientID),
primary key(HistoryID)
);

--  11 works_at
create table if not exists WorksAt(
ClinicID int,
PhysicianID int,
ScheduleID int,
DateJoined date,
HourlyRate int,
foreign key(ClinicID) references Clinic(ClinicID),
foreign key(PhysicianID) references Physician(PhysicianID),
foreign key(ScheduleID) references Schedule(ScheduleID),
primary key(ClinicID, PhysicianID)
);

-- 1. Patient (Email removed)
INSERT INTO Patient (PatientID, Name, DOB, BloodType, PhoneNumber, Address)
VALUES
(1, 'Alice Johnson', '1990-03-12', 'A+', '5551010', '12 Maple St'),
(2, 'Bob Smith', '1985-06-25', 'O-', '5551020', '45 Oak Ave'),
(3, 'Carol Lee', '1992-01-10', 'B+', '5551030', '78 Pine Rd'),
(4, 'David Kim', '1978-12-05', 'AB+', '5551040', '90 Birch Ln'),
(5, 'Emma Wilson', '2000-07-15', 'A-', '5551050', '22 Cedar Ct'),
(6, 'Frank Brown', '1995-02-02', 'O+', '5551060', '33 Elm St'),
(7, 'Grace Liu', '1988-08-18', 'B-', '5551070', '66 Walnut Dr'),
(8, 'Henry Adams', '1993-11-30', 'A+', '5551080', '99 Spruce Blvd'),
(9, 'Ivy Chen', '1986-04-20', 'O-', '5551090', '12 Willow Way'),
(10, 'Jack Miller', '1999-09-09', 'AB-', '5551100', '77 Poplar St');

-- 2. Physician (Email removed)
INSERT INTO Physician (PhysicianID, Name, PhoneNumber, Department)
VALUES
(1, 'Dr. Amy Carter', '5552010', 'Cardiology'),
(2, 'Dr. Ben Young', '5552020', 'Neurology'),
(3, 'Dr. Chloe Davis', '5552030', 'Pediatrics'),
(4, 'Dr. Daniel Moore', '5552040', 'Orthopedics'),
(5, 'Dr. Ella Scott', '5552050', 'Dermatology'),
(6, 'Dr. Felix White', '5552060', 'General'),
(7, 'Dr. Gina Torres', '5552070', 'Radiology'),
(8, 'Dr. Henry Hall', '5552080', 'Oncology'),
(9, 'Dr. Irene King', '5552090', 'ENT'),
(10, 'Dr. James Lee', '5552100', 'Emergency');

-- 3. Clinic
INSERT INTO Clinic (ClinicID, Name, Address)
VALUES
(1, 'Downtown Health', '101 Main St'),
(2, 'Uptown Clinic', '202 High St'),
(3, 'Lakeside Center', '303 Lakeview Rd'),
(4, 'Eastside Care', '404 East Blvd'),
(5, 'Westend Wellness', '505 West Dr'),
(6, 'Greenwood Medical', '606 Green Ave'),
(7, 'Sunrise Health', '707 Morning Way'),
(8, 'Summit Clinic', '808 Hilltop Rd'),
(9, 'Valley Health', '909 Valley Blvd'),
(10, 'Metro Medical', '1000 City Center');

-- 4. Schedule
INSERT INTO Schedule (ScheduleID, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
VALUES
(1, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE),
(2, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, FALSE),
(3, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE),
(4, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE),
(5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE),
(6, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE),
(7, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE),
(8, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE),
(9, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE),
(10, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE);

-- 5. Insurance
INSERT INTO Insurance (InsuranceID, CompanyName, CompanyLocation)
VALUES
(1, 'BlueCare', 'New York'),
(2, 'MediPlus', 'Los Angeles'),
(3, 'SafeHealth', 'Chicago'),
(4, 'LifeSecure', 'Houston'),
(5, 'HealthOne', 'Miami'),
(6, 'PrimeCare', 'Seattle'),
(7, 'WellSure', 'Boston'),
(8, 'TotalHealth', 'Dallas'),
(9, 'CareFirst', 'Denver'),
(10, 'GuardianMed', 'Phoenix');

-- 6. HealthReport
INSERT INTO HealthReport (ReportID, PhysicianID, PatientID, ReportDate, Weight, Height)
VALUES
(1, 1, 1, '2025-10-01', 65, 170),
(2, 2, 2, '2025-10-02', 80, 180),
(3, 3, 3, '2025-10-03', 55, 160),
(4, 4, 4, '2025-10-04', 72, 175),
(5, 5, 5, '2025-10-05', 60, 165),
(6, 6, 6, '2025-10-06', 85, 182),
(7, 7, 7, '2025-10-07', 50, 158),
(8, 8, 8, '2025-10-08', 78, 173),
(9, 9, 9, '2025-10-09', 68, 171),
(10, 10, 10, '2025-10-10', 62, 168);

-- 7. Appointment
INSERT INTO Appointment (AppointmentID, ClinicID, PatientID, PhysicianID, AppointmentDate, AppointmentTime)
VALUES
(1, 1, 1, 1, '2025-10-01', '09:00:00'),
(2, 2, 2, 2, '2025-10-02', '10:30:00'),
(3, 3, 3, 3, '2025-10-03', '11:00:00'),
(4, 4, 4, 4, '2025-10-04', '14:00:00'),
(5, 5, 5, 5, '2025-10-05', '15:30:00'),
(6, 6, 6, 6, '2025-10-06', '16:00:00'),
(7, 7, 7, 7, '2025-10-07', '08:30:00'),
(8, 8, 8, 8, '2025-10-08', '13:00:00'),
(9, 9, 9, 9, '2025-10-09', '10:00:00'),
(10, 10, 10, 10, '2025-10-10', '11:30:00');

-- 8. Billing
INSERT INTO Billing (BillingID, PatientID, AppointmentID, InsuranceID, TotalAmount, PaymentStatus, BillingDate, DueDate)
VALUES
(1, 1, 1, 1, 150, TRUE, '2025-10-01', '2025-10-15'),
(2, 2, 2, 2, 200, FALSE, '2025-10-02', '2025-10-16'),
(3, 3, 3, 3, 100, TRUE, '2025-10-03', '2025-10-17'),
(4, 4, 4, 4, 300, FALSE, '2025-10-04', '2025-10-18'),
(5, 5, 5, 5, 250, TRUE, '2025-10-05', '2025-10-19'),
(6, 6, 6, 6, 180, TRUE, '2025-10-06', '2025-10-20'),
(7, 7, 7, 7, 120, FALSE, '2025-10-07', '2025-10-21'),
(8, 8, 8, 8, 220, TRUE, '2025-10-08', '2025-10-22'),
(9, 9, 9, 9, 160, TRUE, '2025-10-09', '2025-10-23'),
(10, 10, 10, 10, 190, FALSE, '2025-10-10', '2025-10-24');

-- 9. Prescription
INSERT INTO Prescription (PrescriptionID, ReportID, PhysicianID, DrugName, Dosage, Frequency, StartDate, EndDate, Instructions)
VALUES
(1, 1, 1, 'Aspirin', '500mg', '2/day', '2025-10-01', '2025-10-07', 'Take after meals'),
(2, 2, 2, 'Ibuprofen', '250mg', '3/day', '2025-10-02', '2025-10-08', 'Avoid alcohol'),
(3, 3, 3, 'Paracetamol', '10ml', '2/day', '2025-10-03', '2025-10-09', 'Shake well before use'),
(4, 4, 4, 'Acetaminophen', '100mg', '1/day', '2025-10-04', '2025-10-10', 'Take with water'),
(5, 5, 5, 'Amoxycillin', '200mg', '2/day', '2025-10-05', '2025-10-11', 'Do not crush'),
(6, 6, 6, 'Ciprofloxacin', '1 tab', '1/day', '2025-10-06', '2025-10-12', 'Before breakfast'),
(7, 7, 7, 'Pillsner', '5ml', '3/day', '2025-10-07', '2025-10-13', 'Store in cool place'),
(8, 8, 8, 'Tylenol Xtra', '300mg', '2/day', '2025-10-08', '2025-10-14', 'Avoid sunlight'),
(9, 9, 9, 'Simvastatin', '400mg', '1/day', '2025-10-09', '2025-10-15', 'Take on empty stomach'),
(10, 10, 10, 'Six Seven Pill', '250mg', '2/day', '2025-10-10', '2025-10-16', 'Do not skip doses');

-- 10. MedicalHistory
INSERT INTO MedicalHistory (HistoryID, PatientID, HealthCondition, DiagnosisDate, TreatmentReceived, Outcome, OngoingCare)
VALUES
(1, 1, 'Recovered', '2025-05-01', TRUE, 'No further issues', FALSE),
(2, 2, 'Ongoing', '2025-06-02', TRUE, 'Improving', TRUE),
(3, 3, 'Recovered', '2025-04-03', TRUE, 'Stable', FALSE),
(4, 4, 'Chronic', '2025-03-04', TRUE, 'Under observation', TRUE),
(5, 5, 'Recovered', '2025-02-05', TRUE, 'Fully healed', FALSE),
(6, 6, 'Ongoing', '2025-07-06', TRUE, 'Responding well', TRUE),
(7, 7, 'Recovered', '2025-01-07', TRUE, 'No relapse', FALSE),
(8, 8, 'Ongoing', '2025-08-08', TRUE, 'Stable condition', TRUE),
(9, 9, 'Chronic', '2025-09-09', TRUE, 'Requires care', TRUE),
(10, 10, 'Recovered', '2025-10-10', TRUE, 'Healthy', FALSE);

-- 11. WorksAt
INSERT INTO WorksAt (ClinicID, PhysicianID, ScheduleID, DateJoined, HourlyRate)
VALUES
(1, 1, 1, '2023-01-01', 80),
(2, 2, 2, '2023-02-01', 90),
(3, 3, 3, '2023-03-01', 85),
(4, 4, 4, '2023-04-01', 88),
(5, 5, 5, '2023-05-01', 95),
(6, 6, 6, '2023-06-01', 100),
(7, 7, 7, '2023-07-01', 75),
(8, 8, 8, '2023-08-01', 120),
(9, 9, 9, '2023-09-01', 110),
(10, 10, 10, '2023-10-01', 130);

-- 12. User (Patient accounts - password is 'password123' hashed with bcrypt)
INSERT INTO User (Email, PasswordHash, UserType, ReferenceID, IsActive)
VALUES
('alice.johnson@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 1, TRUE),
('bob.smith@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 2, TRUE),
('carol.lee@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 3, TRUE),
('david.kim@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 4, TRUE),
('emma.wilson@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 5, TRUE),
('frank.brown@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 6, TRUE),
('grace.liu@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 7, TRUE),
('henry.adams@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 8, TRUE),
('ivy.chen@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 9, TRUE),
('jack.miller@email.com', '$2b$12$2FJcXkGquPh/oQeZIl2McuDIQwVS6Casfh0FwyXDPND55NTyFoFU2', 'patient', 10, TRUE);

-- 13. User (Physician accounts - password is 'doctor123' hashed with bcrypt)
INSERT INTO User (Email, PasswordHash, UserType, ReferenceID, IsActive)
VALUES
('amy.carter@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 1, TRUE),
('ben.young@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 2, TRUE),
('chloe.davis@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 3, TRUE),
('daniel.moore@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 4, TRUE),
('ella.scott@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 5, TRUE),
('felix.white@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 6, TRUE),
('gina.torres@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 7, TRUE),
('henry.hall@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 8, TRUE),
('irene.king@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 9, TRUE),
('james.lee@healthsystem.com', '$2b$12$nvKGPwawm1YOOcJdkCV/dO2cdEoq/Ga7PFW172lzcDBhbTLppzf3W', 'physician', 10, TRUE);

-- 14. User (Admin accounts - password is 'admin123' hashed with bcrypt)
INSERT INTO User (Email, PasswordHash, UserType, ReferenceID, IsActive)
VALUES
('admin@healthsystem.com', '$2b$12$IfhcXTo.lKuIs2xo0yKD2O0NyfePTfWFmULhnB06/C2drJPTsRrOi', 'admin', NULL, TRUE),
('sysadmin@healthsystem.com', '$2b$12$IfhcXTo.lKuIs2xo0yKD2O0NyfePTfWFmULhnB06/C2drJPTsRrOi', 'admin', NULL, TRUE);


-- (1) Get patient's age based on DOB

DELIMITER $$

DROP FUNCTION IF EXISTS fn_GetPatientAge$$

CREATE FUNCTION fn_GetPatientAge (
    p_PatientID INT
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_DOB DATE;
    DECLARE v_Age INT;

    SELECT DOB
    INTO v_DOB
    FROM Patient
    WHERE PatientID = p_PatientID;

    SET v_Age = TIMESTAMPDIFF(YEAR, v_DOB, CURDATE());

    RETURN v_Age;
END $$

DELIMITER ;


-- (2) Book new appointment appointment, validate physician is working on that day

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_BookAppointment$$

CREATE PROCEDURE sp_BookAppointment (
    IN p_PatientID INT,
    IN p_PhysicianID INT,
    IN p_ClinicID INT,
    IN p_AppointmentDate DATE,
    IN p_AppointmentTime TIME
)
BEGIN
    DECLARE v_IsWorking BOOLEAN DEFAULT FALSE;
    DECLARE v_DayName VARCHAR(20);
    DECLARE v_ExistingApptCount INT DEFAULT 0;
    DECLARE v_ScheduleID INT;
    DECLARE v_NewAppointmentID INT;

    -- Discretize time to 30-minute intervals (0 or 30)
    IF MINUTE(p_AppointmentTime) NOT IN (0, 30) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Invalid time. Appointments must be on 30-minute intervals (e.g., 11:00 or 11:30).';
    END IF;

    -- Get the physician's schedule for the specific clinic
    SELECT
        ScheduleID INTO v_ScheduleID
    FROM
        WorksAt
    WHERE
        PhysicianID = p_PhysicianID
        AND ClinicID = p_ClinicID;

    IF v_ScheduleID IS NULL THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'Cannot book. Physician has no associated work schedule for this clinic.';
    END IF;

    -- Check if the physician is working on that day
    SET v_DayName = DAYNAME(p_AppointmentDate);

    SELECT
        CASE v_DayName
            WHEN 'Monday' THEN Monday
            WHEN 'Tuesday' THEN Tuesday
            WHEN 'Wednesday' THEN Wednesday
            WHEN 'Thursday' THEN Thursday
            WHEN 'Friday' THEN Friday
            WHEN 'Saturday' THEN Saturday
            WHEN 'Sunday' THEN Sunday
            ELSE FALSE
        END
    INTO v_IsWorking
    FROM Schedule
    WHERE ScheduleID = v_ScheduleID;

    IF v_IsWorking = FALSE OR v_IsWorking IS NULL THEN
        SIGNAL SQLSTATE '45003'
        SET MESSAGE_TEXT = 'Cannot book. The physician is not scheduled to work on this day.';
    END IF;

    -- Check if the timeslot is already filled for that physician
    SELECT COUNT(*)
    INTO v_ExistingApptCount
    FROM Appointment
    WHERE PhysicianID = p_PhysicianID
      AND AppointmentDate = p_AppointmentDate
      AND AppointmentTime = p_AppointmentTime;

    IF v_ExistingApptCount > 0 THEN
        SIGNAL SQLSTATE '45004'
        SET MESSAGE_TEXT = 'Cannot book. This time slot is already filled for this physician.';
    END IF;

    -- Check for required IDs
    IF p_PatientID IS NULL OR p_PhysicianID IS NULL OR p_ClinicID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PatientID, PhysicianID, and ClinicID are required.';
    ELSE
        SET v_NewAppointmentID = (SELECT IFNULL(MAX(AppointmentID), 0) + 1 FROM Appointment);

        -- All checks passed, insert the appointment
        INSERT INTO Appointment (
            AppointmentID,
            PatientID,
            PhysicianID,
            ClinicID,
            AppointmentDate,
            AppointmentTime
        )
        VALUES (
            v_NewAppointmentID,
            p_PatientID,
            p_PhysicianID,
            p_ClinicID,
            p_AppointmentDate,
            p_AppointmentTime
        );
    END IF;
END $$

DELIMITER ;

-- (3) All scheduled timeslots belonging to physician and clinic

DROP VIEW IF EXISTS v_BookedTimeSlots;

CREATE VIEW v_BookedTimeSlots AS
SELECT
    a.AppointmentID,
    a.AppointmentDate,
    a.AppointmentTime,
    p.PhysicianID,
    p.Name AS PhysicianName,
    c.ClinicID,
    c.Name AS ClinicName,
    pat.PatientID,
    pat.Name AS PatientName
FROM
    Appointment a
JOIN
    Physician p ON a.PhysicianID = p.PhysicianID
JOIN
    Clinic c ON a.ClinicID = c.ClinicID
JOIN
    Patient pat ON a.PatientID = pat.PatientID
ORDER BY
    a.AppointmentDate, a.AppointmentTime;
