// Frontend\src\components\ArticlesPage.jsx

import React, { useState, useEffect } from 'react';
import articlesAPI from '../services/articlesApi';
import familyTreeAPI from '../services/api';
import { STYLES } from '../constants/treeConstants';
import ArticleCard from './ArticleCard';
import ArticleModal from './ArticleModal';
import CreateArticleModal from './CreateArticleModal';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Модальные окна
  const [selectedArticle, setSelectedArticle] = useState(null);
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
      
      // Загружаем статьи и семейные данные параллельно
      const [articlesData, familyTreeData] = await Promise.all([
        articlesAPI.getAllArticles(),
        familyTreeAPI.getFamilyData()
      ]);
      
      setArticles(articlesData);
      setFamilyData(familyTreeData);
      
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

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleCreateArticle = async (articleData) => {
    try {
      const result = await articlesAPI.createArticle(articleData);
      
      if (result.success) {
        setArticles(prev => [...prev, result.data]);
        showNotification('Статья успешно создана!', 'success');
        setCreateModalOpen(false);
      } else {
        showNotification(result.message);
      }
    } catch (error) {
      console.error('Ошибка создания статьи:', error);
      showNotification(`Ошибка: ${error.message}`);
    }
  };

  const handleUpdateArticle = async (articleId, articleData) => {
    try {
      const result = await articlesAPI.updateArticle(articleId, articleData);
      
      if (result.success) {
        setArticles(prev => prev.map(article => 
          article.id === articleId ? result.data : article
        ));
        showNotification('Статья успешно обновлена!', 'success');
        setSelectedArticle(null);
      } else {
        showNotification(result.message);
      }
    } catch (error) {
      console.error('Ошибка обновления статьи:', error);
      showNotification(`Ошибка: ${error.message}`);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      return;
    }

    try {
      const result = await articlesAPI.deleteArticle(articleId);
      
      if (result.success) {
        setArticles(prev => prev.filter(article => article.id !== articleId));
        showNotification('Статья успешно удалена!', 'success');
        setSelectedArticle(null);
      } else {
        showNotification(result.message);
      }
    } catch (error) {
      console.error('Ошибка удаления статьи:', error);
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
            Создайте первую статью для сохранения истории вашей семьи
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              ...STYLES.button,
              ...STYLES.greenButton
            }}
          >
            Создать первую статью
          </button>
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
              onClick={() => handleArticleClick(article)}
            />
          ))}
        </div>
      )}

      {/* Модальное окно статьи */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onUpdate={handleUpdateArticle}
          onDelete={handleDeleteArticle}
          familyData={familyData}
        />
      )}

      {/* Модальное окно создания статьи */}
      {createModalOpen && (
        <CreateArticleModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateArticle}
          familyData={familyData}
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
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;