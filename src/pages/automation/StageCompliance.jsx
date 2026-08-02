import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaCheckCircle, FaExclamationTriangle, FaCalendarAlt, FaFilePdf } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function StageCompliance() {
  const { automationId } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [validations, setValidations] = useState([
    { id: 1, check: 'Case Number Format', status: 'passed' },
    { id: 2, check: 'Court Name Verification', status: 'passed' },
    { id: 3, check: 'Filing Date Valid', status: 'failed', issue: 'Date is in the past' },
    { id: 4, check: 'Next Hearing Scheduled', status: 'passed' },
    { id: 5, check: 'Document Completeness', status: 'warning' },
  ]);

  useEffect(() => {
    fetchAutomationDetails();
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
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'compliance',
        status: 'completed',
        validationResults: validations
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Automation completed successfully!');
      navigate('/automation');
    } catch (error) {
      console.error('❌ Completion error:', error);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'passed') return <FaCheckCircle className="text-emerald-400" />;
    if (status === 'failed') return <FaExclamationTriangle className="text-red-400" />;
    return <FaExclamationTriangle className="text-amber-400" />;
  };

  return (
    <MainLayout>
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">⚖️ Stage 4: Compliance Automation</h1>
        <p className="text-white/60 mt-1">Client: {automation?.clientId?.name || 'N/A'}</p>
      </div>

      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <FaCalendarAlt className="text-2xl text-emerald-400" />
          <h2 className="text-xl font-bold">Compliance Validations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validations.map(v => (
            <div key={v.id} className="bg-slate-800/30 border border-white/10 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p>{v.check}</p>
                {v.issue && <p className="text-sm text-red-400">{v.issue}</p>}
              </div>
              <div className="text-xl">
                {getStatusIcon(v.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <FaFilePdf className="text-2xl text-red-400" />
            <div>
              <p className="font-medium">Compliance Report Ready</p>
              <p className="text-sm text-white/40">Download summary of validations</p>
            </div>
            <button className="ml-auto glass-card px-4 py-2 text-sm text-white">
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          className="glass-card px-8 py-3 text-white"
        >
          ✅ Complete Automation
        </button>
      </div>
    </MainLayout>
  );
}

export default StageCompliance;