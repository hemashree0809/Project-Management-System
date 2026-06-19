const { body } = require('express-validator');

/**
 * Validation rules for creating a project.
 */
const createProjectValidator = [
  body('projectName')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Project name must be between 2 and 150 characters'),
  
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED'),
  
  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid date (ISO8601 format)'),
  
  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid date (ISO8601 format)')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),
];

/**
 * Validation rules for updating a project.
 */
const updateProjectValidator = [
  body('projectName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ min: 2, max: 150 })
    .withMessage('Project name must be between 2 and 150 characters'),
  
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED'),
  
  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Start date must be a valid date (ISO8601 format)'),
  
  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End date must be a valid date (ISO8601 format)')
    .custom((value, { req }) => {
      const start = value && (req.body.startDate || req.body.currentStartDate);
      if (value && start && new Date(value) < new Date(start)) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
};
