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
const notificationRoutes = require('./routes/notificationRoutes');
const gstAutomationRoutes = require('./routes/gstAutomationRoutes');



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

// ✅ Force security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.removeHeader('X-Powered-By');
  next();
});

// ✅ Security - Helmet (with minimal config)
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: false, // manual header already set
  hidePoweredBy: true,
  hsts: false, // manual header already set
  ieNoOpen: true,
  noSniff: false, // manual header already set
  referrerPolicy: false, // manual header already set
  xssFilter: false // manual header already set
}));

// ✅ Trust Proxy (Render ke liye)
app.set('trust proxy', 1);

// ✅ CORS - Updated with all Vercel URLs
const allowedOrigins = (process.env.CORS_ORIGIN || 
  'http://localhost:5173,http://localhost:5174,https://legalvault-frontend-two.vercel.app,https://legalvault-ochre.vercel.app').split(',');

app.use(cors({
  origin: function (origin, callback) {
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

// ✅ Morgan - Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ✅ Compression - Faster responses
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// ✅ Rate Limiting - Stricter for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return false;
  }
});
app.use('/api/', limiter);

// ✅ Body Parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Cache Headers for static routes
app.use('/api/clients', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=60');
  }
  next();
});

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
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/automation', require('./routes/automationRoutes'));
app.use('/api/documents', require('./routes/uploadGridFSRoutes'));
app.use('/api/gst-automation', gstAutomationRoutes);




// ✅ Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Root
app.get('/', (req, res) => {
  res.send('LegalVault API is running');
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Global Error Handler - No stack trace in production
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

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
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
  console.log(`🛡️  Security Headers: Enabled (Manual)`);
  console.log(`🚦 Rate Limiting: 100 requests per 15 minutes`);
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