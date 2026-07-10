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

// ✅ CORS - Dynamic Origin (WITHOUT app.options('*', cors()))
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,https://legalvault-frontend-two.vercel.app').split(',');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// ✅ Security - Helmet with fine-tuned configuration
app.use(helmet({
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

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

// ✅ Global Error Handler - FIXED (No stack trace in production)
app.use((err, req, res, next) => {
  // ✅ Log error internally
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // ✅ Hide stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    // ✅ Only send details in development
    ...(isDevelopment && { 
      error: err,
      stack: err.stack 
    })
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
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