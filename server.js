// Load environment variables as early as possible
require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { prisma } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Create the HTTP server
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Project Management System Backend`);
  console.log(`  Server running on port: ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Health Check URL: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});

// Graceful shutdown helper
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Initiating graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed.');
    
    try {
      // Properly close the database client connection
      await prisma.$disconnect();
      console.log('Database client disconnected.');
      process.exit(0);
    } catch (error) {
      console.error('Failed to gracefully disconnect database client:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10s if connections linger
  setTimeout(() => {
    console.warn('Forcing immediate shutdown: operations timed out.');
    process.exit(1);
  }, 10000);
};

// Process lifetime event listeners
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  // Uncaught exceptions indicate unstable state; crash safely
  process.exit(1);
});
