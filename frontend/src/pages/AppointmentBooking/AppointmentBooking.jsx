import React, { useState, useEffect } from 'react';
import { Stepper, Button, Group, Select, TextInput, Title, Text, Box, Notification, Loader } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';


function AppointmentBookingForm() {
  const [active, setActive] = useState(0);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [physicians, setPhysicians] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [worksAt, setWorksAt] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableTimes] = useState([
    { value: '09:00:00', label: '9:00 AM' },
    { value: '09:30:00', label: '9:30 AM' },
    { value: '10:00:00', label: '10:00 AM' },
    { value: '10:30:00', label: '10:30 AM' },
    { value: '11:00:00', label: '11:00 AM' },
    { value: '11:30:00', label: '11:30 AM' },
    { value: '13:00:00', label: '1:00 PM' },
    { value: '13:30:00', label: '1:30 PM' },
    { value: '14:00:00', label: '2:00 PM' },
    { value: '14:30:00', label: '2:30 PM' },
    { value: '15:00:00', label: '3:00 PM' },
    { value: '15:30:00', label: '3:30 PM' }
  ]);
  
  const { user } = useAuth();

  const isPhysicianWorkingOnDate = (date, physicianId, clinicId) => {
    if (!date || !physicianId || !clinicId) return true;
    
    const dateObj = date instanceof Date ? date : new Date(date + 'T00:00:00Z');
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(dateObj);
    const worksAtRecord = worksAt.find(w => 
      w.PhysicianID.toString() === physicianId && 
      w.ClinicID.toString() === clinicId
    );
    
    if (!worksAtRecord || !worksAtRecord.schedule) {
      return false;
    }
    
    const schedule = worksAtRecord.schedule;
    const isWorking = schedule[dayName] === true || schedule[dayName] === 1;
    return isWorking;
  };

  const isDateFullyBooked = (date, physicianId, clinicId) => {
    if (!date || !physicianId || !clinicId || bookedSlots.length === 0) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date + 'T00:00:00Z');
    const dateStr = dateObj.toISOString().split('T')[0];
    const bookedForDate = bookedSlots.filter(slot => 
      slot.PhysicianID.toString() === physicianId &&
      slot.ClinicID.toString() === clinicId &&
      slot.AppointmentDate === dateStr
    );
    
    return bookedForDate.length >= availableTimes.length;
  };

  const isTimeSlotBooked = (time, date, physicianId, clinicId) => {
    if (!date || !physicianId || !clinicId || bookedSlots.length === 0) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date + 'T00:00:00Z');
    const dateStr = dateObj.toISOString().split('T')[0];
    
    const isBooked = bookedSlots.some(slot =>
      slot.PhysicianID.toString() === physicianId &&
      slot.ClinicID.toString() === clinicId &&
      slot.AppointmentDate === dateStr &&
      slot.AppointmentTime === time
    );
    
    return isBooked;
  };

  const fetchPhysicians = async () => {
    try {
      const response = await fetch('/api/physicians?page=1&page_size=1000', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        const physicianData = data.data || [];
        setPhysicians(physicianData);
        
        const uniqueDepts = [...new Set(physicianData
          .map(p => p.Department?.trim())
          .filter(Boolean)
        )].sort();
        setDepartments(uniqueDepts.map(dept => ({ value: dept, label: dept })));
        
        const worksAtMapping = physicianData.map(p => ({
          PhysicianID: p.PhysicianID,
          ClinicID: p.ClinicID,
          ClinicName: p.clinic,
          schedule: {
            Monday: p.Monday,
            Tuesday: p.Tuesday,
            Wednesday: p.Wednesday,
            Thursday: p.Thursday,
            Friday: p.Friday,
            Saturday: p.Saturday,
            Sunday: p.Sunday
          }
        })).filter(w => w.ClinicID);
        
        setWorksAt(worksAtMapping);
      }
    } catch (error) {
      console.error('Failed to fetch physicians:', error);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await fetch('/api/clinics', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setClinics(data.data.map(clinic => ({
          value: clinic.ClinicID.toString(),
          label: clinic.Name
        })));
      }
    } catch (error) {
      console.error('Failed to fetch clinics:', error);
    }
  };

  const fetchBookedSlots = async (physicianId, clinicId) => {
    if (!physicianId || !clinicId) {
      setBookedSlots([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/booked-timeslots?physician_id=${physicianId}&clinic_id=${clinicId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Booked slots API error:', response.status, response.statusText);
        setBookedSlots([]);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setBookedSlots(data.data || []);
      } else {
        console.error('Booked slots API failed:', data.error);
        setBookedSlots([]);
      }
    } catch (error) {
      console.error('Failed to fetch booked slots:', error);
      setBookedSlots([]);
    }
  };

  const form = useForm({
    initialValues: {
      // Step 1
      patientId: user?.reference_id || null, 
      // Step 2
      department: '',
      physicianId: null,
      clinicId: null,
      // Step 3
      appointmentDate: null,
      appointmentTime: null,
    },
  });

  useEffect(() => {
    fetchPhysicians();
    fetchClinics();
  }, []);

  useEffect(() => {
    if (form.values.physicianId && form.values.clinicId) {
      fetchBookedSlots(form.values.physicianId, form.values.clinicId);
    }
  }, [form.values.physicianId, form.values.clinicId]);

  const validateCurrentStep = () => {
    const values = form.values;
    if (active === 0 && !user) {
      return false;
    }
    if (active === 1 && (!values.physicianId || !values.clinicId)) {
      if (!values.physicianId) form.setFieldError('physicianId', 'Required');
      if (!values.clinicId) form.setFieldError('clinicId', 'Required');
      return false;
    }
    if (active === 2 && (!values.appointmentDate || !values.appointmentTime)) {
      if (!values.appointmentDate) form.setFieldError('appointmentDate', 'Required');
      if (!values.appointmentTime) form.setFieldError('appointmentTime', 'Required');
      return false;
    }
    return true;
  };

  const nextStep = () => {
      form.clearErrors();
      if (!validateCurrentStep()) return;
      setActive((current) => (current < 3 ? current + 1 : current));
      setBookingStatus(null);
  };
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async (values) => {
    setLoading(true);
    setBookingStatus(null);

    let formattedDate = null;
    if (values.appointmentDate) {
      if (values.appointmentDate instanceof Date) {
        formattedDate = values.appointmentDate.toISOString().split('T')[0];
      } else if (typeof values.appointmentDate === 'string') {
        formattedDate = values.appointmentDate;
      } else {
        const dateObj = new Date(values.appointmentDate);
        formattedDate = dateObj.toISOString().split('T')[0];
      }
    }

    const appointmentData = {
      PatientID: values.patientId,
      PhysicianID: parseInt(values.physicianId),
      ClinicID: parseInt(values.clinicId),
      AppointmentDate: formattedDate,
      AppointmentTime: values.appointmentTime,
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookingStatus('success');
        setActive(4);
      } else {
        setBookingStatus('error');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setBookingStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maw={800} mx="auto" p="md">
      <Title order={1} mb="xl" ta="center">🏥 New Appointment Booking</Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}> 
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
          <Stepper.Step label="Patient" description="Logged In Patient">
            <Title order={2} mt="lg" mb="md">Step 1: Patient Identification</Title>
            
            {user ? (
              <Box p="md" style={{ border: '1px solid var(--mantine-color-blue-3)', borderRadius: '4px', backgroundColor: 'var(--mantine-color-blue-0)' }}>
                <Text weight={500}>Booking appointment for:</Text>
                <Text size="lg" weight={600} mt="xs">{user.name}</Text>
                <Text size="sm" color="dimmed">Patient ID: {user.reference_id}</Text>
              </Box>
            ) : (
              <Box p="md" style={{ border: '1px solid var(--mantine-color-red-3)', borderRadius: '4px', backgroundColor: 'var(--mantine-color-red-0)' }}>
                <Text color="red">Please log in to book an appointment.</Text>
              </Box>
            )}
          </Stepper.Step>

          <Stepper.Step label="Service" description="Choose Doctor and Location">
            <Title order={2} mt="lg" mb="md">Step 2: Service & Location</Title>

            {departments.length === 0 ? (
              <Loader size="sm" />
            ) : (
              <>
                <Select
                  label="Select Department"
                  placeholder="E.g., Cardiology, Orthopedics"
                  data={departments}
                  {...form.getInputProps('department')}
                  required
                />
                <Select
                  label="Select Physician"
                  placeholder="Choose a physician"
                  data={physicians
                    .filter(p => p.Department === form.values.department)
                    .reduce((unique, p) => {
                      if (!unique.some(item => item.PhysicianID === p.PhysicianID)) {
                        unique.push(p);
                      }
                      return unique;
                    }, [])
                    .map(p => ({ value: p.PhysicianID.toString(), label: p.Name }))
                  }
                  {...form.getInputProps('physicianId')}
                  mt="md"
                  disabled={!form.values.department}
                  required
                />
                <Select
                  label="Select Clinic Location"
                  placeholder="Choose a clinic"
                  data={clinics.filter(clinic => {
                    if (!form.values.physicianId) return true;
                    
                    const worksAtRecord = worksAt.find(w => 
                      w.PhysicianID.toString() === form.values.physicianId && 
                      w.ClinicID.toString() === clinic.value
                    );
                    
                    return worksAtRecord && 
                           worksAtRecord.schedule && 
                           Object.values(worksAtRecord.schedule).some(day => day === true || day === 1);
                  })}
                  value={form.values.clinicId}
                  onChange={(value) => form.setFieldValue('clinicId', value)}
                  mt="md"
                  disabled={!form.values.physicianId}
                  required
                />
              </>
            )}
          </Stepper.Step>

          <Stepper.Step label="Time" description="Pick Date and Time">
            <Title order={2} mt="lg" mb="md">Step 3: Date & Time</Title>
            
            
            <DateInput
              label="Appointment Date"
              placeholder="Pick a date"
              minDate={new Date()}
              value={form.values.appointmentDate}
              onChange={(value) => form.setFieldValue('appointmentDate', value)}
              excludeDate={(date) => {
                const physicianNotWorking = !isPhysicianWorkingOnDate(date, form.values.physicianId, form.values.clinicId);
                const fullyBooked = isDateFullyBooked(date, form.values.physicianId, form.values.clinicId);
                return physicianNotWorking || fullyBooked;
              }}
              error={form.errors.appointmentDate}
              disabled={!form.values.physicianId || !form.values.clinicId}
              required
            />
            
            <Select
              label="Appointment Time"
              placeholder="Select available time slot"
              data={availableTimes.map(time => ({
                ...time,
                disabled: isTimeSlotBooked(time.value, form.values.appointmentDate, form.values.physicianId, form.values.clinicId)
              }))} 
              value={form.values.appointmentTime}
              onChange={(value) => form.setFieldValue('appointmentTime', value)}
              mt="md"
              disabled={!form.values.appointmentDate || !form.values.physicianId || !form.values.clinicId}
              required
            />
          </Stepper.Step>

          <Stepper.Step label="Confirm" description="Review and Submit">
            <Title order={2} mt="lg" mb="md">Step 4: Review and Confirm</Title>
            
            {bookingStatus === 'error' && (
                <Notification 
                    icon={<IconAlertCircle size={18} />} 
                    color="red" 
                    title="Booking Failed" 
                    mt="md"
                    mb="md"
                >
                    Cannot book. The time slot is already filled or the physician is not available.
                </Notification>
            )}

            <Box p="md" bg="gray.1">
                <Title order={3}>Appointment Summary</Title>
                <Text>Patient ID: **{form.values.patientId}**</Text>
                <Text>Physician ID: **{form.values.physicianId}**</Text>
                <Text>Clinic ID: **{form.values.clinicId}**</Text>
                <Text>Date: **{form.values.appointmentDate ? 
                  (form.values.appointmentDate instanceof Date ? 
                    form.values.appointmentDate.toDateString() : 
                    String(form.values.appointmentDate)) : 'N/A'}**</Text>
                <Text>Time: **{form.values.appointmentTime}**</Text>
            </Box>
            
          </Stepper.Step>

          <Stepper.Completed>
            <Notification icon={<IconCheck size={18} />} color="teal" title="Booking Successful" mt="md">
                Your appointment has been successfully scheduled!
            </Notification>
            <Group mt="xl">
                <Button onClick={() => { setActive(0); form.reset(); setBookingStatus(null); }}>Book Another Appointment</Button>
            </Group>
          </Stepper.Completed>
          
        </Stepper>

        <Group justify="flex-end" mt="xl">
          {active !== 0 && active !== 4 && (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          )}
          {active < 3 && (
            <Button onClick={nextStep}>
              Next Step
            </Button>
          )}
          {active === 3 && (
            <Button type="submit" loading={loading}>
              Confirm Booking
            </Button>
          )}
        </Group>
      </form>
    </Box>
  );
}

export default AppointmentBookingForm;