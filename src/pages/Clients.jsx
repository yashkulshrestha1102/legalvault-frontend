import MainLayout from "../layouts/MainLayout";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import AddClientModal from "../components/modals/AddClientModal";
import { addNotification } from "../utils/notifications";
import { addActivity } from "../utils/activityLogger";
import { exportClientsPDF, exportClientsExcel } from "../utils/reportExport";

// ✅ Hardcoded Render URL (AuthContext ke same)
const API_URL = 'https://legalvault-jm2n.onrender.com';

function Clients() {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('📋 Fetching clients from:', `${API_URL}/api/clients`);
        const response = await axios.get(`${API_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(response.data);
      } catch (error) {
        console.error('❌ Error fetching clients:', error);
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        if (savedClients.length > 0) {
          setClients(savedClients);
        } else {
          setClients([
            {
              id: 1,
              name: "Rajan Malhotra",
              company: "Malhotra Group",
              email: "rajan@malhotra.com",
              phone: "9876543210",
              status: "Active",
            },
            {
              id: 2,
              name: "Vikram Mehta",
              company: "Mehta Enterprises",
              email: "vikram@mehta.com",
              phone: "9876543211",
              status: "Active",
            },
            {
              id: 3,
              name: "Neha Kapoor",
              company: "Kapoor Industries",
              email: "neha@kapoor.com",
              phone: "9876543212",
              status: "Inactive",
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const addClient = (newClient) => {
    const clientWithId = {
      ...newClient,
      id: Date.now(),
      registrations: [],
      contracts: [],
      policies: [],
      corporateSecretariat: [],
      hr: [],
      gst: [],
      incomeTax: [],
      financials: [],
    };
    const updatedClients = [...clients, clientWithId];
    setClients(updatedClients);
    localStorage.setItem("clients", JSON.stringify(updatedClients));
    addNotification(`Client Added: ${newClient.name}`);
    addActivity(`Client Added`);
  };

  const deleteClient = (indexToDelete) => {
    const clientName = clients[indexToDelete]?.name || 'Unknown';
    const updatedClients = clients.filter((_, index) => index !== indexToDelete);
    setClients(updatedClients);
    localStorage.setItem("clients", JSON.stringify(updatedClients));
    addNotification(`Client Deleted: ${clientName}`);
    addActivity(`Client Deleted`);
  };

  const updateClient = (updatedClient) => {
    const updatedClients = [...clients];
    updatedClients[editIndex] = updatedClient;
    setClients(updatedClients);
    localStorage.setItem("clients", JSON.stringify(updatedClients));
    setEditIndex(null);
    setEditData(null);
    addNotification(`Client Updated: ${updatedClient.name}`);
    addActivity(`Client Updated`);
  };

  const activeClients = clients.filter(client => client.status === "Active").length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Clients...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[140px]" />
      </div>

      <div className="glass relative overflow-hidden p-4 md:p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="absolute right-0 top-0 w-60 h-60 bg-cyan-500/10 blur-[120px]" />
        <h1 className="text-3xl font-bold">Clients</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={exportClientsPDF} className="glass-card px-4 py-3 text-sm flex-1 md:flex-none whitespace-nowrap hover:scale-105 transition-all duration-300">
            Export PDF
          </button>
          <button onClick={exportClientsExcel} className="glass-card px-4 py-3 text-sm flex-1 md:flex-none whitespace-nowrap hover:scale-105 transition-all duration-300">
            Export Excel
          </button>
          <button onClick={() => setOpenModal(true)} className="glass-card blue-glow px-4 py-3 text-sm flex-1 md:flex-none whitespace-nowrap hover:scale-105 transition-all">
            + Add Client
          </button>
        </div>
      </div>

      <div className="glass-card p-4 md:p-6 overflow-hidden">
        <input
          type="text"
          placeholder="Search client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full glass-card p-3 md:p-4 mb-5 text-sm md:text-base outline-none placeholder:text-gray-400 focus:border-cyan-400/40 focus:shadow-[0_0_25px_rgba(34,211,238,.25)] transition-all"
        />
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-white/5 backdrop-blur-xl">
              <tr className="border-b border-white/10">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    No Clients Found
                  </td>
                </tr>
              ) : (
                clients
                  .filter((client) =>
                    client.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((client, index) => (
                    <tr
                      key={client.id || index}
                      className="border-b border-white/10 hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="p-3">{client.name}</td>
                      <td className="p-3">{client.company}</td>
                      <td className="p-3">{client.email}</td>
                      <td className="p-3">{client.phone}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            client.status === "Active"
                              ? "bg-green-500/20 text-green-400 border border-green-400/20"
                              : "bg-red-500/20 text-red-400 border border-red-400/20"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-4">
                          <FaEye
                            className="cursor-pointer text-cyan-400 hover:scale-125 transition-all"
                            onClick={() => navigate(`/client/${client.id}`)}
                          />
                          <FaEdit
                            className="cursor-pointer text-yellow-400 hover:scale-125 transition-all"
                            onClick={() => {
                              setEditIndex(index);
                              setEditData(client);
                              setOpenModal(true);
                            }}
                          />
                          <FaTrash
                            className="cursor-pointer text-red-500 hover:scale-125 transition-all"
                            onClick={() => deleteClient(index)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddClientModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditData(null);
        }}
        onSave={editData ? updateClient : addClient}
        editData={editData}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="glass-card p-4 md:p-5">
          <p className="text-gray-400">Total Clients</p>
          <h2 className="text-4xl font-bold mt-2">{clients.length}</h2>
        </div>
        <div className="glass-card p-4 md:p-5">
          <p className="text-gray-400">Active Clients</p>
          <h2 className="text-4xl font-bold text-green-400 mt-2">{activeClients}</h2>
        </div>
        <div className="glass-card p-4 md:p-5">
          <p className="text-gray-400">Inactive Clients</p>
          <h2 className="text-4xl font-bold text-red-400 mt-2">{clients.length - activeClients}</h2>
        </div>
        <div className="glass-card p-4 md:p-5">
          <p className="text-gray-400">Growth</p>
          <h2 className="text-4xl font-bold text-cyan-400 mt-2">+18%</h2>
        </div>
      </div>
    </MainLayout>
  );
}

export default Clients;