import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dairy_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dairy_token') || null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('dairy_token');
    if (storedToken) {
      getMeApi()
        .then((res) => {
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('dairy_user', JSON.stringify(res.data.user));
          } else {
            logout(false);
          }
        })
        .catch(() => {
          logout(false);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    } else {
      setInitialLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('dairy_token', res.data.token);
        localStorage.setItem('dairy_user', JSON.stringify(res.data.user));
        addToast(res.data.message || `Welcome back, ${res.data.user.name}!`, 'success');
        return res.data;
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      addToast(errMsg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (showToast = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dairy_token');
    localStorage.removeItem('dairy_user');
    if (showToast) {
      addToast('Logged out successfully', 'info');
    }
  };


  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initialLoading,
        isAdmin,
        isStaff,
        login,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
