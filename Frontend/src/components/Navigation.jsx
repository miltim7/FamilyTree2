// Frontend\src\components\Navigation.jsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffffc3',
    borderBottom: '1px solid #c0a282',
    marginBottom: '1rem',
    fontFamily: 'Montserrat, sans-serif'
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

  return (
    <nav style={navStyle}>
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
          if (location.pathname !== '/articles') {
            e.target.style.backgroundColor = '#c0a282';
            e.target.style.color = 'white';
          }
        }}
        onMouseLeave={(e) => {
          if (location.pathname !== '/articles') {
            e.target.style.backgroundColor = '#ffffffc3';
            e.target.style.color = '#303133';
          }
        }}
      >
        Статьи
      </button>
    </nav>
  );
};

export default Navigation;