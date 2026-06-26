import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Stars from '../components/Stars';
import Modal from '../components/Modal';

const OwnerDashboard = () => {
  const { token, API_BASE_URL } = useAuth();
  const { showToast } = useToast();

  const [hasStore, setHasStore] = useState(false);
  const [storeDetails, setStoreDetails] = useState(null);
  const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting for reviews
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');



  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        sortBy,
        sortOrder,
      }).toString();

      const res = await fetch(`${API_BASE_URL}/owner/dashboard?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.status === 404) {
        setHasStore(false);
        setStoreDetails(null);
      } else if (res.ok) {
        setHasStore(true);
        setStoreDetails(data.store);
        setStats({
          averageRating: parseFloat(data.averageRating) || 0,
          totalRatings: parseInt(data.totalRatings) || 0
        });
        setRatings(data.ratings);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, sortBy, sortOrder]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };



  if (loading) {
    return (
      <div className="content-wrap" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Loading store dashboard details...</div>
      </div>
    );
  }

  // Handle case where Store Owner user has no store assigned in database yet
  if (!hasStore) {
    return (
      <div className="content-wrap">

        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>No Store Assigned</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
            Your account is registered as a Store Owner, but no store has been linked to your profile in the database.
            Please reach out to the Administrator to set up your store listing and connect it to your account.
          </p>
        </div>


      </div>
    );
  }

  return (
    <div className="content-wrap">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Store Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Analyze performance ratings for <strong>{storeDetails.name}</strong></p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start', flexWrap: 'wrap' }} className="owner-layout">
        
        {/* Left Column: Store Details & Rating Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-card gauge-card">
            <div className="gauge-circle">
              <span className="gauge-score">{stats.averageRating.toFixed(1)}</span>
              <span className="gauge-max">out of 5</span>
            </div>
            <h3>Average Score</h3>
            <div style={{ marginTop: '8px' }}>
              <Stars rating={stats.averageRating} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-dark)', marginTop: '12px' }}>
              Calculated from {stats.totalRatings} total user submission(s)
            </p>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>Store Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '2px', fontSize: '11px' }}>Store Name</label>
                <div style={{ fontWeight: '600' }}>{storeDetails.name}</div>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '2px', fontSize: '11px' }}>Contact Email</label>
                <div>{storeDetails.email}</div>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '2px', fontSize: '11px' }}>Store Address</label>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{storeDetails.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reviewers Detailed List */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>Customer Reviews</h3>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Reviewer Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Email Address</th>
                  <th onClick={() => handleSort('rating')}>
                    Rating Score {sortBy === 'rating' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ratings.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No ratings or feedback reviews have been submitted for your store yet.
                    </td>
                  </tr>
                ) : (
                  ratings.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: '600' }}>{r.User ? r.User.name : 'Unknown Reviewer'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.User ? r.User.email : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Stars rating={r.rating} />
                          <span style={{ fontWeight: '700', color: 'var(--warning)', fontSize: '14px' }}>
                            ({r.rating} / 5)
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


    </div>
  );
};

export default OwnerDashboard;
