import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaDatabase, FaCheckCircle, FaEdit } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function StageDataEntry() {
  const { automationId } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [extractedData, setExtractedData] = useState({
    clientName: '',
    caseNumber: '',
    courtName: '',
    filingDate: '',
    nextHearing: ''
  });
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    fetchAutomationDetails();
    simulateExtraction();
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

  const simulateExtraction = () => {
    setTimeout(() => {
      setExtractedData({
        clientName: automation?.clientId?.name || 'ABC Legal Corp',
        caseNumber: 'CIV-2026-001',
        courtName: 'Delhi High Court',
        filingDate: '2026-08-01',
        nextHearing: '2026-09-15'
      });
      setProcessing(false);
    }, 3000);
  };

  const handleInputChange = (e) => {
    setExtractedData({
      ...extractedData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'compliance',
        status: 'processing',
        extractedData: extractedData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/automation/${automationId}/compliance`);
    } catch (error) {
      console.error('❌ Stage update error:', error);
    }
  };

  return (
    <MainLayout>
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">📊 Stage 3: Data Entry Automation</h1>
        <p className="text-white/60 mt-1">AI extracted data for client: {automation?.clientId?.name || 'N/A'}</p>
      </div>

      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <FaDatabase className="text-2xl text-amber-400" />
          <h2 className="text-xl font-bold">Extracted Data</h2>
        </div>

        {processing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-white/60">AI is extracting data from documents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(extractedData).map(([key, value]) => (
              <div key={key} className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
                <label className="text-white/40 text-sm uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                <div className="flex items-center gap-2 mt-1">
                  <FaEdit className="text-white/20" />
                  <input
                    type="text"
                    name={key}
                    value={value}
                    onChange={handleInputChange}
                    className="bg-transparent text-white w-full focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNextStage}
          disabled={processing}
          className="glass-card px-8 py-3 text-white disabled:opacity-50"
        >
          Next: Compliance →
        </button>
      </div>
    </MainLayout>
  );
}

export default StageDataEntry;