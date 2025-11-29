import React, { useState, useEffect } from 'react';
import { Box, Title, Text, Loader, Notification, Table, Badge } from '@mantine/core';
import { IconInfoCircle, IconPill } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import "./Prescriptions.css";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchPrescriptions = async () => {
    if (!user?.reference_id) {
      setError('Please log in to view your prescriptions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prescription?patient_id=${user.reference_id}`, {
        credentials: 'include'
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setPrescriptions(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch prescriptions.');
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to fetch prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isActivePrescrition = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  return (
    <Box className="prescriptions-page">
      <Title order={1} className="page-title">💊 My Prescriptions</Title>
      
      <Text className="page-description">
        View your current and past medication prescriptions.
      </Text>

      {error && (
        <Notification 
          icon={<IconInfoCircle size={18} />} 
          color="red" 
          title="Error"
          onClose={() => setError(null)}
          className="error-notification"
        >
          {error}
        </Notification>
      )}

      {loading ? (
        <div className="loading-state">
          <Loader size="lg" />
          <Text>Loading your prescriptions...</Text>
        </div>
      ) : (
        <div className="prescriptions-section">
          <Title order={2} className="section-title">
            📋 Your Prescriptions ({prescriptions.length})
          </Title>

          {prescriptions.length > 0 ? (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Prescription ID</Table.Th>
                  <Table.Th>Physician ID</Table.Th>
                  <Table.Th>Dosage</Table.Th>
                  <Table.Th>Frequency</Table.Th>
                  <Table.Th>Start Date</Table.Th>
                  <Table.Th>End Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Instructions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {prescriptions.map((prescription) => (
                  <Table.Tr key={prescription.PrescriptionID}>
                    <Table.Td>{prescription.PrescriptionID}</Table.Td>
                    <Table.Td>{prescription.PhysicianID}</Table.Td>
                    <Table.Td>{prescription.Dosage}</Table.Td>
                    <Table.Td>{prescription.Frequency}</Table.Td>
                    <Table.Td>{formatDate(prescription.StartDate)}</Table.Td>
                    <Table.Td>{formatDate(prescription.EndDate)}</Table.Td>
                    <Table.Td>
                      <Badge 
                        color={isActivePrescrition(prescription.StartDate, prescription.EndDate) ? 'green' : 'gray'}
                        variant="filled"
                        leftSection={<IconPill size={12} />}
                      >
                        {isActivePrescrition(prescription.StartDate, prescription.EndDate) ? 'Active' : 'Expired'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                        {prescription.Instructions || 'No specific instructions'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <div className="empty-state">
              <Text className="empty-title">💊 No prescriptions found</Text>
              <Text className="empty-description">
                You don't have any prescriptions at this time.
              </Text>
            </div>
          )}
        </div>
      )}
    </Box>
  );
}