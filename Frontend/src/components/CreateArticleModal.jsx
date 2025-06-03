// Frontend\src\components\CreateArticleModal.jsx

import React, { useState } from 'react';
import { STYLES } from '../constants/treeConstants';
import PhotoUpload from './PhotoUpload';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const CreateArticleModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    photo: '',
    description: '',
    content: ''
    // УБРАНО: personId и createdAt - статьи создаются независимо
  });
  const [loading, setLoading] = useState(false);

  // Блокируем скролл страницы при открытии модального окна
  useBodyScrollLock(isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Укажите название статьи');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        title: formData.title.trim(),
        photo: formData.photo || null,
        description: formData.description.trim(),
        content: formData.content.trim()
        // УБРАНО: personId и createdAt
      });
      
      // Сброс формы
      setFormData({
        title: '',
        photo: '',
        description: '',
        content: ''
      });
    } catch (error) {
      console.error('Ошибка создания статьи:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      photo: '',
      description: '',
      content: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={STYLES.modal}>
      <div style={{
        ...STYLES.modalContent,
        maxWidth: '45rem',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h2 style={{
          ...STYLES.modalTitle,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Создать новую статью
          <button
            onClick={handleClose}
            style={STYLES.modalCloseButton}
          >
            ×
          </button>
        </h2>

        <form onSubmit={handleSubmit} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            
            {/* УБРАНО: Выбор автора */}
            
            {/* Название */}
            <div style={STYLES.formGroup}>
              <label style={STYLES.label}>Название статьи:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                style={STYLES.input}
                placeholder="Введите название статьи"
                required
              />
            </div>

            {/* УБРАНО: Дата создания */}

            {/* Фотография */}
            <PhotoUpload
              photo={formData.photo}
              onPhotoChange={(photo) => setFormData(prev => ({ ...prev, photo }))}
              placeholder="Выберите изображение для статьи"
            />

            {/* Краткое описание */}
            <div style={STYLES.formGroup}>
              <label style={STYLES.label}>Краткое описание:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  ...STYLES.textarea,
                  minHeight: '80px'
                }}
                placeholder="Краткое описание статьи для карточки"
              />
            </div>

            {/* Полный текст */}
            <div style={STYLES.formGroup}>
              <label style={STYLES.label}>Полный текст статьи:</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                style={{
                  ...STYLES.textarea,
                  minHeight: '200px'
                }}
                placeholder="Полный текст статьи"
              />
            </div>
          </div>

          {/* Кнопки */}
          <div style={{
            ...STYLES.modalButtons,
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #c0a282'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                ...STYLES.button,
                ...STYLES.grayButton
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              style={{
                ...STYLES.button,
                ...STYLES.greenButton,
                opacity: (loading || !formData.title.trim()) ? 0.5 : 1,
                cursor: (loading || !formData.title.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Создание...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Создать статью
                </>
              )}
            </button>
          </div>
        </form>

        {/* НОВОЕ: Пояснение */}
        <div style={{
          backgroundColor: '#ffffffc3',
          border: '1px solid #c0a282',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: '#c0a282',
          fontFamily: 'Montserrat, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
          </svg>
          После создания статьи вы сможете привязать её к нужным персонам через их карточки в семейном древе
        </div>
      </div>
    </div>
  );
};

export default CreateArticleModal;