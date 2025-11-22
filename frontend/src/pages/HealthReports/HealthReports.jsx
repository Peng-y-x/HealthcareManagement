import React, { useState, useEffect } from 'react';
import { Box, Title, Text, Loader, Notification } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import DateFilter from '../../components/DateFilter/DateFilter';
import ReportCard from '../../components/ReportCard/ReportCard';
import { HEALTH_REPORTS } from '../../data/mockData';
import "./HealthReports.css";

export default function HealthReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      let filtered = HEALTH_REPORTS;
      
      if (startDate || endDate) {
        filtered = HEALTH_REPORTS.filter((report) => {
          const reportDate = new Date(report.date).getTime();
          const start = startDate ? new Date(startDate).getTime() : 0;
          const end = endDate ? new Date(endDate).setHours(23, 59, 59) : Infinity;
          return reportDate >= start && reportDate <= end;
        });
      }

      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReports(filtered);
    } catch {
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
        <Title order={1} className="page-title">🏥 Health Reports Center</Title>
        
        <Text className="page-description">
          View and download your medical reports from appointments.
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

        <DateFilter onFilter={fetchReports} />

        <div className="reports-section">
          <Title order={2} className="section-title">
            📋 Your Reports ({reports.length})
          </Title>

          <div className="reports-container">
            {loading ? (
              <div className="loading-state">
                <Loader size="lg" />
                <Text>Loading your health reports...</Text>
              </div>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard key={report.id} report={report} />
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