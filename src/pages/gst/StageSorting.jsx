import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaSpinner, FaSort, FaCheckCircle, FaArrowRight, FaFileInvoice } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function GSTSorting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [sorted, setSorted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState(false);
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
      if (response.data.sortedDocuments) {
        setSorted(response.data.sortedDocuments);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = async () => {
    setSorting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/gst-automation/${id}/sort`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSorted(response.data.sorted);
      alert('✅ Documents sorted successfully!');
    } catch (error) {
      console.error('❌ Sort error:', error);
      setError('Failed to sort documents');
    } finally {
      setSorting(false);
    }
  };

  const handleNext = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/gst-automation/${id}/extract`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/gst/dataentry/${id}`);
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Failed to proceed');
    }
  };

  if (loading) return <MainLayout><div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-3xl" /></div></MainLayout>;

  const totalDocs = automation?.documents?.length || 0;

  return (
    <MainLayout>
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">📂 Stage 2: Auto-Sort & Organise</h1>
        <p className="text-white/60 mt-1">Client: {automation?.clientId?.name || 'N/A'}</p>
        <p className="text-white/40 text-sm">Documents: <span className="text-white font-bold">{totalDocs}</span></p>
      </div>

      {error && <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 text-red-300">❌ {error}</div>}

      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">📄 Documents ({totalDocs})</h2>
            <p className="text-white/40 text-sm">AI will sort documents into categories</p>
          </div>
          <button onClick={handleSort} disabled={sorting || totalDocs === 0} className="glass-card px-6 py-3 flex items-center gap-2 text-white disabled:opacity-50">
            {sorting ? <FaSpinner className="animate-spin" /> : <FaSort />}
            {sorting ? 'Sorting...' : totalDocs === 0 ? 'No Documents' : 'Auto-Sort Now'}
          </button>
        </div>
      </div>

      {sorted && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(sorted).map(([key, docs]) => (
            <div key={key} className="glass-card p-6">
              <h3 className="font-bold capitalize mb-2">{key.replace(/([A-Z])/g, ' $1')}</h3>
              <p className="text-white/40 text-sm">{docs?.length || 0} documents</p>
              {docs?.length > 0 && <FaCheckCircle className="text-emerald-400 mt-2" />}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleNext} disabled={!sorted} className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50">
          Next: Data Entry <FaArrowRight />
        </button>
      </div>
    </MainLayout>
  );
}

export default GSTSorting;