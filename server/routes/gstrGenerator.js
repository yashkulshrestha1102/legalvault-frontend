router.post('/generate-gstr', async (req, res) => {
  try {
    const invoices = req.body.invoices; // Array of extracted invoices
    
    // ✅ GSTR-1 (Outward Supplies)
    const gstr1 = {
      b2bInvoices: invoices.filter(i => i.buyerGSTIN && i.buyerGSTIN.length > 0),
      b2cInvoices: invoices.filter(i => !i.buyerGSTIN || i.buyerGSTIN.length === 0),
      exports: invoices.filter(i => i.buyerGSTIN && i.buyerGSTIN.startsWith('00')),
      totalTaxableValue: invoices.reduce((sum, i) => sum + (i.taxableAmount || 0), 0),
      totalGst: invoices.reduce((sum, i) => sum + (i.totalGst || 0), 0)
    };

    // ✅ GSTR-3B (Summary)
    const gstr3b = {
      totalSales: gstr1.totalTaxableValue,
      totalGstCollected: gstr1.totalGst,
      totalPurchases: 0, // From purchase invoices
      totalGstPaid: 0,
      netGstLiability: gstr1.totalGst - 0
    };

    res.json({ gstr1, gstr3b });
  } catch (error) {
    console.error('❌ GSTR generation error:', error);
    res.status(500).json({ message: error.message });
  }
});