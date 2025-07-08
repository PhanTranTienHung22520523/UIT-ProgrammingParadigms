import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const fullName = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    const phoneNumber = localStorage.getItem("phoneNumber");


    if (userId) {
      setUser({
        id: userId,
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber
      });
    }
  }, []); 

  const login = (userData) => {
    localStorage.setItem("user_id", userData.id);
    localStorage.setItem("fullName", userData.fullName);
    localStorage.setItem("email", userData.email);
    localStorage.setItem("phoneNumber", userData.phoneNumber);

    setUser(userData);
  };

  // Hàm logout
  const logout = () => {
    // Xóa tất cả thông tin người dùng khỏi localStorage
    localStorage.removeItem("user_id");
    localStorage.removeItem("fullName");
  localStorage.removeItem("email");
    localStorage.removeItem("phoneNumber");

    setUser(null);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};