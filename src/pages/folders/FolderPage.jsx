import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';

const API_URL = 'https://legalvault-jm2n.onrender.com';

const FolderPage = ({ folderId, title }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/folders/${folderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data || []);
      } catch (err) {
        console.error(`Error fetching ${title} data:`, err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [folderId, title]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading {title}...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="glass-card p-6 bg-red-500/10 border border-red-400/20">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          <button
            onClick={() => navigate(-1)}
            className="glass-card px-4 py-2 text-sm hover:scale-105 transition"
          >
            ← Back
          </button>
        </div>

        <button className="glass-card blue-glow px-4 py-2 mb-6 text-sm hover:scale-105 transition">
          + Add New
        </button>

        <div className="glass-card p-6 overflow-hidden">
          {data.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📂</div>
              <p>No data found in {title}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-white/5 backdrop-blur-xl">
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Added By</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item._id || index} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">{item.title || 'Untitled'}</td>
                      <td className="p-3 text-gray-400">{item.description || '-'}</td>
                      <td className="p-3">{item.addedBy?.name || 'Unknown'}</td>
                      <td className="p-3 text-sm text-gray-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button className="text-cyan-400 hover:scale-110 transition">✏️</button>
                          <button className="text-red-400 hover:scale-110 transition">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FolderPage;