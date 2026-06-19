import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
<<<<<<< HEAD
import { Calendar, Trash2, CheckSquare, ListTodo, Filter } from 'lucide-react';
import { FaEdit } from 'react-icons/fa';
=======
import { Calendar, Trash2, CheckSquare, ListTodo, Filter, Pencil } from 'lucide-react';
>>>>>>> d6f2704 (modified)

/**
 * Tasks Overview list supporting filtering and operations.
 */
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

<<<<<<< HEAD
  // Edit Task Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState({
    id: '',
=======
  // Task Edit Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskData, setEditTaskData] = useState({
>>>>>>> d6f2704 (modified)
    taskName: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
  });
<<<<<<< HEAD
  const [editFormError, setEditFormError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
=======
  const [editTaskError, setEditTaskError] = useState('');
  const [submittingEditTask, setSubmittingEditTask] = useState(false);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (err) {
      return '';
    }
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setEditTaskData({
      taskName: task.taskName || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'PENDING',
      dueDate: formatDateForInput(task.dueDate),
    });
    setEditTaskError('');
    setIsEditModalOpen(true);
  };

  const handleEditTaskInputChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    setEditTaskError('');

    if (!editTaskData.taskName) {
      setEditTaskError('Task name is required.');
      return;
    }

    setSubmittingEditTask(true);
    try {
      const response = await api.put(`/tasks/${editingTask.id}`, {
        ...editTaskData,
        projectId: editingTask.projectId,
        dueDate: editTaskData.dueDate || null,
      });

      setIsEditModalOpen(false);
      setEditingTask(null);

      // Snappy UI state updates: update the task directly in the local array
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === editingTask.id ? { ...t, ...response.data.data.task } : t))
      );
    } catch (err) {
      setEditTaskError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSubmittingEditTask(false);
    }
  };
>>>>>>> d6f2704 (modified)

  // Load user projects (for filter dropdown) and tasks list
  const loadFiltersAndTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch user's projects list (to populate drop-down selection options)
      const projectsRes = await api.get('/projects?limit=1000');
      setProjects(projectsRes.data.data || []);

      // 2. Fetch tasks list
      const tasksRes = await api.get('/tasks', {
        params: {
          projectId: projectFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setTasks(tasksRes.data.data?.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve tasks.');
    } finally {
      setLoading(false);
    }
  }, [projectFilter, statusFilter]);

  useEffect(() => {
    loadFiltersAndTasks();
  }, [loadFiltersAndTasks]);

  // Handle task status update
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
      });
      
      // Update local state instead of reloading everything
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
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
      // Filter out deleted task from local state
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  // Handle edit task form inputs
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Edit Task Modal and populate data
  const handleOpenEditModal = (task) => {
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
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  // Submit task updates
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError('');

    if (!editTaskData.taskName) {
      setEditFormError('Task name is required.');
      return;
    }

    setEditSubmitting(true);
    try {
      await api.put(`/tasks/${editTaskData.id}`, {
        taskName: editTaskData.taskName,
        description: editTaskData.description || null,
        priority: editTaskData.priority,
        status: editTaskData.status,
        dueDate: editTaskData.dueDate || null,
      });

      setIsEditModalOpen(false);
      loadFiltersAndTasks();
    } catch (err) {
      setEditFormError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setEditSubmitting(false);
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

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Tasks Board</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review and manage all your tasks across projects.</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="filter-row" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Status Filter */}
          <div className="filter-group">
            <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status:</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Project Filter */}
          <div className="filter-group">
            <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Project:</span>
            <select
              className="filter-select"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.projectName}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '50px 20px',
          textAlign: 'center'
        }}>
          <ListTodo size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No tasks found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Try adjusting your filters or navigate to a project to add new tasks.
          </p>
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
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
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="filter-select"
                  style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <button
<<<<<<< HEAD
                  onClick={() => handleOpenEditModal(task)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', borderColor: 'var(--border)' }}
                  title="Edit Task"
                >
                  <FaEdit size={16} />
=======
                  onClick={() => handleEditTaskClick(task)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}
                  title="Edit Task"
                >
                  <Pencil size={16} />
>>>>>>> d6f2704 (modified)
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

      {/* Edit Task Modal */}
<<<<<<< HEAD
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task">
        {editFormError && <div className="alert alert-danger">{editFormError}</div>}

        <form onSubmit={handleEditSubmit}>
=======
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingTask(null); }} title="Edit Task">
        {editTaskError && <div className="alert alert-danger">{editTaskError}</div>}

        <form onSubmit={handleEditTaskSubmit}>
>>>>>>> d6f2704 (modified)
          <div className="form-group">
            <label className="form-label" htmlFor="editTaskName">Task Name</label>
            <input
              id="editTaskName"
              name="taskName"
              type="text"
              className="form-control"
              placeholder="e.g. Design Landing Page"
              value={editTaskData.taskName}
<<<<<<< HEAD
              onChange={handleEditInputChange}
              disabled={editSubmitting}
=======
              onChange={handleEditTaskInputChange}
              disabled={submittingEditTask}
>>>>>>> d6f2704 (modified)
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
<<<<<<< HEAD
              onChange={handleEditInputChange}
              disabled={editSubmitting}
=======
              onChange={handleEditTaskInputChange}
              disabled={submittingEditTask}
>>>>>>> d6f2704 (modified)
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
<<<<<<< HEAD
                onChange={handleEditInputChange}
                disabled={editSubmitting}
=======
                onChange={handleEditTaskInputChange}
                disabled={submittingEditTask}
>>>>>>> d6f2704 (modified)
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
<<<<<<< HEAD
                onChange={handleEditInputChange}
                disabled={editSubmitting}
=======
                onChange={handleEditTaskInputChange}
                disabled={submittingEditTask}
>>>>>>> d6f2704 (modified)
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
<<<<<<< HEAD
              onChange={handleEditInputChange}
              disabled={editSubmitting}
=======
              onChange={handleEditTaskInputChange}
              disabled={submittingEditTask}
>>>>>>> d6f2704 (modified)
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
<<<<<<< HEAD
              onClick={() => setIsEditModalOpen(false)}
              disabled={editSubmitting}
=======
              onClick={() => { setIsEditModalOpen(false); setEditingTask(null); }}
              disabled={submittingEditTask}
>>>>>>> d6f2704 (modified)
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
<<<<<<< HEAD
              disabled={editSubmitting}
            >
              {editSubmitting ? 'Saving...' : 'Save Changes'}
=======
              disabled={submittingEditTask}
            >
              {submittingEditTask ? 'Saving...' : 'Save Changes'}
>>>>>>> d6f2704 (modified)
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
