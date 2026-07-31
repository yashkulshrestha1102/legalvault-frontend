const nodemailer = require('nodemailer');

// ✅ Bluehost SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.bluehost.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendUserWelcomeEmail = async (email, name, password) => {
  console.log('📧 Sending welcome email to:', email);

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

  try {
    const info = await transporter.sendMail({
      from: `"LegalVault" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to LegalVault – Your Account Credentials',
      html: html
    });
    console.log('✅ Email sent! Message ID:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendUserWelcomeEmail };