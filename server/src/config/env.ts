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

const requireEnv = (key: string, isRequired = true): string => {
  const value = (process.env[key] || '').trim();
  
  if (value) {
    return value;
  }

  if (isRequired) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[CRITICAL CONFIG ERROR] Required environment variable '${key}' is missing.`);
      process.exit(1);
    } else {
      console.error(`[CONFIG SOFT-ERROR] Missing environment variable '${key}'. Please define it in your .env or .env.local.`);
    }
  }

  return '';
};

export const env: Readonly<EnvConfig> = Object.freeze({
  NODE_ENV: requireEnv('NODE_ENV'),
  PORT: parseInt(requireEnv('PORT'), 10),
  MONGO_URI: rawMongoUri || requireEnv('MONGO_URI'),
  CORS_ORIGIN: requireEnv('CORS_ORIGIN'),
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_ACCESS_EXPIRY: requireEnv('JWT_ACCESS_EXPIRY'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRY: requireEnv('JWT_REFRESH_EXPIRY'),
  AWS_ENDPOINT_URL: requireEnv('AWS_ENDPOINT_URL', false),
  AWS_REGION: requireEnv('AWS_REGION', false),
  AWS_ACCESS_KEY_ID: requireEnv('AWS_ACCESS_KEY_ID', false),
  AWS_SECRET_ACCESS_KEY: requireEnv('AWS_SECRET_ACCESS_KEY', false),
  AWS_S3_BUCKET: requireEnv('AWS_S3_BUCKET', false)
});
