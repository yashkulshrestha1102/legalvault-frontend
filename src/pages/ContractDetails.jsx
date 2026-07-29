import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import MainLayout from "../layouts/MainLayout";
import { FaFilePdf, FaEye, FaDownload, FaFile } from "react-icons/fa";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function ContractDetails() {
  const { id, contractId } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setContract(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const viewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    window.open(`${pdfUrl}?token=${token}`, '_blank');
  };

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

  const getFileName = (url) => {
    if (!url) return 'document.pdf';
    return url.split('/').pop() || 'document.pdf';
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

  const pdfs = contract.pdfs || (contract.pdf ? [contract.pdf] : []);

  return (
    <MainLayout>
      <div className="glass p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Contract Details</h1>
          <button onClick={() => navigate(`/client/${id}`)} className="glass-card px-4 py-2 text-sm">
            ← Back to Client
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
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
        </div>

        {/* ✅ PDF Grid Preview */}
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm mb-4">📄 Documents ({pdfs.length})</p>
          {pdfs.length === 0 ? (
            <h3 className="font-semibold mt-1 text-gray-400">No documents uploaded</h3>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pdfs.map((pdfUrl, index) => (
                <div key={index} className="glass-card p-4 hover:scale-105 transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <FaFilePdf className="text-red-400 text-5xl mb-3" />
                    <p className="text-sm font-medium text-center truncate w-full">
                      {getFileName(pdfUrl)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Document {index + 1}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => viewPDF(pdfUrl)}
                        className="glass-card px-3 py-1.5 text-cyan-400 hover:scale-105 transition text-xs flex items-center gap-1"
                      >
                        <FaEye className="text-xs" /> View
                      </button>
                      <button
                        onClick={() => downloadPDF(pdfUrl)}
                        className="glass-card px-3 py-1.5 text-green-400 hover:scale-105 transition text-xs flex items-center gap-1"
                      >
                        <FaDownload className="text-xs" /> Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default ContractDetails;