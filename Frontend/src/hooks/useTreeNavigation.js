// Frontend\src\hooks\useTreeNavigation.js

import { useState, useRef, useEffect, useCallback } from 'react';
import { TREE_CONSTANTS } from '../constants/treeConstants';

const { MIN_SCALE, MAX_SCALE, ZOOM_FACTOR, DRAG_THRESHOLD } = TREE_CONSTANTS;

export const useTreeNavigation = (treeLayout, boundaries) => {
  // Состояние для масштабирования и перемещения
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);
  
  // НОВОЕ: Состояние для touch событий
  const [isTouch, setIsTouch] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  
  // Ссылка на SVG элемент
  const svgRef = useRef(null);
  
  // Состояние для предотвращения смещения при скрытии/показе
  const [lockPosition, setLockPosition] = useState(false);
  
  // Флаг для отслеживания, было ли древо перемещено пользователем
  const [userMovedTree, setUserMovedTree] = useState(false);
  
  // Ref для доступа к актуальным данным в обработчиках
  const stateRef = useRef({
    position,
    dragStart,
    isDragging,
    dragDistance,
    userMovedTree,
    scale,
    lastTouchDistance,
    lastTouchCenter
  });

  // Обновление ref при изменении состояния
  useEffect(() => {
    stateRef.current = {
      position,
      dragStart,
      isDragging,
      dragDistance,
      userMovedTree,
      scale,
      lastTouchDistance,
      lastTouchCenter
    };
  }, [position, dragStart, isDragging, dragDistance, userMovedTree, scale, lastTouchDistance, lastTouchCenter]);

  // НОВАЯ ФУНКЦИЯ: Получение расстояния между двумя точками касания
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // НОВАЯ ФУНКЦИЯ: Получение центра между двумя точками касания
  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // Функция центрирования дерева
  const centerTree = useCallback(() => {
    if (svgRef.current && treeLayout?.nodes?.length > 0) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const centerX = svgRect.width / 2;
      const centerY = svgRect.height / 2;
      
      setPosition({
        x: centerX - (boundaries.width / 2) * scale,
        y: centerY - (boundaries.height / 2) * scale
      });
      
      setUserMovedTree(false);
    }
  }, [treeLayout, boundaries, scale]);

  // Функции программного управления навигацией
  const moveStep = 100;

  const moveUp = useCallback(() => {
    setPosition(prev => ({ ...prev, y: prev.y + moveStep }));
    setUserMovedTree(true);
  }, []);

  const moveDown = useCallback(() => {
    setPosition(prev => ({ ...prev, y: prev.y - moveStep }));
    setUserMovedTree(true);
  }, []);

  const moveLeft = useCallback(() => {
    setPosition(prev => ({ ...prev, x: prev.x + moveStep }));
    setUserMovedTree(true);
  }, []);

  const moveRight = useCallback(() => {
    setPosition(prev => ({ ...prev, x: prev.x - moveStep }));
    setUserMovedTree(true);
  }, []);

  const zoomIn = useCallback(() => {
    if (!svgRef.current) return;
    
    const newScale = Math.min(scale * ZOOM_FACTOR, MAX_SCALE);
    if (newScale === scale) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const factor = newScale / scale;
    const newX = centerX - factor * (centerX - position.x);
    const newY = centerY - factor * (centerY - position.y);
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
    setUserMovedTree(true);
  }, [scale, position]);

  const zoomOut = useCallback(() => {
    if (!svgRef.current) return;
    
    const newScale = Math.max(scale / ZOOM_FACTOR, MIN_SCALE);
    if (newScale === scale) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const factor = newScale / scale;
    const newX = centerX - factor * (centerX - position.x);
    const newY = centerY - factor * (centerY - position.y);
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
    setUserMovedTree(true);
  }, [scale, position]);

  // Центрирование при изменении макета
  useEffect(() => {
    if (treeLayout && !lockPosition && !userMovedTree) {
      centerTree();
    }
  }, [treeLayout, lockPosition, userMovedTree, centerTree]);

  // МЫШЬ: Начало перетаскивания
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    
    if (e.button === 0) {
      setIsTouch(false);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragDistance(0);
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, []);
  
  // МЫШЬ: Перетаскивание
  const handleMouseMove = useCallback((e) => {
    const state = stateRef.current;
    if (!state.isDragging) return;
    
    const dx = e.clientX - state.dragStart.x;
    const dy = e.clientY - state.dragStart.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    setPosition({
      x: state.position.x + dx,
      y: state.position.y + dy
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragDistance(state.dragDistance + distance);
  }, []);
  
  // МЫШЬ: Окончание перетаскивания
  const handleMouseUp = useCallback((e) => {
    const state = stateRef.current;
    const wasDragging = state.dragDistance > DRAG_THRESHOLD;
    
    if (wasDragging) {
      setUserMovedTree(true);
    }
    
    setIsDragging(false);
    setDragDistance(0);
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // НОВОЕ: TOUCH СОБЫТИЯ

  // Touch Start
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    setIsTouch(true);
    
    const touches = e.touches;
    
    if (touches.length === 1) {
      // Одно касание - начало перетаскивания
      setIsDragging(true);
      setDragStart({ x: touches[0].clientX, y: touches[0].clientY });
      setDragDistance(0);
      
      // Проверка на двойной тап
      const now = Date.now();
      if (now - lastTap < 300) {
        // Двойной тап - сброс масштаба
        setScale(0.8);
        setUserMovedTree(false);
      }
      setLastTap(now);
      
    } else if (touches.length === 2) {
      // Два касания - начало зума
      setIsDragging(false);
      const distance = getTouchDistance(touches[0], touches[1]);
      const center = getTouchCenter(touches[0], touches[1]);
      
      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    }
  }, [lastTap]);

  // Touch Move
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const state = stateRef.current;
    const touches = e.touches;
    
    if (touches.length === 1 && state.isDragging) {
      // Одно касание - перетаскивание
      const dx = touches[0].clientX - state.dragStart.x;
      const dy = touches[0].clientY - state.dragStart.y;
      
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      setPosition({
        x: state.position.x + dx,
        y: state.position.y + dy
      });
      
      setDragStart({ x: touches[0].clientX, y: touches[0].clientY });
      setDragDistance(state.dragDistance + distance);
      
    } else if (touches.length === 2) {
      // Два касания - зум
      const distance = getTouchDistance(touches[0], touches[1]);
      const center = getTouchCenter(touches[0], touches[1]);
      
      if (state.lastTouchDistance > 0) {
        const scaleFactor = distance / state.lastTouchDistance;
        let newScale = state.scale * scaleFactor;
        
        // Ограничения масштаба
        newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
        
        if (newScale !== state.scale && svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const offsetX = center.x - rect.left;
          const offsetY = center.y - rect.top;
          
          const factor = newScale / state.scale;
          const newX = offsetX - factor * (offsetX - state.position.x);
          const newY = offsetY - factor * (offsetY - state.position.y);
          
          setScale(newScale);
          setPosition({ x: newX, y: newY });
          setUserMovedTree(true);
        }
      }
      
      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    }
  }, []);

  // Touch End
  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    const state = stateRef.current;
    
    if (e.touches.length === 0) {
      // Все касания завершены
      const wasDragging = state.dragDistance > DRAG_THRESHOLD;
      
      if (wasDragging) {
        setUserMovedTree(true);
      }
      
      setIsDragging(false);
      setDragDistance(0);
      setLastTouchDistance(0);
    } else if (e.touches.length === 1) {
      // Остается одно касание - переключаемся на перетаскивание
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastTouchDistance(0);
    }
  }, []);

  // Колесо мыши для зума (только для десктопа)
  useEffect(() => {
    const svgContainer = document.querySelector('[data-svg-container="true"]');
    if (!svgContainer) return;

    const handleContainerWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        
        if (!svgRef.current) return;
        
        const rect = svgContainer.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY < 0 ? ZOOM_FACTOR : (1 / ZOOM_FACTOR);
        let newScale = scale * zoomFactor;
        
        if (newScale > MAX_SCALE) {
          if (scale >= MAX_SCALE) return;
          newScale = MAX_SCALE;
        }
        if (newScale < MIN_SCALE) {
          if (scale <= MIN_SCALE) return;
          newScale = MIN_SCALE;
        }
        
        const factor = newScale / scale;
        const newX = offsetX - factor * (offsetX - position.x);
        const newY = offsetY - factor * (offsetY - position.y);
        
        setScale(newScale);
        setPosition({ x: newX, y: newY });
        setUserMovedTree(true);
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        if (svgContainer.contains(document.activeElement) || svgContainer.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    
    svgContainer.addEventListener('wheel', handleContainerWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (svgContainer) {
        svgContainer.removeEventListener('wheel', handleContainerWheel);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, scale]);

  // Сброс масштаба
  const handleDoubleClick = useCallback(() => {
    if (!isTouch) { // Только для мыши, не для touch
      setScale(0.8);
      setUserMovedTree(false);
    }
  }, [isTouch]);

  return {
    scale,
    setScale,
    position,
    setPosition,
    isDragging,
    svgRef,
    lockPosition,
    setLockPosition,
    userMovedTree,
    setUserMovedTree,
    centerTree,
    handleMouseDown,
    handleDoubleClick,
    // НОВЫЕ touch обработчики
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    // Функции навигации
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    zoomIn,
    zoomOut,
  };
};