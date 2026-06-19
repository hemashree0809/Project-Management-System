import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { ArrowLeft, Plus, Trash2, Calendar, CheckSquare, ListTodo } from 'lucide-react';
import { FaEdit } from 'react-icons/fa';

/**
 * Single project details view featuring Tasks list management.
 */
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Task Creation Form State
  const [taskData, setTaskData] = useState({
    taskName: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
  });
  const [taskError, setTaskError] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Task Editing Form State
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState({
    id: '',
    taskName: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
  });
  const [editTaskError, setEditTaskError] = useState('');
  const [editSubmittingTask, setEditSubmittingTask] = useState(false);

  // Fetch project details (with tasks)
  const fetchProjectDetails = useCallback(async () => {
    try {
      setError('');
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data?.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve project details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Handle task input updates
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError('');

    if (!taskData.taskName) {
      setTaskError('Task name is required.');
      return;
    }

    setSubmittingTask(true);
    try {
      await api.post('/tasks', {
        ...taskData,
        projectId: id,
        dueDate: taskData.dueDate || null,
      });

      // Clear task form and reload list
      setTaskData({
        taskName: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: '',
      });
      setIsModalOpen(false);
      fetchProjectDetails();
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmittingTask(false);
    }
  };

  // Update task status directly from list dropdown
  const handleStatusChange = async (taskId, currentTask, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
      });
      fetchProjectDetails(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // Delete task handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  // Handle edit task form inputs
  const handleEditTaskInputChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Edit Task Modal and populate data
  const handleOpenEditTaskModal = (task) => {
    const formatForInput = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    };

    setEditTaskData({
      id: task.id,
      taskName: task.taskName || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'PENDING',
      dueDate: formatForInput(task.dueDate),
    });
    setEditTaskError('');
    setIsEditTaskModalOpen(true);
  };

  // Submit task updates
  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    setEditTaskError('');

    if (!editTaskData.taskName) {
      setEditTaskError('Task name is required.');
      return;
    }

    setEditSubmittingTask(true);
    try {
      await api.put(`/tasks/${editTaskData.id}`, {
        taskName: editTaskData.taskName,
        description: editTaskData.description || null,
        priority: editTaskData.priority,
        status: editTaskData.status,
        dueDate: editTaskData.dueDate || null,
      });

      setIsEditTaskModalOpen(false);
      fetchProjectDetails();
    } catch (err) {
      setEditTaskError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setEditSubmittingTask(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <button onClick={() => navigate('/projects')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={18} />
          <span>Back to Projects</span>
        </button>
        <div className="alert alert-danger">{error || 'Project not found.'}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate('/projects')} className="btn btn-secondary" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={18} />
        <span>Back to Projects</span>
      </button>

      {/* Project Meta Details Card */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{project.projectName}</h1>
            <span className={`badge badge-${project.status.toLowerCase()}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong>Start Date:</strong> <p>{formatDate(project.startDate)}</p>
            </div>
            <div>
              <strong>End Date:</strong> <p>{formatDate(project.endDate)}</p>
            </div>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', whiteSpace: 'pre-line' }}>
          {project.description || 'No description provided for this project.'}
        </p>
      </div>

      {/* Tasks Section Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckSquare size={24} style={{ color: 'var(--primary)' }} />
          <h2>Tasks Checklist</h2>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tasks List */}
      {project.tasks && project.tasks.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <ListTodo size={40} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No tasks created yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Add tasks under this project to organize and track progress.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary">
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <div>
          {project.tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-item-main">
                <h4>{task.taskName}</h4>
                {task.description && <p>{task.description}</p>}
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>
                    Priority: {task.priority}
                  </span>
                  {task.dueDate && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      Due: {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className="task-item-actions">
                {/* Status Toggle Dropdown */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, task, e.target.value)}
                  className="filter-select"
                  style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <button
                  onClick={() => handleOpenEditTaskModal(task)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', borderColor: 'var(--border)' }}
                  title="Edit Task"
                >
                  <FaEdit size={16} />
                </button>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Task to Project">
        {taskError && <div className="alert alert-danger">{taskError}</div>}

        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label" htmlFor="taskName">Task Name</label>
            <input
              id="taskName"
              name="taskName"
              type="text"
              className="form-control"
              placeholder="e.g. Design Landing Page"
              value={taskData.taskName}
              onChange={handleTaskInputChange}
              disabled={submittingTask}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              name="description"
              className="form-control"
              rows="3"
              placeholder="Provide a short description of the task..."
              value={taskData.description}
              onChange={handleTaskInputChange}
              disabled={submittingTask}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="form-control"
                value={taskData.priority}
                onChange={handleTaskInputChange}
                disabled={submittingTask}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="taskStatus">Initial Status</label>
              <select
                id="taskStatus"
                name="status"
                className="form-control"
                value={taskData.status}
                onChange={handleTaskInputChange}
                disabled={submittingTask}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="form-control"
              value={taskData.dueDate}
              onChange={handleTaskInputChange}
              disabled={submittingTask}
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submittingTask}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingTask}
            >
              {submittingTask ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditTaskModalOpen} onClose={() => setIsEditTaskModalOpen(false)} title="Edit Task">
        {editTaskError && <div className="alert alert-danger">{editTaskError}</div>}

        <form onSubmit={handleEditTaskSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="editTaskName">Task Name</label>
            <input
              id="editTaskName"
              name="taskName"
              type="text"
              className="form-control"
              placeholder="e.g. Design Landing Page"
              value={editTaskData.taskName}
              onChange={handleEditTaskInputChange}
              disabled={editSubmittingTask}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editTaskDescription">Description</label>
            <textarea
              id="editTaskDescription"
              name="description"
              className="form-control"
              rows="3"
              placeholder="Provide a short description of the task..."
              value={editTaskData.description}
              onChange={handleEditTaskInputChange}
              disabled={editSubmittingTask}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="editPriority">Priority</label>
              <select
                id="editPriority"
                name="priority"
                className="form-control"
                value={editTaskData.priority}
                onChange={handleEditTaskInputChange}
                disabled={editSubmittingTask}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="editTaskStatus">Status</label>
              <select
                id="editTaskStatus"
                name="status"
                className="form-control"
                value={editTaskData.status}
                onChange={handleEditTaskInputChange}
                disabled={editSubmittingTask}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDueDate">Due Date</label>
            <input
              id="editDueDate"
              name="dueDate"
              type="date"
              className="form-control"
              value={editTaskData.dueDate}
              onChange={handleEditTaskInputChange}
              disabled={editSubmittingTask}
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditTaskModalOpen(false)}
              disabled={editSubmittingTask}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={editSubmittingTask}
            >
              {editSubmittingTask ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
