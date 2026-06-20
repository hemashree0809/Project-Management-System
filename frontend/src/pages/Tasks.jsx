import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Calendar, Trash2, ListTodo, Filter, Pencil, Folder } from 'lucide-react';

/**
 * Tasks Overview list supporting filtering and operations.
 */
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Edit Task State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskError, setEditTaskError] = useState('');
  const [submittingEditTask, setSubmittingEditTask] = useState(false);

  const [editTaskData, setEditTaskData] = useState({
    taskName: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
  });

  // Load projects + tasks
  const loadFiltersAndTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const projectsRes = await api.get('/projects?limit=1000');
      setProjects(projectsRes.data.data || []);

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

  // Status update
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  // Open edit modal
  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setEditTaskData({
      taskName: task.taskName || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'PENDING',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });

    setEditTaskError('');
    setIsEditModalOpen(true);
  };

  // Input change
  const handleEditTaskInputChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit edit
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

      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id ? { ...t, ...response.data.data.task } : t
        )
      );

      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      setEditTaskError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSubmittingEditTask(false);
    }
  };

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
      <div className="page-header">
        <div>
          <h1>Tasks Board</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review and manage all your tasks across projects.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div className="filter-group">
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Project:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName}
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
        <div className="empty-state">
          <ListTodo size={48} />
          <h3>No tasks found</h3>
          <p>Try resetting your status or project filters.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card priority-${task.priority.toLowerCase()}`}>
              <div>
                <div className="task-card-project">
                  <Folder size={14} style={{ marginRight: '4px' }} />
                  {task.project?.projectName || 'No Project'}
                </div>
                <h3 className="task-card-title">{task.taskName}</h3>
                <p className="task-card-desc">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="task-card-meta">
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  
                  {task.dueDate ? (
                    <div className="task-card-date">
                      <Calendar size={14} />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  ) : (
                    <div className="task-card-date" style={{ color: 'var(--text-light)' }}>
                      <Calendar size={14} />
                      <span>No due date</span>
                    </div>
                  )}
                </div>

                <div className="task-card-footer">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="filter-select"
                    style={{ fontSize: '0.85rem', padding: '6px 10px', width: 'auto' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <div className="task-card-actions">
                    <button
                      onClick={() => handleEditTaskClick(task)}
                      className="task-btn-action"
                      title="Edit Task"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="task-btn-action task-btn-danger"
                      title="Delete Task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        title="Edit Task"
      >
        {editTaskError && <div className="alert alert-danger">{editTaskError}</div>}

        <form onSubmit={handleEditTaskSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="editTaskName">Task Name</label>
            <input
              id="editTaskName"
              name="taskName"
              type="text"
              className="form-control"
              placeholder="e.g. Design landing page"
              value={editTaskData.taskName}
              onChange={handleEditTaskInputChange}
              disabled={submittingEditTask}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDescription">Description</label>
            <textarea
              id="editDescription"
              name="description"
              className="form-control"
              rows="3"
              placeholder="Provide a short description of the task..."
              value={editTaskData.description}
              onChange={handleEditTaskInputChange}
              disabled={submittingEditTask}
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
                disabled={submittingEditTask}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="editStatus">Status</label>
              <select
                id="editStatus"
                name="status"
                className="form-control"
                value={editTaskData.status}
                onChange={handleEditTaskInputChange}
                disabled={submittingEditTask}
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
              disabled={submittingEditTask}
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={submittingEditTask}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingEditTask}
            >
              {submittingEditTask ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;

