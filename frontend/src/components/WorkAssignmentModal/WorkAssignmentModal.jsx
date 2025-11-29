import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Group, MultiSelect, NumberInput, TextInput, Text, Alert } from '@mantine/core';
import { IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import "./WorkAssignmentModal.css";

export default function WorkAssignmentModal({ opened, onClose, onSuccess }) {
  const [physicians, setPhysicians] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedPhysician, setSelectedPhysician] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existsError, setExistsError] = useState('');

  const dayOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    if (opened) {
      fetchPhysicians();
      fetchClinics();
    }
  }, [opened]);

  useEffect(() => {
    if (selectedPhysician && selectedClinic) {
      checkWorkAssignmentExists();
    } else {
      setExistsError('');
    }
  }, [selectedPhysician, selectedClinic]);

  const fetchPhysicians = async () => {
    try {
      const response = await fetch('/api/data/physicians', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        const physicianOptions = result.data.map(p => ({
          value: p.id.toString(),
          label: `${p.name} (${p.department})`
        }));
        setPhysicians(physicianOptions);
      }
    } catch (err) {
      console.error('Error fetching physicians:', err);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await fetch('/api/data/clinics', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        const clinicOptions = result.data.map(c => ({
          value: c.id.toString(),
          label: `${c.name} - ${c.address}`
        }));
        setClinics(clinicOptions);
      }
    } catch (err) {
      console.error('Error fetching clinics:', err);
    }
  };

  const checkWorkAssignmentExists = async () => {
    try {
      const response = await fetch(`/api/workassignment/check?physicianId=${selectedPhysician}&clinicId=${selectedClinic}`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.exists) {
        setExistsError('This physician is already assigned to this clinic.');
      } else {
        setExistsError('');
      }
    } catch (err) {
      console.error('Error checking work assignment:', err);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!selectedPhysician || !selectedClinic || selectedDays.length === 0 || !hourlyRate || !dateJoined) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (existsError) {
      setLoading(false);
      return;
    }

    try {
      const scheduleData = {
        days: selectedDays
      };

      const scheduleResponse = await fetch('/api/schedule/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(scheduleData)
      });

      const scheduleResult = await scheduleResponse.json();
      
      if (!scheduleResult.success) {
        setError(scheduleResult.error || 'Failed to create schedule');
        setLoading(false);
        return;
      }

      const workAssignmentData = {
        physicianId: selectedPhysician,
        clinicId: selectedClinic,
        scheduleId: scheduleResult.scheduleId,
        dateJoined: dateJoined,
        hourlyRate: parseInt(hourlyRate)
      };

      const workResponse = await fetch('/api/workassignment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(workAssignmentData)
      });

      const workResult = await workResponse.json();
      
      if (workResult.success) {
        onSuccess();
        handleClose();
      } else {
        setError(workResult.error || 'Failed to create work assignment');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPhysician(null);
    setSelectedClinic(null);
    setSelectedDays([]);
    setHourlyRate('');
    setDateJoined('');
    setError('');
    setExistsError('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Work Assignment"
      size="md"
      centered
    >
      <div className="work-assignment-form">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {existsError && (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb="md">
            {existsError}
          </Alert>
        )}

        <Select
          label="Physician"
          placeholder="Select a physician"
          data={physicians}
          value={selectedPhysician}
          onChange={setSelectedPhysician}
          searchable
          required
          mb="md"
        />

        <Select
          label="Clinic"
          placeholder="Select a clinic"
          data={clinics}
          value={selectedClinic}
          onChange={setSelectedClinic}
          searchable
          required
          mb="md"
        />

        <MultiSelect
          label="Working Days"
          placeholder="Select working days"
          data={dayOptions}
          value={selectedDays}
          onChange={setSelectedDays}
          required
          mb="md"
        />

        <NumberInput
          label="Hourly Rate ($)"
          placeholder="Enter hourly rate"
          value={hourlyRate}
          onChange={setHourlyRate}
          min={1}
          max={500}
          required
          mb="md"
        />

        <TextInput
          label="Date Joined"
          placeholder="YYYY-MM-DD"
          value={dateJoined}
          onChange={(e) => setDateJoined(e.currentTarget.value)}
          leftSection={<IconCalendar size={16} />}
          required
          mb="md"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            loading={loading}
            disabled={!!existsError}
          >
            Create Assignment
          </Button>
        </Group>
      </div>
    </Modal>
  );
}