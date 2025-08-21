'use client';

// PDF generation utility for test reports
// This uses client-side PDF generation with jsPDF and html2canvas

export const generateTestReportPDF = async (reportData) => {
  // Dynamic imports to avoid SSR issues
  const jsPDF = (await import('jspdf')).default;
  const html2canvas = (await import('html2canvas')).default;

  try {
    // Create a temporary HTML element for the report
    const reportElement = createReportHTML(reportData);
    document.body.appendChild(reportElement);

    // Convert HTML to canvas
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove the temporary element
    document.body.removeChild(reportElement);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Create HTML structure for the report
const createReportHTML = (reportData) => {
  const element = document.createElement('div');
  element.style.cssText = `
    width: 794px;
    padding: 40px;
    font-family: Arial, sans-serif;
    background: white;
    position: absolute;
    left: -9999px;
    top: 0;
  `;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'REVIEWED': return '#8b5cf6';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'PENDING': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getResultColor = (status) => {
    switch (status) {
      case 'NORMAL': return '#10b981';
      case 'ABNORMAL': return '#ef4444';
      case 'HIGH': return '#f59e0b';
      case 'LOW': return '#3b82f6';
      case 'CRITICAL': return '#dc2626';
      default: return '#6b7280';
    }
  };

  element.innerHTML = `
    <div style="border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">🏥 Medical Test Report</h1>
      <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Hospital Management System</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
      <div>
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Patient Information</h2>
        <div style="space-y: 8px;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${reportData.patient?.name || 'N/A'}</p>
          <p style="margin: 8px 0;"><strong>Patient ID:</strong> ${reportData.patient?.id || 'N/A'}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${reportData.patient?.email || 'N/A'}</p>
        </div>
      </div>
      
      <div>
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Report Details</h2>
        <div style="space-y: 8px;">
          <p style="margin: 8px 0;"><strong>Report Number:</strong> ${reportData.reportNumber}</p>
          <p style="margin: 8px 0;"><strong>Test Date:</strong> ${formatDate(reportData.testDate)}</p>
          <p style="margin: 8px 0;"><strong>Report Date:</strong> ${formatDate(reportData.reportDate)}</p>
          <p style="margin: 8px 0;">
            <strong>Status:</strong> 
            <span style="background-color: ${getStatusColor(reportData.status)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
              ${reportData.status.replace('_', ' ')}
            </span>
          </p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Test Information</h2>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <p style="margin: 8px 0;"><strong>Test Type:</strong> ${reportData.testType?.name || 'N/A'}</p>
        <p style="margin: 8px 0;"><strong>Category:</strong> ${reportData.testType?.category || 'N/A'}</p>
        ${reportData.conductedBy ? `<p style="margin: 8px 0;"><strong>Conducted By:</strong> ${reportData.conductedBy}</p>` : ''}
        ${reportData.reviewedBy ? `<p style="margin: 8px 0;"><strong>Reviewed By:</strong> ${reportData.reviewedBy}</p>` : ''}
      </div>
    </div>

    ${reportData.testResults && reportData.testResults.length > 0 ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Test Results</h2>
        <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Parameter</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Value</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Unit</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Reference Range</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.testResults.map((result, index) => `
                <tr style="${index % 2 === 0 ? 'background-color: #f8fafc;' : 'background-color: white;'}">
                  <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${result.parameterName}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${result.value}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${result.unit || '-'}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${result.referenceRange || '-'}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="background-color: ${getResultColor(result.status)}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px; font-weight: bold;">
                      ${result.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}

    ${reportData.summary ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Summary</h2>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <p style="margin: 0; line-height: 1.6;">${reportData.summary}</p>
        </div>
      </div>
    ` : ''}

    ${reportData.findings ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Findings</h2>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
          <p style="margin: 0; line-height: 1.6;">${reportData.findings}</p>
        </div>
      </div>
    ` : ''}

    ${reportData.recommendations ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Recommendations</h2>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; line-height: 1.6;">${reportData.recommendations}</p>
        </div>
      </div>
    ` : ''}

    ${reportData.notes ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Additional Notes</h2>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
          <p style="margin: 0; line-height: 1.6;">${reportData.notes}</p>
        </div>
      </div>
    ` : ''}

    <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
      <p style="margin: 5px 0;">This report was generated on ${new Date().toLocaleString()}</p>
      <p style="margin: 5px 0;">Hospital Management System - Confidential Medical Document</p>
      <p style="margin: 5px 0;">Please consult with your healthcare provider for interpretation of these results</p>
    </div>
  `;

  return element;
};

// Download PDF function
export const downloadTestReportPDF = async (reportData) => {
  try {
    const pdf = await generateTestReportPDF(reportData);
    const fileName = `test-report-${reportData.reportNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Generate PDF blob for server-side operations
export const generateTestReportPDFBlob = async (reportData) => {
  try {
    const pdf = await generateTestReportPDF(reportData);
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw error;
  }
};