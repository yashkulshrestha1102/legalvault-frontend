const nodemailer = require('nodemailer');

// ✅ Brevo SMTP Transporter - Production Ready (Hardcoded)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'b3d43b001@smtp-brevo.com',
    pass: 'KTbBZY67GdQ3zgwJ'
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

// Generic Email Sender
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: '"LegalVault" <yashkulshrestha1102@gmail.com>',
      to,
      subject,
      html
    };

    console.log('📧 Attempting to send email to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent! Message ID:', info.messageId);
    console.log('✅ Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    if (error.response) {
      console.error('❌ Full error:', error.response);
    }
    return { success: false, error: error.message };
  }
};

// 🎉 Welcome Email
const sendUserWelcomeEmail = async (email, name, password) => {
  console.log('📧 Preparing welcome email for:', email);
  const frontendUrl = process.env.FRONTEND_URL || 'https://legalvault-frontend-two.vercel.app';
  const loginUrl = `${frontendUrl}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f9; padding: 20px; }
        .container { max-width: 550px; margin: auto; background: #ffffff; padding: 35px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { text-align: center; border-bottom: 2px solid #0D9488; padding-bottom: 20px; }
        .header h1 { color: #0D9488; font-size: 26px; margin: 0; }
        .content { padding: 25px 0; }
        .credentials { background: #F3F4F6; padding: 16px 20px; border-radius: 8px; margin: 15px 0; }
        .credentials p { margin: 6px 0; }
        .credentials strong { color: #0D9488; }
        .btn { display: inline-block; padding: 12px 30px; background: #0D9488; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; text-decoration: none; }
        .footer { margin-top: 25px; font-size: 13px; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚖️ LegalVault</h1>
          <p>Premium Legal Management Suite</p>
        </div>
        <div class="content">
          <h2>Welcome to LegalVault, ${name}! 🎉</h2>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <div class="credentials">
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>🔑 Password:</strong> <span style="background: #e5e7eb; padding: 2px 10px; border-radius: 4px; font-family: monospace;">${password}</span></p>
          </div>
          <p style="color: #6B7280; font-size: 14px;">⚠️ For security, please change your password after first login.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${loginUrl}" class="btn">🔐 Login to LegalVault</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 LegalVault. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, '🎉 Welcome to LegalVault – Your Account Credentials', html);
};

// 🔐 Password Reset Email
const sendPasswordResetEmail = async (email, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://legalvault-frontend-two.vercel.app';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f9; padding: 20px; }
        .container { max-width: 550px; margin: auto; background: #ffffff; padding: 35px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { text-align: center; border-bottom: 2px solid #0D9488; padding-bottom: 20px; }
        .header h1 { color: #0D9488; font-size: 26px; margin: 0; }
        .content { padding: 25px 0; }
        .btn { display: inline-block; padding: 12px 30px; background: #0D9488; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; text-decoration: none; }
        .footer { margin-top: 25px; font-size: 13px; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚖️ LegalVault</h1>
          <p>Premium Legal Management Suite</p>
        </div>
        <div class="content">
          <h2>🔐 Reset Your Password</h2>
          <p>Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">This link will expire in <strong>1 hour</strong>.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 LegalVault. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(email, '🔐 LegalVault - Password Reset Request', html);
};

module.exports = {
  sendEmail,
  sendUserWelcomeEmail,
  sendPasswordResetEmail
};