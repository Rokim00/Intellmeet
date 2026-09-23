import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

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
