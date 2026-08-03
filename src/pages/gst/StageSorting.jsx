import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { 
  FaSpinner, FaSort, FaCheckCircle, FaArrowRight, 
  FaFileInvoice, FaFileAlt, FaFilePdf, FaFile 
} from "react-icons/fa";
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
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/gst-automation/${id}/sort`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSorted(response.data.sorted);
      alert('✅ Documents sorted successfully!');
      fetchAutomation();
    } catch (error) {
      console.error('❌ Sort error:', error);
      setError('Failed to sort documents: ' + (error.response?.data?.message || error.message));
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
      setError('Failed to proceed to next stage');
    }
  };

  const totalDocs = automation?.documents?.length || 0;

  // ✅ Category icons
  const categoryIcons = {
    saleInvoices: <FaFileInvoice className="text-cyan-400" />,
    purchaseInvoices: <FaFileAlt className="text-purple-400" />,
    bankStatements: <FaFilePdf className="text-emerald-400" />,
    ledgers: <FaFile className="text-amber-400" />
  };

  const categoryLabels = {
    saleInvoices: 'Sale Invoices',
    purchaseInvoices: 'Purchase Invoices',
    bankStatements: 'Bank Statements',
    ledgers: 'Ledgers'
  };

  const categoryColors = {
    saleInvoices: 'from-cyan-500 to-blue-400',
    purchaseInvoices: 'from-purple-500 to-pink-400',
    bankStatements: 'from-emerald-500 to-teal-400',
    ledgers: 'from-amber-500 to-orange-400'
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
        <h1 className="text-2xl font-bold">📂 Stage 2: Auto-Sort & Organise</h1>
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
      {sorted && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(sorted).map(([key, docs]) => {
            const count = docs?.length || 0;
            return (
              <div key={key} className="glass-card p-6 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[key] || 'from-gray-500 to-gray-400'} flex items-center justify-center text-white text-lg`}>
                    {categoryIcons[key] || <FaFile />}
                  </div>
                  <div>
                    <h3 className="font-bold">{categoryLabels[key] || key}</h3>
                    <p className="text-white/40 text-sm">{count} documents</p>
                  </div>
                  {count > 0 && (
                    <span className="ml-auto text-emerald-400">
                      <FaCheckCircle />
                    </span>
                  )}
                </div>
                
                {count === 0 ? (
                  <p className="text-white/30 text-sm">No documents in this category</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {docs.map((doc, index) => (
                      <div key={doc._id || index} className="bg-slate-800/30 border border-white/5 rounded-lg px-3 py-2 text-sm flex justify-between items-center">
                        <span className="truncate">{doc.filename || doc.name || `Document ${index + 1}`}</span>
                        <span className="text-white/30 text-xs">{(doc.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
            <p className="text-2xl font-bold">
              {sorted ? Object.values(sorted).filter(arr => arr?.length > 0).length : 0}
            </p>
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
          onClick={handleNext}
          disabled={!sorted || totalDocs === 0}
          className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          Next: Data Entry <FaArrowRight />
        </button>
      </div>
    </MainLayout>
  );
}

export default GSTSorting;