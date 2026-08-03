import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { 
  FaFileInvoice, FaSort, FaDatabase, FaFilePdf, 
  FaSpinner, FaCheckCircle, FaCalendarAlt, FaUsers 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function GSTDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ stages: [], recent: [], total: 0 });
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchClients();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gst-automation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
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

  const startAutomation = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    setStarting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/gst-automation/start`, {
        clientId: selectedClient,
        month: new Date().toISOString().slice(0, 7)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate(`/gst/collection/${response.data.automation._id}`);
    } catch (error) {
      console.error('❌ Start error:', error);
      setError(error.response?.data?.message || 'Failed to start automation');
    } finally {
      setStarting(false);
    }
  };

  const stageColors = {
    collection: 'from-blue-500 to-cyan-400',
    sorting: 'from-purple-500 to-pink-400',
    data_entry: 'from-amber-500 to-orange-400',
    filing: 'from-emerald-500 to-teal-400'
  };

  const stageIcons = {
    collection: <FaFileInvoice />,
    sorting: <FaSort />,
    data_entry: <FaDatabase />,
    filing: <FaFilePdf />
  };

  const stageLabels = {
    collection: 'Document Collection',
    sorting: 'Auto-Sort',
    data_entry: 'Data Entry',
    filing: 'GST Filing'
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
        <h1 className="text-3xl font-bold">📊 GST Automation Dashboard</h1>
        <p className="text-white/60 mt-1">AI-powered GST filing and compliance automation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.stages?.map((stage) => (
          <div key={stage._id} className={`glass-card p-6 border-t-4 border-t-${stageColors[stage._id]?.split('-')[1] || 'cyan-400'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stageColors[stage._id] || 'from-gray-500 to-gray-400'} flex items-center justify-center text-white`}>
                {stageIcons[stage._id] || <FaFileInvoice />}
              </div>
              <div>
                <p className="text-white/40 text-sm capitalize">{stageLabels[stage._id] || stage._id}</p>
                <p className="text-2xl font-bold">{stage.count}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-white/40 text-sm">Total</p>
              <p className="text-2xl font-bold">{stats.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Start New Automation */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">🚀 Start GST Automation</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">Select a client...</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.name} {client.gstin ? `- ${client.gstin}` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={startAutomation}
            disabled={starting || !selectedClient}
            className="glass-card px-6 py-3 flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          >
            {starting ? <FaSpinner className="animate-spin" /> : <FaCalendarAlt />}
            {starting ? 'Starting...' : 'Start GST Automation'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Recent Automations */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">📋 Recent GST Automations</h2>
        {stats.recent?.length === 0 ? (
          <p className="text-white/40">No recent automations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2">Client</th>
                  <th className="text-left py-2">Month</th>
                  <th className="text-left py-2">Stage</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent?.map(item => (
                  <tr 
                    key={item._id} 
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => {
                      const stageMap = {
                        collection: 'collection',
                        sorting: 'sorting',
                        data_entry: 'dataentry',
                        filing: 'filing'
                      };
                      navigate(`/gst/${stageMap[item.stage] || 'collection'}/${item._id}`);
                    }}
                  >
                    <td className="py-2">{item.clientId?.name || 'N/A'}</td>
                    <td className="py-2">{item.month}</td>
                    <td className="py-2 capitalize">{stageLabels[item.stage] || item.stage}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                        item.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
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

export default GSTDashboard;