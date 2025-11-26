import React, { useState } from 'react';
import { Stepper, Button, Group, Select, TextInput, Title, Text, Box, Notification } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { DEPARTMENTS, PHYSICIANS, CLINICS, AVAILABLE_TIMES, PATIENT_TYPES } from '../../data/mockData';


function AppointmentBookingForm() {
  const [active, setActive] = useState(0);
  const [bookingStatus, setBookingStatus] = useState(null); // 'success' or 'error'

  const form = useForm({
    initialValues: {
      // Step 1
      patientId: null, 
      // Step 2
      department: '',
      physicianId: null,
      clinicId: null,
      // Step 3
      appointmentDate: null,
      appointmentTime: null,
    },
  });

  const validateCurrentStep = () => {
    const values = form.values;
    if (active === 0 && values.patientId === null) {
      form.setFieldError('patientId', 'Please select patient status');
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
      form.clearErrors(); // Clear previous errors
      if (!validateCurrentStep()) return; // Stop if the current step has errors
      setActive((current) => (current < 3 ? current + 1 : current));
      setBookingStatus(null);
  };
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = (values) => {
    const appointmentData = {
      patientId: values.patientId,
      physicianId: values.physicianId,
      clinicId: values.clinicId,
      appointmentDate: values.appointmentDate ? values.appointmentDate.toISOString().split('T')[0] : null,
      appointmentTime: values.appointmentTime,
    };

    if (appointmentData.appointmentTime === '10:15:00') {
        setBookingStatus('error');
        return;
    }

    setTimeout(() => {
        setBookingStatus('success');
        nextStep(); 
    }, 1500);
  };
  // -------------------------------------------------------------------------

  return (
    <Box maw={800} mx="auto" p="md">
      <Title order={1} mb="xl" ta="center">🏥 New Appointment Booking</Title>
      
      {/* The Mantine form component wrapping the Stepper */}
      <form onSubmit={form.onSubmit(handleSubmit)}> 
      
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>

          {/* --------------------------------- STEP 1: PATIENT IDENTIFICATION --------------------------------- */}
          <Stepper.Step label="Patient" description="Identify Yourself">
            <Title order={2} mt="lg" mb="md">Step 1: Patient Identification</Title>
            
            <Select
              label="Are you an existing or new patient?"
              placeholder="Select status"
              data={PATIENT_TYPES}
              {...form.getInputProps('patientId')}
              required
            />
            {form.values.patientId === '2' && (
              <Box mt="xl" p="md" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px' }}>
                <Title order={3} mb="md">New Patient Details (Will create a new record)</Title>
                <TextInput label="Full Name" placeholder="Jane Doe" required />
                <TextInput label="Email" placeholder="jane.doe@example.com" mt="md" required />
              </Box>
            )}
          </Stepper.Step>

          {/* --------------------------------- STEP 2: SERVICE & LOCATION SELECTION --------------------------------- */}
          <Stepper.Step label="Service" description="Choose Doctor and Location">
            <Title order={2} mt="lg" mb="md">Step 2: Service & Location</Title>

            <Select
              label="Select Department"
              placeholder="E.g., Cardiology, Orthopedics"
              data={DEPARTMENTS}
              {...form.getInputProps('department')}
              required
            />
            <Select
              label="Select Physician"
              placeholder="Dr. Amy Carter, Dr. Daniel Moore"
              data={PHYSICIANS
                .filter(p => p.department === form.values.department)
                .map(p => ({ value: p.id.toString(), label: p.name }))
              }
              {...form.getInputProps('physicianId')}
              mt="md"
              disabled={!form.values.department}
              required
            />
            <Select
              label="Select Clinic Location"
              placeholder="Downtown Health, Summit Clinic"
              data={CLINICS}
              {...form.getInputProps('clinicId')}
              mt="md"
              required
            />
          </Stepper.Step>

          {/* --------------------------------- STEP 3: DATE AND TIME SELECTION --------------------------------- */}
          <Stepper.Step label="Time" description="Pick Date and Time">
            <Title order={2} mt="lg" mb="md">Step 3: Date & Time</Title>
            
            
            <DateInput
              label="Appointment Date"
              placeholder="Pick a date"
              minDate={new Date()}
              {...form.getInputProps('appointmentDate')}
              required
            />
            
            <Select
              label="Appointment Time"
              placeholder="Select available time slot"
              data={AVAILABLE_TIMES} 
              {...form.getInputProps('appointmentTime')}
              mt="md"
              disabled={!form.values.appointmentDate || !form.values.physicianId || !form.values.clinicId}
              required
            />
          </Stepper.Step>

          {/* --------------------------------- STEP 4: REVIEW AND BOOK --------------------------------- */}
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
                <Text>Date: **{form.values.appointmentDate instanceof Date ? form.values.appointmentDate.toDateString() : 'N/A'}**</Text>
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

        {/* --------------------------------- NAVIGATION BUTTONS --------------------------------- */}
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
            <Button type="submit" loading={bookingStatus === 'loading'}>
              Confirm Booking
            </Button>
          )}
        </Group>
      </form>
    </Box>
  );
}

export default AppointmentBookingForm;