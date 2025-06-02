// Frontend\src\components\CreateArticleModal.jsx

import React, { useState } from 'react';
import { STYLES } from '../constants/treeConstants';
import PhotoUpload from './PhotoUpload';
import { findPersonById } from '../utils/familyUtils';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const CreateArticleModal = ({ isOpen, onClose, onCreate, familyData }) => {
  const [formData, setFormData] = useState({
    personId: '',
    title: '',
    photo: '',
    description: '',
    content: '',
    createdAt: new Date().toISOString() // НОВОЕ: дата создания
  });
  const [loading, setLoading] = useState(false);

  // Блокируем скролл страницы при открытии модального окна
  useBodyScrollLock(isOpen);

  // Получаем список всех персон для выбора
  const getAllPersons = (node, persons = []) => {
    if (!node) return persons;
    
    persons.push({
      id: node.id,
      name: node.name,
      type: 'person'
    });
    
    if (node.spouse) {
      persons.push({
        id: node.id,
        name: node.spouse.name,
        type: 'spouse',
        isSpouse: true
      });
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        getAllPersons(child, persons);
      });
    }
    
    return persons;
  };

  const allPersons = familyData ? getAllPersons(familyData) : [];

  // НОВОЕ: Форматирование даты для input type="datetime-local"
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.personId || !formData.title.trim()) {
      alert('Выберите автора и укажите название статьи');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        personId: formData.personId,
        title: formData.title.trim(),
        photo: formData.photo || null,
        description: formData.description.trim(),
        content: formData.content.trim(),
        createdAt: formData.createdAt // НОВОЕ: передаем дату создания
      });
      
      // Сброс формы
      setFormData({
        personId: '',
        title: '',
        photo: '',
        description: '',
        content: '',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Ошибка создания статьи:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      personId: '',
      title: '',
      photo: '',
      description: '',
      content: '',
      createdAt: new Date().toISOString()
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
            {/* Выбор автора */}
            <div style={STYLES.formGroup}>
              <label style={STYLES.label}>Автор статьи:</label>
              <select
                value={formData.personId}
                onChange={(e) => setFormData(prev => ({ ...prev, personId: e.target.value }))}
                style={{
                  ...STYLES.input,
                  cursor: 'pointer'
                }}
                required
              >
                <option value="">Выберите автора</option>
                {allPersons.map((person, index) => {
                  const displayName = person.isSpouse 
                    ? `${person.name} (супруг${person.name.endsWith('а') || person.name.endsWith('я') ? 'а' : ''})`
                    : person.name;
                  
                  return (
                    <option key={`${person.id}-${person.type}-${index}`} value={person.id}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>

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

            {/* НОВОЕ: Дата создания */}
            <div style={STYLES.formGroup}>
              <label style={STYLES.label}>Дата создания:</label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.createdAt)}
                onChange={(e) => setFormData(prev => ({ ...prev, createdAt: new Date(e.target.value).toISOString() }))}
                style={STYLES.input}
              />
            </div>

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
              disabled={loading || !formData.personId || !formData.title.trim()}
              style={{
                ...STYLES.button,
                ...STYLES.greenButton,
                opacity: (loading || !formData.personId || !formData.title.trim()) ? 0.5 : 1,
                cursor: (loading || !formData.personId || !formData.title.trim()) ? 'not-allowed' : 'pointer',
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
      </div>
    </div>
  );
};

export default CreateArticleModal;