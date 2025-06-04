// Frontend\src\hooks\useFamilyTree.js

import { useState, useRef, useEffect, useCallback } from 'react';
import { TREE_CONSTANTS } from '../constants/treeConstants';
import familyTreeAPI from '../services/api';
import articlesAPI from '../services/articlesApi';
import { getDefaultPhoto } from '../utils/familyUtils';


export const useFamilyTree = () => {
  // Основное состояние
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [notification, setNotification] = useState(null);

  // НОВОЕ СОСТОЯНИЕ: Последние статьи
  const [recentArticles, setRecentArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // ОБНОВЛЕННОЕ состояние для скрытых поколений - теперь хранит минимальный скрытый уровень
  const [hiddenFromLevel, setHiddenFromLevel] = useState(null);
  
  // Состояние для отображения ветки родственника
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Состояние для модального окна с информацией о персоне
  const [personInfoModal, setPersonInfoModal] = useState({
    isOpen: false,
    person: null,
    isSpouse: false,
    personId: null,
    articles: []
  });

  // НОВОЕ СОСТОЯНИЕ: Модальное окно редактирования
  const [editModal, setEditModal] = useState({
    isOpen: false,
    name: '',
    gender: 'male',
    photo: '',
    lifeYears: '',
    profession: '',
    birthPlace: '',
    biography: '',
    personId: null,
    isSpouse: false,
    loading: false
  });
  
  // Состояние для супруга
  const [spouseModal, setSpouseModal] = useState({
    isOpen: false,
    name: '',
    gender: 'female',
    photo: '',
    lifeYears: '',
    profession: '',
    birthPlace: '',
    biography: '',
    targetPersonId: null,
    targetPersonName: '',
    loading: false
  });
  
  // Состояние для ребенка
  const [childModal, setChildModal] = useState({
    isOpen: false,
    name: '',
    gender: 'male',
    photo: '',
    lifeYears: '',
    profession: '',
    birthPlace: '',
    biography: '',
    parentId: null,
    parentName: '',
    loading: false
  });
  
  // Режим выбора (родитель или супруг)
  const [selectionMode, setSelectionMode] = useState(null);

  // Состояние подключения к серверу
  const [isServerConnected, setIsServerConnected] = useState(true);

  // Загрузка данных при инициализации
  useEffect(() => {
    loadFamilyData();
    loadRecentArticles();
  }, []);

  // Загрузка данных с сервера
  // Загрузка данных с сервера
const loadFamilyData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Проверяем подключение к серверу
    const serverHealth = await familyTreeAPI.checkServerHealth();
    setIsServerConnected(serverHealth);
    
    if (!serverHealth) {
      throw new Error('Сервер недоступен. Проверьте подключение.');
    }
    
    const data = await familyTreeAPI.getFamilyData();
    setFamilyData(data);
    
    // ДОБАВЬТЕ ЭТУ СТРОКУ ЗДЕСЬ:
    window.familyData = data; // Для доступа из модалов
    
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    setError(error.message);
    setIsServerConnected(false);
    showNotification(`Ошибка загрузки: ${error.message}`);
  } finally {
    setLoading(false);
  }
}, []);

  // Загрузка последних статей
  const loadRecentArticles = useCallback(async () => {
    try {
      setArticlesLoading(true);
      const articles = await articlesAPI.getAllArticles();
      
      // Сортируем по дате создания (новые сначала) и берем первые 6
      const sortedArticles = articles
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
      
      setRecentArticles(sortedArticles);
    } catch (error) {
      console.error('Ошибка загрузки статей:', error);
      setRecentArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  // Загрузка статей персоны
  const loadPersonArticles = useCallback(async (personId) => {
    try {
      const articles = await articlesAPI.getPersonArticles(personId);
      return articles;
    } catch (error) {
      console.error('Ошибка загрузки статей персоны:', error);
      return [];
    }
  }, []);

  // Установка модального окна персоны с загрузкой статей
  const setPersonInfoModalWithArticles = useCallback(async (modalData) => {
    if (modalData.isOpen && modalData.personId) {
      let articles = [];
      if (!modalData.isSpouse) {
        articles = await loadPersonArticles(modalData.personId);
      }
      
      setPersonInfoModal({
        ...modalData,
        articles: articles
      });
    } else {
      setPersonInfoModal({
        ...modalData,
        articles: []
      });
    }
  }, [loadPersonArticles]);

  // Показать уведомление
  const showNotification = useCallback((message, type = 'error') => {
    setNotification({ message, type });
  }, []);
  
  // Эффект для скрытия уведомления
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, notification.type === 'success' ? 2000 : 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // НОВАЯ ЛОГИКА: Функция скрытия поколений по уровням
  const hideGenerationsFromLevel = useCallback((level) => {
    setHiddenFromLevel(prevLevel => {
      // Если уже скрыт этот уровень - показываем
      if (prevLevel === level) {
        return null;
      }
      // Если скрыт более высокий уровень - не меняем
      if (prevLevel !== null && prevLevel < level) {
        showNotification(`Поколения уже скрыты с уровня ${prevLevel + 1}`, 'info');
        return prevLevel;
      }
      // Скрываем с нового уровня
      return level;
    });
  }, [showNotification]);
  
  // НОВАЯ ФУНКЦИЯ: Сброс всех скрытий
  const resetHiddenGenerations = useCallback(() => {
    setHiddenFromLevel(null);
  }, []);
  
  // НОВАЯ ФУНКЦИЯ: Проверка, скрыто ли поколение
  const isGenerationHidden = useCallback((level) => {
    return hiddenFromLevel !== null && level > hiddenFromLevel;
  }, [hiddenFromLevel]);

  // ОБНОВЛЕННАЯ ФУНКЦИЯ: Получение информации о скрытии для персоны
  const getHideInfo = useCallback((personLevel) => {
    if (hiddenFromLevel === null) return null;
    
    if (hiddenFromLevel === personLevel) {
      // Эта персона является точкой скрытия
      return {
        isHidePoint: true,
        hiddenLevelsCount: getTotalLevels() - personLevel
      };
    }
    
    if (hiddenFromLevel < personLevel) {
      // Эта персона скрыта
      return {
        isHidden: true
      };
    }
    
    return null;
  }, [hiddenFromLevel]);

  // Вспомогательная функция для подсчета общего количества уровней
  const getTotalLevels = useCallback(() => {
    if (!familyData) return 0;
    
    const findMaxLevel = (node, level = 0) => {
      let maxLevel = level;
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (child) {
            maxLevel = Math.max(maxLevel, findMaxLevel(child, level + 1));
          }
        }
      }
      return maxLevel;
    };
    
    return findMaxLevel(familyData);
  }, [familyData]);

  // Функция переключения ветки родственника
  const toggleBranch = useCallback((personId) => {
    if (selectedBranch === personId) {
      setSelectedBranch(null);
    } else {
      setSelectedBranch(personId);
    }
  }, [selectedBranch]);

  // Открыть редактирование персоны
  const openEditModal = useCallback((person, isSpouse, personId) => {
    setEditModal({
      isOpen: true,
      name: person.name || '',
      gender: person.gender || 'male',
      photo: person.photo || '',
      lifeYears: person.lifeYears || '',
      profession: person.profession || '',
      birthPlace: person.birthPlace || '',
      biography: person.biography || '',
      personId: personId,
      isSpouse: isSpouse,
      loading: false
    });
  }, []);

  // Подтвердить редактирование с дефолтными фотографиями
  const confirmEditPerson = useCallback(async () => {
    const { name, gender, photo, lifeYears, profession, birthPlace, biography, personId, isSpouse } = editModal;
    
    if (!name.trim()) {
      showNotification("Введите имя персоны");
      return;
    }
    
    try {
      setEditModal(prev => ({ ...prev, loading: true }));
      
      const finalPhoto = photo && photo.trim() ? photo : getDefaultPhoto(gender);
      
      const personData = {
        name: name,
        gender: gender,
        photo: finalPhoto,
        lifeYears: lifeYears || '',
        profession: profession || '',
        birthPlace: birthPlace || '',
        biography: biography || ''
      };

      const result = await familyTreeAPI.editPerson(personId, personData, isSpouse);
      
      if (!result.success) {
        showNotification(result.message);
        return;
      }
      
      setFamilyData(result.data);
      showNotification('Данные персоны успешно обновлены!', 'success');
      
      setEditModal({
        isOpen: false,
        name: '',
        gender: 'male',
        photo: '',
        lifeYears: '',
        profession: '',
        birthPlace: '',
        biography: '',
        personId: null,
        isSpouse: false,
        loading: false
      });
      
      setPersonInfoModal({
        isOpen: false,
        person: null,
        isSpouse: false,
        personId: null,
        articles: []
      });
      
    } catch (error) {
      console.error("Ошибка при редактировании персоны:", error);
      showNotification(`Ошибка: ${error.message}`);
    } finally {
      setEditModal(prev => ({ ...prev, loading: false }));
    }
  }, [editModal, showNotification]);

  // Удалить персону
  const deletePerson = useCallback(async (personId, isSpouse) => {
    const confirmMessage = isSpouse 
      ? "Вы уверены, что хотите удалить супруга(-у)?"
      : "Вы уверены, что хотите удалить эту персону? Все её потомки также будут удалены.";
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      const result = await familyTreeAPI.deletePerson(personId, isSpouse);
      
      if (!result.success) {
        showNotification(result.message);
        return;
      }
      
      setFamilyData(result.data);
      showNotification(result.message, 'success');
      
      setPersonInfoModal({
        isOpen: false,
        person: null,
        isSpouse: false,
        personId: null,
        articles: []
      });
      
    } catch (error) {
      console.error("Ошибка при удалении персоны:", error);
      showNotification(`Ошибка: ${error.message}`);
    }
  }, [showNotification]);

  // Модальные окна
  const openSpouseModal = useCallback(() => {
    setSpouseModal({
      isOpen: true,
      name: '',
      gender: 'female',
      photo: '',
      lifeYears: '',
      profession: '',
      birthPlace: '',
      biography: '',
      targetPersonId: null,
      targetPersonName: '',
      loading: false
    });
    setSelectionMode(null);
  }, []);
  
  const startSpousePersonSelection = useCallback(() => {
    if (!spouseModal.name.trim()) {
      showNotification("Сначала введите имя супруга(-и)");
      return;
    }
    
    setSpouseModal(prev => ({
      ...prev,
      isOpen: false
    }));
    
    setSelectionMode('spouse');
  }, [spouseModal.name, showNotification]);
  
  // Подтвердить добавление супруга с дефолтной фотографией
  const confirmAddSpouse = useCallback(async () => {
    const { name, gender, photo, lifeYears, profession, birthPlace, biography, targetPersonId } = spouseModal;
    
    if (!name.trim()) {
      showNotification("Введите имя супруга(-и)");
      return;
    }
    
    if (!targetPersonId) {
      showNotification("Выберите персону для добавления супруга(-и)");
      return;
    }
    
    try {
      setSpouseModal(prev => ({ ...prev, loading: true }));
      
      const finalPhoto = photo && photo.trim() ? photo : getDefaultPhoto(gender);
      
      const spouseData = {
        name: name,
        gender: gender,
        photo: finalPhoto,
        lifeYears: lifeYears || '',
        profession: profession || '',
        birthPlace: birthPlace || '',
        biography: biography || ''
      };

      const result = await familyTreeAPI.addSpouse(targetPersonId, spouseData);
      
      if (!result.success) {
        showNotification(result.message);
        return;
      }
      
      setFamilyData(result.data);
      showNotification('Супруг(-а) успешно добавлен(-а)!', 'success');
      
      setSpouseModal({
        isOpen: false,
        name: '',
        gender: 'female',
        photo: '',
        lifeYears: '',
        profession: '',
        birthPlace: '',
        biography: '',
        targetPersonId: null,
        targetPersonName: '',
        loading: false
      });
      
    } catch (error) {
      console.error("Ошибка при добавлении супруга:", error);
      showNotification(`Ошибка: ${error.message}`);
    } finally {
      setSpouseModal(prev => ({ ...prev, loading: false }));
    }
  }, [spouseModal, showNotification]);
  
  const openChildModal = useCallback(() => {
    setChildModal({
      isOpen: true,
      name: '',
      gender: 'male',
      photo: '',
      lifeYears: '',
      profession: '',
      birthPlace: '',
      biography: '',
      parentId: null,
      parentName: '',
      loading: false
    });
    setSelectionMode(null);
  }, []);
  
  const startParentSelection = useCallback(() => {
    if (!childModal.name.trim()) {
      showNotification("Сначала введите имя ребенка");
      return;
    }
    
    setChildModal(prev => ({
      ...prev,
      isOpen: false
    }));
    setSelectionMode('parent');
  }, [childModal.name, showNotification]);
  
  // Подтвердить добавление ребенка с дефолтной фотографией
  const confirmAddChild = useCallback(async () => {
    const { name, gender, photo, lifeYears, profession, birthPlace, biography, parentId } = childModal;
    
    if (!name.trim()) {
      showNotification("Укажите имя ребенка");
      return;
    }
    
    if (!parentId) {
      showNotification("Выберите родителя");
      return;
    }
    
    try {
      setChildModal(prev => ({ ...prev, loading: true }));
      
      const finalPhoto = photo && photo.trim() ? photo : getDefaultPhoto(gender);
      
      const childData = {
        name: name,
        gender: gender,
        photo: finalPhoto,
        lifeYears: lifeYears || '',
        profession: profession || '',
        birthPlace: birthPlace || '',
        biography: biography || ''
      };

      const result = await familyTreeAPI.addChild(parentId, childData);
      
      if (!result.success) {
        showNotification(result.message);
        return;
      }
      
      setFamilyData(result.data);
      showNotification('Ребенок успешно добавлен!', 'success');
      
      loadRecentArticles();
      
      setChildModal({
        isOpen: false,
        name: '',
        gender: 'male',
        photo: '',
        lifeYears: '',
        profession: '',
        birthPlace: '',
        biography: '',
        parentId: null,
        parentName: '',
        loading: false
      });
      
    } catch (error) {
      console.error("Ошибка при добавлении ребенка:", error);
      showNotification(`Ошибка: ${error.message}`);
    } finally {
      setChildModal(prev => ({ ...prev, loading: false }));
    }
  }, [childModal, showNotification, loadRecentArticles]);
  
  const cancelModals = useCallback(() => {
    setSpouseModal({
      isOpen: false,
      name: '',
      gender: 'female',
      photo: '',
      lifeYears: '',
      profession: '',
      birthPlace: '',
      biography: '',
      targetPersonId: null,
      targetPersonName: '',
      loading: false
    });
    setChildModal({
      isOpen: false,
      name: '',
      gender: 'male',
      photo: '',
      lifeYears: '',
      profession: '',
      birthPlace: '',
      biography: '',
      parentId: null,
      parentName: '',
      loading: false
    });
    setPersonInfoModal({
      isOpen: false,
      person: null,
      isSpouse: false,
      personId: null,
      articles: []
    });
    setEditModal({
      isOpen: false,
      name: '',
      gender: 'male',
      photo: '',
      lifeYears: '',
      profession: '',
      birthPlace: '',
      biography: '',
      personId: null,
      isSpouse: false,
      loading: false
    });
    setSelectionMode(null);
  }, []);

  return {
    // Состояние
    familyData,
    loading,
    error,
    isServerConnected,
    selectedPerson,
    setSelectedPerson,
    editMode,
    setEditMode,
    editField,
    setEditField,
    editValue,
    setEditValue,
    hoveredPerson,
    setHoveredPerson,
    notification,
    hiddenFromLevel, // ОБНОВЛЕНО
    selectedBranch,
    setSelectedBranch,
    personInfoModal,
    setPersonInfoModal: setPersonInfoModalWithArticles,
    editModal,
    setEditModal,
    spouseModal,
    setSpouseModal,
    childModal,
    setChildModal,
    selectionMode,
    setSelectionMode,
    
    // Статьи
    recentArticles,
    articlesLoading,
    
    // Функции
    loadFamilyData,
    loadRecentArticles,
    showNotification,
    hideGenerationsFromLevel, // НОВОЕ
    resetHiddenGenerations,   // ОБНОВЛЕНО
    isGenerationHidden,       // ОБНОВЛЕНО
    getHideInfo,             // НОВОЕ
    toggleBranch,
    openEditModal,
    confirmEditPerson,
    deletePerson,
    openSpouseModal,
    startSpousePersonSelection,
    confirmAddSpouse,
    openChildModal,
    startParentSelection,
    confirmAddChild,
    cancelModals,
  };
};