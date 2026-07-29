import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";
import { FaFilePdf, FaEye, FaDownload } from "react-icons/fa";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function RegistrationDetails() {
  const { id, registrationId } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('❌ Error fetching registration:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistration();
  }, [registrationId]);

  // ✅ View PDF - Direct URL with token
  const viewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    const finalUrl = `${pdfUrl}?token=${token}`;
    window.open(finalUrl, '_blank');
  };

  // ✅ Download PDF - Direct URL with token
  const downloadPDF = async (pdfUrl) => {
    if (!pdfUrl) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }
      const finalUrl = `${pdfUrl}?token=${token}`;
      
      const response = await axios.get(finalUrl, {
        responseType: 'blob'
      });
      
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

  // ✅ Get filename from URL
  const getFileName = (url) => {
    if (!url) return 'document.pdf';
    return url.split('/').pop() || 'document.pdf';
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

  // ✅ Get PDFs array
  const pdfs = registration.pdfs || (registration.pdf ? [registration.pdf] : []);

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

            {/* ✅ Multiple PDF Documents */}
            <div className="glass-card p-4 md:col-span-2">
              <p className="text-gray-400 text-sm mb-3">📄 Documents ({pdfs.length})</p>
              {pdfs.length === 0 ? (
                <h3 className="font-semibold mt-1 text-gray-400">No documents uploaded</h3>
              ) : (
                <div className="space-y-2">
                  {pdfs.map((pdfUrl, index) => (
                    <div key={index} className="glass-card p-3 flex items-center justify-between hover:bg-white/5 transition">
                      <div className="flex items-center gap-3">
                        <FaFilePdf className="text-red-400 text-xl" />
                        <div>
                          <p className="font-medium text-sm">{getFileName(pdfUrl)}</p>
                          <p className="text-xs text-gray-400">Document {index + 1}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewPDF(pdfUrl)}
                          className="glass-card px-3 py-1.5 text-cyan-400 hover:scale-105 transition text-sm flex items-center gap-1"
                        >
                          <FaEye className="text-xs" /> View
                        </button>
                        <button
                          onClick={() => downloadPDF(pdfUrl)}
                          className="glass-card px-3 py-1.5 text-green-400 hover:scale-105 transition text-sm flex items-center gap-1"
                        >
                          <FaDownload className="text-xs" /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default RegistrationDetails;