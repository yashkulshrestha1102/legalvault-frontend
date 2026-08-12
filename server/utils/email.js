const Brevo = require('@getbrevo/brevo');

let apiInstance = null;

// ✅ Initialize Brevo API
if (process.env.BREVO_API_KEY) {
  try {
    apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    console.log('✅ Brevo API initialized');
  } catch (error) {
    console.error('❌ Brevo API init error:', error);
  }
}

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `https://app.businezexcellence.com/reset-password?token=${resetToken}`;
  
  console.log(`📧 Sending to: ${email}`);
  console.log(`🔗 Link: ${resetLink}`);

  try {
    if (apiInstance) {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = '🔑 Password Reset - LegalVault';
      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
          <div style="max-width: 500px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto;">
            <h1 style="color: #0D9488; text-align: center;">LegalVault</h1>
            <h2>Password Reset Request</h2>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" style="background: #0D9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #888;">This link expires in 1 hour.</p>
            <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `;
      sendSmtpEmail.sender = { 
        name: 'LegalVault', 
        email: process.env.EMAIL_FROM || 'noreply@businezexcellence.com' 
      };
      sendSmtpEmail.to = [{ email: email }];

      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Email sent via Brevo API:', result.response?.statusCode || 'OK');
      return { success: true };
    } else {
      console.log('📧 FALLBACK - No API configured');
      console.log(`📧 To: ${email}`);
      console.log(`🔗 Link: ${resetLink}`);
      return { success: true, fallback: true };
    }
  } catch (error) {
    console.error('❌ Email error:', error.message);
    if (error.response) {
      console.error('📦 Response:', error.response.body);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendUserWelcomeEmail = async (email, name, password) => {
  console.log('📧 Sending welcome email to:', email);

  try {
    if (apiInstance) {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = '🎉 Welcome to LegalVault!';
      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
          <div style="max-width: 500px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto;">
            <h1 style="color: #0D9488; text-align: center;">🎉 LegalVault</h1>
            <h2>Welcome ${name || 'User'}!</h2>
            <p>Your account has been created successfully.</p>
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            <div style="text-align: center;">
              <a href="https://app.businezexcellence.com" style="background: #0D9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
            </div>
          </div>
        </body>
        </html>
      `;
      sendSmtpEmail.sender = { 
        name: 'LegalVault', 
        email: process.env.EMAIL_FROM || 'noreply@businezexcellence.com' 
      };
      sendSmtpEmail.to = [{ email: email }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Welcome email sent via Brevo API');
      return { success: true };
    } else {
      console.log('📧 WELCOME FALLBACK - Would send to:', email);
      return { success: true, fallback: true };
    }
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { 
  sendPasswordResetEmail,
  sendUserWelcomeEmail 
};