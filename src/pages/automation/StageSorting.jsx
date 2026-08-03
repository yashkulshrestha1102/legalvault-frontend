import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { 
  FaFileContract, FaGavel, FaFileSignature, FaFileAlt, 
  FaCheckCircle, FaSpinner, FaArrowRight, FaSort 
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function StageSorting() {
  const { automationId } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [sortedDocs, setSortedDocs] = useState({
    contracts: [],
    petitions: [],
    affidavits: [],
    others: []
  });
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState(false);
  const [error, setError] = useState('');

  // ✅ Fetch automation details
  const fetchAutomationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/automation/${automationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomation(response.data);

      // ✅ Check if already sorted
      if (response.data.extractedData?.sortedDocuments) {
        setSortedDocs(response.data.extractedData.sortedDocuments);
      }
    } catch (error) {
      console.error('❌ Error fetching automation:', error);
      setError('Failed to load automation details');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchAutomationDetails();
  }, [automationId]);

  // ✅ Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAutomationDetails();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [automationId]);

  // ✅ Auto-Sort handler
  const handleSort = async () => {
    setSorting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/automation/${automationId}/sort`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSortedDocs(response.data.sorted);
      alert('✅ Documents sorted successfully!');
    } catch (error) {
      console.error('❌ Sort error:', error);
      setError('Failed to sort documents');
    } finally {
      setSorting(false);
    }
  };

  // ✅ Next Stage handler
  const handleNextStage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'data_entry',
        status: 'processing'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/automation/${automationId}/dataentry`);
    } catch (error) {
      console.error('❌ Stage update error:', error);
      setError('Failed to move to next stage');
    }
  };

  // ✅ Calculate total documents
  const totalDocs = Object.values(sortedDocs).reduce((acc, arr) => acc + arr.length, 0);

  // ✅ Categories configuration
  const categories = [
    { key: 'contracts', label: 'Contracts', icon: <FaFileContract className="text-cyan-400" />, color: 'from-cyan-500 to-blue-400' },
    { key: 'petitions', label: 'Petitions', icon: <FaGavel className="text-purple-400" />, color: 'from-purple-500 to-pink-400' },
    { key: 'affidavits', label: 'Affidavits', icon: <FaFileSignature className="text-emerald-400" />, color: 'from-emerald-500 to-teal-400' },
    { key: 'others', label: 'Others', icon: <FaFileAlt className="text-amber-400" />, color: 'from-amber-500 to-orange-400' }
  ];

  // ✅ Loading state
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

  return (
    <MainLayout>
      {/* Header */}
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">📂 Stage 2: Auto-Sort & Organise</h1>
        <p className="text-white/60 mt-1">
          Client: <span className="text-white">{automation?.clientId?.name || 'N/A'}</span>
        </p>
        <p className="text-white/40 text-sm">
          Status: <span className="capitalize">{automation?.status || 'pending'}</span>
        </p>
        <p className="text-white/40 text-sm">
          Documents: <span className="text-white">{totalDocs}</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 text-red-300">
          ❌ {error}
        </div>
      )}

      {/* Sort Action */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">📄 Documents ({totalDocs})</h2>
            <p className="text-white/40 text-sm">AI will sort documents into categories</p>
          </div>
          <button
            onClick={handleSort}
            disabled={sorting || totalDocs === 0}
            className="glass-card px-6 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          >
            {sorting ? <FaSpinner className="animate-spin" /> : <FaSort />}
            {sorting ? 'Sorting...' : totalDocs === 0 ? 'No Documents' : 'Auto-Sort Now'}
          </button>
        </div>
      </div>

      {/* Sorted Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {categories.map((cat) => {
          const docs = sortedDocs[cat.key] || [];
          return (
            <div key={cat.key} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold">{cat.label}</h3>
                  <p className="text-white/40 text-sm">{docs.length} documents</p>
                </div>
                {docs.length > 0 && (
                  <span className="ml-auto text-emerald-400">
                    <FaCheckCircle />
                  </span>
                )}
              </div>
              
              {docs.length === 0 ? (
                <p className="text-white/30 text-sm">No documents in this category</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {docs.map((doc, index) => (
                    <div key={doc._id || index} className="bg-slate-800/30 border border-white/5 rounded-lg px-3 py-2 text-sm flex justify-between items-center">
                      <span className="truncate">{doc.name || `Document ${index + 1}`}</span>
                      <span className="text-white/30 text-xs">{(doc.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="glass-card p-6 mb-8">
        <h3 className="font-bold mb-2">📊 Sorting Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/40 text-sm">Total Documents</p>
            <p className="text-2xl font-bold">{totalDocs}</p>
          </div>
          <div>
            <p className="text-white/40 text-sm">Categories</p>
            <p className="text-2xl font-bold">{categories.filter(c => sortedDocs[c.key]?.length > 0).length}</p>
          </div>
          <div>
            <p className="text-white/40 text-sm">Sorted</p>
            <p className="text-2xl font-bold text-emerald-400">
              {totalDocs > 0 ? '✅' : '⏳'}
            </p>
          </div>
          <div>
            <p className="text-white/40 text-sm">Status</p>
            <p className={`text-sm font-bold ${totalDocs > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalDocs > 0 ? 'Ready' : 'Waiting'}
            </p>
          </div>
        </div>
      </div>

      {/* Next Stage Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNextStage}
          disabled={totalDocs === 0}
          className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          Next: Data Entry <FaArrowRight />
        </button>
      </div>
    </MainLayout>
  );
}

export default StageSorting;