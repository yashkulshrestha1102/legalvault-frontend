// ✅ Simple email utility (for now)
const sendUserWelcomeEmail = async (email, name, password) => {
  console.log('📧 Welcome email would be sent to:', email);
  console.log('👤 User:', name);
  console.log('🔑 Password:', password);
  
  // 🔧 TODO: Add real email service here (Brevo/Resend/SendGrid)
  // For now, just log to console
  
  return { success: true, message: 'Email logged (no actual send)' };
};

module.exports = { sendUserWelcomeEmail };