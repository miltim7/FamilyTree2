// Frontend\src\hooks\useFamilyTree.js

import { useState, useRef, useEffect, useCallback } from 'react';
import { TREE_CONSTANTS } from '../constants/treeConstants';
import familyTreeAPI from '../services/api';

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

  // Состояние для скрытых поколений
  const [hiddenGenerations, setHiddenGenerations] = useState({});
  
  // Состояние для отображения ветки родственника
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Состояние для модального окна с информацией о персоне
  const [personInfoModal, setPersonInfoModal] = useState({
    isOpen: false,
    person: null,
    isSpouse: false
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
  }, []);

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
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError(error.message);
      setIsServerConnected(false);
      showNotification(`Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Функция скрытия/отображения поколения
  const toggleGeneration = useCallback((nodeId) => {
    setHiddenGenerations(prev => {
      const newHiddenGenerations = { ...prev };
      if (newHiddenGenerations[nodeId]) {
        delete newHiddenGenerations[nodeId];
      } else {
        newHiddenGenerations[nodeId] = true;
      }
      return newHiddenGenerations;
    });
  }, []);
  
  // Сброс всех скрытий
  const resetHiddenGenerations = useCallback(() => {
    setHiddenGenerations({});
  }, []);
  
  // Проверка, скрыто ли поколение
  const isGenerationHidden = useCallback((nodeId) => {
    return !!hiddenGenerations[nodeId];
  }, [hiddenGenerations]);

  // Функция переключения ветки родственника
  const toggleBranch = useCallback((personId) => {
    if (selectedBranch === personId) {
      setSelectedBranch(null);
    } else {
      setSelectedBranch(personId);
    }
  }, [selectedBranch]);

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
      
      const spouseData = {
        name: name,
        gender: gender,
        photo: photo || null,
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
      
      const childData = {
        name: name,
        gender: gender,
        photo: photo || null,
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
  }, [childModal, showNotification]);
  
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
      isSpouse: false
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
    hiddenGenerations,
    selectedBranch,
    personInfoModal,
    setPersonInfoModal,
    spouseModal,
    setSpouseModal,
    childModal,
    setChildModal,
    selectionMode,
    setSelectionMode,
    
    // Функции
    loadFamilyData,
    showNotification,
    toggleGeneration,
    resetHiddenGenerations,
    isGenerationHidden,
    toggleBranch,
    openSpouseModal,
    startSpousePersonSelection,
    confirmAddSpouse,
    openChildModal,
    startParentSelection,
    confirmAddChild,
    cancelModals,
  };
};