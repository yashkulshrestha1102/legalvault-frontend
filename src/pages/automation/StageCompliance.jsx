import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { 
  FaSpinner, FaCheckCircle, FaExclamationTriangle, 
  FaArrowRight, FaFilePdf, FaCalendarAlt, 
  FaUsers, FaGavel, FaChartBar 
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function StageCompliance() {
  const { automationId } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [complianceReport, setComplianceReport] = useState(null);
  const [validations, setValidations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAutomationDetails();
    fetchComplianceReport();
  }, [automationId]);

  const fetchAutomationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/automation/${automationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomation(response.data);
    } catch (error) {
      console.error('❌ Error fetching automation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplianceReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/automation/${automationId}/compliance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.complianceReport) {
        setComplianceReport(response.data.complianceReport);
        setValidations(response.data.validations);
      }
    } catch (error) {
      console.error('❌ Error fetching compliance:', error);
    }
  };

  const handleComplianceCheck = async () => {
    setChecking(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/automation/${automationId}/compliance`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComplianceReport(response.data.complianceReport);
      setValidations(response.data.complianceReport.validations);
      alert('✅ Compliance check completed!');
    } catch (error) {
      console.error('❌ Compliance error:', error);
      setError('Failed to run compliance check');
    } finally {
      setChecking(false);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'compliance',
        status: 'completed'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('🎉 Automation completed successfully!');
      navigate('/automation');
    } catch (error) {
      console.error('❌ Completion error:', error);
      setError('Failed to complete automation');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalDocuments = automation?.documents?.length || 0;

  return (
    <MainLayout>
      {/* Header */}
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">⚖️ Stage 4: Compliance Automation</h1>
        <p className="text-white/60 mt-1">
          Client: <span className="text-white">{automation?.clientId?.name || 'N/A'}</span>
        </p>
        <p className="text-white/40 text-sm">
          Status: <span className="capitalize">{automation?.status || 'pending'}</span>
        </p>
        <p className="text-white/40 text-sm">
          Documents: <span className="text-white font-bold">{totalDocuments}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 text-red-300">
          ❌ {error}
        </div>
      )}

      {/* Compliance Action */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">⚖️ 30+ Validations</h2>
            <p className="text-white/40 text-sm">
              {complianceReport ? 'Compliance check completed' : 'Run compliance check'}
            </p>
          </div>
          {!complianceReport ? (
            <button
              onClick={handleComplianceCheck}
              disabled={checking || totalDocuments === 0}
              className="glass-card px-6 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            >
              {checking ? <FaSpinner className="animate-spin" /> : <FaGavel />}
              {checking ? 'Checking...' : 'Run Compliance Check'}
            </button>
          ) : (
            <span className="glass-card px-6 py-3 flex items-center gap-2 text-emerald-400">
              <FaCheckCircle />
              {complianceReport.status === 'compliant' ? '✅ All Compliant' : '⚠️ Needs Review'}
            </span>
          )}
        </div>
      </div>

      {/* Compliance Report */}
      {complianceReport && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 text-center">
              <p className="text-white/40 text-sm">Total Validations</p>
              <p className="text-2xl font-bold">{complianceReport.validations?.validationCount || 0}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 text-center">
              <p className="text-white/40 text-sm">Passed</p>
              <p className="text-2xl font-bold text-emerald-400">{complianceReport.validations?.passedCount || 0}</p>
            </div>
            <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 text-center">
              <p className="text-white/40 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-400">{complianceReport.validations?.failedCount || 0}</p>
            </div>
            <div className={`border rounded-xl p-4 text-center ${
              complianceReport.status === 'compliant' 
                ? 'bg-emerald-500/10 border-emerald-400/30' 
                : 'bg-amber-500/10 border-amber-400/30'
            }`}>
              <p className="text-white/40 text-sm">Status</p>
              <p className={`text-sm font-bold ${
                complianceReport.status === 'compliant' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {complianceReport.status === 'compliant' ? '✅ Compliant' : '⚠️ Needs Review'}
              </p>
            </div>
          </div>

          {/* Document Info */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">📄 Document Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
                <p className="text-white/40 text-sm">Total Documents</p>
                <p className="text-2xl font-bold">{complianceReport.documentCount || 0}</p>
              </div>
              <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
                <p className="text-white/40 text-sm">Case Number</p>
                <p className="text-sm font-mono">{complianceReport.caseNumber || 'N/A'}</p>
              </div>
              <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
                <p className="text-white/40 text-sm">Next Hearing</p>
                <p className="text-sm">{complianceReport.nextHearing || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Validation Details */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">✅ Validation Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {validations && Object.entries(validations).map(([key, value]) => {
                if (typeof value !== 'boolean' || key === 'passedCount' || key === 'failedCount' || key === 'validationCount') return null;
                return (
                  <div key={key} className="flex items-center justify-between bg-slate-800/30 border border-white/5 rounded-lg px-4 py-2">
                    <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    {value ? (
                      <FaCheckCircle className="text-emerald-400" />
                    ) : (
                      <FaExclamationTriangle className="text-red-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Complete Button */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={!complianceReport || complianceReport.status !== 'compliant'}
          className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          ✅ Complete Automation
        </button>
      </div>
    </MainLayout>
  );
}

export default StageCompliance;