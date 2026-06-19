const express = require('express');
const taskController = require('../controllers/task.controller');
const authenticate = require('../middleware/auth.middleware');
const { createTaskValidator, updateTaskValidator } = require('../validators/task.validator');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// POST /api/tasks - Create a task under a project
router.post('/', createTaskValidator, validate, taskController.createTask);

// GET /api/tasks - Get all tasks (optional filter by projectId & status)
router.get('/', taskController.getTasks);

// GET /api/tasks/:id - Get a task by ID
router.get('/:id', taskController.getTaskById);

// PUT /api/tasks/:id - Update a task by ID
router.put('/:id', updateTaskValidator, validate, taskController.updateTask);

// DELETE /api/tasks/:id - Delete a task by ID
router.delete('/:id', taskController.deleteTask);

module.exports = router;
