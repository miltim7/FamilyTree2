// Frontend\src\components\ArticleView.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import articlesAPI from '../services/articlesApi';
import familyTreeAPI from '../services/api';
import { STYLES } from '../constants/treeConstants';
import { findPersonById } from '../utils/familyUtils';
import PhotoUpload from './PhotoUpload';

const ArticleView = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    photo: '',
    description: '',
    content: ''
  });
  const [saving, setSaving] = useState(false);

  // Загрузка данных при инициализации
  useEffect(() => {
    loadData();
  }, [articleId]);

  // Автоскрытие уведомлений
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, notification.type === 'success' ? 2000 : 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем статью и семейные данные параллельно
      const [articleData, familyTreeData] = await Promise.all([
        articlesAPI.getArticle(articleId),
        familyTreeAPI.getFamilyData()
      ]);
      
      setArticle(articleData);
      setFamilyData(familyTreeData);
      setEditData({
        title: articleData.title || '',
        photo: articleData.photo || '',
        description: articleData.description || '',
        content: articleData.content || ''
      });
      
    } catch (error) {
      console.error('Ошибка загрузки статьи:', error);
      setError(error.message);
      showNotification(`Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData.title.trim()) {
      showNotification('Название статьи не может быть пустым');
      return;
    }

    setSaving(true);
    try {
      const result = await articlesAPI.updateArticle(articleId, editData);
      
      if (result.success) {
        setArticle(result.data);
        setIsEditing(false);
        showNotification('Статья успешно обновлена!', 'success');
      } else {
        showNotification(result.message);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showNotification(`Ошибка: ${error.message}`);
    } finally {
      setSaving(false);
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

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      return;
    }

    try {
      const result = await articlesAPI.deleteArticle(articleId);
      
      if (result.success) {
        showNotification('Статья успешно удалена!', 'success');
        setTimeout(() => {
          navigate('/articles');
        }, 1000);
      } else {
        showNotification(result.message);
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showNotification(`Ошибка: ${error.message}`);
    }
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

  if (loading) {
    return (
      <div style={STYLES.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #ffffffc3',
            borderTop: '4px solid #c0a282',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <h2 style={{ color: '#303133', fontFamily: 'Montserrat, sans-serif' }}>Загрузка статьи...</h2>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={STYLES.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#303133', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif' }}>
            {error || 'Статья не найдена'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/articles')}
              style={{
                ...STYLES.button,
                ...STYLES.greenButton
              }}
            >
              Вернуться к статьям
            </button>
            {error && (
              <button 
                onClick={loadData}
                style={{
                  ...STYLES.button,
                  ...STYLES.grayButton
                }}
              >
                Попробовать снова
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const person = findPersonById(familyData, article.personId);

  return (
    <div style={STYLES.container}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 8px 25px rgba(48, 49, 51, 0.15)',
        width: '100%',
        maxWidth: '55rem',
        margin: '0 auto',
        overflow: 'hidden',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        
        {/* Навигационная панель */}
        <div style={{
          padding: '1rem 2rem',
          backgroundColor: '#ffffffc3',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/articles')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#c0a282',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontFamily: 'Montserrat, sans-serif',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Вернуться к статьям
          </button>
          
          <div style={{
            fontSize: '0.85rem',
            color: '#666',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            / {article.title}
          </div>
        </div>

        {/* Заголовок с кнопками */}
        <div style={{
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid #e0e0e0'
        }}>
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
                  disabled={saving}
                  style={{
                    backgroundColor: saving ? '#a08966' : '#c0a282',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  {saving && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  {saving ? 'Сохранение...' : 'Сохранить'}
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
                        maxHeight: '500px',
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
                  minHeight: '300px',
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

      {/* Уведомления */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          boxShadow: '0 2px 10px rgba(48, 49, 51, 0.2)',
          zIndex: 100,
          opacity: 1,
          transition: 'opacity 0.3s ease',
          backgroundColor: notification.type === 'success' ? '#c0a282' : '#303133',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ArticleView;