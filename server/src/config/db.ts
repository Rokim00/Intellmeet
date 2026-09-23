import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Production Best Practice: Prioritize IPv4 DNS resolution for Node.js dual-stack networking
try {
  dns.setDefaultResultOrder('ipv4first');
  // In development environments, fallback to Google/Cloudflare DNS if local ISP DNS blocks SRV lookups
  if (env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch {
  // Gracefully fallback to default system DNS
}

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (!env.MONGO_URI) {
    logger.warn('MONGO_URI is not set. Database connection skipped.');
    return;
  }

  if (isConnected) {
    logger.info('Using existing MongoDB connection.');
    return;
  }

  try {
    const connectionInstance = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    });

    isConnected = true;
    logger.info(`MongoDB connected successfully! Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    const err = error as Error;
    logger.error(`MongoDB connection failed: ${err.message}`);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB connection lost. Retrying...');
});

mongoose.connection.on('error', (err: Error) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

export const getDBStatus = (): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed cleanly.');
  }
};
