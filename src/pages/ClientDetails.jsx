import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from '../utils/api';
import MainLayout from "../layouts/MainLayout";
import AuthContext from '../context/AuthContext';
import AddRegistrationModal from "../components/modals/AddRegistrationModal";
import AddContractModal from "../components/modals/AddContractModal";

import CustomFoldersPage from "./folders/CustomFoldersPage";
import DocumentsPage from "./folders/DocumentsPage";
import PoliciesPage from "./folders/PoliciesPage";
import GSTPage from "./folders/GSTPage";
import IncomeTaxPage from "./folders/IncomeTaxPage";
import HRPage from "./folders/HRPage";
import CorporateSecretariatPage from "./folders/CorporateSecretariatPage";
import FinancialsPage from "./folders/FinancialsPage";

function ClientDetails() {
  const { id, clientId } = useParams();
  const actualId = id || clientId;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [editRegistration, setEditRegistration] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [openContractModal, setOpenContractModal] = useState(false);
  const [editContract, setEditContract] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  const fetchClient = async () => {
    try {
      console.log('📥 Fetching client with ID:', actualId);

      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      let clientData = null;

      if (isValidObjectId) {
        try {
          const response = await api.get(`/api/clients/${actualId}`);
          clientData = response.data;
          console.log('✅ Client fetched from backend:', clientData);

          const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
          const updatedClients = savedClients.map(c =>
            String(c._id) === String(actualId) || String(c.id) === String(actualId) ? clientData : c
          );
          localStorage.setItem("clients", JSON.stringify(updatedClients));

        } catch (backendError) {
          console.warn('⚠️ Backend fetch failed, trying localStorage...', backendError);
          const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
          const foundClient = savedClients.find(c => String(c._id) === String(actualId) || String(c.id) === String(actualId));
          if (foundClient) {
            clientData = foundClient;
            console.log('✅ Client loaded from localStorage fallback:', clientData);
          } else {
            throw new Error('Client not found anywhere');
          }
        }
      } else {
        console.warn('⚠️ Invalid ObjectId format, loading from localStorage...');
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const foundClient = savedClients.find(c => String(c.id) === String(actualId) || String(c._id) === String(actualId));
        if (foundClient) {
          clientData = foundClient;
          console.log('✅ Client found in localStorage:', clientData);
        } else {
          throw new Error('Client not found');
        }
      }

      if (clientData && !clientData.userPermissions) {
        clientData.userPermissions = [];
      }

      setClient({ ...clientData });
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('❌ Error fetching client:', error);
      const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
      const foundClient = savedClients.find(c => String(c.id) === String(actualId) || String(c._id) === String(actualId));
      if (foundClient) {
        setClient({ ...foundClient });
        setRefreshKey(prev => prev + 1);
        console.log('✅ Client loaded from localStorage fallback:', foundClient);
      } else {
        setClient(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      if (!actualId) {
        console.error('❌ Client ID is undefined!');
        return;
      }
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      if (!isValidObjectId) {
        setRegistrations([]);
        return;
      }

      const response = await api.get(`/api/registrations/client/${actualId}`);
      setRegistrations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching registrations:', error.response?.data || error.message);
      setRegistrations([]);
    }
  };

  const fetchContracts = async () => {
    try {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      if (!isValidObjectId) {
        setContracts([]);
        return;
      }

      const response = await api.get(`/api/contracts/client/${actualId}`);
      setContracts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching contracts:', error.response?.data || error.message);
      setContracts([]);
    }
  };

  const fetchDocuments = async () => {
    try {
      if (!actualId) return;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      if (!isValidObjectId) {
        setDocuments([]);
        return;
      }

      const response = await api.get(`/api/documents/client/${actualId}`);
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching documents:', error.response?.data || error.message);
      setDocuments([]);
    }
  };

  useEffect(() => {
    if (actualId) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);

      if (isValidObjectId) {
        fetchClient();
        fetchRegistrations();
        fetchContracts();
        fetchDocuments();
      } else {
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const foundClient = savedClients.find(c =>
          String(c.id) === String(actualId) || String(c._id) === String(actualId)
        );
        if (foundClient) {
          setClient({ ...foundClient });
          setRefreshKey(prev => prev + 1);
        } else {
          setClient(null);
        }
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [actualId]);

  const renameDocument = async (docId, newName) => {
    if (!newName || newName.trim() === '') {
      alert('Please enter a valid name');
      return;
    }

    try {
      await api.put(`/api/documents/${docId}/rename`, {
        newName: newName.trim()
      });
      fetchDocuments();
      setRenamingId(null);
      setNewFileName('');
    } catch (error) {
      console.error('Rename error:', error);
      alert('Failed to rename document');
    }
  };

  const startRename = (doc) => {
    setRenamingId(doc._id);
    setNewFileName(doc.filename);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setNewFileName('');
  };

  const handleRenameKeyDown = (e, docId) => {
    if (e.key === 'Enter') {
      renameDocument(docId, newFileName);
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  };

  const uploadDocuments = async (files) => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('documents', file);
      }
      formData.append('clientId', actualId);

      setUploadingDocs(true);
      const response = await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDocuments();
      setSelectedFiles([]);

      const fileCount = response.data.files ? response.data.files.length : (response.data.length || 0);
      alert(`✅ ${fileCount} files uploaded successfully!`);
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload documents');
    } finally {
      setUploadingDocs(false);
    }
  };

  const viewDocument = async (docUrl) => {
    if (!docUrl) return;
    try {
      const response = await api.get(docUrl, { responseType: 'blob' });
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('❌ View error:', error);
      alert('Failed to open document');
    }
  };

  const downloadDocument = async (docUrl, filename) => {
    try {
      const response = await api.get(docUrl, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/api/documents/${docId}`);
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const uploadPDF = async (file) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await api.post('/api/pdfs/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.url;
    } catch (error) {
      console.error('❌ PDF upload error:', error.response?.data || error.message);
      return null;
    }
  };

  const viewPDF = async (pdfUrl) => {
    if (!pdfUrl) return;
    try {
      const response = await api.get(pdfUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('❌ View error:', error);
      alert('Failed to open PDF');
    }
  };

  const downloadPDF = async (pdfUrl) => {
    if (!pdfUrl) return;
    try {
      const response = await api.get(pdfUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download PDF');
    }
  };

  const saveRegistration = async (registrationData) => {
    try {
      let validClientId = actualId;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);

      if (!isValidObjectId) {
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const localClient = savedClients.find(c => String(c.id) === String(actualId) || String(c._id) === String(actualId));

        if (localClient) {
          try {
            const allClientsRes = await api.get('/api/clients');
            const allClients = allClientsRes.data?.clients || allClientsRes.data || [];
            const existingClient = allClients.find(c => c.email === localClient.email);

            if (existingClient) {
              validClientId = existingClient._id;
              const updatedClients = savedClients.map(c =>
                String(c.id) === String(actualId) || String(c._id) === String(actualId)
                  ? { ...c, _id: validClientId }
                  : c
              );
              localStorage.setItem("clients", JSON.stringify(updatedClients));
              window.history.replaceState(null, '', `/client/${validClientId}`);
            } else {
              const createResponse = await api.post('/api/clients', {
                name: localClient.name || 'Unknown',
                company: localClient.company || 'Unknown',
                email: localClient.email,
                phone: localClient.phone || '0000000000',
                status: localClient.status || 'Active'
              });
              validClientId = createResponse.data._id;
              const updatedClients = savedClients.map(c =>
                String(c.id) === String(actualId) || String(c._id) === String(actualId)
                  ? { ...c, _id: validClientId }
                  : c
              );
              localStorage.setItem("clients", JSON.stringify(updatedClients));
              window.history.replaceState(null, '', `/client/${validClientId}`);
            }
          } catch (syncError) {
            console.error('❌ Sync error:', syncError.response?.data || syncError.message);
            const errorMsg = syncError.response?.data?.message || 'Unknown error';
            alert(`❌ Cannot sync client: ${errorMsg}`);
            return;
          }
        } else {
          alert('❌ Client not found in local storage.');
          return;
        }
      }

      const data = { ...registrationData, clientId: validClientId };
      if (registrationData.pdfs && registrationData.pdfs.length > 0) {
        data.pdfs = registrationData.pdfs;
      }

      if (editRegistration) {
        await api.put(`/api/registrations/${editRegistration._id}`, data);
      } else {
        await api.post('/api/registrations', data);
      }

      fetchRegistrations();
      setEditRegistration(null);
      setOpenModal(false);
      alert('✅ Registration saved successfully!');

    } catch (error) {
      console.error('❌ Error saving registration:', error);
      alert('Failed to save registration: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteRegistration = async (registrationId) => {
    if (!window.confirm("Delete Registration?")) return;
    try {
      await api.delete(`/api/registrations/${registrationId}`);
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration');
    }
  };

  const saveContract = async (contractData) => {
    try {
      let validClientId = actualId;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);

      if (!isValidObjectId) {
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const localClient = savedClients.find(c => String(c.id) === String(actualId) || String(c._id) === String(actualId));

        if (localClient) {
          try {
            const allClientsRes = await api.get('/api/clients');
            const allClients = allClientsRes.data?.clients || allClientsRes.data || [];
            const existingClient = allClients.find(c => c.email === localClient.email);

            if (existingClient) {
              validClientId = existingClient._id;
              const updatedClients = savedClients.map(c =>
                String(c.id) === String(actualId) || String(c._id) === String(actualId)
                  ? { ...c, _id: validClientId }
                  : c
              );
              localStorage.setItem("clients", JSON.stringify(updatedClients));
              window.history.replaceState(null, '', `/client/${validClientId}`);
            } else {
              const createResponse = await api.post('/api/clients', {
                name: localClient.name || 'Unknown',
                company: localClient.company || 'Unknown',
                email: localClient.email,
                phone: localClient.phone || '0000000000',
                status: localClient.status || 'Active'
              });
              validClientId = createResponse.data._id;
              const updatedClients = savedClients.map(c =>
                String(c.id) === String(actualId) || String(c._id) === String(actualId)
                  ? { ...c, _id: validClientId }
                  : c
              );
              localStorage.setItem("clients", JSON.stringify(updatedClients));
              window.history.replaceState(null, '', `/client/${validClientId}`);
            }
          } catch (syncError) {
            console.error('❌ Sync error:', syncError.response?.data || syncError.message);
            const errorMsg = syncError.response?.data?.message || 'Unknown error';
            alert(`❌ Cannot sync client: ${errorMsg}`);
            return;
          }
        } else {
          alert('❌ Client not found in local storage.');
          return;
        }
      }

      const data = { ...contractData, clientId: validClientId };
      if (contractData.pdfs && contractData.pdfs.length > 0) {
        data.pdfs = contractData.pdfs;
      }

      if (editContract) {
        await api.put(`/api/contracts/${editContract._id}`, data);
      } else {
        await api.post('/api/contracts', data);
      }

      fetchContracts();
      setEditContract(null);
      setOpenContractModal(false);
      alert('✅ Contract saved successfully!');

    } catch (error) {
      console.error('Error saving contract:', error);
      alert('Failed to save contract: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteContract = async (contractId) => {
    if (!window.confirm("Delete Contract?")) return;
    try {
      await api.delete(`/api/contracts/${contractId}`);
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Failed to delete contract');
    }
  };

  const getDaysLeft = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleEdit = (registration) => {
    setEditRegistration(registration);
    setOpenModal(true);
  };

  const handleEditContract = (contract) => {
    setEditContract(contract);
    setOpenContractModal(true);
  };

  const allFolders = [
    { label: "Registrations / Certifications", value: "registrations", id: "registrations" },
    { label: "Contracts", value: "contracts", id: "contracts" },
    { label: "Policies", value: "policies", id: "policies" },
    { label: "Corporate Secretariat", value: "corporateSecretariat", id: "corporate-secretariat" },
    { label: "HR", value: "hr", id: "hr" },
    { label: "GST", value: "gst", id: "gst" },
    { label: "Income Tax", value: "incomeTax", id: "income-tax" },
    { label: "Financials", value: "financials", id: "financials" },
    { label: "📁 Client Repository", value: "documents", id: "documents" },
    { label: "🗂️ Client Folder", value: "clientFolder", id: "client-folder" }
  ];

  const getUserFolderPermissions = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return allFolders.map(f => f.id);
    }

    let clientLevelPerms = [];
    if (client && client.userPermissions && Array.isArray(client.userPermissions)) {
      const userPerm = client.userPermissions.find(p => {
        const userId = p.userId?._id || p.userId;
        return String(userId) === String(user.id);
      });
      if (userPerm && Array.isArray(userPerm.folderPermissions)) {
        clientLevelPerms = userPerm.folderPermissions;
      }
    }

    let userLevelPerms = [];
    if (user.folderPermissions && Array.isArray(user.folderPermissions)) {
      userLevelPerms = user.folderPermissions;
    }

    return [...new Set([...clientLevelPerms, ...userLevelPerms])];
  };

  const userFolderPermissions = getUserFolderPermissions();
  const role = user?.role || 'user';

  const accessibleFolders = allFolders.filter(f => {
    if (role === 'admin') return true;
    return userFolderPermissions.includes(f.id);
  });

  // ═══════════════════════════════════════════
  // ✅ DEDUPLICATE ASSIGNED USERS
  // ═══════════════════════════════════════════
  const getUniqueAssignedUsers = () => {
    if (!client?.userPermissions || !Array.isArray(client.userPermissions)) {
      return [];
    }
    return client.userPermissions.filter(
      (p, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            String(t.userId?._id || t.userId) ===
            String(p.userId?._id || p.userId)
        )
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Client Details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout>
        <div className="glass-card p-6">
          <p className="text-red-400">Client Not Found</p>
          <button onClick={() => navigate('/clients')} className="glass-card px-4 py-2 mt-4">
            ← Back to Clients
          </button>
        </div>
      </MainLayout>
    );
  }

  const uniqueAssignedUsers = getUniqueAssignedUsers();

  return (
    <MainLayout key={refreshKey}>
      <div className="space-y-6">
        {/* ═══════════════════════════════════════════
            ✅ CLIENT INFO SECTION — Fixed UI
            ═══════════════════════════════════════════ */}
        <div className="glass p-4 sm:p-6">
          {/* Client Name — truncate with tooltip */}
          <h1
            className="text-2xl sm:text-3xl font-bold mb-4 truncate"
            title={client.name}
          >
            {client.name}
          </h1>

          {/* Info Cards — Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Contact Person */}
            <div className="glass-card p-3 sm:p-4 min-w-0">
              <p className="text-gray-100 text-xs sm:text-sm mb-1 truncate">
                Contact Person
              </p>
              <h3
                className="font-semibold truncate text-sm sm:text-base"
                title={client.contactPerson || '-'}
              >
                {client.contactPerson || "-"}
              </h3>
            </div>

            {/* Email */}
            <div className="glass-card p-3 sm:p-4 min-w-0">
              <p className="text-gray-100 text-xs sm:text-sm mb-1 truncate">
                Email
              </p>
              <h6
                className="text-xs sm:text-sm font-semibold truncate"
                title={client.email || '-'}
              >
                {client.email || "-"}
              </h6>
            </div>

            {/* Mobile */}
            <div className="glass-card p-3 sm:p-4 min-w-0">
              <p className="text-gray-100 text-xs sm:text-sm mb-1 truncate">
                Mobile
              </p>
              <h3
                className="font-semibold truncate text-sm sm:text-base"
                title={client.phone || '-'}
              >
                {client.phone || "-"}
              </h3>
            </div>

            {/* Onboarding Date */}
            <div className="glass-card p-3 sm:p-4 min-w-0">
              <p className="text-gray-100 text-xs sm:text-sm mb-1 truncate">
                Onboarding Date
              </p>
              <h3 className="font-semibold truncate text-sm sm:text-base">
                {client.onboardingDate || "-"}
              </h3>
            </div>

            {/* Status */}
            <div className="glass-card p-3 sm:p-4 min-w-0">
              <p className="text-gray-100 text-xs sm:text-sm mb-1 truncate">
                Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                  client.status === 'Active'
                    ? 'bg-green-500/20 text-green-400 border border-green-400/20'
                    : 'bg-red-500/20 text-red-400 border border-red-400/20'
                }`}
              >
                {client.status || 'Active'}
              </span>
            </div>
          </div>

          {/* ✅ Assigned Users — Fixed Overflow */}
          {role === 'admin' && uniqueAssignedUsers.length > 0 && (
            <div className="mt-4 glass-card p-3 sm:p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-100 text-sm font-medium">
                  Assigned Users
                </p>
                <span className="text-xs text-gray-400">
                  {uniqueAssignedUsers.length} user{uniqueAssignedUsers.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                {uniqueAssignedUsers.map((p) => (
                  <div
                    key={`perm-${p.userId?._id || p.userId}`}
                    className="px-3 py-1.5 bg-cyan-500/20 text-cyan-100 rounded-full text-xs flex items-center gap-2 max-w-[240px]"
                    title={`${p.userId?.name || 'Unknown'} — ${p.folderPermissions?.length || 0} folders`}
                  >
                    <span className="truncate font-medium">
                      {p.userId?.name || 'Unknown'}
                    </span>
                    <span className="text-[10px] bg-cyan-500/30 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                      {p.folderPermissions?.length || 0} folders
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════
            FOLDER TILES
            ═══════════════════════════════════════════ */}
        {accessibleFolders.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {accessibleFolders.map((folder) => (
              <div
                key={folder.value}
                onClick={() => setSelectedFolder(folder.value)}
                className="glass-card p-4 sm:p-6 cursor-pointer hover:scale-105 transition-all duration-300 min-w-0"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📁</div>
                <h3 className="font-semibold text-sm sm:text-base truncate" title={folder.label}>
                  {folder.label}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center text-gray-400">
            {role === 'admin'
              ? 'No folders available'
              : 'You do not have access to any folders for this client'}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            REGISTRATIONS
            ═══════════════════════════════════════════ */}
        {selectedFolder === "registrations" && (
          <div className="glass p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => { setEditRegistration(null); setOpenModal(true); }}
                className="glass-card px-5 py-3 blue-glow"
              >
                + Add Registration
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left text-sm w-[140px]">Type</th>
                    <th className="p-3 text-left text-sm w-[200px]">Registration Name</th>
                    <th className="p-3 text-left text-sm w-[110px]">Start Date</th>
                    <th className="p-3 text-left text-sm w-[110px]">End Date</th>
                    <th className="p-3 text-left text-sm w-[110px]">Status</th>
                    <th className="p-3 text-left text-sm w-[140px]">PDF</th>
                    <th className="p-3 text-left text-sm w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400">
                        No Registrations Found
                      </td>
                    </tr>
                  ) : (
                    registrations.map((item, index) => (
                      <tr key={`reg-${item._id || item.id || index}`} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 max-w-[140px]">
                          <span className="block truncate text-sm" title={item.category}>
                            {item.category || '-'}
                          </span>
                        </td>
                        <td className="p-3 max-w-[200px]">
                          <span className="block truncate text-sm font-medium" title={item.registrationName}>
                            {item.registrationName || '-'}
                          </span>
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap">{item.startDate || '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{item.endDate || '-'}</td>
                        <td className="p-3">
                          {getDaysLeft(item.endDate) <= 0 ? (
                            <span className="text-red-400 text-xs whitespace-nowrap">Expired</span>
                          ) : getDaysLeft(item.endDate) <= 30 ? (
                            <span className="text-yellow-400 text-xs whitespace-nowrap">Expiring Soon</span>
                          ) : (
                            <span className="text-green-400 text-xs whitespace-nowrap">Valid</span>
                          )}
                        </td>
                        <td className="p-3">
                          {item.pdfs && item.pdfs.length > 0 ? (
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => viewPDF(item.pdfs[0])} className="text-cyan-400 hover:underline text-xs whitespace-nowrap">📄 View</button>
                              <button onClick={() => downloadPDF(item.pdfs[0])} className="text-green-400 hover:underline text-xs whitespace-nowrap">⬇️ Download</button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => navigate(`/clients/${actualId}/registration/${item._id || item.id}`)} className="text-cyan-400 text-xs whitespace-nowrap">View</button>
                            <button onClick={() => handleEdit(item)} className="text-yellow-400 text-xs whitespace-nowrap">Edit</button>
                            <button onClick={() => deleteRegistration(item._id || item.id)} className="text-red-400 text-xs whitespace-nowrap">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            CONTRACTS
            ═══════════════════════════════════════════ */}
        {selectedFolder === "contracts" && (
          <div className="glass p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => { setEditContract(null); setOpenContractModal(true); }}
                className="glass-card px-5 py-3 blue-glow"
              >
                + Add Contract
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left text-sm w-[140px]">Type</th>
                    <th className="p-3 text-left text-sm w-[160px]">Contract Name</th>
                    <th className="p-3 text-left text-sm w-[140px]">First Party</th>
                    <th className="p-3 text-left text-sm w-[140px]">Second Party</th>
                    <th className="p-3 text-left text-sm w-[110px]">Start Date</th>
                    <th className="p-3 text-left text-sm w-[110px]">End Date</th>
                    <th className="p-3 text-left text-sm w-[140px]">PDF</th>
                    <th className="p-3 text-left text-sm w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-gray-400">
                        No Contracts Found
                      </td>
                    </tr>
                  ) : (
                    contracts.map((item, index) => (
                      <tr key={`contract-${item._id || item.id || index}`} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 max-w-[140px]">
                          <span className="block truncate text-sm" title={item.contractType}>
                            {item.contractType || '-'}
                          </span>
                        </td>
                        <td className="p-3 max-w-[160px]">
                          <span className="block truncate text-sm font-medium" title={item.contractName}>
                            {item.contractName || '-'}
                          </span>
                        </td>
                        <td className="p-3 max-w-[140px]">
                          <span className="block truncate text-sm" title={item.firstParty}>
                            {item.firstParty || '-'}
                          </span>
                        </td>
                        <td className="p-3 max-w-[140px]">
                          <span className="block truncate text-sm" title={item.secondParty}>
                            {item.secondParty || '-'}
                          </span>
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap">{item.startDate || '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{item.endDate || '-'}</td>
                        <td className="p-3">
                          {item.pdfs && item.pdfs.length > 0 ? (
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => viewPDF(item.pdfs[0])} className="text-cyan-400 hover:underline text-xs whitespace-nowrap">📄 View</button>
                              <button onClick={() => downloadPDF(item.pdfs[0])} className="text-green-400 hover:underline text-xs whitespace-nowrap">⬇️ Download</button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-shrink-0">
                            <button className="text-cyan-400 text-xs whitespace-nowrap" onClick={() => navigate(`/clients/${actualId}/contract/${item._id || item.id}`)}>View</button>
                            <button onClick={() => handleEditContract(item)} className="text-yellow-400 text-xs whitespace-nowrap">Edit</button>
                            <button onClick={() => deleteContract(item._id || item.id)} className="text-red-400 text-xs whitespace-nowrap">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedFolder === "policies" && <PoliciesPage clientId={actualId} />}
        {selectedFolder === "gst" && <GSTPage clientId={actualId} />}
        {selectedFolder === "incomeTax" && <IncomeTaxPage clientId={actualId} />}
        {selectedFolder === "hr" && <HRPage clientId={actualId} />}
        {selectedFolder === "corporateSecretariat" && <CorporateSecretariatPage clientId={actualId} />}
        {selectedFolder === "financials" && <FinancialsPage clientId={actualId} />}
        {selectedFolder === "documents" && <DocumentsPage clientId={actualId} />}
        {selectedFolder === "clientFolder" && (<CustomFoldersPage clientId={actualId} clientName={client.name} />)}
      </div>

      <AddRegistrationModal
        open={openModal}
        onClose={() => { setOpenModal(false); setEditRegistration(null); }}
        onSave={saveRegistration}
        editData={editRegistration}
      />

      <AddContractModal
        open={openContractModal}
        onClose={() => { setOpenContractModal(false); setEditContract(null); }}
        onSave={saveContract}
        editData={editContract}
      />
    </MainLayout>
  );
}

export default ClientDetails;