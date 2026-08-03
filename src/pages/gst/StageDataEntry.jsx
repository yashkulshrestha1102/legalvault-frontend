import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { 
  FaSpinner, FaDatabase, FaCheckCircle, FaExclamationTriangle,
  FaArrowRight, FaEdit, FaFileAlt 
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function GSTDataEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchAutomation();
    fetchExtractedData();
  }, [id]);

  const fetchAutomation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gst-automation/${id}`, {
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
      const response = await axios.get(`${API_URL}/api/gst-automation/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.extractedData) {
        setExtractedData(response.data.extractedData);
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
      const response = await axios.post(
        `${API_URL}/api/gst-automation/${id}/extract`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExtractedData(response.data.extractedData);
      setEditedData(response.data.extractedData);
      alert('✅ Data extraction completed!');
      fetchAutomation();
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
      await axios.put(`${API_URL}/api/gst-automation/${id}/stage`, {
        stage: 'data_entry',
        status: 'processing',
        extractedData: editedData
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

  const handleNext = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/gst-automation/${id}/file`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/gst/filing/${id}`);
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Failed to proceed to next stage');
    }
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

  const totalDocs = automation?.documents?.length || 0;

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
          Documents: <span className="text-white font-bold">{totalDocs}</span>
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
              disabled={extracting || totalDocs === 0}
              className="glass-card px-6 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            >
              {extracting ? <FaSpinner className="animate-spin" /> : <FaDatabase />}
              {extracting ? 'Extracting...' : totalDocs === 0 ? 'No Documents' : 'Extract Data'}
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
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📋 Extracted Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">Total Sales</p>
              <p className="text-xl font-bold text-emerald-400">
                ₹{(editedData.totalSales || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">Total Purchases</p>
              <p className="text-xl font-bold text-amber-400">
                ₹{(editedData.totalPurchases || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">GST Collected</p>
              <p className="text-xl font-bold text-cyan-400">
                ₹{(editedData.totalGstCollected || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">GST Paid</p>
              <p className="text-xl font-bold text-purple-400">
                ₹{(editedData.totalGstPaid || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4 col-span-2">
              <p className="text-white/40 text-sm">Net GST Liability</p>
              <p className={`text-2xl font-bold ${(editedData.netGstLiability || 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                ₹{(editedData.netGstLiability || 0).toLocaleString()}
              </p>
              <p className="text-xs text-white/30 mt-1">
                Invoice Count: {extractedData.invoiceCount || 0} | Purchase Count: {extractedData.purchaseCount || 0}
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(editedData).map(([key, value]) => {
              if (key === 'extractedAt' || key === 'gstr1Data' || key === 'gstr3bData') return null;
              return (
                <div key={key} className="bg-slate-800/30 border border-white/10 rounded-xl p-3">
                  <label className="text-white/40 text-xs uppercase block mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <div className="flex items-center gap-2">
                    <FaEdit className="text-white/20" />
                    <input
                      type="number"
                      value={value || 0}
                      onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)}
                      className="bg-transparent text-white w-full focus:outline-none border-b border-white/10 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Stage Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!extractedData}
          className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          Next: GST Filing <FaArrowRight />
        </button>
      </div>
    </MainLayout>
  );
}

export default GSTDataEntry;