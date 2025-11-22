import React from 'react';
import { Box, Text, Group, Button } from '@mantine/core';
import "./ReportCard.css";

export default function ReportCard({ report }) {
  const dateObj = new Date(report.date);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

  const handleDownload = () => {
    window.open(`/api/reports/${report.id}/download`, '_blank');
  };

  return (
    <Box className="report-card">
      <div className="report-header">
        <Text className="report-date">{formattedDate}</Text>
        <Text className="report-id">{report.refId}</Text>
      </div>

      <div className="report-content">
        <div className="doctor-info">
          <Text className="doctor-name">👨‍⚕️ {report.doctor}</Text>
          <Text className="specialty">{report.specialty}</Text>
        </div>

        <div className="vitals-grid">
          <div className="vital-item">
            <span className="vital-icon">📏</span>
            <span className="vital-label">Height:</span>
            <span className="vital-value">{report.height}</span>
          </div>
          <div className="vital-item">
            <span className="vital-icon">⚖️</span>
            <span className="vital-label">Weight:</span>
            <span className="vital-value">{report.weight}</span>
          </div>
          <div className="vital-item">
            <span className="vital-icon">📊</span>
            <span className="vital-label">BMI:</span>
            <span className="vital-value">{report.bmi}</span>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <Button onClick={handleDownload} className="download-btn" size="sm">
          📄 Download Report
        </Button>
      </div>
    </Box>
  );
}