import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize paths with forward slashes for cross-platform glob matching in swagger-jsdoc
const routesPathTs = path.resolve(__dirname, '../routes/**/*.ts').replace(/\\/g, '/');
const routesPathJs = path.resolve(__dirname, '../routes/**/*.js').replace(/\\/g, '/');
const distRoutesPathJs = path.resolve(__dirname, '../../dist/routes/**/*.js').replace(/\\/g, '/');

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'IntellMeet API',
      version: '1.0.0',
      description: 'Production-grade enterprise meeting & collaboration platform API.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token'
        }
      }
    }
  },
  apis: [routesPathTs, routesPathJs, distRoutesPathJs]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Writes the generated spec to server/openapi.json.
 * Dev-only: never called when NODE_ENV=production, so the file is not
 * read or written on a production host.
 */
export const writeOpenApiFile = (outputPath: string): boolean => {
  if (env.NODE_ENV === 'production') {
    return false;
  }

  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(swaggerSpec, null, 2)}\n`, 'utf8');
    return true;
  } catch (error) {
    logger.warn(`Could not write openapi.json: ${(error as Error).message}`);
    return false;
  }
};
