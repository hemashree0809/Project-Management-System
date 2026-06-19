import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, CheckSquare, Clock, CheckCircle2, User } from 'lucide-react';

/**
 * Dashboard stats page.
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projectsCount: 0,
    tasksCount: 0,
    completedTasksCount: 0,
    pendingTasksCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError('');
        // Retrieve projects count with pagination limit 1 (retrieves totalCount metadata without bloating payload)
        const projectsRes = await api.get('/projects?limit=1');
        const projectsCount = projectsRes.data.pagination?.totalCount || 0;

        // Retrieve all tasks to aggregate statistics
        const tasksRes = await api.get('/tasks');
        const tasks = tasksRes.data.data?.tasks || [];
        
        const tasksCount = tasks.length;
        const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
        const pendingTasksCount = tasks.filter(t => t.status === 'PENDING').length;

        setStats({
          projectsCount,
          tasksCount,
          completedTasksCount,
          pendingTasksCount,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1>Hello, {user?.fullName || 'User'}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's an overview of your projects and task status.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-grid">
        {/* Total Projects */}
        <div className="stat-card">
          <div className="stat-icon primary">
            <FolderKanban size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.projectsCount}</h3>
            <p>Total Projects</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="stat-card">
          <div className="stat-icon warning">
            <CheckSquare size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.tasksCount}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.completedTasksCount}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="stat-card">
          <div className="stat-icon danger">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingTasksCount}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>
      </div>

      {/* Quick guide card */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h2 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>Getting Started Checklist</h2>
        <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Navigate to the <strong>Projects</strong> tab in the sidebar to view your projects or create a new one.</li>
          <li>Click on a project to open its detail view, where you can view and add specific tasks.</li>
          <li>Assign priorities and update task progression statuses as you work.</li>
          <li>Track aggregated status metrics directly here on the dashboard.</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
