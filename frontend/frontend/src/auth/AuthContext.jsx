import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiFetch('/api/session');
        if (!mounted) return;
        setLoggedIn(Boolean(data?.loggedIn));
        setUserName(data?.userName || '');
      } catch (e) {
        if (!mounted) return;
        setLoggedIn(false);
        setUserName('');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    const data = await apiFetch('/api/login', { method: 'POST', body: { email, password } });
    if (!data?.success) throw new Error(data?.error || 'Login failed');
    setLoggedIn(true);
    setUserName(data?.userName || '');
    return data;
  };

  const register = async (name, email, password, confirm_password) => {
    setError(null);
    const data = await apiFetch('/api/register', {
      method: 'POST',
      body: { name, email, password, confirm_password },
    });
    if (!data?.success) throw new Error(data?.error || 'Register failed');
    setLoggedIn(true);
    setUserName(data?.userName || '');
    return data;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } finally {
      setLoggedIn(false);
      setUserName('');
    }
  };

  const value = useMemo(
    () => ({
      loading,
      loggedIn,
      userName,
      error,
      setError,
      login,
      register,
      logout,
      reloadSession: async () => {
        const data = await apiFetch('/api/session');
        setLoggedIn(Boolean(data?.loggedIn));
        setUserName(data?.userName || '');
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, loggedIn, userName, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

