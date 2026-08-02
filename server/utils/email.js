// ✅ Email temporarily disabled
const sendUserWelcomeEmail = async (email, name, password) => {
  console.log('📧 Email would be sent to:', email);
  console.log('👤 User:', name);
  console.log('🔑 Password:', password);
  return { success: true };
};

module.exports = { sendUserWelcomeEmail };