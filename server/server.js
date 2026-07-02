const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { initGridFS } = require('./config/gridfs');


const app = express();

// ==========================================
// ✅ 1. CORS (Sabse pehle)
// ==========================================
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==========================================
// ✅ 2. Security & Rate Limiting
// ==========================================
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// ==========================================
// ✅ 3. Body Parser
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// ✅ 4. Connect to MongoDB
// ==========================================
connectDB();

// ✅ Initialize GridFS
initGridFS().catch(err => console.error('GridFS init failed:', err));

// ==========================================
// ✅ 5. Routes (CORS ke BAAD)
// ==========================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/pdfs', require('./routes/uploadGridFSRoutes'));

// ==========================================
// ✅ 6. Health Check & Root
// ==========================================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send('LegalVault API is running');
});

// ==========================================
// ✅ 7. 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ==========================================
// ✅ 8. Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ==========================================
// ✅ 9. Start Server
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});