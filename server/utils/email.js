const nodemailer = require('nodemailer');

// ✅ Force IPv4 (Render IPv6 issue fix)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// ✅ SMTP Transporter - Port 465 with SSL
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"LegalVault" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ User Welcome Email
const sendUserWelcomeEmail = async (email, name, password) => {
  console.log('📧 Sending welcome email to:', email);
  const frontendUrl = process.env.FRONTEND_URL || 'https://legalvault-frontend-two.vercel.app';
  const loginUrl = `${frontendUrl}/login`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; padding: 20px; }
        .container { max-width: 550px; margin: auto; background: #ffffff; padding: 35px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { text-align: center; border-bottom: 2px solid #0D9488; padding-bottom: 20px; }
        .header h1 { color: #0D9488; font-size: 28px; margin: 0; }
        .header p { color: #6B7280; margin: 5px 0 0; }
        .content { padding: 25px 0; }
        .content h2 { color: #1F2937; font-size: 20px; margin-top: 0; }
        .credentials { background: #F3F4F6; padding: 16px 20px; border-radius: 10px; margin: 15px 0; }
        .credentials p { margin: 6px 0; font-size: 15px; }
        .credentials strong { color: #0D9488; }
        .btn { display: inline-block; padding: 12px 30px; background: #0D9488; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px; }
        .btn:hover { background: #0F766E; }
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
          
          <p style="color: #6B7280; font-size: 14px;">⚠️ For security, please change your password after your first login.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${loginUrl}" class="btn">🔐 Login to LegalVault</a>
          </div>
          
          <p style="font-size: 14px; color: #4B5563;">You can also copy and paste this URL into your browser:</p>
          <p style="font-size: 13px; color: #0D9488; word-break: break-all; background: #F3F4F6; padding: 10px; border-radius: 6px;">${loginUrl}</p>
        </div>
        <div class="footer">
          <p>This is an automated message from LegalVault. Please do not reply to this email.</p>
          <p>&copy; 2026 LegalVault. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, '🎉 Welcome to LegalVault – Your Account Credentials', html);
};

// ✅ Password Reset Email
const sendPasswordResetEmail = async (email, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://legalvault-frontend-two.vercel.app';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const html = `
    <h1>🔐 Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0D9488;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
    <p>This link will expire in <strong>1 hour</strong>.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(email, '🔐 LegalVault - Password Reset Request', html);
};

module.exports = { 
  sendEmail, 
  sendPasswordResetEmail, 
  sendUserWelcomeEmail 
};