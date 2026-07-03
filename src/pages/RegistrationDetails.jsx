import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function RegistrationDetails() {
  const { id, registrationId } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('📋 Fetching registration:', registrationId);
        const response = await axios.get(`${API_URL}/api/registrations/${registrationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Registration fetched:', response.data);
        setRegistration(response.data);
        
        // ✅ Fetch associated documents
        if (response.data._id) {
          fetchDocuments(response.data._id);
        }
      } catch (error) {
        console.error('❌ Error fetching registration:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistration();
  }, [registrationId]);

  // ✅ Fetch documents for this registration
  const fetchDocuments = async (regId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/pdfs/registration/${regId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Documents fetched:', response.data);
      setDocuments(response.data);
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
    }
  };

  // ✅ View Document (PDF/Image)
  const viewDocument = (docUrl) => {
    if (!docUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    const finalUrl = `${docUrl}?token=${token}`;
    console.log('📄 View Document - Final URL:', finalUrl);
    
    const newWindow = window.open(finalUrl, '_blank');
    if (!newWindow) {
      const link = document.createElement('a');
      link.href = finalUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ✅ Download Document
  const downloadDocument = async (docUrl, filename) => {
    if (!docUrl) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }
      const finalUrl = `${docUrl}?token=${token}`;
      console.log('⬇️ Download Document - Final URL:', finalUrl);
      
      const response = await axios.get(finalUrl, {
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
      console.error('❌ Download error:', error);
      alert('Failed to download document');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Registration Details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!registration) {
    return (
      <MainLayout>
        <div className="glass-card p-6">
          <p className="text-red-400">Registration Not Found</p>
          <button onClick={() => navigate(`/clients/${id}`)} className="glass-card px-4 py-2 mt-4">
            ← Back to Client
          </button>
        </div>
      </MainLayout>
    );
  }

  const getDaysLeft = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const statusColor = registration.endDate
    ? getDaysLeft(registration.endDate) <= 0 ? 'text-red-400'
      : getDaysLeft(registration.endDate) <= 30 ? 'text-yellow-400'
      : 'text-green-400'
    : 'text-gray-400';

  const statusText = registration.endDate
    ? getDaysLeft(registration.endDate) <= 0 ? 'Expired'
      : getDaysLeft(registration.endDate) <= 30 ? 'Expiring Soon'
      : 'Valid'
    : 'N/A';

  return (
    <MainLayout>
      <div className="p-6">
        <button onClick={() => navigate(`/clients/${id}`)} className="glass-card px-4 py-2 mb-6 text-sm hover:scale-105 transition">
          ← Back to Client
        </button>

        <div className="glass p-6">
          <h1 className="text-3xl font-bold mb-6">Registration Details</h1>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Type</p>
              <h3 className="font-semibold mt-1">{registration.category || 'N/A'}</h3>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Registration Name</p>
              <h3 className="font-semibold mt-1">{registration.registrationName}</h3>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Start Date</p>
              <h3 className="font-semibold mt-1">{registration.startDate || 'N/A'}</h3>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">End Date</p>
              <h3 className="font-semibold mt-1">{registration.endDate || 'N/A'}</h3>
            </div>
            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">Status</p>
              <h3 className={`font-semibold mt-1 ${statusColor}`}>{statusText}</h3>
            </div>

            {/* ✅ Multiple Documents Section */}
            <div className="glass-card p-4 md:col-span-2">
              <p className="text-gray-400 text-sm mb-2">📄 Documents</p>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between glass-card p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {doc.filename}
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            doc.fileType === 'pdf' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {doc.fileType}
                          </span>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDocument(doc.fileUrl)}
                          className="text-cyan-400 hover:underline text-sm"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => downloadDocument(doc.fileUrl, doc.filename)}
                          className="text-green-400 hover:underline text-sm"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm mt-1">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default RegistrationDetails;