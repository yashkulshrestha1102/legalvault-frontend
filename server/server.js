const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { initGridFS } = require('./config/gridfs');
const auditLog = require('./middleware/audit');

const app = express();

// ✅ Environment Variable Validation
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});
console.log('✅ All environment variables are set');

// ✅ CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://legalvault-frontend-two.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// ✅ Morgan (Request Logging)
app.use(morgan('dev'));

// ✅ Compression
app.use(compression());

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// ✅ Security
app.use(helmet());

// ✅ Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Audit Log Middleware
app.use(auditLog);

// ✅ Connect to MongoDB
connectDB();

// ✅ Initialize GridFS
initGridFS().catch(err => {
  console.error('GridFS initialization failed:', err);
});

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/pdfs', require('./routes/uploadGridFSRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

// ✅ Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// ✅ Root
app.get('/', (req, res) => {
  res.send('LegalVault API is running');
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ✅ Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});