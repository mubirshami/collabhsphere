import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import { FiPlus, FiFolder, FiArrowLeft } from 'react-icons/fi';
import './WorkspaceDetail.css';

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [memberForm, setMemberForm] = useState({ email: '' });
  const [toast, setToast] = useState({ type: '', message: '' });

  const fetchWorkspace = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/workspaces/${id}`);
      setWorkspace(response.data);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load workspace',
      });
    }
  }, [id]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/projects?workspaceId=${id}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load projects',
      });
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWorkspace(), fetchProjects()]).finally(() => setLoading(false));
  }, [id, fetchWorkspace, fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/projects`, {
        ...projectForm,
        workspaceId: id,
      });
      setShowProjectModal(false);
      setProjectForm({ name: '', description: '' });
      fetchProjects();
      setToast({ type: 'success', message: 'Project created' });
    } catch (error) {
      console.error('Error creating project:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create project',
      });
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/workspaces/${id}/members`, memberForm);
      setShowMemberModal(false);
      setMemberForm({ email: '' });
      fetchWorkspace();
      setToast({ type: 'success', message: 'Member added' });
    } catch (error) {
      console.error('Error adding member:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to add member',
      });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="workspace-detail-header">
            <div>
              <Skeleton height={28} width={240} />
              <div style={{ height: 8 }} />
              <Skeleton height={14} width={360} />
            </div>
            <div className="header-actions">
              <Skeleton height={36} width={120} />
              <Skeleton height={36} width={140} />
            </div>
          </div>
          <div className="workspace-section">
            <Skeleton height={20} width={180} />
            <div style={{ height: 12 }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ marginBottom: 10 }}>
                <Skeleton height={24} width="50%" />
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
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="workspace-detail-header">
          <div>
            <h1>{workspace?.name}</h1>
            <p>{workspace?.description || 'No description'}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
              <FiPlus /> Add Member
            </button>
            <button className="btn btn-primary" onClick={() => setShowProjectModal(true)}>
              <FiPlus /> Create Project
            </button>
          </div>
        </div>

        <div className="workspace-section">
          <h2>Members ({workspace?.members?.length || 0})</h2>
          <div className="members-list">
            {workspace?.members?.map((member) => (
              <div key={member.user._id} className="member-item">
                <div className="member-avatar">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <div className="member-name">{member.user.name}</div>
                  <div className="member-email">{member.user.email}</div>
                </div>
                <span className="badge">{member.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="workspace-section">
          <h2>Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiFolder />
              </div>
              <p>No projects yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="project-card"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <div className="project-icon">
                    <FiFolder size={24} />
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.description || 'No description'}</p>
                  <div className="project-meta">
                    <span>{project.tasks?.length || 0} tasks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showProjectModal && (
          <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Project</h2>
                <button className="modal-close" onClick={() => setShowProjectModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProjectModal(false)}>
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

        {showMemberModal && (
          <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Member</h2>
                <button className="modal-close" onClick={() => setShowMemberModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleAddMember}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                {/* Role is always Member by default */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add
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

export default WorkspaceDetail;
