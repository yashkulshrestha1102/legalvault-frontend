import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import AuthContext from '../context/AuthContext';
import { FaUndo, FaInfoCircle, FaSearch, FaFilePdf, FaUser, FaBuilding } from 'react-icons/fa';

const API_URL = 'https://legalvault-jm2n.onrender.com';

function AuditLog() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ action: '', entity: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        limit: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit
      };
      if (filter.action) params.action = filter.action;
      if (filter.entity) params.entity = filter.entity;
      if (filter.search) params.search = filter.search;

      const response = await axios.get(`${API_URL}/api/audit`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setLogs(response.data.logs);
      setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/audit/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [pagination.page, filter]);

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'bg-green-500/20 text-green-400 border-green-400/20',
      UPDATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/20',
      DELETE: 'bg-red-500/20 text-red-400 border-red-400/20',
      LOGIN: 'bg-blue-500/20 text-blue-400 border-blue-400/20',
      LOGOUT: 'bg-gray-500/20 text-gray-400 border-gray-400/20',
      VIEW: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/20',
      ROLLBACK: 'bg-purple-500/20 text-purple-400 border-purple-400/20'
    };
    return colors[action] || 'bg-gray-500/20 text-gray-400';
  };

  const getEntityIcon = (entity) => {
    const icons = {
      CLIENT: <FaBuilding className="inline mr-1" />,
      USER: <FaUser className="inline mr-1" />,
      DOCUMENT: <FaFilePdf className="inline mr-1" />
    };
    return icons[entity] || null;
  };

  const handleRollback = async (logId) => {
    if (!window.confirm('Are you sure you want to rollback this action? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/audit/${logId}/rollback`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Rollback successful!');
      fetchLogs();
      fetchStats();
    } catch (error) {
      alert('❌ Rollback failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Audit Logs...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">🔍 Audit Logs</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Total Actions</p>
              <h2 className="text-2xl font-bold">{stats.totalActions}</h2>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Today</p>
              <h2 className="text-2xl font-bold">{stats.todayActions}</h2>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Most Action</p>
              <h5 className="vfont-bold ">
                {stats.actionsByType?.[0]?._id || 'N/A'}
              </h5>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Most Entity</p>
              <h5 className="font-bold ">
                {stats.actionsByEntity?.[0]?._id || 'N/A'}
              </h5>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Top Client</p>
              <h5 className="font-bold ">
                {stats.topClients?.[0]?.name || 'N/A'}
              </h5>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card p-4 mb-6 flex flex-wrap gap-4">
          <select
            value={filter.action}
            onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value, page: 1 }))}
            className="glass-card px-4 py-2 bg-transparent outline-none"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="ROLLBACK">Rollback</option>
          </select>

          <select
            value={filter.entity}
            onChange={(e) => setFilter(prev => ({ ...prev, entity: e.target.value, page: 1 }))}
            className="glass-card px-4 py-2 bg-transparent outline-none"
          >
            <option value="">All Entities</option>
            <option value="CLIENT">Client</option>
            <option value="REGISTRATION">Registration</option>
            <option value="CONTRACT">Contract</option>
            <option value="USER">User</option>
            <option value="DOCUMENT">Document</option>
          </select>

          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center glass-card px-4 py-2">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by name, client, user..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="bg-transparent outline-none w-full text-white"
              />
            </div>
          </div>

          <button
            onClick={() => setFilter({ action: '', entity: '', search: '' })}
            className="glass-card px-4 py-2 text-red-400 hover:scale-105 transition"
          >
            Clear Filters
          </button>
        </div>

        {/* Logs Table */}
        <div className="glass-card p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Entity</th>
                  <th className="p-3 text-left">Name / Client</th>
                  <th className="p-3 text-left">Changes</th>
                  <th className="p-3 text-left">Timestamp</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-3">
                        <div>
                          <p className="font-semibold text-sm">{log.user.name}</p>
                          <p className="text-xs text-gray-400">{log.user.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs border ${getActionColor(log.action)}`}>
                          {log.action}
                          {log.rollbacked && ' 🔄'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">
                          {getEntityIcon(log.entity)}
                          {log.entity}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-sm">{log.entityName || '-'}</p>
                          {log.clientName && (
                            <p className="text-xs text-gray-400">Client: {log.clientName}</p>
                          )}
                          {log.documentInfo?.filename && (
                            <p className="text-xs text-gray-400">📄 {log.documentInfo.filename}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs">
                          {log.changes?.fields?.length > 0 ? (
                            <span className="text-yellow-400">
                              {log.changes.fields.slice(0, 3).join(', ')}
                              {log.changes.fields.length > 3 && '...'}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(log)}
                            className="text-cyan-400 hover:scale-110 transition"
                            title="View Details"
                          >
                            <FaInfoCircle />
                          </button>
                          {!log.rollbacked && log.action !== 'LOGIN' && log.action !== 'LOGOUT' && (
                            <button
                              onClick={() => handleRollback(log._id)}
                              className="text-purple-400 hover:scale-110 transition"
                              title="Rollback"
                            >
                              <FaUndo />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="glass-card px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  className="glass-card px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">📋 Log Details</h2>
              <button onClick={() => setShowDetails(false)} className="glass-card px-4 py-2 text-sm">Close</button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3">
                  <p className="text-gray-400 text-xs">User</p>
                  <p className="font-semibold">{selectedLog.user.name}</p>
                  <p className="text-sm text-gray-400">{selectedLog.user.email}</p>
                </div>
                <div className="glass-card p-3">
                  <p className="text-gray-400 text-xs">Action</p>
                  <p className={`font-semibold ${getActionColor(selectedLog.action)} inline-block px-3 py-1 rounded-full text-xs`}>
                    {selectedLog.action}
                  </p>
                </div>
              </div>
              
              <div className="glass-card p-3">
                <p className="text-gray-400 text-xs">Entity</p>
                <p className="font-semibold">{selectedLog.entity}</p>
                <p className="text-sm">{selectedLog.entityName || 'N/A'}</p>
              </div>

              {selectedLog.clientName && (
                <div className="glass-card p-3">
                  <p className="text-gray-400 text-xs">Client</p>
                  <p className="font-semibold">{selectedLog.clientName}</p>
                </div>
              )}

              {selectedLog.documentInfo?.filename && (
                <div className="glass-card p-3">
                  <p className="text-gray-400 text-xs">Document</p>
                  <p className="font-semibold">{selectedLog.documentInfo.filename}</p>
                  <p className="text-sm text-gray-400">Type: {selectedLog.documentInfo.fileType}</p>
                </div>
              )}

              {selectedLog.changes?.fields?.length > 0 && (
                <div className="glass-card p-3">
                  <p className="text-gray-400 text-xs">Changes</p>
                  <div className="mt-1 space-y-1">
                    {selectedLog.changes.fields.map((field) => (
                      <div key={field} className="text-sm bg-white/5 p-2 rounded">
                        <span className="text-yellow-400">{field}</span>
                        <span className="text-gray-400">: </span>
                        <span className="text-green-400">
                          {selectedLog.changes.after?.[field] || 'N/A'}
                        </span>
                        <span className="text-gray-400"> → </span>
                        <span className="text-red-400">
                          {selectedLog.changes.before?.[field] || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass-card p-3">
                <p className="text-gray-400 text-xs">Timestamp</p>
                <p>{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>

              {selectedLog.rollbacked && (
                <div className="glass-card p-3 border-purple-400/30">
                  <p className="text-purple-400 text-xs">🔄 Rollbacked</p>
                  <p className="text-sm">This action has been rolled back</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AuditLog;