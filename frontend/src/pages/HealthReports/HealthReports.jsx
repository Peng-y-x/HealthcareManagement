import React, { useState, useEffect } from 'react';
import { Box, Title, Text, Loader, Notification, Button, Group } from '@mantine/core';
import { IconInfoCircle, IconPlus } from '@tabler/icons-react';
import DateFilter from '../../components/DateFilter/DateFilter';
import ReportCard from '../../components/ReportCard/ReportCard';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import "./HealthReports.css";

export default function HealthReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const { user, isPhysician } = useAuth();
  const navigate = useNavigate();

  const fetchReports = async (startDate, endDate) => {
    if (!user?.reference_id) {
      setError('Please log in to view your health reports.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isPhysician 
        ? `/api/healthreports` 
        : `/api/healthreports?patient_id=${user.reference_id}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        let filtered = data.data || [];
        
        // Apply date filtering if dates are provided
        if (startDate || endDate) {
          filtered = filtered.filter((report) => {
            const reportDate = new Date(report.ReportDate).getTime();
            const start = startDate ? new Date(startDate).getTime() : 0;
            const end = endDate ? new Date(endDate).setHours(23, 59, 59) : Infinity;
            return reportDate >= start && reportDate <= end;
          });
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.ReportDate) - new Date(a.ReportDate));
        setReports(filtered);
      } else {
        setError(data.error || 'Failed to fetch health reports.');
      }
    } catch (err) {
      console.error('Error fetching health reports:', err);
      setError('Failed to fetch health reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <Box className="health-reports-container">
      <div className="health-reports">
        <Title order={1} className="page-title">
          {isPhysician ? "🏥 Patient Health Reports" : "🏥 Health Reports Center"}
        </Title>
        
        <Text className="page-description">
          {isPhysician 
            ? "View and manage health reports for your patients. Create new reports for patients with appointments."
            : "View and download your medical reports from appointments."
          }
        </Text>

        {isPhysician && (
          <Group justify="flex-end" mb="lg">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/create-health-report')}
            >
              Create New Report
            </Button>
          </Group>
        )}

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

        <DateFilter onFilter={fetchReports} />

        <div className="reports-section">
          <Title order={2} className="section-title">
            📋 {isPhysician ? 'Patient Reports' : 'Your Reports'} ({reports.length})
          </Title>

          <div className="reports-container">
            {loading ? (
              <div className="loading-state">
                <Loader size="lg" />
                <Text>Loading {isPhysician ? 'patient' : 'your'} health reports...</Text>
              </div>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard 
                  key={report.ReportID || report.id} 
                  report={report} 
                  expandedCard={expandedCard}
                  onToggleExpansion={setExpandedCard}
                />
              ))
            ) : (
              <div className="empty-state">
                <Text className="empty-title">📄 No reports found</Text>
                <Text className="empty-description">
                  No health reports match your selected date range. Try adjusting the filter or contact your healthcare provider.
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
}