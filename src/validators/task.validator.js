const { body } = require('express-validator');

/**
 * Validation rules for creating a task.
 */
const createTaskValidator = [
  body('taskName')
    .trim()
    .notEmpty()
    .withMessage('Task name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Task name must be between 2 and 150 characters'),
  
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be one of: LOW, MEDIUM, HIGH'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be one of: PENDING, IN_PROGRESS, COMPLETED'),
  
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid date (ISO8601 format)'),
  
  body('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
];

/**
 * Validation rules for updating a task.
 */
const updateTaskValidator = [
  body('taskName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task name cannot be empty')
    .isLength({ min: 2, max: 150 })
    .withMessage('Task name must be between 2 and 150 characters'),
  
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be one of: LOW, MEDIUM, HIGH'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be one of: PENDING, IN_PROGRESS, COMPLETED'),
  
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid date (ISO8601 format)'),
  
  body('projectId')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
};
