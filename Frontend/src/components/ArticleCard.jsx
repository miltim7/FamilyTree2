// Frontend\src\components\ArticleCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1), 0 2px 4px -1px rgba(48, 49, 51, 0.06)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'Montserrat, sans-serif'
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    backgroundColor: '#ffffffc3'
  };

  const placeholderStyle = {
    width: '100%',
    height: '200px',
    backgroundColor: '#ffffffc3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: '#c0a282'
  };

  const contentStyle = {
    padding: '1rem'
  };

  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#303133',
    marginBottom: '0.5rem',
    fontFamily: 'Montserrat, sans-serif'
  };

  const authorStyle = {
    fontSize: '0.875rem',
    color: '#c0a282',
    marginBottom: '0.5rem',
    fontFamily: 'Montserrat, sans-serif'
  };

  const descriptionStyle = {
    fontSize: '0.875rem',
    color: '#303133',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    fontFamily: 'Montserrat, sans-serif'
  };

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(48, 49, 51, 0.1), 0 4px 6px -2px rgba(48, 49, 51, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(48, 49, 51, 0.1), 0 2px 4px -1px rgba(48, 49, 51, 0.06)';
      }}
    >
      {article.photo ? (
        <img
          src={article.photo}
          alt={article.title}
          style={imageStyle}
        />
      ) : (
        <div style={placeholderStyle}>
          📰
        </div>
      )}
      
      <div style={contentStyle}>
        <h3 style={titleStyle}>{article.title}</h3>
        <p style={authorStyle}>Автор: {article.personName}</p>
        {article.description && (
          <p style={descriptionStyle}>{article.description}</p>
        )}
        {/* УДАЛЕНО: блок с датой создания */}
      </div>
    </div>
  );
};

export default ArticleCard;