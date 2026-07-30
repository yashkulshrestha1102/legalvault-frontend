const nodemailer = require('nodemailer');
const dns = require('dns');

// ✅ Force IPv4
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"LegalVault" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html
    };
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendUserWelcomeEmail = async (email, name, password) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://legalvault-frontend-two.vercel.app';
  const loginUrl = `${frontendUrl}/login`;
  
  const html = `
    <h2>Welcome to LegalVault, ${name}! 🎉</h2>
    <p>Your account has been created.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Password:</strong> ${password}</p>
    <a href="${loginUrl}">Login Here</a>
    <p>Please change your password after login.</p>
  `;
  
  return sendEmail(email, '🎉 Welcome to LegalVault', html);
};

module.exports = { sendUserWelcomeEmail };