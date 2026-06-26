import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage on start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, address, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, address, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors.map(e => e.message).join(' | '));
        }
        throw new Error(data.message || 'Registration failed.');
      }

      return data.message;
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors.map(e => e.message).join(' | '));
        }
        throw new Error(data.message || 'Failed to update password.');
      }

      return data.message;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updatePassword, logout, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
