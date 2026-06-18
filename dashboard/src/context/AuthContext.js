'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, login as apiLogin, signup as apiSignup, logout as apiLogout, getToken, setToken } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        // Token invalid/expired — clear it
        apiLogout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await apiSignup(name, email, password);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
