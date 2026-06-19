const projectService = require('../services/project.service');

/**
 * Controller to handle creating a project.
 */
const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle retrieving all projects of the user (paginated & filtered).
 */
const getProjects = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await projectService.getProjects(req.user.id, { status, page, limit });
    
    return res.status(200).json({
      success: true,
      data: result.projects,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle retrieving a single project by ID.
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle updating a project.
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle deleting a project.
 */
const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
