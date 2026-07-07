import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function ContractDetails() {
  const { id, contractId } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  // ✅ Fetch contract from backend
  useEffect(() => {
    const fetchContract = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('📋 Fetching contract with ID:', contractId);
        
        const response = await axios.get(`${API_URL}/api/contracts/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Contract fetched:', response.data);
        setContract(response.data);
      } catch (error) {
        console.error('❌ Error fetching contract:', error);
        
        // ✅ Fallback: localStorage se try karo
        const contracts = JSON.parse(localStorage.getItem(`contracts_${id}`)) || [];
        const selected = contracts.find(item => String(item.id) === contractId || String(item._id) === contractId);
        if (selected) {
          setContract(selected);
          console.log('✅ Contract loaded from localStorage fallback:', selected);
        } else {
          setContract(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (contractId) {
      fetchContract();
    }
  }, [id, contractId]);

  // ✅ PDF Preview
  useEffect(() => {
    if (contract?.pdfUrl && contract.pdfUrl.startsWith("data:application/pdf")) {
      fetch(contract.pdfUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          setPdfPreviewUrl(blobUrl);
        })
        .catch((err) => {
          console.log("PDF Preview Error", err);
        });
    }
  }, [contract]);

  // ✅ View PDF with token
  const viewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    window.open(`${pdfUrl}?token=${token}`, '_blank');
  };

  // ✅ Download PDF with token
  const downloadPDF = async (pdfUrl) => {
    if (!pdfUrl) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }
      
      const response = await axios.get(pdfUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'contract.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Contract Details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!contract) {
    return (
      <MainLayout>
        <div className="glass-card p-6">
          <p className="text-red-400">Contract Not Found</p>
          <button onClick={() => navigate(`/client/${id}`)} className="glass-card px-4 py-2 mt-4">
            ← Back to Client
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="glass p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Contract Details</h1>
          <button onClick={() => navigate(`/client/${id}`)} className="glass-card px-4 py-2 text-sm">
            ← Back to Client
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Contract Type</p>
            <h3 className="font-semibold mt-1">{contract.contractType || '-'}</h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Contract Name</p>
            <h3 className="font-semibold mt-1">{contract.contractName || '-'}</h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">First Party</p>
            <h3 className="font-semibold mt-1">{contract.firstParty || '-'}</h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Second Party</p>
            <h3 className="font-semibold mt-1">{contract.secondParty || '-'}</h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Start Date</p>
            <h3 className="font-semibold mt-1">{contract.startDate || '-'}</h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">End Date</p>
            <h3 className="font-semibold mt-1">{contract.endDate || '-'}</h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Status</p>
            <h3 className="font-semibold mt-1">
              <span className={`px-3 py-1 rounded-full text-sm ${
                contract.status === 'Active' 
                  ? 'bg-green-500/20 text-green-400 border border-green-400/20' 
                  : contract.status === 'Expired'
                  ? 'bg-red-500/20 text-red-400 border border-red-400/20'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/20'
              }`}>
                {contract.status || 'Active'}
              </span>
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">PDF Document</p>
            {contract.pdf ? (
              <div className="mt-2">
                <p className="text-sm text-gray-400 break-all mb-2">
                  {contract.pdf.split('/').pop() || 'PDF Document'}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => viewPDF(contract.pdf)}
                    className="glass-card px-4 py-2 text-cyan-400 hover:scale-105 transition"
                  >
                    📄 View PDF
                  </button>
                  <button
                    onClick={() => downloadPDF(contract.pdf)}
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

        {pdfPreviewUrl && (
          <iframe
            src={pdfPreviewUrl}
            width="100%"
            height="700"
            className="mt-5 rounded-lg"
            title="PDF Preview"
          />
        )}
      </div>
    </MainLayout>
  );
}

export default ContractDetails;