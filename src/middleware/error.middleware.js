/**
 * Centralized error handling middleware for Express.
 * Catches all runtime errors and formats them into a clean JSON response.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error stack for debugging in development or non-production
  if (!isProduction) {
    console.error(err.stack || err);
  } else if (statusCode === 500) {
    // In production, only log internal server errors (status 500)
    console.error(`[Internal Server Error]: ${err.message}`);
  }

  // Handle specific Prisma errors if needed
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  if (err.code && err.code.startsWith('P')) {
    // Prisma specific error code handling (P2002 for unique constraint, etc.)
    if (err.code === 'P2002') {
      res.status(409);
      return res.json({
        success: false,
        message: 'An account with this email already exists.',
        code: err.code,
      });
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(!isProduction && { stack: err.stack }),
  });
};

module.exports = errorHandler;
