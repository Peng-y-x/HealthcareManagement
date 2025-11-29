import React, { useState, useEffect } from 'react';
import { Box, Title, Text, Loader, Notification, Table, Badge } from '@mantine/core';
import { IconInfoCircle, IconHistory } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import "./MedicalHistory.css";

export default function MedicalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchMedicalHistory = async () => {
    if (!user?.reference_id) {
      setError('Please log in to view your medical history.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/history?patient_id=${user.reference_id}`, {
        credentials: 'include'
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setHistory(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch medical history.');
      }
    } catch (err) {
      console.error('Error fetching medical history:', err);
      setError('Failed to fetch medical history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getOutcomeColor = (outcome) => {
    if (!outcome) return 'gray';
    const lower = outcome.toLowerCase();
    if (lower.includes('recovered') || lower.includes('cured') || lower.includes('healed')) {
      return 'green';
    }
    if (lower.includes('ongoing') || lower.includes('treatment')) {
      return 'yellow';
    }
    if (lower.includes('chronic') || lower.includes('permanent')) {
      return 'orange';
    }
    return 'gray';
  };

  return (
    <Box className="medical-history-page">
      <Title order={1} className="page-title">📋 Medical History</Title>
      
      <Text className="page-description">
        View your complete medical history and health conditions.
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
          <Text>Loading your medical history...</Text>
        </div>
      ) : (
        <div className="history-section">
          <Title order={2} className="section-title">
            📋 Your Medical Records ({history.length})
          </Title>

          {history.length > 0 ? (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Record ID</Table.Th>
                  <Table.Th>Health Condition</Table.Th>
                  <Table.Th>Diagnosis Date</Table.Th>
                  <Table.Th>Treatment Received</Table.Th>
                  <Table.Th>Outcome</Table.Th>
                  <Table.Th>Ongoing Care</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {history.map((record) => (
                  <Table.Tr key={record.HistoryID}>
                    <Table.Td>{record.HistoryID}</Table.Td>
                    <Table.Td>
                      <Text weight={500}>{record.HealthCondition}</Text>
                    </Table.Td>
                    <Table.Td>{formatDate(record.DiagnosisDate)}</Table.Td>
                    <Table.Td>
                      <Text size="sm" style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                        {record.TreatmentReceived || 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        color={getOutcomeColor(record.Outcome)}
                        variant="filled"
                        leftSection={<IconHistory size={12} />}
                      >
                        {record.Outcome || 'N/A'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        color={record.OngoingCare ? 'blue' : 'gray'}
                        variant="light"
                      >
                        {record.OngoingCare ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <div className="empty-state">
              <Text className="empty-title">📋 No medical history found</Text>
              <Text className="empty-description">
                You don't have any medical history records at this time.
              </Text>
            </div>
          )}
        </div>
      )}
    </Box>
  );
}