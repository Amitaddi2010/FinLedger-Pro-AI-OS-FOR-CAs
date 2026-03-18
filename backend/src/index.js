import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  const app = express();

  // Middleware
  app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    credentials: true 
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Routes
  app.use('/api/auth', authRoutes);
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
