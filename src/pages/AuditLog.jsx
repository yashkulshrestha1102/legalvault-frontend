import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import AuthContext from '../context/AuthContext';

const API_URL = 'https://legalvault-jm2n.onrender.com';

function AuditLog() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ action: '', entity: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        limit: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit
      };
      if (filter.action) params.action = filter.action;
      if (filter.entity) params.entity = filter.entity;

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
      VIEW: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/20'
    };
    return colors[action] || 'bg-gray-500/20 text-gray-400';
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Audit Logs</h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Total Actions</p>
              <h2 className="text-2xl font-bold">{stats.totalActions}</h2>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Today</p>
              <h2 className="text-2xl font-bold text-cyan-400">{stats.todayActions}</h2>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Most Action</p>
              <h2 className="text-2xl font-bold text-yellow-400">
                {stats.actionsByType?.[0]?._id || 'N/A'}
              </h2>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Most Entity</p>
              <h2 className="text-2xl font-bold text-purple-400">
                {stats.actionsByEntity?.[0]?._id || 'N/A'}
              </h2>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card p-4 mb-6 flex flex-wrap gap-4">
          <select
            value={filter.action}
            onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value }))}
            className="glass-card px-4 py-2 bg-transparent outline-none"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>

          <select
            value={filter.entity}
            onChange={(e) => setFilter(prev => ({ ...prev, entity: e.target.value }))}
            className="glass-card px-4 py-2 bg-transparent outline-none"
          >
            <option value="">All Entities</option>
            <option value="CLIENT">Client</option>
            <option value="REGISTRATION">Registration</option>
            <option value="CONTRACT">Contract</option>
            <option value="USER">User</option>
          </select>

          <button
            onClick={() => setFilter({ action: '', entity: '' })}
            className="glass-card px-4 py-2 text-red-400 hover:scale-105 transition"
          >
            Clear Filters
          </button>
        </div>

        {/* Logs Table */}
        <div className="glass-card p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Entity</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-3">
                        <div>
                          <p className="font-semibold">{log.user.name}</p>
                          <p className="text-xs text-gray-400">{log.user.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">{log.entity}</td>
                      <td className="p-3">{log.entityName || '-'}</td>
                      <td className="p-3 text-sm text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
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
    </MainLayout>
  );
}

export default AuditLog;