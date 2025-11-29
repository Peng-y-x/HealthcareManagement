import jsPDF from 'jspdf';

export const generateHealthReportPDF = async (reportData) => {
  const pdf = new jsPDF();
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;

  const addText = (text, x, y, options = {}) => {
    const { fontSize = 10, style = 'normal', maxWidth = pageWidth - 2 * margin } = options;
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.6);
  };

  pdf.setFillColor(41, 128, 185);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  currentY = addText('HEALTH REPORT', margin, 25, { fontSize: 20, style: 'bold' });
  
  pdf.setTextColor(0, 0, 0);
  currentY = 60;

  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin, currentY - 10, pageWidth - 2 * margin, 25, 'F');
  
  currentY = addText('REPORT INFORMATION', margin + 5, currentY, { fontSize: 14, style: 'bold' });
  currentY += 5;

  const reportInfo = [
    `Report ID: ${reportData.reportId}`,
    `Report Date: ${new Date(reportData.reportDate).toLocaleDateString()}`,
    `Generated: ${new Date().toLocaleString()}`
  ];

  reportInfo.forEach(info => {
    currentY = addText(info, margin + 5, currentY, { fontSize: 11 });
    currentY += 2;
  });

  currentY += 10;

  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin, currentY - 10, pageWidth - 2 * margin, 25, 'F');
  
  currentY = addText('PATIENT INFORMATION', margin + 5, currentY, { fontSize: 14, style: 'bold' });
  currentY += 5;

  const patientInfo = [
    `Name: ${reportData.patientName}`,
    `Date of Birth: ${new Date(reportData.patientDOB).toLocaleDateString()}`,
    `Blood Type: ${reportData.patientBloodType}`,
    `Phone: ${reportData.patientPhone}`,
    `Address: ${reportData.patientAddress}`
  ];

  patientInfo.forEach(info => {
    currentY = addText(info, margin + 5, currentY, { fontSize: 11 });
    currentY += 2;
  });

  currentY += 10;

  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin, currentY - 10, pageWidth - 2 * margin, 25, 'F');
  
  currentY = addText('PHYSICIAN INFORMATION', margin + 5, currentY, { fontSize: 14, style: 'bold' });
  currentY += 5;

  const physicianInfo = [
    `Physician: ${reportData.physicianName}`,
    `Department: ${reportData.physicianDepartment}`
  ];

  physicianInfo.forEach(info => {
    currentY = addText(info, margin + 5, currentY, { fontSize: 11 });
    currentY += 2;
  });

  currentY += 10;

  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin, currentY - 10, pageWidth - 2 * margin, 25, 'F');
  
  currentY = addText('VITAL MEASUREMENTS', margin + 5, currentY, { fontSize: 14, style: 'bold' });
  currentY += 5;

  const vitals = [
    `Weight: ${reportData.weight} kg`,
    `Height: ${reportData.height} cm`,
    `BMI: ${reportData.weight && reportData.height ? (reportData.weight / Math.pow(reportData.height / 100, 2)).toFixed(1) : 'N/A'}`
  ];

  vitals.forEach(vital => {
    currentY = addText(vital, margin + 5, currentY, { fontSize: 11 });
    currentY += 2;
  });

  currentY += 15;

  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin, currentY - 10, pageWidth - 2 * margin, 25, 'F');
  
  currentY = addText('PRESCRIPTION DETAILS', margin + 5, currentY, { fontSize: 14, style: 'bold' });
  currentY += 5;

  if (reportData.prescription) {
    const prescriptionInfo = [
      `Prescription ID: ${reportData.prescription.prescriptionId}`,
      `Dosage: ${reportData.prescription.dosage}`,
      `Frequency: ${reportData.prescription.frequency}`,
      `Start Date: ${new Date(reportData.prescription.startDate).toLocaleDateString()}`,
      `End Date: ${new Date(reportData.prescription.endDate).toLocaleDateString()}`,
      `Instructions: ${reportData.prescription.instructions}`
    ];

    prescriptionInfo.forEach(info => {
      currentY = addText(info, margin + 5, currentY, { fontSize: 11 });
      currentY += 2;
    });
  } else {
    currentY = addText('No prescription available for this health report.', margin + 5, currentY, { 
      fontSize: 11, 
      style: 'italic' 
    });
    pdf.setTextColor(128, 128, 128);
    currentY += 5;
    pdf.setTextColor(0, 0, 0);
  }

  currentY += 20;

  const footerY = pageHeight - 30;
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, footerY, pageWidth, 30, 'F');
  
  pdf.setFontSize(9);
  pdf.setTextColor(128, 128, 128);
  pdf.text('This is a computer-generated health report.', margin, footerY + 10);
  pdf.text('For questions, please contact your healthcare provider.', margin, footerY + 20);

  const fileName = `HealthReport_${reportData.reportId}_${reportData.patientName.replace(/\s+/g, '_')}.pdf`;
  
  pdf.save(fileName);
};