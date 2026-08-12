import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ✅ Forget Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const API_URL = 'https://legalvault-jm2n.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Invalid credentials");
    }
    setLoading(false);
  };

  // ✅ Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setResetLoading(true);

    if (!resetEmail) {
      setResetError("Email is required");
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        setResetMessage("✅ Password reset link sent to your email!");
        setResetEmail("");
      } else {
        setResetError(data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setResetError("Network error. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://external-preview.redd.it/nyc-high-quality-wallpaper-pack-mostly-4k-resolution-i-v0-9vmW53BCcL1hXh2LYP8hMvbMsYviRo_WDLPQL2iHmQw.jpg?width=1080&crop=smart&auto=webp&s=4b858123e8824fe2d7cefc2d1784b31018b22c92')`,
        }}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 -z-5 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-cyan-500/10">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              LegalVault
            </h1>
            <p className="text-sm text-gray-300 mt-2">
              {showForgotPassword ? "Reset your password" : "Welcome back. Please login to your account."}
            </p>
          </div>

          {/* ✅ LOGIN FORM */}
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none text-white placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none text-white placeholder:text-slate-400"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-400/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* ✅ Forgot Password Link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            // ✅ FORGOT PASSWORD FORM
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-600/50 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none text-white placeholder:text-slate-400"
                  required
                />
              </div>

              {resetError && (
                <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-400/20">
                  {resetError}
                </div>
              )}

              {resetMessage && (
                <div className="p-3 rounded-xl text-sm bg-green-500/20 text-green-400 border border-green-400/20">
                  {resetMessage}
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-xl text-sm bg-green-500/20 text-green-400 border border-green-400/20">
                  ✅ Check your email for password reset link!
                </div>
              )}

              <button
                type="submit"
                disabled={resetLoading || resetSuccess}
                className="w-full py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : resetSuccess ? "✅ Sent!" : "Send Reset Link"}
              </button>

              {/* ✅ Back to Login */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetError("");
                    setResetMessage("");
                    setResetSuccess(false);
                  }}
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

export default Login;