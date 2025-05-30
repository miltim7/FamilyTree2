// Frontend\src\components\AdminLoginModal.jsx

import React, { useState } from 'react';
import { STYLES } from '../constants/treeConstants';

const AdminLoginModal = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onLogin(password);
      
      if (result.success) {
        setPassword('');
        setError('');
        onClose();
      } else {
        setError(result.message || 'Неверный пароль');
      }
    } catch (error) {
      setError('Ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={STYLES.modal}>
      <div style={{
        ...STYLES.modalContent,
        maxWidth: '400px',
        position: 'relative'
      }}>
        
        {/* Заголовок с кнопкой закрытия */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <h2 style={{
            ...STYLES.modalTitle,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingRight: '2rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Вход в админ панель
          </h2>
          
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '-0.5rem',
              right: '-0.5rem',
              background: '#303133',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            ×
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit}>
          <div style={STYLES.formGroup}>
            <label style={STYLES.label}>Пароль администратора:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...STYLES.input,
                borderColor: error ? '#ff4444' : '#c0a282'
              }}
              placeholder="Введите пароль"
              autoFocus
              disabled={loading}
            />
            
            {error && (
              <div style={{
                color: '#ff4444',
                fontSize: '0.875rem',
                marginTop: '0.5rem',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {error}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            marginTop: '1.5rem'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                ...STYLES.button,
                ...STYLES.grayButton,
                opacity: loading ? 0.6 : 1
              }}
            >
              Отмена
            </button>
            
            <button
              type="submit"
              disabled={loading || !password.trim()}
              style={{
                ...STYLES.button,
                ...STYLES.greenButton,
                opacity: (loading || !password.trim()) ? 0.6 : 1,
                cursor: (loading || !password.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              )}
              {loading ? 'Проверка...' : 'Войти'}
            </button>
          </div>
        </form>

        {/* Подсказка */}
        <div style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#666',
          textAlign: 'center',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          После входа станут доступны все функции редактирования
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;