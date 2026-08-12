const nodemailer = require('nodemailer');

let transporter = null;

// ✅ Initialize SMTP
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('✅ Brevo SMTP email service initialized');
} else {
  console.log('⚠️ No email service configured, using fallback logging');
}

// ✅ Send Password Reset Email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  console.log(`📧 Sending password reset email to: ${email}`);
  console.log(`🔗 Reset link: ${resetLink}`);

  try {
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@businezexcellence.com',
        to: email,
        subject: '🔑 Password Reset - LegalVault',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
            <h1 style="color: #0D9488; text-align: center;">LegalVault</h1>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2>Password Reset Request</h2>
              <p>Click the button below to reset your password:</p>
              <a href="${resetLink}" style="display: inline-block; background: #0D9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a>
              <p style="font-size: 12px; color: #888;">This link expires in 1 hour.</p>
              <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent via SMTP');
      return { success: true };
    } else {
      // Fallback: Log only
      console.log('📧 EMAIL FALLBACK - Reset link:');
      console.log(`📧 To: ${email}`);
      console.log(`🔗 Link: ${resetLink}`);
      return { success: true, fallback: true };
    }
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// ✅ Send Welcome Email
const sendUserWelcomeEmail = async (email, name, password) => {
  console.log('📧 Sending welcome email to:', email);

  try {
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@businezexcellence.com',
        to: email,
        subject: '🎉 Welcome to LegalVault!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
            <h1 style="color: #0D9488; text-align: center;">🎉 LegalVault</h1>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2>Welcome ${name || 'User'}!</h2>
              <p>Your account has been created successfully.</p>
              <div style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
              </div>
            </div>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent via SMTP');
      return { success: true };
    } else {
      console.log('📧 WELCOME EMAIL (fallback) - Would send to:', email);
      return { success: true, fallback: true };
    }
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ ENSURE PROPER EXPORT - YEH IMPORTANT HAI!
module.exports = { 
  sendPasswordResetEmail,
  sendUserWelcomeEmail 
};