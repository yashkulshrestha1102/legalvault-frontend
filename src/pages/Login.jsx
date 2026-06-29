import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";  // ✅ Default import

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);  // ✅ Context use karo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");  // ✅ Error state add karo

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);  // ✅ Sirf ek login function
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl w-[400px]">
        <h1 className="text-3xl font-bold mb-6">LegalVault Login</h1>

        <form onSubmit={handleSubmit}>  {/* ✅ Form mein onSubmit */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-slate-700 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-slate-700 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"  // ✅ type submit
            className="w-full bg-blue-600 py-3 rounded hover:bg-blue-700"
          >
            Login
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;