// Frontend\src\components\Modals.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLES, NODE_STYLES } from '../constants/treeConstants';
import PhotoUpload from './PhotoUpload';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import articlesAPI from '../services/articlesApi';

// НОВАЯ ФУНКЦИЯ: Поиск персоны по ID (используется для поиска основной персоны по ID супруга)
const findPersonById = (root, targetId) => {
  if (!root || !targetId) return null;

  const normalizedId = targetId.replace(/-spouse$/, '');

  if (root.id === normalizedId) {
    return root;
  }

  if (root.children && Array.isArray(root.children)) {
    for (const child of root.children) {
      if (!child) continue;
      const found = findPersonById(child, normalizedId);
      if (found) return found;
    }
  }

  return null;
};

// НОВАЯ ФУНКЦИЯ: Поиск родителей персоны
const findParents = (familyData, targetPersonId) => {
  const searchInNode = (node) => {
    if (!node || !node.children) return null;

    // Проверяем, есть ли целевая персона среди детей этого узла
    for (const child of node.children) {
      if (child && child.id === targetPersonId) {
        // Нашли родителей - возвращаем основную персону и супруга
        const parents = [node];
        if (node.spouse) {
          parents.push({ ...node.spouse, id: `${node.id}-spouse` });
        }
        return parents;
      }
    }

    // Рекурсивно ищем в детях
    for (const child of node.children) {
      if (child) {
        const found = searchInNode(child);
        if (found) return found;
      }
    }

    return null;
  };

  return searchInNode(familyData) || [];
};

