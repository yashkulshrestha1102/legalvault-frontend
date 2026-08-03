const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Extract invoice using Gemini AI
router.post('/extract', auth, async (req, res) => {
  try {
    console.log('🤖 Gemini AI Extraction started');
    const { imageData, mimeType } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing');
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert in reading Indian GST invoices.
Extract the following fields in valid JSON format:
{
  "invoiceNumber": "string",
  "invoiceDate": "YYYY-MM-DD",
  "supplierName": "string",
  "supplierGSTIN": "string (15 characters)",
  "buyerName": "string",
  "buyerGSTIN": "string (15 characters)",
  "totalAmount": number,
  "taxableAmount": number,
  "cgst": number,
  "sgst": number,
  "igst": number,
  "totalGst": number,
  "items": [
    { "description": "string", "quantity": number, "unitPrice": number, "total": number }
  ]
}

Return ONLY valid JSON, no extra text or markdown.
`;

    console.log('📤 Sending to Gemini AI...');
    
    const result = await model.generateContent([
      { inlineData: { data: imageData, mimeType: mimeType || 'image/png' } },
      prompt
    ]);

    const response = result.response.text();
    console.log('📥 Gemini Response:', response);

    // ✅ Parse JSON response
    const extractedData = JSON.parse(response);
    
    // ✅ Validate GSTIN format
    const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/;
    if (extractedData.supplierGSTIN && !gstinRegex.test(extractedData.supplierGSTIN)) {
      console.warn('⚠️ Invalid GSTIN format:', extractedData.supplierGSTIN);
    }

    console.log('✅ Gemini Extraction complete');
    res.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error('❌ Gemini extraction error:', error);
    res.status(500).json({ 
      message: 'Failed to extract invoice data',
      error: error.message 
    });
  }
});

module.exports = router;