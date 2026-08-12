import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = 'https://legalvault-jm2n.onrender.com';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!token) {
      setError('Invalid reset token');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          newPassword: newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage('✅ Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://external-preview.redd.it/nyc-high-quality-wallpaper-pack-mostly-4k-resolution-i-v0-9vmW53BCcL1hXh2LYP8hMvbMsYviRo_WDLPQL2iHmQw.jpg?width=1080&crop=smart&auto=webp&s=4b858123e8824fe2d7cefc2d1784b31018b22c92')`,
        }}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" />
      </div>

      <div className="absolute inset-0 -z-5 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              LegalVault
            </h1>
            <p className="text-sm text-gray-300 mt-2">
              Create New Password
            </p>
          </div>

          {!token ? (
            <div className="p-4 rounded-xl bg-red-500/20 text-red-400 border border-red-400/20 text-center">
              Invalid or missing reset token. Please request a new password reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none text-white placeholder:text-slate-400"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none text-white placeholder:text-slate-400"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-400/20">
                  {error}
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-xl text-sm ${success ? 'bg-green-500/20 text-green-400 border border-green-400/20' : 'bg-blue-500/20 text-blue-400 border border-blue-400/20'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
              >
                {loading ? "Resetting..." : success ? "✅ Done!" : "Reset Password"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;