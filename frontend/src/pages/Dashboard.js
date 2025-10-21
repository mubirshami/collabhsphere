import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import { FiPlus, FiFolder, FiUsers } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [toast, setToast] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(`${API_URL}/workspaces`);
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to load workspaces' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/workspaces`, formData);
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchWorkspaces();
      setToast({ type: 'success', message: 'Workspace created' });
    } catch (error) {
      console.error('Error creating workspace:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to create workspace' });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="dashboard-header" style={{ marginTop: 16 }}>
            <Skeleton height={36} width={220} />
            <Skeleton height={36} width={140} />
          </div>
          <div className="workspaces-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <Skeleton height={60} width={60} />
                <div style={{ height: 12 }} />
                <Skeleton height={18} width="60%" />
                <div style={{ height: 8 }} />
                <Skeleton height={12} width="90%" />
                <div style={{ height: 12 }} />
                <Skeleton height={12} width="40%" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>My Workspaces</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Create Workspace
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiFolder />
            </div>
            <h3>No workspaces yet</h3>
            <p>Create your first workspace to get started</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> Create Workspace
            </button>
          </div>
        ) : (
          <div className="workspaces-grid">
            {workspaces.map((workspace) => (
              <div
                key={workspace._id}
                className="workspace-card"
                onClick={() => navigate(`/workspaces/${workspace._id}`)}
              >
                <div className="workspace-icon">
                  <FiFolder size={32} />
                </div>
                <h3>{workspace.name}</h3>
                <p>{workspace.description || 'No description'}</p>
                <div className="workspace-meta">
                  <span>
                    <FiUsers size={14} /> {workspace.members?.length || 0} members
                  </span>
                  <span>{workspace.projects?.length || 0} projects</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Workspace</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Workspace Name</label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: '', message: '' })} />
    </>
  );
};

export default Dashboard;

