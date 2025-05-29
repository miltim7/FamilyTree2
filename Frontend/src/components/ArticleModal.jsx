// Frontend\src\components\ArticleModal.jsx

import React, { useState } from 'react';
import { STYLES } from '../constants/treeConstants';
import PhotoUpload from './PhotoUpload';
import { findPersonById } from '../utils/familyUtils';

const ArticleModal = ({ article, onClose, onUpdate, onDelete, familyData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: article.title || '',
    photo: article.photo || '',
    description: article.description || '',
    content: article.content || ''
  });
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData.title.trim()) {
      alert('Название статьи не может быть пустым');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(article.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: article.title || '',
      photo: article.photo || '',
      description: article.description || '',
      content: article.content || ''
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(article.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const person = findPersonById(familyData, article.personId);

  return (
    <div style={STYLES.modal}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(48, 49, 51, 0.25)',
        width: '95%',
        maxWidth: '55rem',
        maxHeight: '90vh',
        margin: '2rem',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Montserrat, sans-serif',
        position: 'relative'
      }}>
        
        {/* Заголовок с кнопками */}
        <div style={{
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid #e0e0e0',
          position: 'relative'
        }}>
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#666',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0f0f0';
              e.target.style.color = '#303133';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'none';
              e.target.style.color = '#666';
            }}
          >
            ×
          </button>

          {/* Название */}
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#303133',
                fontFamily: 'Montserrat, sans-serif',
                border: '2px solid #c0a282',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                width: '100%',
                marginBottom: '1rem',
                outline: 'none'
              }}
              placeholder="Название статьи"
            />
          ) : (
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: '#303133',
              fontFamily: 'Montserrat, sans-serif',
              marginBottom: '1rem',
              marginRight: '3rem',
              lineHeight: '1.3'
            }}>
              {article.title}
            </h1>
          )}
          
          {/* Метаинформация */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.9rem',
            color: '#c0a282',
            fontFamily: 'Montserrat, sans-serif',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Автор: {person ? person.name : article.personName}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Создано: {formatDate(article.createdAt)}</span>
            </div>
            
            {article.updatedAt !== article.createdAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Изменено: {formatDate(article.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  style={{
                    backgroundColor: '#c0a282',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#a08966'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#c0a282'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Редактировать
                </button>
                
                <button
                  onClick={handleDelete}
                  style={{
                    backgroundColor: '#303133',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1a1a1a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#303133'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Удалить
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#a08966' : '#c0a282',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'Montserrat, sans-serif'
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
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                
                <button
                  onClick={handleCancel}
                  style={{
                    backgroundColor: '#ffffffc3',
                    color: '#303133',
                    border: '1px solid #c0a282',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#c0a282';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffffc3';
                    e.target.style.color = '#303133';
                  }}
                >
                  Отмена
                </button>
              </>
            )}
          </div>
        </div>

        {/* Контент */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem'
        }}>
          {/* Фотография */}
          {(article.photo || isEditing) && (
            <div style={{ marginBottom: '2rem' }}>
              {isEditing ? (
                <PhotoUpload
                  photo={editData.photo}
                  onPhotoChange={(photo) => setEditData(prev => ({ ...prev, photo }))}
                  placeholder="Выберите изображение для статьи"
                />
              ) : (
                article.photo && (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={article.photo}
                      alt={article.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '0.75rem',
                        boxShadow: '0 8px 25px rgba(48, 49, 51, 0.15)'
                      }}
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* Описание */}
          {(article.description || isEditing) && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#303133',
                marginBottom: '0.75rem',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Краткое описание
              </h3>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '1rem',
                    border: '2px solid #c0a282',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    fontFamily: 'Montserrat, sans-serif',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  placeholder="Краткое описание статьи"
                />
              ) : (
                <div style={{
                  backgroundColor: '#ffffffc3',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e0e0e0',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#303133',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {article.description || 'Описание не указано'}
                </div>
              )}
            </div>
          )}

          {/* Полный контент */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#303133',
              marginBottom: '0.75rem',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Содержание статьи
            </h3>
            {isEditing ? (
              <textarea
                value={editData.content}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                style={{
                  width: '100%',
                  minHeight: '250px',
                  padding: '1rem',
                  border: '2px solid #c0a282',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  fontFamily: 'Montserrat, sans-serif',
                  resize: 'vertical',
                  outline: 'none'
                }}
                placeholder="Полный текст статьи"
              />
            ) : (
              <div style={{
                backgroundColor: '#ffffffc3',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e0e0e0',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                color: '#303133',
                fontFamily: 'Montserrat, sans-serif',
                minHeight: '200px',
                whiteSpace: 'pre-wrap'
              }}>
                {article.content || 'Содержание не указано'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;