const { checkDbConnection } = require('../config/db');

/**
 * Controller for checking application health.
 * Responds with system metrics and database status.
 */
const getHealth = async (req, res, next) => {
  try {
    const isDbConnected = await checkDbConnection();
    
    const healthStatus = {
      status: isDbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        server: 'online',
        database: isDbConnected ? 'connected' : 'disconnected',
      },
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    };

    if (isDbConnected) {
      return res.status(200).json({
        success: true,
        data: healthStatus,
      });
    } else {
      return res.status(503).json({
        success: false,
        message: 'Service is in a degraded state. Database is unreachable.',
        data: healthStatus,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
};
