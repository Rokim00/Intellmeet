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

// Docker/Kubernetes mount secrets as files under /run/secrets. Reading from a
// file keeps credentials out of the image, the process list and CI logs.
// Never fall back to a built-in default for a secret: a missing value must fail
// loudly rather than silently sign tokens with a publicly known key.
const readSecret = (name: string): string | undefined => {
  const filePath = process.env[`${name}_FILE`];
  if (!filePath) return undefined;
  try {
    if (!fs.existsSync(filePath)) return undefined;
    const value = fs.readFileSync(filePath, 'utf-8').trim();
    return value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
};

const resolveSecret = (name: string): string | undefined =>
  (readSecret(name) ?? process.env[name])?.replace(/^["']|["']$/g, '') || undefined;

const rawMongoUri = resolveSecret('MONGO_URI') ?? resolveSecret('MONGODB_URI');
const accessSecret = resolveSecret('JWT_ACCESS_SECRET');
const refreshSecret = resolveSecret('JWT_REFRESH_SECRET');

// Non-secret settings are the only ones allowed a default value.
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const validateEnv = (): void => {
  const missing: string[] = [];
  if (!rawMongoUri) missing.push('MONGO_URI (or MONGO_URI_FILE / MONGODB_URI)');
  if (!accessSecret) missing.push('JWT_ACCESS_SECRET (or JWT_ACCESS_SECRET_FILE)');
  if (!refreshSecret) missing.push('JWT_REFRESH_SECRET (or JWT_REFRESH_SECRET_FILE)');

  if (missing.length > 0) {
    console.error(
      `[CONFIG ERROR] Missing required configuration:\n  - ${missing.join('\n  - ')}\n` +
        'Set them in server/.env for local work, or mount Docker secrets from server/secrets/ ' +
        '(node server/scripts/generate-secrets.mjs).'
    );
    process.exit(1);
  }
};

validateEnv();

export const env: Readonly<EnvConfig> = Object.freeze({
  NODE_ENV,
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: rawMongoUri as string,
  CORS_ORIGIN: process.env.CORS_ORIGIN || (isProduction ? '' : '*'),
  JWT_ACCESS_SECRET: accessSecret as string,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_SECRET: refreshSecret as string,
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  AWS_ENDPOINT_URL: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'test',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'intellmeet-bucket'
});
