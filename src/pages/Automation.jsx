import MainLayout from "../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaCloudUploadAlt, FaSort, FaDatabase, FaCheckCircle, FaPlay, FaSpinner } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


const API_URL = 'https://legalvault-jm2n.onrender.com';

function Automation() {
  const [stages, setStages] = useState({
    collection: 0,
    sorting: 0,
    data_entry: 0,
    compliance: 0
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();


  // ✅ Fetch dashboard data
  useEffect(() => {
    fetchDashboard();
    fetchClients();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/automation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // ✅ Map stage data
      const stageMap = {};
      response.data.stages.forEach(item => {
        stageMap[item._id] = item.count;
      });
      setStages({
        collection: stageMap.collection || 0,
        sorting: stageMap.sorting || 0,
        data_entry: stageMap.data_entry || 0,
        compliance: stageMap.compliance || 0
      });
      setRecent(response.data.recent || []);
    } catch (error) {
      console.error('❌ Error fetching automation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
    }
  };

  // ✅ Start automation for selected client
  const startAutomation = async () => {
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }

    setStarting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/automation/start`, 
        { clientId: selectedClient },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Automation started successfully!');
      fetchDashboard(); // Refresh stats
      setSelectedClient('');
    } catch (error) {
      console.error('❌ Error starting automation:', error);
      alert('❌ Failed to start automation: ' + (error.response?.data?.message || error.message));
    } finally {
      setStarting(false);
    }
  };

  // ✅ Stage cards data
  const stageCards = [
    { key: 'collection', label: 'Document Collection', icon: <FaCloudUploadAlt />, color: 'from-blue-500 to-cyan-400' },
    { key: 'sorting', label: 'Sorting', icon: <FaSort />, color: 'from-purple-500 to-pink-400' },
    { key: 'data_entry', label: 'Data Entry', icon: <FaDatabase />, color: 'from-amber-500 to-orange-400' },
    { key: 'compliance', label: 'Compliance', icon: <FaCheckCircle />, color: 'from-emerald-500 to-teal-400' }
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Automation Dashboard...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[180px]" />
      </div>

      {/* Header */}
      <div className="glass-card p-6 mb-8">
        <h1 className="text-3xl font-bold">🤖 Automation Dashboard</h1>
        <p className="text-white/60 mt-1">Streamline your legal workflows with AI-powered automation</p>
      </div>

      {/* 4 Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stageCards.map((card) => (
          <div key={card.key} className="glass-card p-6 hover:scale-[1.02] transition-transform">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-xl mb-4`}>
              {card.icon}
            </div>
            <h3 className="text-lg font-semibold">{card.label}</h3>
            <p className="text-3xl font-bold mt-2">{stages[card.key] || 0}</p>
            <p className="text-white/40 text-sm mt-1">Active processes</p>
          </div>
        ))}
      </div>

      {/* Start New Automation */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">🚀 Start New Automation</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">Select a client...</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.name} - {client.email}
              </option>
            ))}
          </select>
          <button
            onClick={startAutomation}
            disabled={starting || !selectedClient}
            className="glass-card px-6 py-3 flex items-center justify-center gap-2 text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starting ? <FaSpinner className="animate-spin" /> : <FaPlay />}
            {starting ? 'Starting...' : 'Start Automation'}
          </button>
        </div>
      </div>

      {/* Recent Automations */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">📋 Recent Automations</h2>
        {recent.length === 0 ? (
          <p className="text-white/40">No recent automations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2">Client</th>
                  <th className="text-left py-2">Stage</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Assigned To</th>
                  <th className="text-left py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(item => (
                  <tr key={item._id} onClick={() => navigate(`/automation/${item._id}/collection`)} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2">{item.clientId?.name || 'N/A'}</td>
                    <td className="py-2 capitalize">{item.stage}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                        item.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2">{item.assignedTo?.name || 'Unassigned'}</td>
                    <td className="py-2">{new Date(item.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Automation;