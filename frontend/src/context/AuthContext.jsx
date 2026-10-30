import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerApi,
  loginApi,
  forgotPasswordApi,
  resetPasswordApi,
  getMeApi,
} from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cac-token') || null);
  const [loading, setLoading] = useState(true);

  // Check user on initial mount
  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await getMeApi(token);
          if (res && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async ({ identifier, password }) => {
    const res = await loginApi({ identifier, password });
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('cac-token', res.token);
    }
    return res;
  };

  const register = async ({ name, mobile, email, password }) => {
    const res = await registerApi({ name, mobile, email, password });
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('cac-token', res.token);
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cac-token');
  };

  const forgotPassword = async (email) => {
    return await forgotPasswordApi(email);
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    return await resetPasswordApi({ email, otp, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

