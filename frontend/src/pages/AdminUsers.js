import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [confirm, setConfirm] = useState({ open: false, userId: null, nextRole: 'Member' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/users`);
      setUsers(res.data);
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: e.response?.data?.message || 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (userId, role) => {
    setSavingId(userId);
    try {
      await axios.put(`${API_URL}/auth/users/${userId}/role`, { role });
      await fetchUsers();
      setToast({ type: 'success', message: 'Role updated' });
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: e.response?.data?.message || 'Failed to update role' });
    } finally {
      setSavingId(null);
    }
  };

  const filteredSorted = useMemo(() => {
    const q = query.toLowerCase();
    const list = users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
    const sorted = list.sort((a, b) => {
      const av = (a[sortKey] || '').toString().toLowerCase();
      const bv = (b[sortKey] || '').toString().toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, query, sortKey, sortDir]);

  const requestRoleChange = (userId, nextRole) => {
    setConfirm({ open: true, userId, nextRole });
  };

  const confirmRoleChange = async () => {
    const { userId, nextRole } = confirm;
    setConfirm({ open: false, userId: null, nextRole: 'Member' });
    await updateRole(userId, nextRole);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>User Management</h1>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-responsive">
            <div className="table-toolbar">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, role"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ maxWidth: 360 }}
              />
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th style={{cursor:'pointer'}} onClick={() => { setSortKey('name'); setSortDir(sortDir==='asc'?'desc':'asc'); }}>Name</th>
                  <th style={{cursor:'pointer'}} onClick={() => { setSortKey('email'); setSortDir(sortDir==='asc'?'desc':'asc'); }}>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" disabled={savingId===u._id || u.role==='Member'} onClick={() => requestRoleChange(u._id, 'Member')}>Make Member</button>
                        <button className="btn btn-primary" disabled={savingId===u._id || u.role==='Admin'} onClick={() => requestRoleChange(u._id, 'Admin')}>Make Admin</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: '', message: '' })} />
      <ConfirmModal
        open={confirm.open}
        title="Confirm role change"
        description={`Are you sure you want to set this user's role to ${confirm.nextRole}?`}
        confirmText="Yes, change"
        onConfirm={confirmRoleChange}
        onCancel={() => setConfirm({ open: false, userId: null, nextRole: 'Member' })}
      />
    </>
  );
};

export default AdminUsers;


