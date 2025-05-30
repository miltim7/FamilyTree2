// Frontend\src\components\Modals.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLES, NODE_STYLES } from '../constants/treeConstants';
import PhotoUpload from './PhotoUpload';

// Модальное окно с информацией о персоне
export const PersonInfoModal = ({ modal, onClose, onEdit, onDelete, isAuthenticated }) => {
  const navigate = useNavigate();
  
  if (!modal.isOpen || !modal.person) return null;

  const canDelete = modal.personId !== 'root-1'; // Нельзя удалить основателя

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleArticleClick = (articleId) => {
    onClose(); // Закрываем модальное окно
    navigate(`/articles/${articleId}`); // Переходим на страницу статьи
  };

  return (
    <div style={STYLES.modal}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(48, 49, 51, 0.25)',
        width: '95%',
        maxWidth: '50rem',
        maxHeight: '90vh',
        margin: '2rem',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Montserrat, sans-serif',
        position: 'relative'
      }}>
        
        {/* Заголовок */}
        <div style={{
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid #e0e0e0',
          position: 'relative'
        }}>
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

          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#303133',
            fontFamily: 'Montserrat, sans-serif',
            marginBottom: '1rem',
            marginRight: '3rem'
          }}>
            {modal.isSpouse ? 'Информация о супруге(-е)' : 'Информация о персоне'}
          </h2>

          {/* ОБНОВЛЕННЫЕ кнопки действий - только для авторизованных */}
          {isAuthenticated && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onEdit(modal.person, modal.isSpouse, modal.personId)}
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
              
              {canDelete && (
                <button
                  onClick={() => onDelete(modal.personId, modal.isSpouse)}
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
              )}
            </div>
          )}

          {/* НОВОЕ: Сообщение для неавторизованных */}
          {!isAuthenticated && (
            <div style={{
              backgroundColor: '#ffffffc3',
              border: '1px solid #c0a282',
              borderRadius: '0.5rem',
              padding: '0.75rem',
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
              Для редактирования требуется авторизация
            </div>
          )}
        </div>

        {/* Контент */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem'
        }}>
          
          {/* Основная информация */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {/* Фотография */}
            <div style={{ flexShrink: 0 }}>
              {modal.person.photo ? (
                <img
                  src={modal.person.photo}
                  alt={modal.person.name}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '1rem',
                    objectFit: 'cover',
                    boxShadow: '0 8px 25px rgba(48, 49, 51, 0.15)'
                  }}
                />
              ) : (
                <div style={{
                  width: '150px',
                  height: '150px',
                  backgroundColor: '#ffffffc3',
                  border: '2px solid #c0a282',
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '60px',
                  color: '#c0a282'
                }}>
                  <div>👤</div>
                </div>
              )}
            </div>
            
            {/* Основные данные */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#303133',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {modal.person.name || 'Имя не указано'}
              </h3>
              
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#c0a282',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>Пол:</span>
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#303133',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {modal.person.gender === 'male' ? 'Мужской' : 'Женский'}
                  </span>
                </div>
                
                <div>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#c0a282',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>Годы жизни:</span>
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#303133',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {modal.person.lifeYears || 'Не указаны'}
                  </span>
                </div>
                
                <div>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#c0a282',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>Профессия:</span>
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#303133',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {modal.person.profession || 'Не указана'}
                  </span>
                </div>
                
                <div>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#c0a282',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>Место рождения:</span>
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#303133',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {modal.person.birthPlace || 'Не указано'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Биография */}
          {modal.person.biography && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#303133',
                marginBottom: '0.75rem',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Биография
              </h4>
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
                {modal.person.biography}
              </div>
            </div>
          )}

          {/* Статьи персоны - только для основных персон */}
          {!modal.isSpouse && (
            <div>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#303133',
                marginBottom: '1rem',
                fontFamily: 'Montserrat, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Статьи ({modal.articles ? modal.articles.length : 0})
              </h4>

              {modal.articles && modal.articles.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '1rem'
                }}>
                  {modal.articles.map(article => (
                    <div
                      key={article.id}
                      style={{
                        backgroundColor: '#ffffffc3',
                        border: '1px solid #e0e0e0',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.borderColor = '#c0a282';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffffc3';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => handleArticleClick(article.id)}
                    >
                      {/* Миниатюра */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        flexShrink: 0
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
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            color: '#c0a282'
                          }}>
                            📰
                          </div>
                        )}
                      </div>

                      {/* Содержимое */}
                      <div style={{ flex: 1 }}>
                        <h5 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#303133',
                          marginBottom: '0.25rem',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          {article.title}
                        </h5>
                        
                        {article.description && (
                          <p style={{
                            fontSize: '0.85rem',
                            color: '#666',
                            marginBottom: '0.5rem',
                            fontFamily: 'Montserrat, sans-serif',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {article.description}
                          </p>
                        )}
                        
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#999',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          {formatDate(article.createdAt)}
                        </div>
                      </div>

                      {/* Стрелка */}
                      <div style={{
                        color: '#c0a282',
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#ffffffc3',
                  border: '2px dashed #e0e0e0',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '1rem',
                    opacity: 0.5
                  }}>
                    📝
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    fontFamily: 'Montserrat, sans-serif',
                    margin: 0
                  }}>
                    У этой персоны пока нет статей
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Информация для супругов */}
          {modal.isSpouse && (
            <div style={{
              backgroundColor: '#ffffffc3',
              border: '1px solid #e0e0e0',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '0.5rem',
                opacity: 0.7
              }}>
                💑
              </div>
              <p style={{
                fontSize: '0.9rem',
                fontFamily: 'Montserrat, sans-serif',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Статьи создаются только для основных персон семейного древа.<br/>
                Супруги могут иметь свою информацию, но статьи привязываются к основной персоне.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Остальные модальные окна остаются без изменений (они вызываются только для авторизованных)
export const EditPersonModal = ({ 
  modal, 
  onModalChange, 
  onClose, 
  onConfirm 
}) => {
  if (!modal.isOpen) return null;

  return (
    <div style={STYLES.modal}>
      <div style={STYLES.modalContent}>
        <h2 style={STYLES.modalTitle}>
          Редактировать персону
          <button
            onClick={onClose}
            style={STYLES.modalCloseButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#303133'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#303133'}
          >
            ×
          </button>
        </h2>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>ФИО:</label>
          <input
            type="text"
            value={modal.name}
            onChange={(e) => onModalChange({ name: e.target.value })}
            style={STYLES.input}
            placeholder="Введите полное имя"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Пол:</label>
          <div style={STYLES.radioGroup}>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="editGender"
                checked={modal.gender === 'male'}
                onChange={() => onModalChange({ gender: 'male' })}
                style={STYLES.radioInput}
              />
              Мужской
            </label>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="editGender"
                checked={modal.gender === 'female'}
                onChange={() => onModalChange({ gender: 'female' })}
                style={STYLES.radioInput}
              />
              Женский
            </label>
          </div>
        </div>
        
        <PhotoUpload
          photo={modal.photo}
          onPhotoChange={(photo) => onModalChange({ photo })}
          placeholder="Перетащите новое фото или нажмите для выбора"
        />
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Годы жизни:</label>
          <input
            type="text"
            value={modal.lifeYears}
            onChange={(e) => onModalChange({ lifeYears: e.target.value })}
            style={STYLES.input}
            placeholder="например: 1980-н.в. или 1950-2020"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Профессия:</label>
          <input
            type="text"
            value={modal.profession}
            onChange={(e) => onModalChange({ profession: e.target.value })}
            style={STYLES.input}
            placeholder="Введите профессию"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Место рождения:</label>
          <input
            type="text"
            value={modal.birthPlace}
            onChange={(e) => onModalChange({ birthPlace: e.target.value })}
            style={STYLES.input}
            placeholder="Введите место рождения"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Биография:</label>
          <textarea
            value={modal.biography}
            onChange={(e) => onModalChange({ biography: e.target.value })}
            style={STYLES.textarea}
            placeholder="Краткая биография персоны"
          />
        </div>
        
        <div style={STYLES.modalButtons}>
          <button
            onClick={onClose}
            style={{ ...STYLES.button, ...STYLES.grayButton }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{ 
              ...STYLES.button, 
              ...STYLES.greenButton,
              opacity: !modal.name.trim() ? 0.5 : 1,
              cursor: !modal.name.trim() ? 'not-allowed' : 'pointer'
            }}
            disabled={!modal.name.trim()}
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddSpouseModal = ({ 
  modal, 
  onModalChange, 
  onClose, 
  onStartSelection, 
  onConfirm 
}) => {
  if (!modal.isOpen) return null;

  return (
    <div style={STYLES.modal}>
      <div style={STYLES.modalContent}>
        <h2 style={STYLES.modalTitle}>
          Добавить супруга(-у)
          <button
            onClick={onClose}
            style={STYLES.modalCloseButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#303133'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#303133'}
          >
            ×
          </button>
        </h2>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>ФИО:</label>
          <input
            type="text"
            value={modal.name}
            onChange={(e) => onModalChange({ name: e.target.value })}
            style={STYLES.input}
            placeholder="Введите полное имя"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Пол:</label>
          <div style={STYLES.radioGroup}>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="spouseGender"
                checked={modal.gender === 'male'}
                onChange={() => onModalChange({ gender: 'male' })}
                style={STYLES.radioInput}
              />
              Мужской
            </label>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="spouseGender"
                checked={modal.gender === 'female'}
                onChange={() => onModalChange({ gender: 'female' })}
                style={STYLES.radioInput}
              />
              Женский
            </label>
          </div>
        </div>
        
        <PhotoUpload
          photo={modal.photo}
          onPhotoChange={(photo) => onModalChange({ photo })}
        />
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Годы жизни:</label>
          <input
            type="text"
            value={modal.lifeYears}
            onChange={(e) => onModalChange({ lifeYears: e.target.value })}
            style={STYLES.input}
            placeholder="например: 1980-н.в. или 1950-2020"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Профессия:</label>
          <input
            type="text"
            value={modal.profession}
            onChange={(e) => onModalChange({ profession: e.target.value })}
            style={STYLES.input}
            placeholder="Введите профессию"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Место рождения:</label>
          <input
            type="text"
            value={modal.birthPlace}
            onChange={(e) => onModalChange({ birthPlace: e.target.value })}
            style={STYLES.input}
            placeholder="Введите место рождения"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Биография:</label>
          <textarea
            value={modal.biography}
            onChange={(e) => onModalChange({ biography: e.target.value })}
            style={STYLES.textarea}
            placeholder="Краткая биография персоны"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Персона для добавления супруга(-и):</label>
          {modal.targetPersonId ? (
            <div style={STYLES.selectedPerson}>
              {modal.targetPersonName || `ID: ${modal.targetPersonId}`}
            </div>
          ) : (
            <button
              onClick={onStartSelection}
              style={{ ...STYLES.button, ...STYLES.blueButton, width: '100%' }}
            >
              Выбрать персону
            </button>
          )}
          <div style={STYLES.infoText}>
            После нажатия на кнопку, выберите карточку персоны на дереве.
          </div>
        </div>
        
        <div style={STYLES.modalButtons}>
          <button
            onClick={onClose}
            style={{ ...STYLES.button, ...STYLES.grayButton }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{ 
              ...STYLES.button, 
              ...STYLES.greenButton,
              opacity: !modal.name.trim() || !modal.targetPersonId ? 0.5 : 1,
              cursor: !modal.name.trim() || !modal.targetPersonId ? 'not-allowed' : 'pointer'
            }}
            disabled={!modal.name.trim() || !modal.targetPersonId}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddChildModal = ({ 
  modal, 
  onModalChange, 
  onClose, 
  onStartSelection, 
  onConfirm 
}) => {
  if (!modal.isOpen) return null;

  return (
    <div style={STYLES.modal}>
      <div style={STYLES.modalContent}>
        <h2 style={STYLES.modalTitle}>
          Добавить ребенка
          <button
            onClick={onClose}
            style={STYLES.modalCloseButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#303133'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#303133'}
          >
            ×
          </button>
        </h2>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>ФИО:</label>
          <input
            type="text"
            value={modal.name}
            onChange={(e) => onModalChange({ name: e.target.value })}
            style={STYLES.input}
            placeholder="Введите полное имя"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Пол:</label>
          <div style={STYLES.radioGroup}>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="childGender"
                value="male"
                checked={modal.gender === 'male'}
                onChange={() => onModalChange({ gender: 'male' })}
                style={STYLES.radioInput}
              />
              Мужской
            </label>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="childGender"
                value="female"
                checked={modal.gender === 'female'}
                onChange={() => onModalChange({ gender: 'female' })}
                style={STYLES.radioInput}
              />
              Женский
            </label>
          </div>
        </div>
        
        <PhotoUpload
          photo={modal.photo}
          onPhotoChange={(photo) => onModalChange({ photo })}
        />
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Годы жизни:</label>
          <input
            type="text"
            value={modal.lifeYears}
            onChange={(e) => onModalChange({ lifeYears: e.target.value })}
            style={STYLES.input}
            placeholder="например: 2005-н.в. или 1950-2020"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Профессия:</label>
          <input
            type="text"
            value={modal.profession}
            onChange={(e) => onModalChange({ profession: e.target.value })}
            style={STYLES.input}
            placeholder="Введите профессию"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Место рождения:</label>
          <input
            type="text"
            value={modal.birthPlace}
            onChange={(e) => onModalChange({ birthPlace: e.target.value })}
            style={STYLES.input}
            placeholder="Введите место рождения"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Биография:</label>
          <textarea
            value={modal.biography}
            onChange={(e) => onModalChange({ biography: e.target.value })}
            style={STYLES.textarea}
            placeholder="Краткая биография персоны"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Родители:</label>
          {modal.parentId ? (
            <div style={STYLES.selectedPerson}>
              {modal.parentName}
            </div>
          ) : (
            <button
              onClick={onStartSelection}
              style={{ ...STYLES.button, ...STYLES.blueButton, width: '100%' }}
            >
              Выбрать родителя
            </button>
          )}
        </div>
        
        <div style={STYLES.modalButtons}>
          <button
            onClick={onClose}
            style={{ ...STYLES.button, ...STYLES.grayButton }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{ 
              ...STYLES.button, 
              ...STYLES.greenButton,
              opacity: !modal.name.trim() || !modal.parentId ? 0.5 : 1,
              cursor: !modal.name.trim() || !modal.parentId ? 'not-allowed' : 'pointer'
            }}
            disabled={!modal.name.trim() || !modal.parentId}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};