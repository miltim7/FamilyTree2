// Frontend\src\contexts\AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStatus = sessionStorage.getItem('familyTreeAdmin');
        setIsAuthenticated(authStatus === 'true');
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Вход в систему
  const login = async (password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('familyTreeAdmin', 'true');
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      return { success: false, message: 'Ошибка подключения к серверу' };
    }
  };

  // Выход из системы
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('familyTreeAdmin');
  };

  const value = {
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};