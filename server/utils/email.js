const nodemailer = require('nodemailer');

// Brevo SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'b3d43b001@smtp.brevo.com',
    pass: 'KTbBZY67GdQ3zgwJ'
  }
});

const sendUserWelcomeEmail = async (email, name, password) => {
  console.log('📧 Sending email to:', email);
  
  const html = `
    <h2>Welcome to LegalVault, ${name}!</h2>
    <p>Your account has been created.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Password:</strong> ${password}</p>
    <p>Login: https://legalvault-frontend-two.vercel.app/login</p>
    <p>Please change your password after login.</p>
  `;
  
  try {
    const info = await transporter.sendMail({
      from: '"LegalVault" <yashkulshrestha1102@gmail.com>',
      to: email,
      subject: '🎉 Welcome to LegalVault',
      html: html
    });
    console.log('✅ Email sent! ID:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendUserWelcomeEmail };