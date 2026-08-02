import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaSort, FaFolderOpen, FaCheckCircle } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function StageSorting() {
  const { automationId } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [sortingComplete, setSortingComplete] = useState(false);

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
      setDocuments(response.data.documents || []);
      
      // Auto-sort simulation (in real app, AI would do this)
      if (response.data.documents?.length > 0) {
        setTimeout(() => setSortingComplete(true), 2000);
      }
    } catch (error) {
      console.error('❌ Error fetching automation:', error);
    }
  };

  const handleNextStage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'data_entry',
        status: 'processing',
        extractedData: {
          sortedDocuments: documents.map(d => d._id)
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/automation/${automationId}/dataentry`);
    } catch (error) {
      console.error('❌ Stage update error:', error);
    }
  };

  return (
    <MainLayout>
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">📂 Stage 2: Auto-Sort & Organise</h1>
        <p className="text-white/60 mt-1">AI is sorting documents for client: {automation?.clientId?.name || 'N/A'}</p>
      </div>

      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <FaSort className="text-2xl text-purple-400" />
          <h2 className="text-xl font-bold">Sorting in progress...</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FaFolderOpen className="text-cyan-400" />
              <span>Contracts</span>
              <span className="text-white/40">(3 documents)</span>
            </div>
          </div>
          <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FaFolderOpen className="text-purple-400" />
              <span>Petitions</span>
              <span className="text-white/40">(2 documents)</span>
            </div>
          </div>
          <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FaFolderOpen className="text-emerald-400" />
              <span>Affidavits</span>
              <span className="text-white/40">(1 document)</span>
            </div>
          </div>
        </div>

        {sortingComplete && (
          <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center gap-3">
            <FaCheckCircle className="text-emerald-400" />
            <span className="text-emerald-400">Sorting complete! Documents organized by type.</span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNextStage}
          disabled={!sortingComplete}
          className="glass-card px-8 py-3 text-white disabled:opacity-50"
        >
          Next: Data Entry →
        </button>
      </div>
    </MainLayout>
  );
}

export default StageSorting;