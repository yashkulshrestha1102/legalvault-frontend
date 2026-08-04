import MainLayout from "../layouts/MainLayout";
import StatsCard from "../components/dashboard/StatsCard";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaUsers } from "react-icons/fa";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function Dashboard() {
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('📊 Fetching stats from:', `${API_URL}/api/dashboard/stats`);
        const response = await axios.get(`${API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientCount(response.data.totalClients || 0);
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Dashboard...</div>
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
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[180px]" />
      </div>

      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 glass-card backdrop-blur-3xl border border-white/10 bg-white/5">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome Back 👋</h1>
          <p className="text-blue-100 text-sm md:text-lg leading-7">Manage Legal Cases, Clients, Policies and Documents.</p>
        </div>
        <div className="absolute right-[-80px] top-[-80px] w-72 h-72 rounded-full bg-white/10" />
      </div>

      {/* ✅ Only Total Clients Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Clients" 
          value={clientCount} 
          growth="12" 
          icon={<FaUsers />} 
        />
      </div>

    </MainLayout>
  );
}

export default Dashboard;