import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Calendar, Trash2, CheckSquare, ListTodo, Filter } from 'lucide-react';

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
    </div>
  );
};

export default Tasks;
