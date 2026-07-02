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

  // ✅ View PDF - Direct raw URL open karo
  const viewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    console.log('📄 View PDF URL:', pdfUrl);
    window.open(pdfUrl, '_blank');
  };

  // ✅ Download PDF - raw URL mein fl_attachment flag add karo
  const downloadPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    let url = pdfUrl;
    // Agar URL mein upload hai toh fl_attachment flag add karo
    if (url.includes('/upload/')) {
      url = url.replace('/upload/', '/upload/fl_attachment:/');
    }
    console.log('⬇️ Download PDF URL:', url);
    window.open(url, '_blank');
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

            <div className="glass-card p-4">
              <p className="text-gray-400 text-sm">PDF Document</p>
              {registration.pdf ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-400 break-all mb-2">
                    {registration.pdf.split('/').pop() || 'PDF Document'}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => viewPDF(registration.pdf)}
                      className="glass-card px-4 py-2 text-cyan-400 hover:scale-105 transition"
                    >
                      📄 View PDF
                    </button>
                    <button
                      onClick={() => downloadPDF(registration.pdf)}
                      className="glass-card px-4 py-2 text-green-400 hover:scale-105 transition"
                    >
                      ⬇️ Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <h3 className="font-semibold mt-1 text-gray-400">No PDF uploaded</h3>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default RegistrationDetails;