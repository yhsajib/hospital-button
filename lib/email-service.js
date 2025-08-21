// import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

// Create email transporter
// const createTransporter = () => {
//   // In production, you would use environment variables for email configuration
//   return nodemailer.createTransporter({
//     host: process.env.SMTP_HOST || 'smtp.gmail.com',
//     port: process.env.SMTP_PORT || 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
// };

// Email templates
const emailTemplates = {
  testReportReady: {
    subject: 'Your Test Report is Ready - Hospital Management System',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Report Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .report-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #64748b; }
          .detail-value { color: #1e293b; }
          .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-completed { background-color: #dcfce7; color: #166534; }
          .status-reviewed { background-color: #f3e8ff; color: #7c3aed; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Test Report Ready</h1>
          </div>
          <div class="content">
            <p>Dear ${data.patientName},</p>
            <p>Your test report is now ready for review. Please find the details below:</p>
            
            <div class="report-details">
              <div class="detail-row">
                <span class="detail-label">Report Number:</span>
                <span class="detail-value">${data.reportNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Test Type:</span>
                <span class="detail-value">${data.testType} (${data.testCategory})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Test Date:</span>
                <span class="detail-value">${new Date(data.testDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Report Date:</span>
                <span class="detail-value">${new Date(data.reportDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span class="status-badge ${data.status === 'COMPLETED' ? 'status-completed' : 'status-reviewed'}">
                    ${data.status.replace('_', ' ')}
                  </span>
                </span>
              </div>
              ${data.conductedBy ? `
              <div class="detail-row">
                <span class="detail-label">Conducted By:</span>
                <span class="detail-value">${data.conductedBy}</span>
              </div>
              ` : ''}
            </div>
            
            ${data.summary ? `
            <div class="report-details">
              <h3>Summary</h3>
              <p>${data.summary}</p>
            </div>
            ` : ''}
            
            <p>You can view your complete test report by logging into your patient portal:</p>
            <a href="${data.portalUrl}" class="button">View Test Report</a>
            
            <p><strong>Important:</strong> Please consult with your healthcare provider to discuss these results and any necessary follow-up actions.</p>
            
            <div class="footer">
              <p>This is an automated message from Hospital Management System.</p>
              <p>If you have any questions, please contact us at ${process.env.HOSPITAL_CONTACT_EMAIL || 'support@hospital.com'}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  testReportUpdated: {
    subject: 'Test Report Updated - Hospital Management System',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Report Updated</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .report-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Test Report Updated</h1>
          </div>
          <div class="content">
            <p>Dear ${data.patientName},</p>
            <p>Your test report (${data.reportNumber}) has been updated. Please review the latest version in your patient portal.</p>
            
            <div class="report-details">
              <p><strong>Test Type:</strong> ${data.testType}</p>
              <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Updated By:</strong> ${data.updatedBy}</p>
            </div>
            
            <a href="${data.portalUrl}" class="button">View Updated Report</a>
            
            <div class="footer">
              <p>This is an automated message from Hospital Management System.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Send email notification for new test report
export async function sendTestReportNotification(reportId, type = 'testReportReady') {
  // Email functionality temporarily disabled
  console.log('Email notification would be sent for report:', reportId, 'type:', type);
  return { success: true, message: 'Email functionality disabled' };
  
  // try {
  //   // Get test report with patient and test type details
  //   const report = await prisma.testReport.findUnique({
  //     where: { id: reportId },
  //     include: {
  //       patient: {
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //           clerkUserId: true
  //         }
  //       },
  //       testType: {
  //         select: {
  //           name: true,
  //           category: true
  //         }
  //       }
  //     }
  //   });

  //   if (!report || !report.patient || !report.patient.email) {
  //     console.error('Report not found or patient email not available');
  //     return { success: false, error: 'Report or patient email not found' };
  //   }

  //   // Skip sending email if SMTP is not configured
  //   if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  //     console.log('SMTP not configured, skipping email notification');
  //     return { success: true, message: 'Email skipped - SMTP not configured' };
  //   }

  //   const transporter = createTransporter();
  //   const template = emailTemplates[type];
    
  //   if (!template) {
  //     throw new Error(`Email template '${type}' not found`);
  //   }

  //   // Prepare email data
  //   const emailData = {
  //     patientName: report.patient.name,
  //     reportNumber: report.reportNumber,
  //     testType: report.testType.name,
  //     testCategory: report.testType.category,
  //     testDate: report.testDate,
  //     reportDate: report.reportDate,
  //     status: report.status,
  //     conductedBy: report.conductedBy,
  //     reviewedBy: report.reviewedBy,
  //     summary: report.summary,
  //     portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/test-reports`,
  //     updatedBy: report.reviewedBy || 'Medical Staff'
  //   };

  //   // Send email
  //   const mailOptions = {
  //     from: `"Hospital Management System" <${process.env.SMTP_USER}>`,
  //     to: report.patient.email,
  //     subject: template.subject,
  //     html: template.html(emailData)
  //   };

  //   const info = await transporter.sendMail(mailOptions);
    
  //   // Log the email notification in database (optional)
  //   await prisma.testReport.update({
  //     where: { id: reportId },
  //     data: {
  //       emailNotificationSent: true,
  //       emailNotificationSentAt: new Date()
  //     }
  //   });

  //   console.log('Email sent successfully:', info.messageId);
  //   return { success: true, messageId: info.messageId };

  // } catch (error) {
  //   console.error('Failed to send email notification:', error);
  //   return { success: false, error: error.message };
  // }
}

// Send email notification for test report update
export async function sendTestReportUpdateNotification(reportId) {
  // Email functionality temporarily disabled
  console.log('Email update notification would be sent for report:', reportId);
  return { success: true, message: 'Email functionality disabled' };
  // return await sendTestReportNotification(reportId, 'testReportUpdated');
}

// Batch send notifications for multiple reports
export async function sendBatchNotifications(reportIds, type = 'testReportReady') {
  // Email functionality temporarily disabled
  console.log('Batch email notifications would be sent for reports:', reportIds, 'type:', type);
  return reportIds.map(reportId => ({ reportId, success: true, message: 'Email functionality disabled' }));
  
  // const results = [];
  
  // for (const reportId of reportIds) {
  //   const result = await sendTestReportNotification(reportId, type);
  //   results.push({ reportId, ...result });
    
  //   // Add delay between emails to avoid rate limiting
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  // }
  
  // return results;
}