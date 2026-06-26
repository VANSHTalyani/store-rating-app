import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Stars from '../components/Stars';
import Modal from '../components/Modal';

const UserDashboard = () => {
  const { token, API_BASE_URL } = useAuth();
  const { showToast } = useToast();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');



  // Fetch user tailored stores list
  const fetchStores = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
      }).toString();

      const res = await fetch(`${API_BASE_URL}/users/stores?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error(err);
    }
  }, [API_BASE_URL, token, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Submit or modify rating
  const handleRateStore = async (storeId, score) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storeId, rating: score }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit rating.');
      }

      showToast('success', 'Rating submitted/updated successfully!');
      fetchStores();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };



  return (
    <div className="content-wrap">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Browse Stores</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Submit ratings or update your feedback for registered stores</p>
        </div>
      </div>

      {/* Stores Directory Panel */}
      <div className="glass-card">
        <div className="filter-bar">
          <input
            type="text"
            className="form-input filter-input"
            placeholder="Search stores by name, email, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Store Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('email')}>
                  Email Address {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('address')}>
                  Store Address {sortBy === 'address' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('averageRating')}>
                  Overall Rating {sortBy === 'averageRating' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>My Feedback Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No registered stores found matching your criteria.
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '600' }}>{s.name}</td>
                    <td>{s.email}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.address}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--warning)' }}>
                          {parseFloat(s.averageRating).toFixed(1)} / 5
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-dark)' }}>
                          ({s.totalRatings || 0} reviews)
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Stars
                          rating={s.myRating || 0}
                          interactive={true}
                          onChange={(score) => handleRateStore(s.id, score)}
                        />
                        <span style={{ fontSize: '11px', color: s.myRating ? 'var(--success)' : 'var(--text-dark)', fontWeight: '500' }}>
                          {s.myRating ? `Your rating: ${s.myRating} / 5` : 'Click stars to rate'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default UserDashboard;
