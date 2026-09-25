import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { INITIAL_USER } from '../services/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem('dsa_token');
        if (token) {
          const profile = await authAPI.getProfile();
          setUser(profile || INITIAL_USER);
        } else {
          // Default demo session for immediate exploration
          setUser(INITIAL_USER);
        }
      } catch (err) {
        setUser(INITIAL_USER);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
