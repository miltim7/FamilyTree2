// Frontend\src\utils\treeLayoutUtils.js

import { TREE_CONSTANTS } from '../constants/treeConstants';

const {
  PERSON_WIDTH,
  PERSON_HEIGHT,
  VERTICAL_GAP,
  HORIZONTAL_GAP,
  BRANCH_GAP
} = TREE_CONSTANTS;

// ОРИГИНАЛЬНАЯ генерация макета дерева с правильными соединениями
export const generateTreeLayout = (familyData, hiddenGenerations = {}) => {
  if (!familyData) {
    console.error('Данные семейного древа отсутствуют');
    return { nodes: [], connections: [] };
  }
  
  const layout = {
    nodes: [],
    connections: []
  };

  // Проверка, скрыто ли поколение
  const isGenerationHidden = (nodeId) => {
    return !!hiddenGenerations[nodeId];
  };
  
  // Функция обработки узла - ОРИГИНАЛЬНАЯ ЛОГИКА
  const processNode = (node, level = 0, parentX = null, parentY = null) => {
    if (!node || !node.id) return 0;
    
    const hasSpouse = node.spouse !== null && node.spouse !== undefined;
    const hasChildren = node.children && Array.isArray(node.children) && node.children.length > 0;
    const isHiddenGeneration = isGenerationHidden(node.id);
    
    // Позиция персоны
    const personX = parentX !== null ? parentX : 0;
    const personY = level * (PERSON_HEIGHT + VERTICAL_GAP);
    
    // Добавляем основную персону
    const personNode = {
      id: node.id,
      type: 'person',
      name: node.name || 'Без имени',
      gender: node.gender || 'unknown',
      photo: node.photo || null,
      lifeYears: node.lifeYears || '',
      x: personX,
      y: personY,
      width: PERSON_WIDTH,
      height: PERSON_HEIGHT,
      level,
      hasHiddenGeneration: isHiddenGeneration,
      hasChildren: hasChildren
    };
    
    layout.nodes.push(personNode);
    
    let spouseNode = null;
    
    // Добавляем супруга, если есть
    if (hasSpouse) {
      const spouseX = personX + PERSON_WIDTH + HORIZONTAL_GAP;
      const spouseY = personY;
      
      spouseNode = {
        id: `${node.id}-spouse`,
        type: 'spouse',
        name: node.spouse?.name || 'Супруг(а)',
        gender: node.spouse?.gender || 'unknown',
        photo: node.spouse?.photo || null,
        lifeYears: node.spouse?.lifeYears || '',
        x: spouseX,
        y: spouseY,
        width: PERSON_WIDTH,
        height: PERSON_HEIGHT,
        level
      };
      
      layout.nodes.push(spouseNode);
      
      // ОБНОВЛЕННОЕ соединение между супругами с nodeId
      layout.connections.push({
        type: 'couple',
        x1: personX + PERSON_WIDTH,
        y1: personY + PERSON_HEIGHT / 2,
        x2: spouseX,
        y2: personY + PERSON_HEIGHT / 2,
        nodeId: node.id // ДОБАВЛЯЕМ nodeId
      });
    }
    
    // Обработка детей если они не скрыты
    if (hasChildren && !isHiddenGeneration) {
      // Центр текущего узла
      const centerX = hasSpouse 
        ? (personX + spouseNode.x + PERSON_WIDTH) / 2 
        : personX + PERSON_WIDTH / 2;
      
      const bottomY = personY + PERSON_HEIGHT;
      const junctionY = bottomY + VERTICAL_GAP / 2;
      
      // Рассчитываем ширины детей
      let childrenWidths = [];
      let totalChildrenWidth = 0;
      
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (!child) continue;
        
        let childWidth = PERSON_WIDTH;
        
        if (child.spouse) {
          childWidth += PERSON_WIDTH + HORIZONTAL_GAP;
        }
        
        if (child.children && Array.isArray(child.children) && child.children.length > 0 && !isGenerationHidden(child.id)) {
          let descendantsWidth = 0;
          for (let j = 0; j < child.children.length; j++) {
            if (!child.children[j]) continue;
            descendantsWidth += PERSON_WIDTH * (child.children[j].spouse ? 2 : 1) + HORIZONTAL_GAP;
            if (j < child.children.length - 1) {
              descendantsWidth += BRANCH_GAP;
            }
          }
          childWidth = Math.max(childWidth, descendantsWidth);
        }
        
        totalChildrenWidth += childWidth;
        if (i < node.children.length - 1) {
          totalChildrenWidth += HORIZONTAL_GAP * 2 + BRANCH_GAP;
        }
        
        childrenWidths.push(childWidth);
      }
      
      // Рисуем соединения
      if (hasSpouse) {
        const person1X = personX + PERSON_WIDTH / 2;
        const person2X = spouseNode.x + PERSON_WIDTH / 2;
        const midY = bottomY + VERTICAL_GAP / 4;
        
        // ОБНОВЛЯЕМ все соединения с nodeId
        layout.connections.push({
          type: 'parent-junction',
          x1: person1X,
          y1: bottomY,
          x2: person1X,
          y2: midY,
          nodeId: node.id // ДОБАВЛЯЕМ nodeId
        });
        
        layout.connections.push({
          type: 'parent-junction',
          x1: person2X,
          y1: bottomY,
          x2: person2X,
          y2: midY,
          nodeId: node.id // ДОБАВЛЯЕМ nodeId
        });
        
        layout.connections.push({
          type: 'parent-junction',
          x1: person1X,
          y1: midY,
          x2: person2X,
          y2: midY,
          nodeId: node.id // ДОБАВЛЯЕМ nodeId
        });
        
        // Главная линия с кнопкой управления
        layout.connections.push({
          type: 'parent-junction',
          x1: centerX,
          y1: midY,
          x2: centerX,
          y2: junctionY,
          hasToggleButton: true,
          toggleButtonX: centerX,
          toggleButtonY: midY + (junctionY - midY) / 2,
          nodeId: node.id
        });
      } else {
        // Главная линия с кнопкой управления
        layout.connections.push({
          type: 'parent-junction',
          x1: centerX,
          y1: bottomY,
          x2: centerX,
          y2: junctionY,
          hasToggleButton: true,
          toggleButtonX: centerX,
          toggleButtonY: bottomY + (junctionY - bottomY) / 2,
          nodeId: node.id
        });
      }
      
      // Размещаем детей
      let currentX = centerX - totalChildrenWidth / 2;
      
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (!child) continue;
        
        const childWidth = childrenWidths[i];
        const childCenterX = currentX + childWidth / 2;
        
        // ОБНОВЛЯЕМ соединительные линии с nodeId
        if (node.children.length > 1) {
          layout.connections.push({
            type: 'child-connection',
            x1: centerX,
            y1: junctionY,
            x2: childCenterX,
            y2: junctionY,
            nodeId: node.id // ДОБАВЛЯЕМ nodeId родителя
          });
          
          layout.connections.push({
            type: 'child-connection',
            x1: childCenterX,
            y1: junctionY,
            x2: childCenterX,
            y2: bottomY + VERTICAL_GAP,
            nodeId: child.id // ДОБАВЛЯЕМ nodeId ребенка
          });
        } else {
          layout.connections.push({
            type: 'child-connection',
            x1: centerX,
            y1: junctionY,
            x2: centerX,
            y2: bottomY + VERTICAL_GAP,
            nodeId: child.id // ДОБАВЛЯЕМ nodeId ребенка
          });
        }
        
        // Рекурсивно обрабатываем ребенка
        const childX = node.children.length === 1 
          ? centerX - PERSON_WIDTH / 2 
          : childCenterX - PERSON_WIDTH / 2;
        
        processNode(
          child,
          level + 1,
          childX,
          bottomY + VERTICAL_GAP
        );
        
        currentX += childWidth + HORIZONTAL_GAP * 2 + BRANCH_GAP;
      }
    } 
    // Если поколение скрыто, отображаем индикатор скрытых детей
    else if (hasChildren && isHiddenGeneration) {
      const centerX = hasSpouse 
        ? (personX + spouseNode.x + PERSON_WIDTH) / 2 
        : personX + PERSON_WIDTH / 2;
      
      const bottomY = personY + PERSON_HEIGHT;
      
      // Добавляем пунктирную линию вниз для индикации скрытого поколения
      layout.connections.push({
        type: 'hidden-generation',
        x1: centerX,
        y1: bottomY,
        x2: centerX,
        y2: bottomY + 50,
        hasToggleButton: true,
        toggleButtonX: centerX,
        toggleButtonY: bottomY + 25,
        nodeId: node.id,
        isHidden: true
      });
    }
    
    return hasSpouse ? PERSON_WIDTH * 2 + HORIZONTAL_GAP : PERSON_WIDTH;
  };
  
  try {
    processNode(familyData);
  } catch (error) {
    console.error('Ошибка при обработке дерева:', error);
  }
  
  return layout;
};

// Определение границ дерева
export const getBoundaries = (layout) => {
  if (!layout || !layout.nodes || layout.nodes.length === 0) {
    return { minX: 0, minY: 0, width: 800, height: 600 };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  layout.nodes.forEach(node => {
    if (!node) return;
    
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });
  
  if (minX === Infinity) {
    return { minX: 0, minY: 0, width: 800, height: 600 };
  }
  
  const padding = 40;
  
  return {
    minX: minX - padding,
    minY: minY - padding,
    width: (maxX - minX) + padding * 2,
    height: (maxY - minY) + padding * 2
  };
};