import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import rewardRoutes from './routes/rewards.js';
import walletRoutes from './routes/wallet.js';
import notificationRoutes from './routes/notifications.js';
import storeRoutes from './routes/stores.js';
import couponRoutes from './routes/coupons.js';
import cashierRoutes from './routes/cashier.js';
import adminRoutes from './routes/admin.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { 
  sanitizeInput, 
  detectSuspiciousActivity, 
  preventParameterPollution,
  checkContentType,
  checkBodySize 
} from './middleware/security.js';

// โหลด .env จากโฟลเดอร์ server (local) — บน Vercel ใช้ env จาก Dashboard
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

const isVercelOrigin = (origin) => origin && (
  origin.endsWith('.vercel.app') ||
  origin === 'https://vercel.com' ||
  origin.startsWith('https://') && origin.includes('vercel.app')
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsOrigins.indexOf(origin) !== -1 || isVercelOrigin(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5001", "http://127.0.0.1:5000", "http://127.0.0.1:5001", "https://cdn.jsdelivr.net"]
    }
  }
})); // Security headers with CSP
app.use(morgan('combined')); // Request logging
app.use(express.json({ limit: '1mb' })); // Limit body size
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(checkBodySize);
app.use(checkContentType);
app.use(sanitizeInput);
app.use(detectSuspiciousActivity);
app.use(preventParameterPollution);
app.use('/api', apiLimiter); // Rate limiting for all API routes

app.get('/', (req, res) => {
  res.json({ 
    message: 'Jespark Rewards API',
    version: '1.0.0',
    status: 'running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cashier', cashierRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// รัน listen เฉพาะเมื่อไม่ใช่ Vercel (บน Vercel ใช้ serverless จาก api/index.js)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Jespark Rewards API Server`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`\n✅ Available endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   POST   /api/auth/line-login`);
    console.log(`   GET    /api/users/me`);
    console.log(`   PUT    /api/users/me`);
    console.log(`   POST   /api/users/points/add`);
    console.log(`   GET    /api/rewards`);
    console.log(`   POST   /api/rewards/redeem`);
    console.log(`   GET    /api/wallet/balance`);
    console.log(`   POST   /api/wallet/topup`);
    console.log(`   POST   /api/wallet/payment`);
    console.log(`   GET    /api/wallet/transactions`);
    console.log(`   GET    /api/notifications`);
    console.log(`   GET    /api/stores`);
    console.log(`   GET    /api/coupons\n`);
  });
}

export default app;
