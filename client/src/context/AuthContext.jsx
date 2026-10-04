import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await authAPI.getProfile();
        setUser(profile || null);
      } catch (err) {
        // Cookie missing, invalid, or cleared — log out user
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);


  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    try {
      const fullProfile = await authAPI.getProfile();
      setUser(fullProfile);
    } catch (_) {
      setUser(res.data || res.user || null);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    try {
      const fullProfile = await authAPI.getProfile();
      setUser(fullProfile);
    } catch (_) {
      setUser(res.data || res.user || null);
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
