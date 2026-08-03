import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { 
  FaSpinner, FaCheckCircle, FaExclamationTriangle, 
  FaArrowRight, FaDatabase, FaEdit, FaFileAlt 
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function StageDataEntry() {
  const { automationId } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchAutomationDetails();
    fetchExtractedData();
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

  const fetchExtractedData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/automation/${automationId}/extracted`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.extractedData) {
        setExtractedData(response.data.extractedData);
        setValidationResults(response.data.validationResults);
        setEditedData(response.data.extractedData);
      }
    } catch (error) {
      console.error('❌ Error fetching extracted data:', error);
    }
  };

  const handleExtract = async () => {
    setExtracting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // ✅ Send request with body
      const response = await axios.post(
        `${API_URL}/api/automation/${automationId}/extract`,
        { action: 'extract' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExtractedData(response.data.extractedData);
      setValidationResults(response.data.validationResults);
      setEditedData(response.data.extractedData);
      alert('✅ Data extraction completed!');
    } catch (error) {
      console.error('❌ Extract error:', error);
      setError('Failed to extract data: ' + (error.response?.data?.message || error.message));
    } finally {
      setExtracting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  const handleSaveEdits = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'data_entry',
        status: 'processing',
        extractedData: {
          ...extractedData,
          ...editedData
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExtractedData(editedData);
      alert('✅ Changes saved successfully!');
    } catch (error) {
      console.error('❌ Save error:', error);
      setError('Failed to save changes');
    }
  };

  const handleNextStage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'compliance',
        status: 'processing'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/automation/${automationId}/compliance`);
    } catch (error) {
      console.error('❌ Stage update error:', error);
      setError('Failed to move to next stage');
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
        <h1 className="text-2xl font-bold">📊 Stage 3: Data Entry Automation</h1>
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

      {/* Extract Action */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">🤖 AI Data Extraction</h2>
            <p className="text-white/40 text-sm">
              {extractedData ? 'Data extracted successfully' : 'Extract data from documents'}
            </p>
          </div>
          {!extractedData ? (
            <button
              onClick={handleExtract}
              disabled={extracting || totalDocuments === 0}
              className="glass-card px-6 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            >
              {extracting ? <FaSpinner className="animate-spin" /> : <FaDatabase />}
              {extracting ? 'Extracting...' : totalDocuments === 0 ? 'No Documents' : 'Extract Data'}
            </button>
          ) : (
            <button
              onClick={handleSaveEdits}
              className="glass-card px-6 py-3 flex items-center gap-2 text-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.2)]"
            >
              <FaCheckCircle />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Extracted Data Display */}
      {extractedData && (
        <>
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">📋 Extracted Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(editedData).map(([key, value]) => {
                if (key === 'extractedAt' || key === 'documentCount') return null;
                return (
                  <div key={key} className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
                    <label className="text-white/40 text-sm uppercase block mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <div className="flex items-center gap-2">
                      <FaEdit className="text-white/20" />
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="bg-transparent text-white w-full focus:outline-none border-b border-white/10 focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-white/40 text-sm">
              Document Count: <span className="text-white">{extractedData.documentCount || totalDocuments}</span>
            </div>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <div className="glass-card p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">✅ Validation Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-sm">Total Checks</p>
                  <p className="text-2xl font-bold">{validationResults.totalChecks || 0}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-sm">Passed</p>
                  <p className="text-2xl font-bold text-emerald-400">{validationResults.passed || 0}</p>
                </div>
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{validationResults.failed || 0}</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${
                  validationResults.failed === 0 
                    ? 'bg-emerald-500/10 border-emerald-400/30' 
                    : 'bg-amber-500/10 border-amber-400/30'
                }`}>
                  <p className="text-white/40 text-sm">Status</p>
                  <p className={`text-sm font-bold ${validationResults.failed === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {validationResults.failed === 0 ? '✅ All Passed' : '⚠️ Needs Review'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(validationResults).map(([key, value]) => {
                  if (typeof value !== 'boolean') return null;
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
          )}
        </>
      )}

      {/* Next Stage Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNextStage}
          disabled={!extractedData}
          className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          Next: Compliance <FaArrowRight />
        </button>
      </div>
    </MainLayout>
  );
}

export default StageDataEntry;