import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService, STORAGE_KEYS, DEMO_USERS } from '../services/storageService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Ensure demo users exist in LocalStorage
  useEffect(() => {
    storageService.initializeUsers();
  }, []);

  // Initialize active session from LocalStorage
  const [user, setUser] = useState(() => {
    return storageService.getItem(STORAGE_KEYS.AUTH_USER, null);
  });

  const [loading, setLoading] = useState(false);

  /**
   * Login handler
   * Note: LocalStorage-based authentication is provided for client-side demo
   * purposes and is not a replacement for server-side cryptographic authentication.
   */
  const login = async (username, password) => {
    setLoading(true);
    try {
      const users = storageService.getItem(STORAGE_KEYS.USERS, DEMO_USERS);
      const matched = users.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
      );

      if (!matched) {
        throw new Error('Invalid username or password. Please verify your credentials.');
      }

      // Security measure: never keep password in active session state
      const { password: _, ...sessionUser } = matched;

      storageService.setItem(STORAGE_KEYS.AUTH_USER, sessionUser);
      setUser(sessionUser);
      return sessionUser;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout handler
   */
  const logout = () => {
    storageService.removeItem(STORAGE_KEYS.AUTH_USER);
    setUser(null);
  };

  /**
   * Role check helper
   */
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFaculty: user?.role === 'faculty',
    isStudent: user?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

