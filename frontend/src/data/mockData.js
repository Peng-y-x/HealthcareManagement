export const DEPARTMENTS = [
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Internal Medicine', label: 'Internal Medicine' },
  { value: 'General Practice', label: 'General Practice' }
];

export const PHYSICIANS = [
  { id: 1, name: 'Dr. Emily Rodriguez', department: 'Cardiology', email: 'emily.r@hospital.com', phone: '555-1001' },
  { id: 2, name: 'Dr. Michael Chen', department: 'Internal Medicine', email: 'michael.c@hospital.com', phone: '555-1002' },
  { id: 3, name: 'Dr. Lisa Thompson', department: 'General Practice', email: 'lisa.t@hospital.com', phone: '555-1003' },
  { id: 4, name: 'Dr. David Kim', department: 'Neurology', email: 'david.k@hospital.com', phone: '555-1004' },
  { id: 5, name: 'Dr. Amy Carter', department: 'Cardiology', email: 'amy.c@hospital.com', phone: '555-1005' },
  { id: 6, name: 'Dr. Ben Young', department: 'Neurology', email: 'ben.y@hospital.com', phone: '555-1006' },
  { id: 7, name: 'Dr. Chloe Davis', department: 'Pediatrics', email: 'chloe.d@hospital.com', phone: '555-1007' },
  { id: 8, name: 'Dr. Daniel Moore', department: 'Orthopedics', email: 'daniel.m@hospital.com', phone: '555-1008' }
];

export const CLINICS = [
  { value: '1', label: 'Downtown Health Center', id: 1, name: 'Downtown Health Center', address: '123 Medical Plaza, Downtown' },
  { value: '2', label: 'Uptown Family Clinic', id: 2, name: 'Uptown Family Clinic', address: '456 Health Street, Uptown' },
  { value: '3', label: 'Lakeside Medical Center', id: 3, name: 'Lakeside Medical Center', address: '789 Lake View Drive, Lakeside' },
  { value: '4', label: 'Suburban Care Facility', id: 4, name: 'Suburban Care Facility', address: '321 Suburb Lane, Suburbs' }
];

export const PATIENTS = [
  { id: 1, name: 'Tom Adams', email: 'TA100@email.com', dob: '8/2/1952', bloodtype: 'AB', phone: '12332323', address: '1 Main Street' },
  { id: 2, name: 'Tom Andrews', email: 'TA502@email.com', dob: '5/8/1972', bloodtype: 'O+', phone: '46545645', address: '500 Oak Street' },
  { id: 3, name: 'Sarah Johnson', email: 'sarah.j@email.com', dob: '3/15/1985', bloodtype: 'A+', phone: '55512345', address: '123 Pine Ave' },
  { id: 4, name: 'Mike Wilson', email: 'mike.w@email.com', dob: '12/20/1978', bloodtype: 'B-', phone: '77798765', address: '456 Elm St' },
  { id: 5, name: 'Alice Johnson', email: 'alice.j@email.com', dob: '6/14/1990', bloodtype: 'O-', phone: '33344455', address: '789 Oak Drive' }
];

export const HEALTH_REPORTS = [
  {
    id: 1,
    date: "2024-11-05T11:00:00",
    refId: "RHR-002156",
    doctor: "Dr. Emily Rodriguez",
    specialty: "Cardiology",
    patient: "Tom Adams",
    height: "176 cm",
    weight: "68 kg",
    bmi: "21.9",
    reportDate: "11/5/2024",
    physicianId: 1,
    patientId: 1
  },
  {
    id: 2,
    date: "2024-12-10T15:00:00",
    refId: "RHR-001234",
    doctor: "Dr. Michael Chen",
    specialty: "Internal Medicine",
    patient: "Sarah Johnson",
    height: "165 cm",
    weight: "62 kg",
    bmi: "22.8",
    reportDate: "10/15/2024",
    physicianId: 2,
    patientId: 3
  },
  {
    id: 3,
    date: "2024-08-20T09:00:00",
    refId: "RHR-002921",
    doctor: "Dr. Lisa Thompson",
    specialty: "General Practice",
    patient: "Mike Wilson",
    height: "182 cm",
    weight: "80 kg",
    bmi: "24.2",
    reportDate: "12/1/2024",
    physicianId: 3,
    patientId: 4
  }
];

export const WORK_ASSIGNMENTS = [
  { clinicId: 1, physicianId: 1, scheduleId: 101, dateJoined: '2023-01-15', hourlyRate: '$150' },
  { clinicId: 2, physicianId: 2, scheduleId: 102, dateJoined: '2023-03-20', hourlyRate: '$140' },
  { clinicId: 1, physicianId: 3, scheduleId: 103, dateJoined: '2023-06-10', hourlyRate: '$135' },
  { clinicId: 3, physicianId: 4, scheduleId: 104, dateJoined: '2023-09-05', hourlyRate: '$160' },
  { clinicId: 2, physicianId: 5, scheduleId: 105, dateJoined: '2023-11-12', hourlyRate: '$145' }
];

export const AVAILABLE_TIMES = [
  '09:00:00', '09:30:00', '10:00:00', '10:30:00', 
  '11:00:00', '11:30:00', '13:00:00', '13:30:00',
  '14:00:00', '14:30:00', '15:00:00', '15:30:00'
];

export const PATIENT_TYPES = [
  { value: '1', label: 'Existing Patient (Alice Johnson - ID 1)' },
  { value: '2', label: 'New Patient Registration' }
];