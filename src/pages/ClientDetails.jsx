import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
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

  // ✅ Fetch client from backend
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('📥 Fetching client with ID:', id);
        
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        
        let clientData;
        if (!isValidObjectId) {
          console.warn('⚠️ Invalid ObjectId format, trying fallback...');
          const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
          const foundClient = savedClients.find(c => String(c.id) === String(id) || String(c._id) === String(id));
          if (foundClient) {
            clientData = foundClient;
            console.log('✅ Client found in localStorage:', clientData);
          } else {
            throw new Error('Client not found');
          }
        } else {
          const response = await axios.get(`${API_URL}/api/clients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          clientData = response.data;
          console.log('✅ Client fetched from backend:', clientData);
        }
        
        setClient(clientData);
      } catch (error) {
        console.error('❌ Error fetching client:', error);
        const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
        const foundClient = savedClients.find(c => String(c.id) === String(id) || String(c._id) === String(id));
        if (foundClient) {
          setClient(foundClient);
          console.log('✅ Client loaded from localStorage fallback:', foundClient);
        } else {
          setClient(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  // ✅ Fetch registrations from backend
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

  // ✅ Fetch contracts from backend
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

  // ✅ Load registrations and contracts on mount
  useEffect(() => {
    if (id) {
      console.log('🔄 Loading data for client ID:', id);
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isValidObjectId) {
        fetchRegistrations();
        fetchContracts();
      }
    } else {
      console.error('❌ No client ID available');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  // ✅ View PDF - Direct URL with token as query param
  const viewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    window.open(`${pdfUrl}?token=${token}`, '_blank');
  };

  // ✅ Download PDF - Direct URL with token as query param
  const downloadPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    window.open(`${pdfUrl}?token=${token}`, '_blank');
  };

  // ✅ Save registration to backend - FIXED with duplicate check
 const saveRegistration = async (registrationData) => {
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Check if id is valid ObjectId
    let validClientId = id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (!isValidObjectId) {
      // ... client sync code (same as before)
    }
    
    // ✅ Now save registration with valid client ID
    const data = { 
      ...registrationData, 
      clientId: validClientId 
    };
    
    // ✅ PDF upload - registrationData.pdf se check karo
    if (registrationData.pdf && !data.pdf) {
      data.pdf = registrationData.pdf;
      console.log('📄 PDF URL from modal:', data.pdf);
    }
    
    // ✅ Agar registrationData.pdfFile hai toh upload karo
    if (registrationData.pdfFile) {
      const pdfUrl = await uploadPDF(registrationData.pdfFile);
      if (pdfUrl) {
        data.pdf = pdfUrl;
        console.log('📄 PDF uploaded and set:', pdfUrl);
      }
    }
    
    // ✅ Save registration
    const response = await axios.post(`${API_URL}/api/registrations`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Registration saved:', response.data);
    
    fetchRegistrations();
    setEditRegistration(null);
    setOpenModal(false);
    alert('✅ Registration saved successfully!');
    
  } catch (error) {
    console.error('❌ Error saving registration:', error);
    alert('Failed to save registration: ' + (error.response?.data?.message || error.message));
  }
};

  // ✅ Delete registration from backend
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

  // ✅ Save contract to backend - FIXED with duplicate check
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
            // ✅ STEP 1: Pehle check karo ki client already exists ya nahi
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
      
      if (contractData.pdfFile) {
        const pdfUrl = await uploadPDF(contractData.pdfFile);
        if (pdfUrl) data.pdf = pdfUrl;
      }
      
      if (editContract) {
        await axios.put(`${API_URL}/api/contracts/${editContract._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/contracts`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  // ✅ Delete contract from backend
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

  // ✅ User permissions
  const permissions = user?.folderPermissions || [];
  const role = user?.role || 'user';

  const allFolders = [
    { label: "Registrations / Certifications", value: "registrations" },
    { label: "Contracts", value: "contracts" },
    { label: "Policies", value: "policies" },
    { label: "Corporate Secretariat", value: "corporateSecretariat" },
    { label: "HR", value: "hr" },
    { label: "GST", value: "gst" },
    { label: "Income Tax", value: "incomeTax" },
    { label: "Financials", value: "financials" }
  ];

  const accessibleFolders = allFolders.filter(f => {
    if (role === 'admin') return true;
    const folderIdMap = {
      'registrations': 'registrations',
      'contracts': 'contracts',
      'policies': 'policies',
      'corporateSecretariat': 'corporate-secretariat',
      'hr': 'hr',
      'gst': 'gst',
      'incomeTax': 'income-tax',
      'financials': 'financials'
    };
    return permissions.includes(folderIdMap[f.value] || f.value);
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
    <MainLayout>
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
        </div>

        {/* Folders Grid */}
        {accessibleFolders.length > 0 && (
          <div className="grid md:grid-cols-4 gap-5">
            {accessibleFolders.map((folder) => (
              <div key={folder.value} onClick={() => setSelectedFolder(folder.value)} className="glass-card p-6 cursor-pointer hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">📁</div>
                <h3 className="font-semibold">{folder.label}</h3>
              </div>
            ))}
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