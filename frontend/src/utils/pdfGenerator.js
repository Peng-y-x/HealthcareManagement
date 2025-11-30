import jsPDF from 'jspdf';

export const generateHealthReportPDF = async (reportData) => {
  const pdf = new jsPDF();
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;

  const checkPageBreak = (y, additionalSpace = 30) => {
    if (y + additionalSpace > pageHeight - margin) {
      pdf.addPage();
      return margin;
    }
    return y;
  };

  const addText = (text, x, y, options = {}) => {
    const { fontSize = 10, style = 'normal', maxWidth = pageWidth - 2 * margin } = options;
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    
    y = checkPageBreak(y, fontSize * 2);
    
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

  // Create ID line with tab spacing for physician view
  const idParts = [];
  if (reportData.reportId) {
    idParts.push(`Report ID: ${reportData.reportId}`);
  }
  if (reportData.physicianId) {
    idParts.push(`Physician ID: ${reportData.physicianId}`);
  }
  if (reportData.patientId) {
    idParts.push(`Patient ID: ${reportData.patientId}`);
  }
  // Collect all prescription IDs
  const allPrescriptions = reportData.prescriptions || (reportData.prescription ? [reportData.prescription] : []);
  const prescriptionIds = allPrescriptions
    .filter(p => p.prescriptionId)
    .map(p => p.prescriptionId);
  
  if (prescriptionIds.length > 0) {
    idParts.push(`Prescription IDs: ${prescriptionIds.join(', ')}`);
  }
  
  const reportInfo = [];
  if (idParts.length > 0) {
    reportInfo.push(idParts.join('\t\t'));
  }
  
  reportInfo.push(
    `Report Date: ${new Date(reportData.reportDate).toLocaleDateString()}`,
    `Generated: ${new Date().toLocaleString()}`
  );

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

  // Check if we need a new page for prescription section
  currentY = checkPageBreak(currentY, 80);

  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin, currentY - 10, pageWidth - 2 * margin, 25, 'F');
  
  currentY = addText('PRESCRIPTION DETAILS', margin + 5, currentY, { fontSize: 14, style: 'bold' });
  currentY += 5;

  console.log('Prescription data in PDF:', reportData.prescription);
  console.log('Multiple prescriptions data in PDF:', reportData.prescriptions);

  const prescriptions = reportData.prescriptions || (reportData.prescription ? [reportData.prescription] : []);
  
  if (prescriptions.length > 0) {
    prescriptions.forEach((prescription, index) => {
      if (index > 0) {
        currentY += 10; // Add space between prescriptions
        currentY = addText(`--- Prescription ${index + 1} ---`, margin + 5, currentY, { fontSize: 12, style: 'bold' });
        currentY += 3;
      }
      
      const prescriptionInfo = [];
      
      // Only include prescription ID if it exists and is not empty
      if (prescription.prescriptionId) {
        prescriptionInfo.push(`Prescription ID: ${prescription.prescriptionId}`);
      }
      
      prescriptionInfo.push(
        `Dosage: ${prescription.dosage}`,
        `Frequency: ${prescription.frequency}`,
        `Start Date: ${new Date(prescription.startDate).toLocaleDateString()}`,
        `End Date: ${new Date(prescription.endDate).toLocaleDateString()}`,
        `Instructions: ${prescription.instructions}`
      );

      console.log(`Adding prescription ${index + 1} info to PDF:`, prescriptionInfo);
      prescriptionInfo.forEach(info => {
        currentY = addText(info, margin + 5, currentY, { fontSize: 11 });
        currentY += 2;
      });
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

  const fileName = reportData.reportId 
    ? `HealthReport_${reportData.reportId}_${reportData.patientName.replace(/\s+/g, '_')}.pdf`
    : `HealthReport_${reportData.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  pdf.save(fileName);
};