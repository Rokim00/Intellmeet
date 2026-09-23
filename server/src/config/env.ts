import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { EnvConfig } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envLocalPath = path.resolve(__dirname, '../../.env.local');
const envPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const rawMongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').replace(/^["']|["']$/g, '');

const validateEnv = (): void => {
  if (!rawMongoUri) {
    console.error(
      `[CRITICAL ERROR] Missing required MongoDB URI (MONGO_URI or MONGODB_URI).\n` +
      `Please check server/.env or server/.env.local.`
    );
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

validateEnv();

export const env: Readonly<EnvConfig> = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: rawMongoUri,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  AWS_ENDPOINT_URL: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'test',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'intellmeet-bucket'
});
