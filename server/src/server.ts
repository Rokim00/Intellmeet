import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB, closeDB } from './config/db.js';
import { initSocket } from './socket/socket.js';
import { logger } from './utils/logger.js';
import { writeOpenApiFile } from './config/swagger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const httpServer = http.createServer(app);

// Initialize Socket.io attached to the HTTP server
initSocket(httpServer);

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    writeOpenApiFile(path.resolve(__dirname, '../openapi.json'));

    httpServer.listen(env.PORT, () => {
      logger.info(`IntellMeet Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`Health check available at: http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`Swagger API Docs available at: http://localhost:${env.PORT}/api/docs`);
    });
  } catch (err) {
    const error = err as Error;
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const handleShutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Gracefully shutting down IntellMeet server...`);
  httpServer.close(async () => {
    logger.info('HTTP server closed.');
    await closeDB();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();
