const transporter = require('../config/mailer');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');

const baseStyles = `
  body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
  .header { background: #1e40af; color: #ffffff; padding: 24px; text-align: center; }
  .content { padding: 32px 24px; color: #1f2937; line-height: 1.6; }
  .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
  .badge { display: inline-block; background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 999px; font-size: 14px; }
  .btn { display: inline-block; background: #1e40af; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
`;

const wrapTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div style="padding: 24px;">
    <div class="container">
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">CivicConnect</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Smart Municipal Complaint Management</p>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} CivicConnect. All rights reserved.</p>
        <p>This is an automated message. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const templates = {
  [NOTIFICATION_TYPES.COMPLAINT_CREATED]: ({ complaintId, userName, complaintTitle }) => ({
    subject: `Complaint #${complaintId} submitted successfully`,
    html: wrapTemplate(
      'Complaint Submitted',
      `
        <h2 style="margin-top: 0; color: #1e40af;">Your complaint has been submitted</h2>
        <p>Hello ${userName || 'Citizen'},</p>
        <p>Thank you for reporting an issue through CivicConnect. Your complaint has been received and is now being reviewed by our municipal team.</p>
        <p><span class="badge">Complaint ID: ${complaintId}</span></p>
        ${complaintTitle ? `<p><strong>Title:</strong> ${complaintTitle}</p>` : ''}
        <p>You can track the status of your complaint anytime from your CivicConnect dashboard.</p>
        <p>We appreciate your effort in helping improve our community.</p>
      `
    ),
  }),

  [NOTIFICATION_TYPES.WORKER_ASSIGNED]: ({ complaintId, userName, complaintTitle, workerName }) => ({
    subject: `Worker assigned to complaint #${complaintId}`,
    html: wrapTemplate(
      'Worker Assigned',
      `
        <h2 style="margin-top: 0; color: #1e40af;">A worker has been assigned</h2>
        <p>Hello ${userName || 'Citizen'},</p>
        <p>Good news! A municipal worker has been assigned to resolve your complaint.</p>
        <p><span class="badge">Complaint ID: ${complaintId}</span></p>
        ${complaintTitle ? `<p><strong>Title:</strong> ${complaintTitle}</p>` : ''}
        ${workerName ? `<p><strong>Assigned Worker:</strong> ${workerName}</p>` : ''}
        <p>The assigned worker will begin work shortly. You will receive updates as progress is made.</p>
      `
    ),
  }),

  [NOTIFICATION_TYPES.WORK_COMPLETED]: ({ complaintId, userName, complaintTitle }) => ({
    subject: `Work completed on complaint #${complaintId}`,
    html: wrapTemplate(
      'Work Completed',
      `
        <h2 style="margin-top: 0; color: #1e40af;">Work has been completed</h2>
        <p>Hello ${userName || 'Citizen'},</p>
        <p>The assigned worker has marked your complaint as completed. The work is now under admin review for verification.</p>
        <p><span class="badge">Complaint ID: ${complaintId}</span></p>
        ${complaintTitle ? `<p><strong>Title:</strong> ${complaintTitle}</p>` : ''}
        <p>Once verified by an administrator, you will receive a final confirmation notification.</p>
      `
    ),
  }),

  [NOTIFICATION_TYPES.VERIFIED]: ({ complaintId, userName, complaintTitle }) => ({
    subject: `Complaint #${complaintId} verified by admin`,
    html: wrapTemplate(
      'Complaint Verified',
      `
        <h2 style="margin-top: 0; color: #1e40af;">Your complaint has been verified</h2>
        <p>Hello ${userName || 'Citizen'},</p>
        <p>An administrator has verified that the work on your complaint meets the required standards.</p>
        <p><span class="badge">Complaint ID: ${complaintId}</span></p>
        ${complaintTitle ? `<p><strong>Title:</strong> ${complaintTitle}</p>` : ''}
        <p>Your complaint will be officially closed shortly. Thank you for your patience.</p>
      `
    ),
  }),

  [NOTIFICATION_TYPES.CLOSED]: ({ complaintId, userName, complaintTitle }) => ({
    subject: `Complaint #${complaintId} officially closed`,
    html: wrapTemplate(
      'Complaint Closed',
      `
        <h2 style="margin-top: 0; color: #1e40af;">Complaint officially closed</h2>
        <p>Hello ${userName || 'Citizen'},</p>
        <p>Your complaint has been officially closed. Thank you for using CivicConnect to help improve our municipality.</p>
        <p><span class="badge">Complaint ID: ${complaintId}</span></p>
        ${complaintTitle ? `<p><strong>Title:</strong> ${complaintTitle}</p>` : ''}
        <p>We hope the issue has been resolved to your satisfaction. You may submit a new complaint anytime if needed.</p>
      `
    ),
  }),

  [NOTIFICATION_TYPES.USER_REGISTERED]: ({ userName }) => ({
    subject: 'Welcome to CivicConnect!',
    html: wrapTemplate(
      'Welcome to CivicConnect',
      `
        <h2 style="margin-top: 0; color: #1e40af;">Welcome to CivicConnect!</h2>
        <p>Hello ${userName || 'Citizen'},</p>
        <p>Your account has been successfully registered. You can now log in to submit complaints, upload photos, provide geolocations, and track your complaints in real time.</p>
        <p>Thank you for contributing to your community's improvement!</p>
        <div style="margin-top: 24px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" class="btn" style="color:#ffffff;text-decoration:none;">Go to Login</a>
        </div>
      `
    ),
  }),

  [NOTIFICATION_TYPES.WORKER_CREATED]: ({ userName, workerName }) => ({
    subject: 'Welcome to CivicConnect - Worker Profile Created',
    html: wrapTemplate(
      'Worker Profile Created',
      `
        <h2 style="margin-top: 0; color: #1e40af;">Worker Account Created</h2>
        <p>Hello ${userName || workerName || 'Worker'},</p>
        <p>An administrator has created a worker account for you in CivicConnect.</p>
        <p>You can now log in using your email to view assigned tasks, update work statuses, and upload progress photos.</p>
        <div style="margin-top: 24px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" class="btn" style="color:#ffffff;text-decoration:none;">Go to Dashboard</a>
        </div>
      `
    ),
  }),

  [NOTIFICATION_TYPES.TASK_ASSIGNED]: ({ complaintId, workerName, complaintTitle }) => ({
    subject: `New Task Assigned: Complaint #${complaintId}`,
    html: wrapTemplate(
      'New Task Assigned',
      `
        <h2 style="margin-top: 0; color: #1e40af;">You have a new task assigned!</h2>
        <p>Hello ${workerName || 'Worker'},</p>
        <p>An administrator has assigned a new complaint for you to resolve.</p>
        <p><span class="badge">Complaint ID: ${complaintId}</span></p>
        ${complaintTitle ? `<p><strong>Title:</strong> ${complaintTitle}</p>` : ''}
        <p>Please log in to your CivicConnect dashboard to view the full details of this complaint, including location and uploaded photos.</p>
        <div style="margin-top: 24px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" class="btn" style="color:#ffffff;text-decoration:none;">Go to Dashboard</a>
        </div>
      `
    ),
  }),
};

const sendEmail = async (type, recipientEmail, data) => {
  if (!recipientEmail) return null;

  const templateFn = templates[type];
  if (!templateFn) return null;

  const { subject, html } = templateFn(data);

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'CivicConnect <noreply@civicconnect.in>',
    to: recipientEmail,
    subject,
    html,
  });
};

module.exports = { sendEmail, templates };
