import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";
import AuthContext from '../context/AuthContext';
import AddRegistrationModal from "../components/modals/AddRegistrationModal";
import AddContractModal from "../components/modals/AddContractModal";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function ClientDetails() {
  const { id } = useParams();
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

  // ✅ Documents State
  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  // ✅ Fetch client function
  const fetchClient = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('📥 Fetching client with ID:', id);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      let clientData = null;
      
      if (isValidObjectId) {
        try {
          const response = await axios.get(`${API_URL}/api/clients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          clientData = response.data;
          console.log('✅ Client fetched from backend:', clientData);
          
          const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
          const updatedClients = savedClients.map(c => 
            String(c._id) === String(id) || String(c.id) === String(id) ? clientData : c
          );
          localStorage.setItem("clients", JSON.stringify(updatedClients));
          
        } catch (backendError) {
          console.warn('⚠️ Backend fetch failed, trying localStorage...', backendError);
          const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
          const foundClient = savedClients.find(c => String(c._id) === String(id) || String(c.id) === String(id));
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
        const foundClient = savedClients.find(c => String(c.id) === String(id) || String(c._id) === String(id));
        if (foundClient) {
          clientData = foundClient;
          console.log('✅ Client found in localStorage:', clientData);
        } else {
          throw new Error('Client not found');
        }
      }
      
      setClient({ ...clientData });
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('❌ Error fetching client:', error);
      const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
      const foundClient = savedClients.find(c => String(c.id) === String(id) || String(c._id) === String(id));
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
  }, [id]);

  // ✅ Fetch client on mount and when id changes
  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  // ✅ Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        console.log('🔄 Page visible, refreshing client data...');
        fetchClient();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id, fetchClient]);

  // ✅ Force refresh when component mounts
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // ✅ Refresh data when URL changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (id) {
        console.log('🔄 Route changed, refreshing client data...');
        fetchClient();
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [id, fetchClient]);

  // ✅ Fetch registrations
  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!id) {
        console.error('❌ Client ID is undefined!');
        return;
      }
      console.log('📋 Fetching registrations for client ID:', id);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isValidObjectId) {
        console.warn('⚠️ Invalid ObjectId, skipping registrations fetch');
        setRegistrations([]);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/registrations/client/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Registrations fetched:', response.data);
      setRegistrations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching registrations:', error.response?.data || error.message);
      setRegistrations([]);
    }
  };

  // ✅ Fetch contracts
  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('📋 Fetching contracts for client ID:', id);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isValidObjectId) {
        console.warn('⚠️ Invalid ObjectId, skipping contracts fetch');
        setContracts([]);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/contracts/client/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Contracts fetched:', response.data);
      setContracts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching contracts:', error.response?.data || error.message);
      setContracts([]);
    }
  };

  // ✅ Fetch documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!id) {
        console.error('❌ Client ID is undefined!');
        return;
      }
      console.log('📋 Fetching documents for client ID:', id);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isValidObjectId) {
        console.warn('⚠️ Invalid ObjectId, skipping documents fetch');
        setDocuments([]);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/documents/client/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Documents fetched:', response.data);
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching documents:', error.response?.data || error.message);
      setDocuments([]);
    }
  };

  // ✅ Load data on mount
  useEffect(() => {
    if (id) {
      console.log('🔄 Loading data for client ID:', id);
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isValidObjectId) {
        fetchRegistrations();
        fetchContracts();
        fetchDocuments();
      }
    } else {
      console.error('❌ No client ID available');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Rename document
  const renameDocument = async (docId, newName) => {
    if (!newName || newName.trim() === '') {
      alert('Please enter a valid name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/documents/${docId}/rename`, {
        newName: newName.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Document renamed:', response.data);
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

  // ✅ Upload documents
  const uploadDocuments = async (files) => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      for (const file of files) {
        formData.append('documents', file);
      }
      formData.append('clientId', id);
      
      setUploadingDocs(true);
      const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Documents uploaded:', response.data);
      fetchDocuments();
      setSelectedFiles([]);
      alert(`✅ ${response.data.files.length} files uploaded successfully!`);
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload documents');
    } finally {
      setUploadingDocs(false);
    }
  };

  const viewDocument = (docUrl) => {
    if (!docUrl) return;
    const token = localStorage.getItem('token');
    window.open(`${docUrl}?token=${token}`, '_blank');
  };

  const downloadDocument = async (docUrl, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(docUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
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
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  // mongodbpdf
  const uploadPDF = async (file) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 ClientDetails - PDF Upload Token:', token ? '✅ Yes' : '❌ No');

      if (!token) {
        alert('Please login again');
        return null;
      }

      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await axios.post(`${API_URL}/api/pdfs/pdf`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ PDF uploaded:', response.data);
      return response.data.url;
    } catch (error) {
      console.error('❌ PDF upload error:', error.response?.data || error.message);
      return null;
    }
  };

  const viewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    window.open(`${pdfUrl}?token=${token}`, '_blank');
  };

  const downloadPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    window.open(`${pdfUrl}?token=${token}`, '_blank');
  };

  // ✅ Save registration
  const saveRegistration = async (registrationData) => {
    try {
      const token = localStorage.getItem('token');
      
      let validClientId = id;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (!isValidObjectId) {
        console.log('⚠️ Invalid ObjectId, trying to sync client to backend...');
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const localClient = savedClients.find(c => String(c.id) === String(id) || String(c._id) === String(id));
        
        if (localClient) {
          try {
            const allClientsRes = await axios.get(`${API_URL}/api/clients`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const allClients = allClientsRes.data?.clients || allClientsRes.data || [];
            const existingClient = allClients.find(c => c.email === localClient.email);
            
            if (existingClient) {
              validClientId = existingClient._id;
              console.log('✅ Client already exists in backend, using ID:', validClientId);
              const updatedClients = savedClients.map(c => 
                String(c.id) === String(id) || String(c._id) === String(id) 
                  ? { ...c, _id: validClientId } 
                  : c
              );
              localStorage.setItem("clients", JSON.stringify(updatedClients));
              window.history.replaceState(null, '', `/client/${validClientId}`);
            } else {
              const createResponse = await axios.post(`${API_URL}/api/clients`, {
                name: localClient.name || 'Unknown',
                company: localClient.company || 'Unknown',
                email: localClient.email,
                phone: localClient.phone || '0000000000',
                status: localClient.status || 'Active'
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('✅ Client synced to backend:', createResponse.data);
              validClientId = createResponse.data._id;
              const updatedClients = savedClients.map(c => 
                String(c.id) === String(id) || String(c._id) === String(id) 
                  ? { ...c, _id: validClientId } 
                  : c
              );
              localStorage.setItem("clients", JSON.stringify(updatedClients));
              window.history.replaceState(null, '', `/client/${validClientId}`);
            }
          } catch (syncError) {
            console.error('❌ Sync error:', syncError.response?.data || syncError.message);
            const errorMsg = syncError.response?.data?.message || 'Unknown error';
            alert(`❌ Cannot sync client: ${errorMsg}\nPlease add this client again from the Clients page.`);
            return;
          }
        } else {
          alert('❌ Client not found in local storage. Please add the client again from the Clients page.');
          return;
        }
      }
      
      const data = { 
        ...registrationData, 
        clientId: validClientId 
      };
      
      if (registrationData.pdfs && registrationData.pdfs.length > 0) {
        data.pdfs = registrationData.pdfs;
      }
      
      if (editRegistration) {
        const response = await axios.put(`${API_URL}/api/registrations/${editRegistration._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Registration updated:', response.data);
      } else {
        const response = await axios.post(`${API_URL}/api/registrations`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Registration created:', response.data);
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
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/registrations/${registrationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration');
    }
  };

  // ✅ Save contract
  const saveContract = async (contractData) => {
    try {
      const token = localStorage.getItem('token');
      
      let validClientId = id;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (!isValidObjectId) {
        console.log('⚠️ Invalid ObjectId, trying to sync client to backend...');
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const localClient = savedClients.find(c => String(c.id) === String(id) || String(c._id) === String(id));
        
        if (localClient) {
          try {
            const allClientsRes = await axios.get(`${API_URL}/api/clients`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const allClients = allClientsRes.data?.clients || allClientsRes.data || [];
            const existingClient = allClients.find(c => c.email === localClient.email);
            
            if (existingClient) {
              validClientId = existingClient._id;
              console.log('✅ Client already exists in backend, using ID:', validClientId);
              const updatedClients = savedClients.map(c => 
                String(c.id) === String(id) || String(c._id) === String(id) 
                  ? { ...c, _id: validClientId } 
                  : c
              );
              localStorage.setItem("clients", JSON.stringify(updatedClients));
              window.history.replaceState(null, '', `/client/${validClientId}`);
            } else {
              const createResponse = await axios.post(`${API_URL}/api/clients`, {
                name: localClient.name || 'Unknown',
                company: localClient.company || 'Unknown',
                email: localClient.email,
                phone: localClient.phone || '0000000000',
                status: localClient.status || 'Active'
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('✅ Client synced to backend:', createResponse.data);
              validClientId = createResponse.data._id;
              const updatedClients = savedClients.map(c => 
                String(c.id) === String(id) || String(c._id) === String(id) 
                  ? { ...c, _id: validClientId } 
                  : c
              );
              localStorage.setItem("clients", JSON.stringify(updatedClients));
              window.history.replaceState(null, '', `/client/${validClientId}`);
            }
          } catch (syncError) {
            console.error('❌ Sync error:', syncError.response?.data || syncError.message);
            const errorMsg = syncError.response?.data?.message || 'Unknown error';
            alert(`❌ Cannot sync client: ${errorMsg}\nPlease add this client again from the Clients page.`);
            return;
          }
        } else {
          alert('❌ Client not found in local storage. Please add the client again from the Clients page.');
          return;
        }
      }
      
      const data = { ...contractData, clientId: validClientId };
      
      if (contractData.pdfs && contractData.pdfs.length > 0) {
        data.pdfs = contractData.pdfs;
      }
      
      if (editContract) {
        const response = await axios.put(`${API_URL}/api/contracts/${editContract._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Contract updated:', response.data);
      } else {
        const response = await axios.post(`${API_URL}/api/contracts`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Contract created:', response.data);
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
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // ✅ Get folder permissions for current user
  const getUserFolderPermissions = () => {
    if (!client || !client.userPermissions) return [];
    const userPerm = client.userPermissions.find(p => 
      String(p.userId?._id || p.userId) === String(user?.id)
    );
    return userPerm?.folderPermissions || [];
  };

  const userFolderPermissions = getUserFolderPermissions();
  const role = user?.role || 'user';
  
  // ✅ 9 Folders including Client Repository
  const allFolders = [
    { label: "Registrations / Certifications", value: "registrations", id: "registrations" },
    { label: "Contracts", value: "contracts", id: "contracts" },
    { label: "Policies", value: "policies", id: "policies" },
    { label: "Corporate Secretariat", value: "corporateSecretariat", id: "corporate-secretariat" },
    { label: "HR", value: "hr", id: "hr" },
    { label: "GST", value: "gst", id: "gst" },
    { label: "Income Tax", value: "incomeTax", id: "income-tax" },
    { label: "Financials", value: "financials", id: "financials" },
    { label: "📁 Client Repository", value: "documents", id: "documents" }
  ];

  const accessibleFolders = allFolders.filter(f => {
    if (role === 'admin') return true;
    return userFolderPermissions.includes(f.id);
  });

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

  return (
    <MainLayout key={refreshKey}>
      <div className="space-y-6">
        {/* Client Header */}
        <div className="glass p-6">
          <h1 className="text-3xl font-bold mb-4">{client.name}</h1>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Contact Person</p>
              <h3 className="font-semibold mt-1">{client.contactPerson || "-"}</h3>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Email</p>
              <h3 className="font-semibold mt-1">{client.email}</h3>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Mobile</p>
              <h3 className="font-semibold mt-1">{client.phone}</h3>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Onboarding Date</p>
              <h3 className="font-semibold mt-1">{client.onboardingDate || "-"}</h3>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Status</p>
              <h3 className="font-semibold mt-1">{client.status}</h3>
            </div>
          </div>
          
          {role === 'admin' && client.userPermissions && client.userPermissions.length > 0 && (
            <div className="mt-4 glass-card p-3">
              <p className="text-gray-400 text-sm">Assigned Users:</p>
              <div className="flex flex-wrap gap-3 mt-1">
                {client.userPermissions.map((p) => (
                  <div key={String(p.userId?._id || p.userId)} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm flex items-center gap-2">
                    <span>{p.userId?.name || 'Unknown'}</span>
                    <span className="text-xs bg-cyan-500/30 px-1.5 py-0.5 rounded">
                      {p.folderPermissions?.length || 0} folders
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Folders Grid */}
        {accessibleFolders.length > 0 ? (
          <div className="grid md:grid-cols-4 gap-5">
            {accessibleFolders.map((folder) => (
              <div 
                key={folder.value} 
                onClick={() => setSelectedFolder(folder.value)} 
                className="glass-card p-6 cursor-pointer hover:scale-105 transition-all duration-300"
              >
                <div className="text-5xl mb-4">📁</div>
                <h3 className="font-semibold">{folder.label}</h3>
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

        {/* Registrations */}
        {selectedFolder === "registrations" && (
          <div className="glass p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => { setEditRegistration(null); setOpenModal(true); }} className="glass-card px-5 py-3 blue-glow">
                + Add Registration
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-left">Registration Name</th>
                    <th className="p-4 text-left">Start Date</th>
                    <th className="p-4 text-left">End Date</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">PDF</th>
                    <th className="p-4 text-left">Actions</th>
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
                    registrations.map((item) => (
                      <tr key={item._id || item.id}>
                        <td className="p-4">{item.category}</td>
                        <td className="p-4">{item.registrationName}</td>
                        <td className="p-4">{item.startDate}</td>
                        <td className="p-4">{item.endDate}</td>
                        <td className="p-4">
                          {getDaysLeft(item.endDate) <= 0 ? (
                            <span className="text-red-400">Expired</span>
                          ) : getDaysLeft(item.endDate) <= 30 ? (
                            <span className="text-yellow-400">Expiring Soon</span>
                          ) : (
                            <span className="text-green-400">Valid</span>
                          )}
                        </td>
                        <td className="p-4">
                          {item.pdf ? (
                            <div className="flex gap-2">
                              <button onClick={() => viewPDF(item.pdf)} className="text-cyan-400 hover:underline text-sm">📄 View</button>
                              <button onClick={() => downloadPDF(item.pdf)} className="text-green-400 hover:underline text-sm">⬇️ Download</button>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <button onClick={() => navigate(`/clients/${id}/registration/${item._id || item.id}`)} className="text-cyan-400">View</button>
                            <button onClick={() => handleEdit(item)} className="text-yellow-400">Edit</button>
                            <button onClick={() => deleteRegistration(item._id || item.id)} className="text-red-400">Delete</button>
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

        {/* Contracts */}
        {selectedFolder === "contracts" && (
          <div className="glass p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => { setEditContract(null); setOpenContractModal(true); }} className="glass-card px-5 py-3 blue-glow">
                + Add Contract
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-left">Contract Name</th>
                    <th className="p-4 text-left">First Party</th>
                    <th className="p-4 text-left">Second Party</th>
                    <th className="p-4 text-left">Start Date</th>
                    <th className="p-4 text-left">End Date</th>
                    <th className="p-4 text-left">PDF</th>
                    <th className="p-4 text-left">Actions</th>
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
                    contracts.map((item) => (
                      <tr key={item._id || item.id}>
                        <td className="p-4">{item.contractType}</td>
                        <td className="p-4">{item.contractName}</td>
                        <td className="p-4">{item.firstParty}</td>
                        <td className="p-4">{item.secondParty}</td>
                        <td className="p-4">{item.startDate}</td>
                        <td className="p-4">{item.endDate}</td>
                        <td className="p-4">
                          {item.pdf ? (
                            <div className="flex gap-2">
                              <button onClick={() => viewPDF(item.pdf)} className="text-cyan-400 hover:underline text-sm">📄 View</button>
                              <button onClick={() => downloadPDF(item.pdf)} className="text-green-400 hover:underline text-sm">⬇️ Download</button>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <button className="text-cyan-400" onClick={() => navigate(`/clients/${id}/contract/${item._id || item.id}`)}>View</button>
                            <button onClick={() => handleEditContract(item)} className="text-yellow-400">Edit</button>
                            <button onClick={() => deleteContract(item._id || item.id)} className="text-red-400">Delete</button>
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

        {/* ✅ Client Repository Folder */}
        {selectedFolder === "documents" && (
          <div className="glass p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h3 className="text-xl font-semibold">📁 Client Repository</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="glass-card px-4 py-2 cursor-pointer hover:scale-105 transition text-sm">
                  📎 Select Files
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.txt"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>
                {selectedFiles.length > 0 && (
                  <button
                    onClick={() => uploadDocuments(selectedFiles)}
                    disabled={uploadingDocs}
                    className={`glass-card px-4 py-2 blue-glow hover:scale-105 transition text-sm ${
                      uploadingDocs ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingDocs ? '⏳ Uploading...' : `📤 Upload ${selectedFiles.length} files`}
                  </button>
                )}
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="glass-card p-3 mb-4">
                <p className="text-sm text-gray-400">Selected files:</p>
                <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, idx) => (
                    <span key={idx} className="glass-card px-3 py-1 text-sm">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {documents.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  No documents uploaded
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc._id} className="glass-card p-4 hover:scale-105 transition-all duration-300">
                    <div className="flex flex-col items-center">
                      {doc.mimeType?.startsWith('image/') ? (
                        <img 
                          src={`${doc.fileUrl}?token=${localStorage.getItem('token')}`} 
                          alt={doc.filename}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-white/5 rounded-lg mb-3">
                          <span className="text-6xl">
                            {doc.mimeType === 'application/pdf' ? '📄' : '📎'}
                          </span>
                        </div>
                      )}

                      {/* Editable File Name */}
                      {renamingId === doc._id ? (
                        <div className="w-full flex items-center gap-2 mb-1">
                          <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => handleRenameKeyDown(e, doc._id)}
                            onBlur={() => renameDocument(doc._id, newFileName)}
                            className="glass-card px-2 py-1 text-sm w-full text-white outline-none focus:border-cyan-400/40"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-2 mb-1">
                          <p 
                            className="text-sm font-medium text-center truncate cursor-pointer hover:text-cyan-400 transition flex-1"
                            title="Double-click to rename"
                            onDoubleClick={() => startRename(doc)}
                          >
                            {doc.filename}
                          </p>
                          <button
                            onClick={() => startRename(doc)}
                            className="text-gray-400 hover:text-cyan-400 transition text-xs"
                            title="Rename"
                          >
                            ✏️
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                      <div className="flex gap-2 mt-3 flex-wrap justify-center">
                        <button
                          onClick={() => viewDocument(doc.fileUrl)}
                          className="glass-card px-3 py-1 text-cyan-400 hover:scale-105 transition text-xs"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => downloadDocument(doc.fileUrl, doc.filename)}
                          className="glass-card px-3 py-1 text-green-400 hover:scale-105 transition text-xs"
                        >
                          ⬇️ Download
                        </button>
                        <button
                          onClick={() => deleteDocument(doc._id)}
                          className="glass-card px-3 py-1 text-red-400 hover:scale-105 transition text-xs"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
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