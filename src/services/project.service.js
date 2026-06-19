const { prisma } = require('../config/db');

/**
 * Helper to check project existence and ownership.
 * Throws an error if project is not found or does not belong to the user.
 */
const verifyProjectOwnership = async (id, userId) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project || project.userId !== userId) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

/**
 * Create a new project.
 */
const createProject = async (projectData, userId) => {
  const { projectName, description, status, startDate, endDate } = projectData;

  const project = await prisma.project.create({
    data: {
      projectName,
      description,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      userId,
    },
  });

  return project;
};

/**
 * Get projects with pagination and filtering by status.
 */
const getProjects = async (userId, filters = {}) => {
  const { status, page = 1, limit = 10 } = filters;
  
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  // Build query filter criteria
  const whereClause = {
    userId,
    ...(status && { status }),
  };

  // Run total count query and paginated list query in parallel
  const [totalCount, projects] = await Promise.all([
    prisma.project.count({ where: whereClause }),
    prisma.project.findMany({
      where: whereClause,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limitNum);

  return {
    projects,
    pagination: {
      totalCount,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

/**
 * Get project by ID (strictly checks ownership).
 */
const getProjectById = async (id, userId) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project || project.userId !== userId) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

/**
 * Update project details (strictly checks ownership).
 */
const updateProject = async (id, projectData, userId) => {
  // Verify ownership first
  await verifyProjectOwnership(id, userId);

  const { projectName, description, status, startDate, endDate } = projectData;

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      projectName,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    },
  });

  return updatedProject;
};

/**
 * Delete a project (strictly checks ownership).
 */
const deleteProject = async (id, userId) => {
  // Verify ownership first
  await verifyProjectOwnership(id, userId);

  await prisma.project.delete({
    where: { id },
  });

  return { message: 'Project deleted successfully' };
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  verifyProjectOwnership, // exported to be used by tasks service to check project ownership
};
