// Frontend\src\components\Navigation.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLoginModal from './AdminLoginModal';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#ffffffc3',
    borderBottom: '1px solid #c0a282',
    marginBottom: '1rem',
    fontFamily: 'Montserrat, sans-serif'
  };

  const leftNavStyle = {
    display: 'flex',
    gap: '1rem'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    border: 'none',
    fontWeight: '500',
    fontFamily: 'Montserrat, sans-serif',
    backgroundColor: '#ffffffc3',
    color: '#303133',
    border: '1px solid #c0a282',
    transition: 'all 0.2s ease'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#c0a282',
    color: 'white'
  };

  const authButtonStyle = {
    padding: '0.5rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    border: '1px solid #c0a282',
    backgroundColor: '#ffffffc3',
    color: '#c0a282',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    transition: 'all 0.2s ease',
    fontFamily: 'Montserrat, sans-serif'
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleLogin = async (password) => {
    return await login(password);
  };

  return (
    <>
      <nav style={navStyle}>
        {/* Левая часть - навигационные кнопки */}
        <div style={leftNavStyle}>
          <button
            onClick={() => navigate('/')}
            style={location.pathname === '/' ? activeButtonStyle : buttonStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/') {
                e.target.style.backgroundColor = '#c0a282';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/') {
                e.target.style.backgroundColor = '#ffffffc3';
                e.target.style.color = '#303133';
              }
            }}
          >
            Семейное древо
          </button>
          
          <button
            onClick={() => navigate('/articles')}
            style={location.pathname === '/articles' ? activeButtonStyle : buttonStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/articles' && !location.pathname.startsWith('/articles/')) {
                e.target.style.backgroundColor = '#c0a282';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/articles' && !location.pathname.startsWith('/articles/')) {
                e.target.style.backgroundColor = '#ffffffc3';
                e.target.style.color = '#303133';
              }
            }}
          >
            Статьи
          </button>
        </div>

        {/* Правая часть - кнопка авторизации */}
        <div>
          <button
            onClick={handleAuthClick}
            style={authButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#c0a282';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffffc3';
              e.target.style.color = '#c0a282';
            }}
            title={isAuthenticated ? 'Выйти из админ панели' : 'Войти в админ панель'}
          >
            {isAuthenticated ? (
              // Иконка выхода
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              // Иконка входа
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Модальное окно авторизации */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Navigation;