import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    return re.test(val) ? '' : 'Enter a valid email address';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'At least 6 characters';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailErr = validateEmail(email);
      const passErr = validatePassword(password);
      setFieldErrors({ email: emailErr, password: passErr });
      if (emailErr || passErr) {
        setLoading(false);
        return;
      }
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>⚡ CollabSphere</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                setFieldErrors((fe) => ({ ...fe, email: validateEmail(val) }));
              }}
              required
              autoFocus
            />
            {fieldErrors.email && <div className="error-message">{fieldErrors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  setFieldErrors((fe) => ({ ...fe, password: validatePassword(val) }));
                }}
                required
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && <div className="error-message">{fieldErrors.password}</div>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || !!fieldErrors.email || !!fieldErrors.password}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

