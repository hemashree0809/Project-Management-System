import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
<<<<<<< HEAD
import { Plus, Trash2, Calendar, FolderClock, Filter } from 'lucide-react';
import { FaEdit } from 'react-icons/fa';
=======
import { Plus, Trash2, Calendar, FolderClock, Filter, Pencil } from 'lucide-react';
>>>>>>> d6f2704 (modified)

/**
 * Projects overview and CRUD panel.
 */
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // 6 projects per page is great for a grid layout
  const [statusFilter, setStatusFilter] = useState('');
  const [paginationInfo, setPaginationInfo] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Create Project Form state
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    status: 'NOT_STARTED',
    startDate: '',
    endDate: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

<<<<<<< HEAD
  // Edit Project Form state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
=======
  // Edit Project State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editFormData, setEditFormData] = useState({
>>>>>>> d6f2704 (modified)
    projectName: '',
    description: '',
    status: 'NOT_STARTED',
    startDate: '',
    endDate: '',
  });
  const [editFormError, setEditFormError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const navigate = useNavigate();

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

  const handleEditClick = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setEditFormData({
      projectName: project.projectName || '',
      description: project.description || '',
      status: project.status || 'NOT_STARTED',
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
    });
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError('');

    if (!editFormData.projectName) {
      setEditFormError('Project name is required.');
      return;
    }

    if (editFormData.startDate && editFormData.endDate && new Date(editFormData.endDate) < new Date(editFormData.startDate)) {
      setEditFormError('End date cannot be earlier than start date.');
      return;
    }

    setEditSubmitting(true);
    try {
      const response = await api.put(`/projects/${editingProject.id}`, {
        ...editFormData,
        startDate: editFormData.startDate || null,
        endDate: editFormData.endDate || null,
      });

      setIsEditModalOpen(false);
      setEditingProject(null);
      
      // Update local state without reloading
      setProjects((prev) =>
        prev.map((proj) => (proj.id === editingProject.id ? { ...proj, ...response.data.data.project } : proj))
      );
    } catch (err) {
      setEditFormError(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Load projects from API
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/projects', {
        params: {
          page,
          limit,
          status: statusFilter || undefined,
        },
      });
      setProjects(response.data.data || []);
      setPaginationInfo(response.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new project
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.projectName) {
      setFormError('Project name is required.');
      return;
    }

    // Date validations
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/projects', {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      });

      // Clear form and reload list
      setFormData({
        projectName: '',
        description: '',
        status: 'NOT_STARTED',
        startDate: '',
        endDate: '',
      });
      setIsModalOpen(false);
      setPage(1); // Reset page to 1 to see the new project
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete project handler
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click route redirection
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be permanently removed.')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  // Handle edit form inputs
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Edit Modal and load project data
  const handleOpenEditModal = (project, e) => {
    e.stopPropagation(); // Stop card click navigation
    
    const formatForInput = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    };

    setEditFormData({
      id: project.id,
      projectName: project.projectName || '',
      description: project.description || '',
      status: project.status || 'NOT_STARTED',
      startDate: formatForInput(project.startDate),
      endDate: formatForInput(project.endDate),
    });
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  // Submit project updates
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError('');

    if (!editFormData.projectName) {
      setEditFormError('Project name is required.');
      return;
    }

    if (editFormData.startDate && editFormData.endDate && new Date(editFormData.endDate) < new Date(editFormData.startDate)) {
      setEditFormError('End date cannot be earlier than start date.');
      return;
    }

    setEditSubmitting(true);
    try {
      await api.put(`/projects/${editFormData.id}`, {
        projectName: editFormData.projectName,
        description: editFormData.description || null,
        status: editFormData.status,
        startDate: editFormData.startDate || null,
        endDate: editFormData.endDate || null,
      });

      setIsEditModalOpen(false);
      fetchProjects();
    } catch (err) {
      setEditFormError(err.response?.data?.message || 'Failed to update project.');
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
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Organize, manage, and track your active projects.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="filter-row">
        <div className="filter-group">
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // Reset to page 1
            }}
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '50px 20px',
          textAlign: 'center'
        }}>
          <FolderClock size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No projects found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {statusFilter ? 'Try modifying your status filter or create a new project.' : 'Get started by creating your very first project!'}
          </p>
          {!statusFilter && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="project-card-header">
                  <h2>{project.projectName}</h2>
                  <span className={`badge badge-${project.status.toLowerCase()}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="project-card-desc">
                  {project.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} style={{ color: 'var(--text-light)' }} />
                    <span>Starts: {formatDate(project.startDate)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} style={{ color: 'var(--text-light)' }} />
                    <span>Ends: {formatDate(project.endDate)}</span>
                  </div>
                </div>

<<<<<<< HEAD
                <div className="project-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{project._count?.tasks || 0} tasks</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => handleOpenEditModal(project, e)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', borderColor: 'var(--border)' }}
                      title="Edit Project"
                    >
                      <FaEdit size={16} />
=======
                 <div className="project-card-footer">
                  <span>{project._count?.tasks || 0} tasks</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => handleEditClick(project, e)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}
                      title="Edit Project"
                    >
                      <Pencil size={16} />
>>>>>>> d6f2704 (modified)
                    </button>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          {paginationInfo.totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="btn btn-secondary"
                disabled={!paginationInfo.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={!paginationInfo.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        {formError && <div className="alert alert-danger">{formError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="projectName">Project Name</label>
            <input
              id="projectName"
              name="projectName"
              type="text"
              className="form-control"
              placeholder="e.g. Website Redesign"
              value={formData.projectName}
              onChange={handleInputChange}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="3"
              placeholder="Brief description of project goals..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Initial Status</label>
            <select
              id="status"
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleInputChange}
              disabled={submitting}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className="form-control"
                value={formData.startDate}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="form-control"
                value={formData.endDate}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
<<<<<<< HEAD
      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project">
=======

      {/* Edit Project Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingProject(null); }} title="Edit Project">
>>>>>>> d6f2704 (modified)
        {editFormError && <div className="alert alert-danger">{editFormError}</div>}
        
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="editProjectName">Project Name</label>
            <input
              id="editProjectName"
              name="projectName"
              type="text"
              className="form-control"
              placeholder="e.g. Website Redesign"
              value={editFormData.projectName}
              onChange={handleEditInputChange}
              disabled={editSubmitting}
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
              placeholder="Brief description of project goals..."
              value={editFormData.description}
              onChange={handleEditInputChange}
              disabled={editSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editStatus">Status</label>
            <select
              id="editStatus"
              name="status"
              className="form-control"
              value={editFormData.status}
              onChange={handleEditInputChange}
              disabled={editSubmitting}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="editStartDate">Start Date</label>
              <input
                id="editStartDate"
                name="startDate"
                type="date"
                className="form-control"
                value={editFormData.startDate}
                onChange={handleEditInputChange}
                disabled={editSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="editEndDate">End Date</label>
              <input
                id="editEndDate"
                name="endDate"
                type="date"
                className="form-control"
                value={editFormData.endDate}
                onChange={handleEditInputChange}
                disabled={editSubmitting}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
<<<<<<< HEAD
              onClick={() => setIsEditModalOpen(false)}
=======
              onClick={() => { setIsEditModalOpen(false); setEditingProject(null); }}
>>>>>>> d6f2704 (modified)
              disabled={editSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={editSubmitting}
            >
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
