const express = require('express');
const projectController = require('../controllers/project.controller');
const authenticate = require('../middleware/auth.middleware');
const { createProjectValidator, updateProjectValidator } = require('../validators/project.validator');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// POST /api/projects - Create a project
router.post('/', createProjectValidator, validate, projectController.createProject);

// GET /api/projects - Get all projects of the logged-in user (paginated & filtered)
router.get('/', projectController.getProjects);

// GET /api/projects/:id - Get a project by ID
router.get('/:id', projectController.getProjectById);

// PUT /api/projects/:id - Update a project by ID
router.put('/:id', updateProjectValidator, validate, projectController.updateProject);

// DELETE /api/projects/:id - Delete a project by ID
router.delete('/:id', projectController.deleteProject);

module.exports = router;
