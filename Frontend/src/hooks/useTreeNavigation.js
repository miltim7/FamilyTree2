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
    userMovedTree
  });

  // Обновление ref при изменении состояния
  useEffect(() => {
    stateRef.current = {
      position,
      dragStart,
      isDragging,
      dragDistance,
      userMovedTree
    };
  }, [position, dragStart, isDragging, dragDistance, userMovedTree]);

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

  // Центрирование при изменении макета
  useEffect(() => {
    if (treeLayout && !lockPosition && !userMovedTree) {
      centerTree();
    }
  }, [treeLayout, lockPosition, userMovedTree, centerTree]);

  // Начало перетаскивания
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragDistance(0);
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, []);
  
  // Перетаскивание
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
  
  // Окончание перетаскивания
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

  // Простой зум как в рабочем примере
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
        
        // Точно как в рабочем примере
        const zoomFactor = e.deltaY < 0 ? ZOOM_FACTOR : (1 / ZOOM_FACTOR);
        let newScale = scale * zoomFactor;
        
        // Ограничения масштаба
        if (newScale > MAX_SCALE) {
          if (scale >= MAX_SCALE) return;
          newScale = MAX_SCALE;
        }
        if (newScale < MIN_SCALE) {
          if (scale <= MIN_SCALE) return;
          newScale = MIN_SCALE;
        }
        
        // Формула из рабочего примера
        const factor = newScale / scale;
        const newX = offsetX - factor * (offsetX - position.x);
        const newY = offsetY - factor * (offsetY - position.y);
        
        setScale(newScale);
        setPosition({ x: newX, y: newY });
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
    setScale(0.8);
    setUserMovedTree(false);
  }, []);

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
  };
};