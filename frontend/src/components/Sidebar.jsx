import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut } from 'lucide-react';

/**
 * Sidebar component showing navigation items and user context profile details.
 */
const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <FolderKanban size={28} className="text-primary" />
        <span>ProManage</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/projects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FolderKanban size={20} />
          <span>Projects</span>
        </NavLink>
        
        <NavLink to="/tasks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CheckSquare size={20} />
          <span>Tasks</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user.fullName}</span>
            <span className="sidebar-user-email">{user.email}</span>
          </div>
        )}
        <button onClick={logout} className="btn btn-danger" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
