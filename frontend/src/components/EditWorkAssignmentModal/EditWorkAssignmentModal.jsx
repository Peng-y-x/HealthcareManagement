import React, { useState, useEffect } from 'react';
import { Modal, Button, Group, MultiSelect, NumberInput, TextInput, Text, Alert } from '@mantine/core';
import { IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import "./EditWorkAssignmentModal.css";

export default function EditWorkAssignmentModal({ opened, onClose, onSuccess, workAssignment }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (opened && workAssignment) {
      // Parse working days from string
      if (workAssignment.workingDays) {
        const days = workAssignment.workingDays.split(', ').map(day => {
          // Convert abbreviated day names to full names
          const dayMap = {
            'Mon': 'Monday',
            'Tue': 'Tuesday', 
            'Wed': 'Wednesday',
            'Thu': 'Thursday',
            'Fri': 'Friday',
            'Sat': 'Saturday',
            'Sun': 'Sunday'
          };
          return dayMap[day] || day;
        });
        setSelectedDays(days);
      }
      
      // Set hourly rate (remove $ sign if present)
      if (workAssignment.hourlyRate) {
        const rate = workAssignment.hourlyRate.replace('$', '');
        setHourlyRate(rate);
      }
      
      // Convert date format back to YYYY-MM-DD
      if (workAssignment.dateJoined) {
        // Parse "Fri, 10 Oct 2025" format to "2025-10-10"
        const date = new Date(workAssignment.dateJoined);
        if (!isNaN(date)) {
          setDateJoined(date.toISOString().split('T')[0]);
        }
      }
    }
  }, [opened, workAssignment]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (selectedDays.length === 0 || !hourlyRate || !dateJoined) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        days: selectedDays,
        dateJoined: dateJoined,
        hourlyRate: parseInt(hourlyRate)
      };

      const response = await fetch(`/api/workassignment/update?physicianId=${workAssignment.physicianId}&clinicId=${workAssignment.clinicId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        setError(result.error || 'Failed to update work assignment');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDays([]);
    setHourlyRate('');
    setDateJoined('');
    setError('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Edit Work Assignment - Physician ${workAssignment?.physicianId} at Clinic ${workAssignment?.clinicId}`}
      size="md"
      centered
    >
      <div className="edit-work-assignment-form">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

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
          <Button onClick={handleSubmit} loading={loading}>
            Update Assignment
          </Button>
        </Group>
      </div>
    </Modal>
  );
}