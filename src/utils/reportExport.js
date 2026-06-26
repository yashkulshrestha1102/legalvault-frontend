import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportClientsPDF = () => {

  const clients =
    JSON.parse(
      localStorage.getItem("clients")
    ) || [];

  const doc = new jsPDF();

  doc.text(
    "LegalVault Clients Report",
    14,
    15
  );

  autoTable(doc, {
    startY: 25,

    head: [[
      "Name",
      "Company",
      "Email",
      "Phone",
      "Status"
    ]],

    body: clients.map((client) => [
      client.name,
      client.company,
      client.email,
      client.phone,
      client.status,
    ]),
  });

  doc.save("clients-report.pdf");
};

export const exportClientsExcel = () => {

  const clients =
    JSON.parse(
      localStorage.getItem("clients")
    ) || [];

  const worksheet =
    XLSX.utils.json_to_sheet(clients);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Clients"
  );

  XLSX.writeFile(
    workbook,
    "clients-report.xlsx"
  );
};