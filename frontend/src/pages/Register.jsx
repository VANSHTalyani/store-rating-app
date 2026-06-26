import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EyeIcon from '../components/EyeIcon';

const Register = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};
    
    if (!name) {
      tempErrors.name = 'Full name is required.';
    } else if (name.length < 20 || name.length > 60) {
      tempErrors.name = 'Name must be between 20 and 60 characters.';
    }

    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }

    if (!address) {
      tempErrors.address = 'Address is required.';
    } else if (address.length > 400) {
      tempErrors.address = 'Address cannot exceed 400 characters.';
    }

    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 8 || password.length > 16) {
      tempErrors.password = 'Password must be between 8 and 16 characters.';
    } else if (!/[A-Z]/.test(password)) {
      tempErrors.password = 'Password must include at least one uppercase letter.';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      tempErrors.password = 'Password must include at least one special character.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(name, email, address, password);
      showToast('success', 'Registration successful! You can now log in.');
      onNavigate('login');
    } catch (error) {
      showToast('error', error.message || 'Registration failed.');
      setErrors({ form: error.message || 'Registration failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Register as a normal user to submit reviews</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div className="form-error" style={{ marginBottom: '16px', justifyContent: 'center' }}>
              {errors.form}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="Min 20 characters (e.g. Johnathan Alexander Smith)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="e.g. alex@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Physical Address</label>
            <textarea
              id="address"
              className="form-input"
              rows="3"
              placeholder="Enter your street address (Max 400 characters)"
              style={{ resize: 'vertical' }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input"
                placeholder="8-16 chars, 1 uppercase, 1 special char"
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
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <span onClick={() => onNavigate('login')}>Sign In Instead</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
