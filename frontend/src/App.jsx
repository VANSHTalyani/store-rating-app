import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Modal from './components/Modal';
import EyeIcon from './components/EyeIcon';

const AppContent = () => {
  const { user, token, loading, logout, updatePassword } = useAuth();
  const { showToast } = useToast();
  const [view, setView] = useState('login'); // 'login' or 'register'
  
  // Global Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordFormErrors, setPasswordFormErrors] = useState({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({ oldPassword: '', newPassword: '' });
    setPasswordFormErrors({});
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Initialising session...</div>
      </div>
    );
  }

  // Render auth screens if user is not authenticated
  if (!user) {
    return view === 'login' ? (
      <Login onNavigate={setView} />
    ) : (
      <Register onNavigate={setView} />
    );
  }

  // Choose the dashboard based on role
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'store_owner':
        return <OwnerDashboard />;
      case 'user':
      default:
        return <UserDashboard />;
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordForm.oldPassword) errs.oldPassword = 'Old password is required.';
    
    if (!passwordForm.newPassword) errs.newPassword = 'New password is required.';
    else if (passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 16) errs.newPassword = 'New password must be 8-16 characters.';
    else if (!/[A-Z]/.test(passwordForm.newPassword)) errs.newPassword = 'New password must include an uppercase letter.';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword)) errs.newPassword = 'New password must include a special character.';

    if (Object.keys(errs).length > 0) {
      setPasswordFormErrors(errs);
      return;
    }

    try {
      await updatePassword(passwordForm.oldPassword, passwordForm.newPassword);
      showToast('success', 'Password updated successfully!');
      handleClosePasswordModal();
    } catch (err) {
      showToast('error', err.message);
      setPasswordFormErrors({ form: err.message });
    }
  };

  return (
    <div className="app-container">
      {/* Global Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">
          <span>StoreRating</span>
        </div>
        <div className="nav-user">
          <div className={`user-badge badge-${user.role}`}>
            <strong>{user.name}</strong> ({user.role.replace('_', ' ')})
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setIsPasswordModalOpen(true)}>
            Password
          </button>
          <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Dashboard */}
      {renderDashboard()}

      {/* Global Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={handleClosePasswordModal} title="Update Account Password">
        <form onSubmit={handleChangePassword}>
          {passwordFormErrors.form && <div className="form-error" style={{ marginBottom: '14px' }}>{passwordFormErrors.form}</div>}
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showOldPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <EyeIcon visible={showOldPassword} />
              </button>
            </div>
            {passwordFormErrors.oldPassword && <div className="form-error">{passwordFormErrors.oldPassword}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="8-16 chars, 1 uppercase, 1 special symbol"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <EyeIcon visible={showNewPassword} />
              </button>
            </div>
            {passwordFormErrors.newPassword && <div className="form-error">{passwordFormErrors.newPassword}</div>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Save New Password
          </button>
        </form>
      </Modal>

      {/* Footer */}
      <footer className="footer">
        <div>&copy; {new Date().getFullYear()} StoreRating App. Built with React and Sequelize.</div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
