const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables if they haven't been loaded yet (useful for script or test execution)
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not defined in environment variables. Database operations may fail.');
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
} else {
  // Prevent multiple instances of Prisma Client in development due to hot-reloading
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

// Quick check function to test database connectivity
const checkDbConnection = async () => {
  if (!connectionString) {
    return false;
  }
  try {
    // Attempt a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  prisma,
  checkDbConnection,
};
