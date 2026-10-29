import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ConfirmFiling() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirm = async () => {
      try {
        const res = await api.get(`/api/compliance/confirm-filing/${id}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Something went wrong.");
      }
    };
    if (id) confirm();
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="glass p-10 rounded-2xl max-w-md w-full text-center">
        {status === "loading" && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <h2 className="text-xl text-white">Confirming your filing...</h2>
          </div>
        )}
        {status === "success" && (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Filing Confirmed!</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <button onClick={() => navigate("/compliance")} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg transition">
              Go to Compliance Dashboard
            </button>
          </div>
        )}
        {status === "error" && (
          <div>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Oops!</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <button onClick={() => navigate("/compliance")} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition">
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}