import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";
import AuthContext from '../context/AuthContext';
import AddRegistrationModal from "../components/modals/AddRegistrationModal";
import AddContractModal from "../components/modals/AddContractModal";

import DocumentsPage from "./folders/DocumentsPage";
import PoliciesPage from "./folders/PoliciesPage";
import GSTPage from "./folders/GSTPage";
import IncomeTaxPage from "./folders/IncomeTaxPage";
import HRPage from "./folders/HRPage";
import CorporateSecretariatPage from "./folders/CorporateSecretariatPage";
import FinancialsPage from "./folders/FinancialsPage";

const API_URL = 'https://legalvault-jm2n.onrender.com';

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
      const token = localStorage.getItem('token');
      console.log('📥 Fetching client with ID:', actualId);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      let clientData = null;
      
      if (isValidObjectId) {
        try {
          const response = await axios.get(`${API_URL}/api/clients/${actualId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
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
      const token = localStorage.getItem('token');
      if (!actualId) {
        console.error('❌ Client ID is undefined!');
        return;
      }
      console.log('📋 Fetching registrations for client ID:', actualId);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      if (!isValidObjectId) {
        console.warn('⚠️ Invalid ObjectId, skipping registrations fetch');
        setRegistrations([]);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/registrations/client/${actualId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Registrations fetched:', response.data);
      setRegistrations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching registrations:', error.response?.data || error.message);
      setRegistrations([]);
    }
  };

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('📋 Fetching contracts for client ID:', actualId);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      if (!isValidObjectId) {
        console.warn('⚠️ Invalid ObjectId, skipping contracts fetch');
        setContracts([]);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/contracts/client/${actualId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Contracts fetched:', response.data);
      setContracts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching contracts:', error.response?.data || error.message);
      setContracts([]);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!actualId) {
        console.error('❌ Client ID is undefined!');
        return;
      }
      console.log('📋 Fetching documents for client ID:', actualId);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      if (!isValidObjectId) {
        console.warn('⚠️ Invalid ObjectId, skipping documents fetch');
        setDocuments([]);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/documents/client/${actualId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Documents fetched:', response.data);
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching documents:', error.response?.data || error.message);
      setDocuments([]);
    }
  };

  // ✅ SINGLE useEffect with Invalid ObjectId safe fallback
  useEffect(() => {
    if (actualId) {
      console.log('🔄 Loading data for client ID:', actualId);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      
      if (isValidObjectId) {
        fetchClient();
        fetchRegistrations();
        fetchContracts();
        fetchDocuments();
      } else {
        console.warn('⚠️ Invalid ObjectId, attempting to load from localStorage only.');
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
      console.error('❌ No client ID available');
      setLoading(false);
    }
  }, [actualId]);

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
      formData.append('clientId', actualId);
      
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
      
      const fileCount = response.data.files ? response.data.files.length : (response.data.length || 0);
      alert(`✅ ${fileCount} files uploaded successfully!`);
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

  const saveRegistration = async (registrationData) => {
    try {
      const token = localStorage.getItem('token');
      
      let validClientId = actualId;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      
      if (!isValidObjectId) {
        console.log('⚠️ Invalid ObjectId, trying to sync client to backend...');
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const localClient = savedClients.find(c => String(c.id) === String(actualId) || String(c._id) === String(actualId));
        
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
                String(c.id) === String(actualId) || String(c._id) === String(actualId) 
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

  const saveContract = async (contractData) => {
    try {
      const token = localStorage.getItem('token');
      
      let validClientId = actualId;
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(actualId);
      
      if (!isValidObjectId) {
        console.log('⚠️ Invalid ObjectId, trying to sync client to backend...');
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const localClient = savedClients.find(c => String(c.id) === String(actualId) || String(c._id) === String(actualId));
        
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
                String(c.id) === String(actualId) || String(c._id) === String(actualId) 
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

  const getUserFolderPermissions = () => {
    if (!client || !client.userPermissions) return [];
    const userPerm = client.userPermissions.find(p => 
      String(p.userId?._id || p.userId) === String(user?.id)
    );
    return userPerm?.folderPermissions || [];
  };

  const userFolderPermissions = getUserFolderPermissions();
  const role = user?.role || 'user';
  
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
                {client.userPermissions
                  .filter((p, index, self) => 
                    index === self.findIndex((t) => 
                      String(t.userId?._id || t.userId) === String(p.userId?._id || p.userId)
                    )
                  )
                  .map((p) => (
                    <div 
                      key={`perm-${p.userId?._id || p.userId}`} 
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{p.userId?.name || 'Unknown'}</span>
                      <span className="text-xs bg-cyan-500/30 px-1.5 py-0.5 rounded">
                        {p.folderPermissions?.length || 0} folders
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

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
                    registrations.map((item, index) => (
                      <tr key={`reg-${item._id || item.id || index}`}>
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
                            <button onClick={() => navigate(`/clients/${actualId}/registration/${item._id || item.id}`)} className="text-cyan-400">View</button>
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
                    contracts.map((item, index) => (
                      <tr key={`contract-${item._id || item.id || index}`}>
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
                            <button className="text-cyan-400" onClick={() => navigate(`/clients/${actualId}/contract/${item._id || item.id}`)}>View</button>
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

        {selectedFolder === "policies" && <PoliciesPage clientId={actualId} />}
        {selectedFolder === "gst" && <GSTPage clientId={actualId} />}
        {selectedFolder === "incomeTax" && <IncomeTaxPage clientId={actualId} />}
        {selectedFolder === "hr" && <HRPage clientId={actualId} />}
        {selectedFolder === "corporateSecretariat" && <CorporateSecretariatPage clientId={actualId} />}
        {selectedFolder === "financials" && <FinancialsPage clientId={actualId} />}
        {selectedFolder === "documents" && <DocumentsPage clientId={actualId} />}
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