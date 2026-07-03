import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = 'https://legalvault-jm2n.onrender.com';

// ✅ Fetch clients from backend
const fetchClients = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/clients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch clients');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    // Fallback: localStorage se load karo
    return JSON.parse(localStorage.getItem('clients') || '[]');
  }
};

// ✅ Export PDF
export const exportClientsPDF = async () => {
  try {
    const clients = await fetchClients();
    
    if (!clients || clients.length === 0) {
      alert('No clients to export');
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('LegalVault Clients Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Table
    const tableData = clients.map((client) => [
      client.name || 'N/A',
      client.company || 'N/A',
      client.email || 'N/A',
      client.phone || 'N/A',
      client.status || 'Active'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Company', 'Email', 'Phone', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 148, 136] }
    });

    doc.save('LegalVault_Clients_Report.pdf');
  } catch (error) {
    console.error('PDF export error:', error);
    alert('Failed to export PDF');
  }
};

// ✅ Export Excel
export const exportClientsExcel = async () => {
  try {
    const clients = await fetchClients();
    
    if (!clients || clients.length === 0) {
      alert('No clients to export');
      return;
    }

    const tableData = clients.map((client) => ({
      'Name': client.name || 'N/A',
      'Company': client.company || 'N/A',
      'Email': client.email || 'N/A',
      'Phone': client.phone || 'N/A',
      'Status': client.status || 'Active',
      'Created At': client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    
    // Column width
    ws['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 }
    ];

    XLSX.writeFile(wb, 'LegalVault_Clients_Report.xlsx');
  } catch (error) {
    console.error('Excel export error:', error);
    alert('Failed to export Excel');
  }
};