import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EyeIcon from '../components/EyeIcon';

const Login = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      tempErrors.password = 'Password is required.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email, password);
      showToast('success', 'Logged in successfully!');
    } catch (error) {
      showToast('error', error.message || 'Invalid email or password.');
      setErrors({ form: error.message || 'Invalid credentials.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to access your ratings dashboard</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div className="form-error" style={{ marginBottom: '16px', justifyContent: 'center' }}>
              {errors.form}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="e.g., user@storerating.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <span onClick={() => onNavigate('register')}>Sign Up Now</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
