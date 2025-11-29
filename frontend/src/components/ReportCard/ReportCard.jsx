import React from 'react';
import { Box, Text, Group, Button } from '@mantine/core';
import "./ReportCard.css";

export default function ReportCard({ report }) {
  const dateObj = new Date(report.ReportDate || report.date);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

  const handleDownload = () => {
    window.open(`/api/healthreports/${report.ReportID || report.id}/download`, '_blank');
  };

  // Calculate BMI if not provided
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 'N/A';
    const weightKg = parseFloat(weight);
    const heightM = parseFloat(height) / 100; // Convert cm to m
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const weightValue = report.Weight || report.weight || 'N/A';
  const heightValue = report.Height || report.height || 'N/A';
  const bmiValue = report.bmi || calculateBMI(weightValue, heightValue);

  return (
    <Box className="report-card">
      <div className="report-header">
        <Text className="report-date">{formattedDate}</Text>
        <Text className="report-id">Report ID: {report.ReportID || report.refId || 'N/A'}</Text>
      </div>

      <div className="report-content">
        <div className="doctor-info">
          <Text className="doctor-name">👨‍⚕️ Physician ID: {report.PhysicianID || report.doctor || 'N/A'}</Text>
          <Text className="specialty">Patient ID: {report.PatientID || 'N/A'}</Text>
        </div>

        <div className="vitals-grid">
          <div className="vital-item">
            <span className="vital-icon">📏</span>
            <span className="vital-label">Height:</span>
            <span className="vital-value">{heightValue}{heightValue !== 'N/A' && !heightValue.includes('cm') ? ' cm' : ''}</span>
          </div>
          <div className="vital-item">
            <span className="vital-icon">⚖️</span>
            <span className="vital-label">Weight:</span>
            <span className="vital-value">{weightValue}{weightValue !== 'N/A' && !weightValue.includes('kg') ? ' kg' : ''}</span>
          </div>
          <div className="vital-item">
            <span className="vital-icon">📊</span>
            <span className="vital-label">BMI:</span>
            <span className="vital-value">{bmiValue}</span>
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