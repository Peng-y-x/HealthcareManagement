import React, { useState } from 'react';
import { Modal, TextInput, Button, Group, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import "./CreateClinicModal.css";

export default function CreateClinicModal({ opened, onClose, onSuccess }) {
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!clinicName.trim() || !clinicAddress.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const clinicData = {
        name: clinicName.trim(),
        address: clinicAddress.trim()
      };

      const response = await fetch('/api/clinic/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(clinicData)
      });

      const result = await response.json();
      
      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        setError(result.error || 'Failed to create clinic');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClinicName('');
    setClinicAddress('');
    setError('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Clinic"
      size="md"
      centered
    >
      <div className="create-clinic-form">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <TextInput
          label="Clinic Name"
          placeholder="Enter clinic name"
          value={clinicName}
          onChange={(e) => setClinicName(e.currentTarget.value)}
          required
          mb="md"
        />

        <TextInput
          label="Address"
          placeholder="Enter clinic address"
          value={clinicAddress}
          onChange={(e) => setClinicAddress(e.currentTarget.value)}
          required
          mb="md"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Clinic
          </Button>
        </Group>
      </div>
    </Modal>
  );
}