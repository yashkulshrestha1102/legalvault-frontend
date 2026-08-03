const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/extract-invoice', async (req, res) => {
  try {
    const { imageData, mimeType } = req.body;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" // Fast & cheap
    });

    const prompt = `
You are an expert in reading Indian GST invoices.
Extract the following fields in JSON format:
- invoiceNumber
- invoiceDate (YYYY-MM-DD)
- supplierGSTIN (valid format: 2 digits + 5 letters + 4 digits + 1 letter + 1 digit + Z + 1 alphanumeric)
- buyerGSTIN
- totalAmount (number)
- taxableAmount (number)
- cgst (number)
- sgst (number)
- igst (number)
- totalGst (number)
- items: array of { description, quantity, unitPrice, total }

Return only valid JSON, no extra text.`;

    const result = await model.generateContent([
      { inlineData: { data: imageData, mimeType: mimeType } },
      prompt
    ]);

    const response = result.response.text();
    const extractedData = JSON.parse(response);
    
    res.json(extractedData);
  } catch (error) {
    console.error('❌ Extraction error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;