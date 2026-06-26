import MainLayout from "../layouts/MainLayout";
import StatsCard from "../components/dashboard/StatsCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";



import {
  FaUsers,
  FaGavel,
  FaFileAlt,
  FaBook,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [clientCount, setClientCount] = useState(0);



  


  useEffect(() => {

  const clients =
    JSON.parse(localStorage.getItem("clients")) || [];

  

  const documents =
    JSON.parse(localStorage.getItem("documents")) || [];

  const policies =
    JSON.parse(localStorage.getItem("policies")) || [];

  setClientCount(clients.length);

  

  

}, []);

  return (
    <MainLayout>



      <div className="fixed inset-0 -z-10 overflow-hidden">

  <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[180px]" />

  <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[180px]" />

  <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[180px]" />

</div>
      {/* Welcome Banner */}

      <div
  className="
  relative
  overflow-hidden
  rounded-3xl
  p-6
md:p-8
mb-8
  glass-card
  backdrop-blur-3xl
  border border-white/10
bg-white/5
"
>

  <div className="relative z-10">

    <h1 className="text-3xl md:text-4xl font-bold mb-3">
      Welcome Back 👋
    </h1>

    <p className="text-blue-100 text-sm md:text-lg leading-7">
      Manage Legal Cases, Clients,
      Policies and Documents.
    </p>

  </div>

  <div
    className="
    absolute
    right-[-80px]
    top-[-80px]
    w-72
    h-72
    rounded-full
    bg-white/10
  "
  />

</div>


      {/* Stats Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
        <StatsCard
          title="Total Clients"
          value={clientCount}
          growth="12"
          icon={<FaUsers />}
        />

       
      </div>

      {/* Quick Actions */}

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-semibold mb-5">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

  <button
    onClick={() => navigate("/clients")}
    className="
glass-card
p-5
hover:scale-105
hover:border-cyan-400/40
transition-all
duration-300
"
  >
    + Add Client
  </button>

  

  

 

</div>




      </div>
    </MainLayout>
  );
}

export default Dashboard;