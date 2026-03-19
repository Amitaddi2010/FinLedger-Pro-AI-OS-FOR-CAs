import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import deadlineRoutes from './routes/deadlineRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

// ═══ Environment Validation ═══
const requiredEnvVars = ['JWT_SECRET'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. Authentication will fail. Set it in your .env file.');
}

const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  const app = express();

  // ═══ Rate Limiting ═══
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,                  // 300 requests per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
  });

  const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minute
    max: 5,                    // 5 auth attempts per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Please wait a moment before trying again.' }
  });

  app.use(globalLimiter);

  // Middleware
  // Strip trailing slashes from origin
  const frontendOrigin = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.replace(/\/$/, '') 
    : 'http://localhost:5173';

  app.use(cors({ 
    origin: frontendOrigin, 
    credentials: true 
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Routes
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/insights', insightRoutes);
  app.use('/api/metrics', metricsRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/deadlines', deadlineRoutes);
  app.use('/api/alerts', alertRoutes);

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