// Модальное окно с информацией о персоне
export const PersonInfoModal = ({ modal, onClose, onEdit, onDelete, isAuthenticated }) => {
  const navigate = useNavigate();

  // НОВОЕ: Состояние для управления статьями
  const [allArticles, setAllArticles] = useState([]);
  const [personArticles, setPersonArticles] = useState([]);
  const [availableArticles, setAvailableArticles] = useState([]);
  const [showArticleSelector, setShowArticleSelector] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // НОВОЕ: Состояние для семейных связей
  const [familyRelations, setFamilyRelations] = useState({
    parents: [],
    spouse: null,
    children: []
  });

  // Блокируем скролл страницы при открытии модального окна
  useBodyScrollLock(modal.isOpen);

  // НОВОЕ: Загружаем статьи при открытии модала персоны (не супруга)
  useEffect(() => {
    if (modal.isOpen && modal.personId && !modal.isSpouse) {
      loadArticlesData();
    }
  }, [modal.isOpen, modal.personId, modal.isSpouse]);

  // НОВОЕ: Загружаем семейные связи при открытии модала
  useEffect(() => {
    if (modal.isOpen && modal.personId && modal.person) {
      loadFamilyRelations();
    }
  }, [modal.isOpen, modal.personId, modal.person]);

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: Загрузка семейных связей
  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: Загрузка семейных связей
const loadFamilyRelations = () => {
  if (!modal.person || !window.familyData) return;

  const relations = {
    parents: [],
    spouse: null,
    children: []
  };

  if (modal.isSpouse) {
    // ИСПРАВЛЕНО: Для супругов
    const mainPersonId = modal.personId; // ID основной персоны
    const mainPerson = findPersonById(window.familyData, mainPersonId);
    
    if (mainPerson) {
      // Супруг основной персоны
      relations.spouse = mainPerson;
      
      // УБРАНО: Родители супруга (свёкра не показываем!)
      // relations.parents = []; // Остается пустым
      
      // Дети супруга = дети основной персоны (общие дети)
      if (mainPerson.children && mainPerson.children.length > 0) {
        relations.children = mainPerson.children;
      }
    }
  } else {
    // Для основных персон (как было)
    
    // Получаем родителей
    const parents = findParents(window.familyData, modal.personId);
    relations.parents = parents;

    // Получаем супруга
    if (modal.person.spouse) {
      relations.spouse = modal.person.spouse;
    }

    // Получаем детей
    if (modal.person.children && modal.person.children.length > 0) {
      relations.children = modal.person.children;
    }
  }

  setFamilyRelations(relations);
};

  // НОВАЯ ФУНКЦИЯ: Загрузка всех статей и статей персоны
  const loadArticlesData = async () => {
    try {
      setArticlesLoading(true);

      // Загружаем все статьи и статьи персоны параллельно
      const [allArticlesData, personArticlesData] = await Promise.all([
        articlesAPI.getAllArticles(),
        articlesAPI.getPersonArticles(modal.personId)
      ]);

      setAllArticles(allArticlesData);
      setPersonArticles(personArticlesData);

      // Фильтруем доступные статьи (те, что еще не привязаны к этой персоне)
      const linkedArticleIds = personArticlesData.map(article => article.id);
      const available = allArticlesData.filter(article => !linkedArticleIds.includes(article.id));
      setAvailableArticles(available);

    } catch (error) {
      console.error('Ошибка загрузки статей:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  // НОВАЯ ФУНКЦИЯ: Привязать статью к персоне
  const handleLinkArticle = async (articleId) => {
    try {
      const result = await articlesAPI.linkArticleToPerson(articleId, modal.personId);

      if (result.success) {
        await loadArticlesData(); // Перезагружаем данные
        setShowArticleSelector(false);
      }
    } catch (error) {
      console.error('Ошибка привязки статьи:', error);
      alert('Ошибка при привязке статьи');
    }
  };

  // НОВАЯ ФУНКЦИЯ: Отвязать статью от персоны
  const handleUnlinkArticle = async (articleId) => {
    if (!window.confirm('Отвязать эту статью от персоны?')) {
      return;
    }

    try {
      const result = await articlesAPI.unlinkArticleFromPerson(articleId, modal.personId);

      if (result.success) {
        await loadArticlesData(); // Перезагружаем данные
      }
    } catch (error) {
      console.error('Ошибка отвязки статьи:', error);
      alert('Ошибка при отвязке статьи');
    }
  };

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
        position: 'relative',
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

          {/* Кнопки действий - только для авторизованных */}
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Удалить
                </button>
              )}
            </div>
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              width: 'fit-content'
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

          {/* НОВЫЙ БЛОК: Семейные связи */}
          <div style={{ marginBottom: '2rem' }}>
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
                <path d="M16 4l2.586 2.586a2 2 0 010 2.828L8.343 19.657a2 2 0 01-1.414.586H4a1 1 0 01-1-1v-2.929a2 2 0 01.586-1.414L13.829 4.172a2 2 0 012.828 0L16 4z" stroke="currentColor" strokeWidth="2" />
              </svg>
              Семейные связи
            </h4>

            <div style={{
              backgroundColor: '#ffffffc3',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid #e0e0e0',
              display: 'grid',
              gap: '1rem'
            }}>

              {/* Родители */}
              {familyRelations.parents.length > 0 && (
                <div>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#c0a282',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>Родители:</span>
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {familyRelations.parents.map((parent, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#c0a282',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.85rem',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                      >
                        {parent.name || 'Без имени'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Супруг */}
              {familyRelations.spouse && (
                <div>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#c0a282',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>Супруг(-а):</span>
                  <div style={{
                    marginTop: '0.5rem'
                  }}>
                    <span style={{
                      backgroundColor: '#c0a282',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.85rem',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {familyRelations.spouse.name || 'Без имени'}
                    </span>
                  </div>
                </div>
              )}

              {/* Дети */}
              {familyRelations.children.length > 0 && (
                <div>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#c0a282',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>Дети ({familyRelations.children.length}):</span>
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {familyRelations.children.map((child, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#c0a282',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.85rem',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                      >
                        {child.name || 'Без имени'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Если нет семейных связей */}
              {familyRelations.parents.length === 0 &&
                !familyRelations.spouse &&
                familyRelations.children.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '0.9rem',
                    fontFamily: 'Montserrat, sans-serif',
                    fontStyle: 'italic'
                  }}>
                    Семейные связи не указаны
                  </div>
                )}
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

          {/* НОВЫЙ БЛОК: Статьи персоны - только для основных персон */}
          {!modal.isSpouse && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#303133',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Статьи ({personArticles.length})
                </h4>

                {/* НОВАЯ КНОПКА: Добавить статью - только для авторизованных */}
                {isAuthenticated && !showArticleSelector && availableArticles.length > 0 && (
                  <button
                    onClick={() => setShowArticleSelector(true)}
                    style={{
                      backgroundColor: '#c0a282',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#a08966'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#c0a282'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Добавить статью
                  </button>
                )}
              </div>

              {/* НОВЫЙ БЛОК: Селектор статей */}
              {showArticleSelector && (
                <div style={{
                  backgroundColor: '#ffffffc3',
                  border: '2px solid #c0a282',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <h5 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#303133',
                      fontFamily: 'Montserrat, sans-serif',
                      margin: 0
                    }}>
                      Выберите статью для привязки:
                    </h5>
                    <button
                      onClick={() => setShowArticleSelector(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.25rem'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gap: '0.5rem',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {availableArticles.map(article => (
                      <div
                        key={article.id}
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f8f8';
                          e.currentTarget.style.borderColor = '#c0a282';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                        onClick={() => handleLinkArticle(article.id)}
                      >
                        <div>
                          <div style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#303133',
                            fontFamily: 'Montserrat, sans-serif'
                          }}>
                            {article.title}
                          </div>
                          {article.description && (
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#666',
                              fontFamily: 'Montserrat, sans-serif',
                              marginTop: '0.25rem'
                            }}>
                              {article.description.length > 60
                                ? `${article.description.slice(0, 60)}...`
                                : article.description
                              }
                            </div>
                          )}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ))}

                    {availableArticles.length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '0.875rem',
                        fontFamily: 'Montserrat, sans-serif',
                        padding: '1rem'
                      }}>
                        Все доступные статьи уже привязаны к этой персоне
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ОБНОВЛЕННЫЙ БЛОК: Отображение статей персоны */}
              {articlesLoading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '2rem'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #ffffffc3',
                    borderTop: '3px solid #c0a282',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : personArticles.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '1rem'
                }}>
                  {personArticles.map(article => (
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
                        transition: 'all 0.2s ease',
                        position: 'relative'
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

                      {/* НОВАЯ КНОПКА: Отвязать статью - только для авторизованных */}
                      {isAuthenticated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlinkArticle(article.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: '#303133',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7,
                            transition: 'opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '1'}
                          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                          title="Отвязать статью"
                        >
                          ×
                        </button>
                      )}

                      {/* Стрелка */}
                      <div style={{
                        color: '#c0a282',
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  {isAuthenticated && availableArticles.length > 0 && (
                    <button
                      onClick={() => setShowArticleSelector(true)}
                      style={{
                        ...STYLES.button,
                        ...STYLES.greenButton,
                        marginTop: '1rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Добавить статью
                    </button>
                  )}
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
                Статьи привязываются только к основным персонам семейного древа.<br />
                Супруги могут иметь свою информацию, но статьи управляются через основную персону.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Остальные модальные окна остаются без изменений...
// [EditPersonModal, AddSpouseModal, AddChildModal - без изменений]

// Модальное окно редактирования персоны
export const EditPersonModal = ({
  modal,
  onModalChange,
  onClose,
  onConfirm
}) => {
  // Блокируем скролл страницы при открытии модального окна
  useBodyScrollLock(modal.isOpen);

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

// Модальное окно добавления супруга
export const AddSpouseModal = ({
  modal,
  onModalChange,
  onClose,
  onStartSelection,
  onConfirm
}) => {
  // Блокируем скролл страницы при открытии модального окна
  useBodyScrollLock(modal.isOpen);

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

// Модальное окно добавления ребенка
export const AddChildModal = ({
  modal,
  onModalChange,
  onClose,
  onStartSelection,
  onConfirm
}) => {
  // Блокируем скролл страницы при открытии модального окна
  useBodyScrollLock(modal.isOpen);

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