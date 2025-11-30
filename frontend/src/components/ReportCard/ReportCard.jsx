import React, { useState } from 'react';
import { Box, Text, Group, Button } from '@mantine/core';
import { generateHealthReportPDF } from '../../utils/pdfGenerator';
import { useAuth } from '../../context/AuthContext';
import "./ReportCard.css";

export default function ReportCard({ report, expandedCard, onToggleExpansion }) {
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const { isPhysician } = useAuth();
  
  const reportId = report.ReportID || report.id;
  const isExpanded = expandedCard === reportId;
  const dateObj = new Date(report.ReportDate || report.date);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

  const handleShowPrescriptions = async () => {
    if (isExpanded) {
      // If this card is expanded, close it
      onToggleExpansion(null);
      return;
    }

    // Open this card (will close any other expanded card)
    onToggleExpansion(reportId);
    setPrescriptionsLoading(true);
    
    try {
      const endpoint = isPhysician 
        ? `/api/healthreports/${reportId}/download`
        : `/api/patient/healthreports/${reportId}/download`;
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Extract prescriptions from the report data
        const reportPrescriptions = result.data.prescriptions || (result.data.prescription ? [result.data.prescription] : []);
        setPrescriptions(reportPrescriptions);
      } else {
        setPrescriptions([]);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setPrescriptionsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const endpoint = isPhysician 
        ? `/api/healthreports/${report.ReportID || report.id}/download`
        : `/api/patient/healthreports/${report.ReportID || report.id}/download`;
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('PDF Data:', result.data);
        await generateHealthReportPDF(result.data);
      } else {
        console.error('Failed to fetch report data:', result.error);
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate BMI if not provided
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 'N/A';
    const weightKg = parseFloat(weight);
    const heightM = parseFloat(height) / 100; // Convert cm to m
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const weightValue = String(report.Weight || report.weight || 'N/A');
  const heightValue = String(report.Height || report.height || 'N/A');
  const bmiValue = report.bmi || calculateBMI(weightValue, heightValue);

  return (
    <Box className="report-card">
      <div className="report-header">
        <Text className="report-date">{formattedDate}</Text>
        <Text className="report-id">Report ID: {report.ReportID || report.refId || 'N/A'}</Text>
      </div>

      <div className="report-content">
        <div className="doctor-info">
          {isPhysician ? (
            <>
              <Text className="doctor-name">👤 Patient: {report.PatientName || report.patient || 'N/A'}</Text>
              <Text className="specialty">🏥 Department: {report.PhysicianDepartment || 'N/A'}</Text>
            </>
          ) : (
            <>
              <Text className="doctor-name">👨‍⚕️ Physician: {report.PhysicianName || report.doctor || 'N/A'}</Text>
              <Text className="specialty">🏥 Department: {report.PhysicianDepartment || 'N/A'}</Text>
            </>
          )}
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

      {isExpanded && (
        <div className="prescription-section">
          <Text className="prescription-title">Prescriptions</Text>
          {prescriptionsLoading ? (
            <Text size="sm" style={{ textAlign: 'center', padding: '1rem' }}>Loading prescriptions...</Text>
          ) : prescriptions.length > 0 ? (
            <div className="prescriptions-container">
              {prescriptions.map((prescription, index) => (
                <div key={index} className="prescription-item">
                  <div className="prescription-details">
                    <Text size="sm" weight={500}>
                       {prescription.drugName}
                    </Text>
                    <Text size="sm">
                      📋 {prescription.dosage} - {prescription.frequency}
                    </Text>
                    <Text size="xs" color="dimmed">
                      📅 {new Date(prescription.startDate).toLocaleDateString()} - {new Date(prescription.endDate).toLocaleDateString()}
                    </Text>
                    <Text size="xs">
                      💡 {prescription.instructions}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" color="dimmed" style={{ textAlign: 'center', padding: '1rem' }}>
              No prescriptions found for this report
            </Text>
          )}
        </div>
      )}

      <div className="report-actions">
        <Button onClick={handleShowPrescriptions} size="sm" variant="outline" loading={prescriptionsLoading}>
          💊 {isExpanded ? 'Hide' : 'Show'} Prescriptions
        </Button>
        <Button onClick={handleDownload} className="download-btn" size="sm" loading={loading}>
          📄 Download Report
        </Button>
      </div>
    </Box>
  );
}