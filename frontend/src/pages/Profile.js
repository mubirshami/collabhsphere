import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { FiUser, FiMail, FiShield, FiSave } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      // If avatar file selected, upload first
      if (avatarFile) {
        const form = new FormData();
        form.append('avatar', avatarFile);
        const uploadRes = await axios.post(`${API_URL}/auth/profile/avatar`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormData(prev => ({ ...prev, avatar: uploadRes.data.avatar }));
      }

      const updateData = {
        name: formData.name,
        avatar: formData.avatar
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await axios.put(
        `${API_URL}/auth/profile`,
        updateData
      );

      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const avatarOptions = [
    '😀', '😎', '🚀', '⚡', '🎨', '🎯', '💡', '🔥', '⭐', '🌟',
    '🎭', '🎪', '🎸', '🎮', '🏆', '💎', '🌈', '🦄', '🐱', '🐶'
  ];

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {user?.avatar || user?.name?.charAt(0).toUpperCase()}
              </div>
              <h1>{user?.name}</h1>
              <div className="profile-info">
                <span className="info-item">
                  <FiMail /> {user?.email}
                </span>
                <span className="info-item">
                  <FiShield /> {user?.role}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <h2>Edit Profile</h2>

              <div className="form-group">
                <label htmlFor="name">
                  <FiUser /> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Choose Avatar</label>
                <div className="avatar-picker">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`avatar-option ${formData.avatar === emoji ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, avatar: emoji })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Or Upload Image Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
                {avatarFile && (
                  <div style={{ marginTop: '8px' }}>
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="avatar preview"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-divider">
                <span>Change Password (Optional)</span>
              </div>

              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                />
              </div>

              {message.text && (
                <div className={`${message.type}-message`}>
                  {message.text}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

