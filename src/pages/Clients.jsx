import MainLayout from "../layouts/MainLayout";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import AddClientModal from "../components/modals/AddClientModal";
import { addNotification } from "../utils/notifications";
import { addActivity } from "../utils/activityLogger";
import { exportClientsPDF, exportClientsExcel } from "../utils/reportExport";

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

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
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

      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleUnassign = async (clientId, userId, userName) => {
    if (!window.confirm(`Remove "${userName}" from this client?`)) return;

    try {
      const clientResponse = await api.get(`/api/clients/${clientId}`);
      const client = clientResponse.data;

      const updatedPermissions = client.userPermissions.filter(
        p => String(p.userId?._id || p.userId) !== String(userId)
      );

      await api.put(`/api/clients/${clientId}`, {
        ...client,
        userPermissions: updatedPermissions
      });

      addNotification(`User "${userName}" unassigned from ${client.name}`);
      addActivity(`User Unassigned from Client`);
      alert(`✅ "${userName}" removed from client successfully!`);
      fetchClients();
    } catch (error) {
      console.error('❌ Unassign error:', error);
      alert('Failed to unassign user: ' + (error.response?.data?.message || error.message));
    }
  };

  const addClient = async (newClient) => {
    try {
      const response = await api.post('/api/clients', newClient);
      console.log('✅ Client added:', response.data);
      addNotification(`Client Added: ${newClient.name}`);
      addActivity(`Client Added`);
      fetchClients();
      setOpenModal(false);
    } catch (error) {
      console.error('❌ Error adding client:', error.response?.data || error.message);
      alert('Failed to add client: ' + (error.response?.data?.message || error.message));
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

    if (!window.confirm(`Delete "${clientName}"?`)) return;

    try {
      await api.delete(`/api/clients/${clientId}`);
      console.log('✅ Client deleted');
      addNotification(`Client Deleted: ${clientName}`);
      addActivity(`Client Deleted`);
      fetchClients();
    } catch (error) {
      console.error('❌ Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const updateClient = async (updatedClient) => {
    try {
      const clientId = updatedClient._id || updatedClient.id;

      if (!clientId) {
        alert('Error: Client ID not found.');
        return;
      }

      const response = await api.put(`/api/clients/${clientId}`, updatedClient);
      console.log('✅ Client updated:', response.data);

      addNotification(`Client Updated: ${updatedClient.name}`);
      addActivity(`Client Updated`);

      setOpenModal(false);
      setEditData(null);
      fetchClients();
    } catch (error) {
      console.error('❌ Error updating client:', error);
      alert('Failed to update client: ' + (error.response?.data?.message || error.message));
    }
  };

  // ✅ Helper: Get unique users (deduplicate by userId)
  const getUniqueUsers = (userPermissions) => {
    if (!Array.isArray(userPermissions)) return [];
    return userPermissions.filter(
      (perm, i, self) =>
        i ===
        self.findIndex(
          (t) =>
            String(t.userId?._id || t.userId) === String(perm.userId?._id || perm.userId)
        )
    );
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
      <div className="glass relative overflow-hidden p-4 md:p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Clients</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={exportClientsPDF} className="glass-card px-4 py-3 text-sm flex-1 md:flex-none hover:scale-105 transition-all">
            Export PDF
          </button>
          <button onClick={exportClientsExcel} className="glass-card px-4 py-3 text-sm flex-1 md:flex-none hover:scale-105 transition-all">
            Export Excel
          </button>
          {isAdmin && (
            <button onClick={() => setOpenModal(true)} className="glass-card blue-glow px-4 py-3 text-sm flex-1 md:flex-none hover:scale-105 transition-all">
              + Add Client
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-4 md:p-6 overflow-hidden">
        <input
          type="text"
          placeholder="Search client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full glass-card p-3 md:p-4 mb-5 text-sm md:text-base outline-none placeholder:text-gray-400"
        />
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            {/* ✅ TABLE HEADER */}
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="p-3 text-left w-[180px]">Name</th>
                <th className="p-3 text-left w-[160px]">Company</th>
                <th className="p-3 text-left w-[220px]">Email</th>
                <th className="p-3 text-left w-[130px]">Phone</th>
                <th className="p-3 text-left w-[100px]">Status</th>
                {isAdmin && <th className="p-3 text-left w-[220px]">Assigned To</th>}
                <th className="p-3 text-left w-[120px]">Actions</th>
              </tr>
            </thead>

            {/* ✅ TABLE BODY */}
            <tbody>
              {clientsList.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-gray-400">
                    {isAdmin ? 'No Clients Found' : 'No clients assigned to you'}
                  </td>
                </tr>
              ) : (
                clientsList
                  .filter((client) =>
                    client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((client, index) => {
                    const uniqueUsers = getUniqueUsers(client.userPermissions);
                    const visibleUsers = uniqueUsers.slice(0, 3);
                    const hiddenCount = uniqueUsers.length - visibleUsers.length;

                    return (
                      <tr
                        key={client._id || client.id || `client-${index}`}
                        className="border-b border-white/10 hover:bg-white/5"
                      >
                        {/* ✅ NAME */}
                        <td className="p-3 max-w-[180px]">
                          <button
                            onClick={() => navigate(`/client/${client._id || client.id}`)}
                            className="hover:text-cyan-300 transition font-medium truncate block max-w-full text-left"
                            title={client.name || 'Unknown'}
                          >
                            {client.name || 'Unknown'}
                          </button>
                        </td>

                        {/* ✅ COMPANY */}
                        <td className="p-3 max-w-[160px]">
                          <span
                            className="block truncate text-sm"
                            title={client.company || '-'}
                          >
                            {client.company || '-'}
                          </span>
                        </td>

                        {/* ✅ EMAIL */}
                        <td className="p-3 max-w-[220px]">
                          <span
                            className="block truncate text-sm"
                            title={client.email || '-'}
                          >
                            {client.email || '-'}
                          </span>
                        </td>

                        {/* ✅ PHONE */}
                        <td className="p-3 max-w-[130px]">
                          <span
                            className="block truncate text-sm"
                            title={client.phone || '-'}
                          >
                            {client.phone || '-'}
                          </span>
                        </td>

                        {/* ✅ STATUS */}
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                              client.status === 'Active'
                                ? 'bg-green-500/20 text-green-400 border border-green-400/20'
                                : 'bg-red-500/20 text-red-400 border border-red-400/20'
                            }`}
                          >
                            {client.status || 'Active'}
                          </span>
                        </td>

                       {/* ✅ ASSIGNED TO — Show ALL users with × buttons */}
{isAdmin && (
  <td className="p-3">
    {uniqueUsers.length > 0 ? (
      <div
        className="flex flex-col gap-1 items-start max-h-[140px] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {uniqueUsers.map((perm, i) => {
          const userId = perm.userId?._id || perm.userId;
          const userName = perm.userId?.name || 'Unknown';
          const folderCount = perm.folderPermissions?.length || 0;

          return (
            <div
              key={`${userId}-${i}`}
              className="assigned-user-tag"
              title={`${userName} (${folderCount} folders)`}
            >
              <span className="user-name">{userName}</span>
              <button
                onClick={() =>
                  handleUnassign(client._id, userId, userName)
                }
                className="remove-btn"
                title={`Remove ${userName}`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    ) : (
      <span className="text-gray-500 text-xs">Unassigned</span>
    )}
  </td>
)}
                        {/* ✅ ACTIONS */}
                        <td className="p-3">
                          <div className="flex gap-3 flex-shrink-0">
                            <FaEye
                              className="cursor-pointer text-cyan-400 hover:scale-125 transition-all"
                              onClick={() => navigate(`/client/${client._id || client.id}`)}
                            />
                            {isAdmin && (
                              <>
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
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
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