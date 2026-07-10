import MainLayout from "../layouts/MainLayout";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AddClientModal from "../components/modals/AddClientModal";
import { addNotification } from "../utils/notifications";
import { addActivity } from "../utils/activityLogger";
import { exportClientsPDF, exportClientsExcel } from "../utils/reportExport";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function Clients() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [openModal, setOpenModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED fetchClients
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ API Response:', response.data);
      
      let clientsData = [];
      const data = response.data;
      
      if (Array.isArray(data)) {
        clientsData = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.clients)) {
          clientsData = data.clients;
        } else if (Array.isArray(data.data)) {
          clientsData = data.data;
        }
      }
      
      console.log('✅ Extracted clients:', clientsData);
      console.log('✅ Is Array?', Array.isArray(clientsData));
      
      setClients(Array.isArray(clientsData) ? clientsData : []);
      
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
      setClients(Array.isArray(savedClients) ? savedClients : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addClient = async (newClient) => {
    try {
      const token = localStorage.getItem('token');
      console.log('📤 Adding client to backend:', newClient);
      const response = await axios.post(`${API_URL}/api/clients`, newClient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Client added to backend:', response.data);
      addNotification(`Client Added: ${newClient.name}`);
      addActivity(`Client Added`);
      fetchClients();
      setOpenModal(false);
    } catch (error) {
      console.error('❌ Error adding client:', error.response?.data || error.message);
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
      addNotification(`Client Added (Local): ${newClient.name}`);
      addActivity(`Client Added (Local)`);
    }
  };

  const deleteClient = async (indexToDelete) => {
    const client = clients[indexToDelete];
    const clientId = client?._id || client?.id;
    const clientName = client?.name || 'Unknown';
    
    if (!clientId) {
      console.error('No client ID found');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Client deleted from backend');
      addNotification(`Client Deleted: ${clientName}`);
      addActivity(`Client Deleted`);
      fetchClients();
    } catch (error) {
      console.error('❌ Error deleting client:', error);
      const updatedClients = clients.filter((_, index) => index !== indexToDelete);
      setClients(updatedClients);
      localStorage.setItem("clients", JSON.stringify(updatedClients));
      addNotification(`Client Deleted (Local): ${clientName}`);
      addActivity(`Client Deleted (Local)`);
    }
  };

  const updateClient = async (updatedClient) => {
    try {
      const token = localStorage.getItem('token');
      const clientId = updatedClient._id || updatedClient.id;
      
      if (!clientId) {
        console.error('❌ No client ID found:', updatedClient);
        alert('Error: Client ID not found. Please refresh and try again.');
        return;
      }
      
      console.log('📤 Updating client ID:', clientId);
      const response = await axios.put(`${API_URL}/api/clients/${clientId}`, updatedClient, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Client updated in backend:', response.data);
      addNotification(`Client Updated: ${updatedClient.name}`);
      addActivity(`Client Updated`);
      
      const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
      const updatedClients = savedClients.map(c => 
        (c._id === clientId || c.id === clientId) ? response.data : c
      );
      localStorage.setItem("clients", JSON.stringify(updatedClients));
      setClients(updatedClients);
      
      setOpenModal(false);
      setEditIndex(null);
      setEditData(null);
      
      navigate(`/client/${clientId}`, { replace: true });
      
      setTimeout(() => {
        window.location.reload();
      }, 200);
      
    } catch (error) {
      console.error('❌ Error updating client:', error);
      alert('Failed to update client: ' + (error.response?.data?.message || error.message));
      
      const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
      const updatedClients = savedClients.map((c, i) => 
        i === editIndex ? updatedClient : c
      );
      localStorage.setItem("clients", JSON.stringify(updatedClients));
      setClients(updatedClients);
      addNotification(`Client Updated (Local): ${updatedClient.name}`);
      addActivity(`Client Updated (Local)`);
    }
  };

  const clientsList = Array.isArray(clients) ? clients : [];
  const activeClients = clientsList.filter(client => client?.status === "Active").length;

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
                {/* ✅ Assigned To Column - Only for Admin */}
                {isAdmin && <th className="p-3 text-left">Assigned To</th>}
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientsList.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-gray-400">
                    No Clients Found
                  </td>
                </tr>
              ) : (
                clientsList
                  .filter((client) =>
                    client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((client, index) => (
                    <tr
                      key={client._id || client.id || index}
                      className="border-b border-white/10 hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/client/${client._id || client.id}`)}
                          className="text-cyan-400 hover:underline hover:text-cyan-300 transition font-medium"
                        >
                          {client.name}
                        </button>
                      </td>
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
                      {/* ✅ Assigned To Column - Only for Admin */}
                      {isAdmin && (
                        <td className="p-3">
                          {client.assignedTo && client.assignedTo.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {client.assignedTo.map((u) => (
                                <span key={u._id || u} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
                                  {u.name || u}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Unassigned</span>
                          )}
                        </td>
                      )}
                      <td className="p-3">
                        <div className="flex gap-4">
                          <FaEye
                            className="cursor-pointer text-cyan-400 hover:scale-125 transition-all"
                            onClick={() => navigate(`/client/${client._id || client.id}`)}
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
          <h2 className="text-4xl font-bold mt-2">{clientsList.length}</h2>
        </div>
        <div className="glass-card p-4 md:p-5">
          <p className="text-gray-400">Active Clients</p>
          <h2 className="text-4xl font-bold text-green-400 mt-2">{activeClients}</h2>
        </div>
        <div className="glass-card p-4 md:p-5">
          <p className="text-gray-400">Inactive Clients</p>
          <h2 className="text-4xl font-bold text-red-400 mt-2">{clientsList.length - activeClients}</h2>
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