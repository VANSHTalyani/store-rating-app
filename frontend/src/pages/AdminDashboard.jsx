import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import EyeIcon from '../components/EyeIcon';

const AdminDashboard = () => {
  const { token, API_BASE_URL } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  
  // Lists
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [ownersList, setOwnersList] = useState([]); // Used for dropdown in Add Store

  // Filter & Sort state for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  // Filter & Sort state for Stores
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // New User Form State
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [showUserPassword, setShowUserPassword] = useState(false);

  // New Store Form State
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [storeFormErrors, setStoreFormErrors] = useState({});

  // Load Dash Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, [API_BASE_URL, token]);

  // Load Users List
  const fetchUsers = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        search: userSearch,
        role: userRole,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      }).toString();
      
      const res = await fetch(`${API_BASE_URL}/admin/users?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        // Sync owners list for Add Store modal dropdown
        setOwnersList(data.filter(u => u.role === 'store_owner'));
      }
    } catch (err) {
      console.error(err);
    }
  }, [API_BASE_URL, token, userSearch, userRole, userSortBy, userSortOrder]);

  // Load Stores List
  const fetchStores = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        search: storeSearch,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
      }).toString();

      const res = await fetch(`${API_BASE_URL}/admin/stores?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error(err);
    }
  }, [API_BASE_URL, token, storeSearch, storeSortBy, storeSortOrder]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, fetchUsers, fetchStores]);

  // Handle Sort changes
  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(field);
      setUserSortOrder('asc');
    }
  };

  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      storeSortOrder === 'asc' ? setStoreSortOrder('desc') : setStoreSortOrder('asc');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('asc');
    }
  };

  // Add User Submission
  const handleCreateUser = async (e) => {
    e.preventDefault();
    // Validate locally first
    const errs = {};
    if (!userForm.name) errs.name = 'Name is required.';
    else if (userForm.name.length < 20 || userForm.name.length > 60) errs.name = 'Name must be 20-60 characters.';
    
    if (!userForm.email) errs.email = 'Email is required.';
    
    if (!userForm.address) errs.address = 'Address is required.';
    else if (userForm.address.length > 400) errs.address = 'Address cannot exceed 400 characters.';
    
    if (!userForm.password) errs.password = 'Password is required.';
    else if (userForm.password.length < 8 || userForm.password.length > 16) errs.password = 'Password must be 8-16 characters.';
    else if (!/[A-Z]/.test(userForm.password)) errs.password = 'Password must include an uppercase letter.';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(userForm.password)) errs.password = 'Password must include a special character.';

    if (Object.keys(errs).length > 0) {
      setUserFormErrors(errs);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors.map(e => e.message).join(' | '));
        }
        throw new Error(data.message || 'User creation failed.');
      }

      showToast('success', 'User added successfully!');
      setIsUserModalOpen(false);
      setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
      setUserFormErrors({});
      setShowUserPassword(false);
      fetchStats();
      fetchUsers();
    } catch (err) {
      showToast('error', err.message);
      setUserFormErrors({ form: err.message });
    }
  };

  // Add Store Submission
  const handleCreateStore = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!storeForm.name) errs.name = 'Store name is required.';
    else if (storeForm.name.length < 20 || storeForm.name.length > 60) errs.name = 'Store name must be 20-60 characters.';
    
    if (!storeForm.email) errs.email = 'Store email is required.';
    
    if (!storeForm.address) errs.address = 'Store address is required.';
    else if (storeForm.address.length > 400) errs.address = 'Store address cannot exceed 400 characters.';

    if (Object.keys(errs).length > 0) {
      setStoreFormErrors(errs);
      return;
    }

    const payload = {
      name: storeForm.name,
      email: storeForm.email,
      address: storeForm.address,
      ownerId: storeForm.ownerId ? parseInt(storeForm.ownerId) : null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/admin/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors.map(e => e.message).join(' | '));
        }
        throw new Error(data.message || 'Store creation failed.');
      }

      showToast('success', 'Store created successfully!');
      setIsStoreModalOpen(false);
      setStoreForm({ name: '', email: '', address: '', ownerId: '' });
      setStoreFormErrors({});
      fetchStats();
      if (activeTab === 'stores') fetchStores();
    } catch (err) {
      showToast('error', err.message);
      setStoreFormErrors({ form: err.message });
    }
  };



  return (
    <div className="content-wrap">
      {/* Stats Summary cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.totalStores}</div>
          <div>
            <div className="stat-label">Total Stores</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.totalRatings}</div>
          <div>
            <div className="stat-label">Ratings Submitted</div>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setIsUserModalOpen(true)}>
          Add New User
        </button>
        <button className="btn btn-primary" onClick={() => setIsStoreModalOpen(true)}>
          Add New Store
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="tab-controls">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Registry
        </button>
        <button
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          Stores Directory
        </button>
      </div>

      {/* Users Tab Panel */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <div className="filter-bar">
            <input
              type="text"
              className="form-input filter-input"
              placeholder="Search users by name, email, address..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <select
              className="form-input filter-select"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="store_owner">Store Owner</option>
              <option value="user">Normal User</option>
            </select>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th onClick={() => handleUserSort('name')}>
                    Name {userSortBy === 'name' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleUserSort('email')}>
                    Email {userSortBy === 'email' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleUserSort('address')}>
                    Address {userSortBy === 'address' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleUserSort('role')}>
                    Role {userSortBy === 'role' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleUserSort('storeRating')}>
                    Store Rating {userSortBy === 'storeRating' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No matching user records found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '500' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.address}</td>
                      <td>
                        <span className={`user-badge badge-${u.role}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: u.role === 'store_owner' ? 'var(--warning)' : 'inherit' }}>
                        {u.role === 'store_owner' ? parseFloat(u.storeRating).toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stores Tab Panel */}
      {activeTab === 'stores' && (
        <div className="glass-card">
          <div className="filter-bar">
            <input
              type="text"
              className="form-input filter-input"
              placeholder="Search stores by name, email, address..."
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th onClick={() => handleStoreSort('name')}>
                    Store Name {storeSortBy === 'name' && (storeSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleStoreSort('email')}>
                    Email Address {storeSortBy === 'email' && (storeSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleStoreSort('address')}>
                    Store Address {storeSortBy === 'address' && (storeSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Store Owner</th>
                  <th onClick={() => handleStoreSort('averageRating')}>
                    Average Rating {storeSortBy === 'averageRating' && (storeSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No matching store records found.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '500' }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.address}</td>
                      <td>
                        {s.Owner ? (
                          <div>
                            <div style={{ fontWeight: '500' }}>{s.Owner.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dark)' }}>{s.Owner.email}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dark)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--warning)', fontSize: '16px' }}>
                        {parseFloat(s.averageRating).toFixed(1)} / 5
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      <Modal isOpen={isUserModalOpen} onClose={() => { setIsUserModalOpen(false); setShowUserPassword(false); }} title="Register New User">
        <form onSubmit={handleCreateUser}>
          {userFormErrors.form && <div className="form-error" style={{ marginBottom: '14px' }}>{userFormErrors.form}</div>}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Min 20 characters name"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            />
            {userFormErrors.name && <div className="form-error">{userFormErrors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="user@storerating.com"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
            {userFormErrors.email && <div className="form-error">{userFormErrors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Physical Address</label>
            <textarea
              className="form-input"
              rows="2"
              placeholder="Street address (Max 400 characters)"
              value={userForm.address}
              onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
            />
            {userFormErrors.address && <div className="form-error">{userFormErrors.address}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <div className="password-input-wrapper">
              <input
                type={showUserPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="8-16 chars, 1 uppercase, 1 special symbol"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowUserPassword(!showUserPassword)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <EyeIcon visible={showUserPassword} />
              </button>
            </div>
            {userFormErrors.password && <div className="form-error">{userFormErrors.password}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select
              className="form-input"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            >
              <option value="user">Normal User</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Register User Account
          </button>
        </form>
      </Modal>

      {/* Modal: Create Store */}
      <Modal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)} title="Create New Store">
        <form onSubmit={handleCreateStore}>
          {storeFormErrors.form && <div className="form-error" style={{ marginBottom: '14px' }}>{storeFormErrors.form}</div>}
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Min 20 characters name"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
            />
            {storeFormErrors.name && <div className="form-error">{storeFormErrors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="store@storerating.com"
              value={storeForm.email}
              onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
            />
            {storeFormErrors.email && <div className="form-error">{storeFormErrors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea
              className="form-input"
              rows="2"
              placeholder="Street address (Max 400 characters)"
              value={storeForm.address}
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
            />
            {storeFormErrors.address && <div className="form-error">{storeFormErrors.address}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Assign Store Owner</label>
            <select
              className="form-input"
              value={storeForm.ownerId}
              onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}
            >
              <option value="">Unassigned (No owner)</option>
              {ownersList.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
            <small style={{ display: 'block', marginTop: '4px', color: 'var(--text-dark)' }}>
              Only users with the 'Store Owner' role can be assigned. One owner per store.
            </small>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Create Store Record
          </button>
        </form>
      </Modal>


    </div>
  );
};

export default AdminDashboard;
