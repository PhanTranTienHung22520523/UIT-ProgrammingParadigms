import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, id, email, fullName, role } = response.data;
      
      // Only allow ADMIN and MANAGER roles
      if (role !== 'ADMIN' && role !== 'MANAGER') {
        throw new Error('Bạn không có quyền truy cập vào trang quản trị');
      }
      
      const userData = { id, email, fullName, role };
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Đăng nhập thất bại' 
      };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
