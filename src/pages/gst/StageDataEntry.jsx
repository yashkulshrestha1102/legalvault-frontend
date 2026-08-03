import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaSpinner, FaDatabase, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function GSTDataEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
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
      if (response.data.extractedData) {
        setExtracted(response.data.extractedData);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/gst-automation/${id}/extract`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExtracted(response.data.extractedData);
      alert('✅ Data extraction completed!');
    } catch (error) {
      console.error('❌ Extract error:', error);
      setError('Failed to extract data');
    } finally {
      setExtracting(false);
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
      setError('Failed to proceed');
    }
  };

  if (loading) return <MainLayout><div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-3xl" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">📊 Stage 3: Data Entry Automation</h1>
        <p className="text-white/60 mt-1">Client: {automation?.clientId?.name || 'N/A'}</p>
      </div>

      {error && <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 text-red-300">❌ {error}</div>}

      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">🤖 AI Data Extraction</h2>
            <p className="text-white/40 text-sm">{extracted ? 'Data extracted' : 'Extract data from documents'}</p>
          </div>
          <button onClick={handleExtract} disabled={extracting} className="glass-card px-6 py-3 flex items-center gap-2 text-white disabled:opacity-50">
            {extracting ? <FaSpinner className="animate-spin" /> : <FaDatabase />}
            {extracting ? 'Extracting...' : 'Extract Data'}
          </button>
        </div>
      </div>

      {extracted && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📋 Extracted Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">Total Sales</p>
              <p className="text-xl font-bold">₹{extracted.totalSales?.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">Total Purchases</p>
              <p className="text-xl font-bold">₹{extracted.totalPurchases?.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">GST Collected</p>
              <p className="text-xl font-bold text-emerald-400">₹{extracted.totalGstCollected?.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-sm">GST Paid</p>
              <p className="text-xl font-bold text-amber-400">₹{extracted.totalGstPaid?.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4 col-span-2">
              <p className="text-white/40 text-sm">Net GST Liability</p>
              <p className={`text-2xl font-bold ${extracted.netGstLiability > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                ₹{extracted.netGstLiability?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleNext} disabled={!extracted} className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50">
          Next: GST Filing <FaArrowRight />
        </button>
      </div>
    </MainLayout>
  );
}

export default GSTDataEntry;