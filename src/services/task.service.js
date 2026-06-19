const { prisma } = require('../config/db');
const { verifyProjectOwnership } = require('./project.service');

/**
 * Helper to check task existence and ownership.
 * Resolves to the task (with project details included) if it exists and belongs to a project owned by the user.
 * Otherwise, throws a 404 error.
 */
const verifyTaskOwnership = async (id, userId) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!task || task.project.userId !== userId) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return task;
};

/**
 * Create a new task under a project (strictly checks project ownership).
 */
const createTask = async (taskData, userId) => {
  const { taskName, description, priority, status, dueDate, projectId } = taskData;

  // Confirm project exists and belongs to the authenticated user
  await verifyProjectOwnership(projectId, userId);

  const task = await prisma.task.create({
    data: {
      taskName,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
    },
  });

  return task;
};

/**
 * List tasks with optional project and status filters.
 * Ensures only tasks inside projects belonging to the user are returned.
 */
const getTasks = async (userId, filters = {}) => {
  const { projectId, status } = filters;

  if (projectId) {
    // If filtering by project, verify project ownership first
    await verifyProjectOwnership(projectId, userId);
  }

  // Build relational query to enforce user separation
  const whereClause = {
    project: {
      userId,
    },
    ...(projectId && { projectId }),
    ...(status && { status }),
  };

  const tasks = await prisma.task.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return tasks;
};

/**
 * Fetch a single task by ID (strictly checks project ownership).
 */
const getTaskById = async (id, userId) => {
  const task = await verifyTaskOwnership(id, userId);
  
  // Return task, clean the project join context if not needed or return it
  return task;
};

/**
 * Update a task (strictly checks project ownership).
 */
const updateTask = async (id, taskData, userId) => {
  // Verify task exists and belongs to the user
  await verifyTaskOwnership(id, userId);

  const { taskName, description, priority, status, dueDate, projectId } = taskData;

  // If client is transferring the task to a different project, verify ownership of the target project
  if (projectId) {
    await verifyProjectOwnership(projectId, userId);
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      taskName,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId: projectId || undefined,
    },
  });

  return updatedTask;
};

/**
 * Delete a task (strictly checks project ownership).
 */
const deleteTask = async (id, userId) => {
  // Verify task exists and belongs to the user
  await verifyTaskOwnership(id, userId);

  await prisma.task.delete({
    where: { id },
  });

  return { message: 'Task deleted successfully' };
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
