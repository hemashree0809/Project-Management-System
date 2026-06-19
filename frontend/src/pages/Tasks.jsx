import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Calendar, Trash2, ListTodo, Filter, Pencil } from 'lucide-react';

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
        <h1>Tasks Board</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review and manage all your tasks across projects.
        </p>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-group">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loader-container"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <ListTodo size={48} />
          <h3>No tasks found</h3>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="task-item">
            <div>
              <h4>{task.taskName}</h4>
              <p>{task.description}</p>

              <span>Priority: {task.priority}</span>
              {task.dueDate && (
                <span>
                  <Calendar size={14} /> {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            <div className="task-item-actions">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <button onClick={() => handleEditTaskClick(task)}>
                <Pencil size={16} />
              </button>

              <button onClick={() => handleDeleteTask(task.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
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
          <input
            name="taskName"
            value={editTaskData.taskName}
            onChange={handleEditTaskInputChange}
            placeholder="Task name"
          />

          <textarea
            name="description"
            value={editTaskData.description}
            onChange={handleEditTaskInputChange}
            placeholder="Description"
          />

          <select name="priority" value={editTaskData.priority} onChange={handleEditTaskInputChange}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <select name="status" value={editTaskData.status} onChange={handleEditTaskInputChange}>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <input
            type="date"
            name="dueDate"
            value={editTaskData.dueDate}
            onChange={handleEditTaskInputChange}
          />

          <div className="modal-footer">
            <button type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>

            <button type="submit" disabled={submittingEditTask}>
              {submittingEditTask ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

