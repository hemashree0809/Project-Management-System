const { validationResult } = require('express-validator');

/**
 * Middleware that checks for express-validator errors.
 * If errors are found, responds with a 400 Bad Request and validation errors array.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validate;
