import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Role selection removed; everyone is Member by default
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '', confirm: '' });

  const validateName = (val) => {
    if (!val) return 'Name is required';
    if (val.length < 2) return 'Enter your full name';
    return '';
  };

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    return re.test(val) ? '' : 'Enter a valid email address';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'At least 6 characters';
    const strong = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    return strong.test(val) ? '' : 'Include letters and numbers';
  };

  const validateConfirm = (val, pwd) => {
    if (!val) return 'Confirm your password';
    return val === pwd ? '' : 'Passwords do not match';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const errs = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirm(confirm, password)
    };
    setFieldErrors(errs);
    if (errs.name || errs.email || errs.password || errs.confirm) {
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>⚡ CollabSphere</h1>
          <h2>Create Account</h2>
          <p>Join your team's workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                setFieldErrors((fe) => ({ ...fe, name: validateName(val) }));
              }}
              required
              autoFocus
            />
            {fieldErrors.name && <div className="error-message">{fieldErrors.name}</div>}
          </div>

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
                  setFieldErrors((fe) => ({ ...fe, password: validatePassword(val), confirm: validateConfirm(confirm, val) }));
                }}
                required
                minLength="6"
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && <div className="error-message">{fieldErrors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirm"
              className="form-control"
              value={confirm}
              onChange={(e) => {
                const val = e.target.value;
                setConfirm(val);
                setFieldErrors((fe) => ({ ...fe, confirm: validateConfirm(val, password) }));
              }}
              required
              minLength="6"
            />
            {fieldErrors.confirm && <div className="error-message">{fieldErrors.confirm}</div>}
          </div>

          {/* Role selection removed */}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || !!fieldErrors.name || !!fieldErrors.email || !!fieldErrors.password || !!fieldErrors.confirm}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

