// Frontend\src\components\RecentArticles.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLES } from '../constants/treeConstants';

const RecentArticles = ({ articles, loading }) => {
  const navigate = useNavigate();

  const handleArticleClick = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  const handleViewAllClick = () => {
    navigate('/articles');
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '1200px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #ffffffc3',
            borderTop: '4px solid #c0a282',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1)',
      padding: '2rem',
      width: '100%',
      maxWidth: '1200px'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#303133',
          fontFamily: 'Montserrat, sans-serif',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Последние статьи
        </h2>
        
        <button
          onClick={handleViewAllClick}
          style={{
            backgroundColor: 'transparent',
            color: '#c0a282',
            border: '1px solid #c0a282',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#c0a282';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#c0a282';
          }}
        >
          Все статьи
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Контент */}
      {articles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#666'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '1rem',
            opacity: 0.5
          }}>
            📝
          </div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#303133',
            marginBottom: '0.5rem',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Пока нет статей
          </h3>
          <p style={{
            fontSize: '0.9rem',
            color: '#666',
            fontFamily: 'Montserrat, sans-serif',
            marginBottom: '1.5rem'
          }}>
            Создайте первые статьи для сохранения истории вашей семьи
          </p>
          <button
            onClick={handleViewAllClick}
            style={{
              ...STYLES.button,
              ...STYLES.greenButton
            }}
          >
            Перейти к статьям
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {articles.map(article => (
            <div
              key={article.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: '#ffffffc3'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(48, 49, 51, 0.15)';
                e.currentTarget.style.borderColor = '#c0a282';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
              onClick={() => handleArticleClick(article.id)}
            >
              {/* Изображение */}
              <div style={{
                height: '140px',
                overflow: 'hidden',
                backgroundColor: '#f0f0f0'
              }}>
                {article.photo ? (
                  <img
                    src={article.photo}
                    alt={article.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: '#c0a282',
                    backgroundColor: '#ffffffc3'
                  }}>
                    📰
                  </div>
                )}
              </div>

              {/* Контент */}
              <div style={{ padding: '1rem' }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#303133',
                  marginBottom: '0.5rem',
                  fontFamily: 'Montserrat, sans-serif',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.3'
                }}>
                  {article.title}
                </h4>
                
                {/* УБРАНО: отображение автора */}
                
                {article.description && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    lineHeight: '1.4',
                    fontFamily: 'Montserrat, sans-serif',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.description}
                  </p>
                )}
                
                {/* УБРАНО: блок с датой создания */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentArticles;