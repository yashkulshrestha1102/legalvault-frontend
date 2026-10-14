import MainLayout from "../layouts/MainLayout";
import StatsCard from "../components/dashboard/StatsCard";
import { useState, useEffect } from "react";
import { cachedGet } from '../utils/api'; // ✅ FIXED: cachedGet import
import { FaUsers, FaFileAlt, FaBriefcase, FaUserTie } from "react-icons/fa";

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCases: 0,
    documents: 0,
    consultants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ FIXED: cachedGet use किया — 60 sec तक instant
        const response = await cachedGet('/api/dashboard/stats');
        setStats({
          totalClients: response.data.totalClients || 0,
          activeCases: response.data.activeCases || 0,
          documents: response.data.documents || 0,
          consultants: response.data.consultants || 0,
        });
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ✅ FIXED: Skeleton loader (better UX)
  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse">
          {/* Welcome card skeleton */}
          <div className="h-40 bg-white/5 rounded-3xl mb-8"></div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-7 h-40"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[180px]" />
      </div>

      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 glass-card backdrop-blur-3xl border border-white/10 bg-white/5">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Welcome Back 👋
          </h1>
          <p className="text-blue-100 text-sm md:text-lg leading-7">
            Manage Legal Cases, Clients, Policies and Documents.
          </p>
        </div>
        <div className="absolute right-[-80px] top-[-80px] w-72 h-72 rounded-full bg-white/10" />
      </div>

      {/* Stats Cards — 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Clients"
          value={stats.totalClients}
          growth="12"
          icon={<FaUsers />}
        />
        <StatsCard
          title="Active Cases"
          value={stats.activeCases}
          growth="8"
          icon={<FaBriefcase />}
        />
        <StatsCard
          title="Documents"
          value={stats.documents}
          growth="15"
          icon={<FaFileAlt />}
        />
        <StatsCard
          title="Consultants"
          value={stats.consultants}
          growth="5"
          icon={<FaUserTie />}
        />
      </div>
    </MainLayout>
  );
}

export default Dashboard;