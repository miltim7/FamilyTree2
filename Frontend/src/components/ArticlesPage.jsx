// Frontend\src\components\ArticlesPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import articlesAPI from '../services/articlesApi';
import { STYLES } from '../constants/treeConstants';
import ArticleCard from './ArticleCard';
import CreateArticleModal from './CreateArticleModal';

const ArticlesPage = () => {
  // НОВОЕ: Получаем статус авторизации
  const { isAuthenticated } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Модальное окно создания
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Загрузка данных при инициализации
  useEffect(() => {
    loadData();
  }, []);

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
      
      // ОБНОВЛЕНО: Загружаем только статьи (семейные данные больше не нужны)
      const articlesData = await articlesAPI.getAllArticles();
      
      setArticles(articlesData);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError(error.message);
      showNotification(`Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  // ОБНОВЛЕННЫЙ обработчик создания статьи БЕЗ АВТОРА
  const handleCreateArticle = async (articleData) => {
    try {
      const result = await articlesAPI.createArticle(articleData);
      
      if (result.success) {
        setArticles(prev => [...prev, result.data]);
        showNotification('Статья успешно создана! Теперь вы можете привязать её к персонам через их карточки в семейном древе.', 'success');
        setCreateModalOpen(false);
      } else {
        showNotification(result.message);
      }
    } catch (error) {
      console.error('Ошибка создания статьи:', error);
      showNotification(`Ошибка: ${error.message}`);
    }
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
          <h2 style={{ color: '#303133', fontFamily: 'Montserrat, sans-serif' }}>Загрузка статей...</h2>
        </div>
      </div>
    );
  }

  if (error) {
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
            Ошибка загрузки данных
          </h2>
          <p style={{ fontSize: '1rem', color: '#303133', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif' }}>
            {error}
          </p>
          <button 
            onClick={loadData}
            style={{
              ...STYLES.button,
              ...STYLES.greenButton
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.container}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        width: '100%',
        maxWidth: '1200px'
      }}>
        <h1 style={STYLES.title}>Статьи семейного древа</h1>
        
        {/* ОБНОВЛЕННАЯ кнопка создания - только для авторизованных */}
        {isAuthenticated && (
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              ...STYLES.button,
              ...STYLES.greenButton,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Создать статью
          </button>
        )}
      </div>

      {articles.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1)',
          padding: '3rem',
          textAlign: 'center',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#303133', 
            marginBottom: '1rem',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Пока нет статей
          </h3>
          <p style={{ 
            color: '#303133', 
            marginBottom: '1.5rem',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {isAuthenticated 
              ? 'Создайте первую статью. После создания вы сможете привязать её к нужным персонам.'
              : 'Для создания статей требуется авторизация'
            }
          </p>
          
          {/* ОБНОВЛЕННАЯ кнопка - только для авторизованных */}
          {isAuthenticated && (
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                ...STYLES.button,
                ...STYLES.greenButton
              }}
            >
              Создать первую статью
            </button>
          )}

          {/* ОБНОВЛЕННОЕ сообщение для неавторизованных - КОМПАКТНОЕ */}
          {!isAuthenticated && (
            <div style={{
              backgroundColor: '#ffffffc3',
              border: '1px solid #c0a282',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8rem',
              color: '#c0a282',
              fontFamily: 'Montserrat, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Требуется вход
            </div>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '1200px'
        }}>
          {articles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
            />
          ))}
        </div>
      )}

      {/* ОБНОВЛЕННОЕ модальное окно создания статьи БЕЗ FAMILYDATA */}
      {isAuthenticated && createModalOpen && (
        <CreateArticleModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateArticle}
        />
      )}

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
          fontFamily: 'Montserrat, sans-serif',
          maxWidth: '400px'
        }}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;