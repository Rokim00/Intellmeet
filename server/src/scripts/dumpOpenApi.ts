import path from 'path';
import { fileURLToPath } from 'url';
import { writeOpenApiFile } from '../config/swagger.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = path.resolve(__dirname, '../../openapi.json');

if (env.NODE_ENV === 'production') {
  logger.info('Skipping openapi.json generation (production).');
  process.exit(0);
}

if (writeOpenApiFile(target)) {
  logger.info(`OpenAPI spec written to ${target}`);
} else {
  process.exit(1);
}
