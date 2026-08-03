import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { 
  FaSpinner, FaFilePdf, FaCheckCircle, FaExclamationTriangle,
  FaArrowRight, FaUsers, FaGavel, FaChartBar 
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function GSTFiling() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [filing, setFiling] = useState(null);
  const [validations, setValidations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filingStatus, setFilingStatus] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAutomation();
  }, [id]);

  const fetchAutomation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gst-automation/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomation(response.data);
      if (response.data.gstFiling) {
        setFiling(response.data.gstFiling);
        setValidations(response.data.validations);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async () => {
    setFilingStatus(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/gst-automation/${id}/file`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setFiling(response.data.filingResult);
      setValidations(response.data.validationResults);
      alert(response.data.message);
      fetchAutomation();
    } catch (error) {
      console.error('❌ Filing error:', error);
      setError('Failed to file GST: ' + (error.response?.data?.message || error.message));
    } finally {
      setFilingStatus(false);
    }
  };

  const handleComplete = () => {
    navigate('/gst');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-cyan-400" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">⚖️ Stage 4: GST Filing</h1>
        <p className="text-white/60 mt-1">
          Client: <span className="text-white">{automation?.clientId?.name || 'N/A'}</span>
        </p>
        <p className="text-white/40 text-sm">
          Month: <span className="text-white">{automation?.month || 'N/A'}</span>
        </p>
        <p className="text-white/40 text-sm">
          Status: <span className={`font-bold ${
            automation?.status === 'completed' ? 'text-emerald-400' : 
            automation?.status === 'failed' ? 'text-red-400' : 'text-amber-400'
          }`}>
            {automation?.status || 'pending'}
          </span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 text-red-300">
          ❌ {error}
        </div>
      )}

      {/* File Action */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">📄 GST Filing</h2>
            <p className="text-white/40 text-sm">
              {filing ? 'Filing completed' : 'File GSTR1 & GSTR3B with 30+ validations'}
            </p>
          </div>
          <button
            onClick={handleFile}
            disabled={filingStatus || automation?.status === 'completed'}
            className="glass-card px-6 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          >
            {filingStatus ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            {filingStatus ? 'Filing...' : automation?.status === 'completed' ? '✅ Filed' : 'File GST'}
          </button>
        </div>
      </div>

      {/* Validations */}
      {validations && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <p className="text-white/40 text-sm">Total Checks</p>
            <p className="text-2xl font-bold">{validations.totalChecks || 0}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 text-center">
            <p className="text-white/40 text-sm">Passed</p>
            <p className="text-2xl font-bold text-emerald-400">{validations.passed || 0}</p>
          </div>
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 text-center">
            <p className="text-white/40 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-400">{validations.failed || 0}</p>
          </div>
          <div className={`rounded-xl p-4 text-center ${
            validations.failed === 0 ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-amber-500/10 border-amber-400/30'
          }`}>
            <p className="text-white/40 text-sm">Status</p>
            <p className={`text-sm font-bold ${
              validations.failed === 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {validations.failed === 0 ? '✅ All Passed' : '⚠️ Needs Review'}
            </p>
          </div>
        </div>
      )}

      {/* Validation Details */}
      {validations && validations.results && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">✅ Validation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {Object.entries(validations.results).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between bg-slate-800/30 border border-white/5 rounded-lg px-4 py-2">
                <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                {value ? (
                  <FaCheckCircle className="text-emerald-400" />
                ) : (
                  <FaExclamationTriangle className="text-red-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filing Status */}
      {filing && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📋 Filing Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">GSTR1</p>
              <p className={`font-bold ${
                filing.gstr1?.status === 'filed' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {filing.gstr1?.status || 'Pending'}
              </p>
              {filing.gstr1?.filedAt && (
                <p className="text-xs text-white/30">{new Date(filing.gstr1.filedAt).toLocaleDateString()}</p>
              )}
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">GSTR3B</p>
              <p className={`font-bold ${
                filing.gstr3b?.status === 'filed' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {filing.gstr3b?.status || 'Pending'}
              </p>
              {filing.gstr3b?.filedAt && (
                <p className="text-xs text-white/30">{new Date(filing.gstr3b.filedAt).toLocaleDateString()}</p>
              )}
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">Payment</p>
              <p className={`font-bold ${
                filing.payment?.status === 'paid' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {filing.payment?.status || 'Pending'}
              </p>
              {filing.payment?.amount && (
                <p className="text-xs text-white/30">₹{filing.payment.amount.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complete Button */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          className="glass-card px-8 py-3 flex items-center gap-2 text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          ✅ Complete Automation
        </button>
      </div>
    </MainLayout>
  );
}

export default GSTFiling;