// Frontend\src\utils\treeLayoutUtils.js

import { TREE_CONSTANTS } from '../constants/treeConstants';

const {
  PERSON_WIDTH,
  PERSON_HEIGHT,
  VERTICAL_GAP,
  HORIZONTAL_GAP,
  BRANCH_GAP
} = TREE_CONSTANTS;

// ОБНОВЛЕННАЯ генерация макета дерева с новой логикой скрытия поколений
export const generateTreeLayout = (familyData, hiddenFromLevel = null) => {
  if (!familyData) {
    console.error('Данные семейного древа отсутствуют');
    return { nodes: [], connections: [] };
  }
  
  const layout = {
    nodes: [],
    connections: []
  };

  // НОВАЯ ФУНКЦИЯ: Проверка, скрыт ли уровень
  const isLevelHidden = (level) => {
    return hiddenFromLevel !== null && level > hiddenFromLevel;
  };

  // Расчет необходимой ширины для узла и всех его потомков
  const calculateNodeWidth = (node, currentLevel = 0) => {
    if (!node) return PERSON_WIDTH;
    
    const hasSpouse = node.spouse !== null && node.spouse !== undefined;
    const hasChildren = node.children && Array.isArray(node.children) && node.children.length > 0;
    const childrenHidden = hasChildren && isLevelHidden(currentLevel + 1);
    
    // Базовая ширина узла (персона + супруг если есть)
    let nodeWidth = PERSON_WIDTH;
    if (hasSpouse) {
      nodeWidth += PERSON_WIDTH + HORIZONTAL_GAP;
    }
    
    // Если нет детей или они скрыты, возвращаем базовую ширину
    if (!hasChildren || childrenHidden) {
      return nodeWidth;
    }
    
    // Рассчитываем ширину всех детей
    let childrenTotalWidth = 0;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (!child) continue;
      
      const childWidth = calculateNodeWidth(child, currentLevel + 1);
      childrenTotalWidth += childWidth;
      
      // Добавляем отступ между детьми (кроме последнего)
      if (i < node.children.length - 1) {
        childrenTotalWidth += BRANCH_GAP;
      }
    }
    
    // Возвращаем максимум из ширины узла и ширины детей
    return Math.max(nodeWidth, childrenTotalWidth);
  };
  
  // ОБНОВЛЕННАЯ функция обработки узла
  const processNode = (node, level = 0, parentX = null, parentY = null, availableWidth = null) => {
    if (!node || !node.id) return { width: PERSON_WIDTH, centerX: 0 };
    
    // Если этот уровень скрыт, не обрабатываем узел
    if (isLevelHidden(level)) {
      return { width: 0, centerX: 0 };
    }
    
    const hasSpouse = node.spouse !== null && node.spouse !== undefined;
    const hasChildren = node.children && Array.isArray(node.children) && node.children.length > 0;
    const childrenHidden = hasChildren && isLevelHidden(level + 1);
    
    // Рассчитываем полную ширину этого узла
    const nodeWidth = calculateNodeWidth(node, level);
    
    // Определяем позицию узла
    let personX;
    if (parentX !== null) {
      // Центрируем относительно доступного пространства
      const availableSpace = availableWidth || nodeWidth;
      personX = parentX + (availableSpace - PERSON_WIDTH) / 2;
    } else {
      personX = 0; // Корневой элемент
    }
    
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
      hasChildren: hasChildren,
      childrenHidden: childrenHidden // НОВОЕ: информация о скрытых детях
    };
    
    layout.nodes.push(personNode);
    
    let spouseNode = null;
    let centerX = personX + PERSON_WIDTH / 2;
    
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
        level,
        hasChildren: hasChildren,
        childrenHidden: childrenHidden
      };
      
      layout.nodes.push(spouseNode);
      
      // Центр между супругами
      centerX = (personX + spouseX + PERSON_WIDTH) / 2;
      
      // Соединение между супругами
      layout.connections.push({
        type: 'couple',
        x1: personX + PERSON_WIDTH,
        y1: personY + PERSON_HEIGHT / 2,
        x2: spouseX,
        y2: personY + PERSON_HEIGHT / 2,
        nodeId: node.id,
        level: level
      });
    }
    
    // Обработка детей если они НЕ скрыты
    if (hasChildren && !childrenHidden) {
      const bottomY = personY + PERSON_HEIGHT;
      const junctionY = bottomY + VERTICAL_GAP / 2;
      
      // Расчет позиций детей
      const childWidths = node.children.map(child => child ? calculateNodeWidth(child, level + 1) : 0);
      const totalChildrenWidth = childWidths.reduce((sum, width, index) => {
        return sum + width + (index > 0 ? BRANCH_GAP : 0);
      }, 0);
      
      // Стартовая позиция для размещения детей
      let currentX = centerX - totalChildrenWidth / 2;
      
      // Рисуем соединения от родителей
      if (hasSpouse) {
        const person1X = personX + PERSON_WIDTH / 2;
        const person2X = spouseNode.x + PERSON_WIDTH / 2;
        const midY = bottomY + VERTICAL_GAP / 4;
        
        const connections = [
          {
            type: 'parent-junction',
            x1: person1X,
            y1: bottomY,
            x2: person1X,
            y2: midY,
            nodeId: node.id,
            level: level
          },
          {
            type: 'parent-junction', 
            x1: person2X,
            y1: bottomY,
            x2: person2X,
            y2: midY,
            nodeId: node.id,
            level: level
          },
          {
            type: 'parent-junction',
            x1: person1X,
            y1: midY,
            x2: person2X,
            y2: midY,
            nodeId: node.id,
            level: level
          },
          {
            type: 'parent-junction',
            x1: centerX,
            y1: midY,
            x2: centerX,
            y2: junctionY,
            hasToggleButton: true, // ВОЗВРАЩАЕМ исходное название
            toggleButtonX: centerX,
            toggleButtonY: midY + (junctionY - midY) / 2,
            nodeId: node.id,
            level: level
          }
        ];
        
        connections.forEach(conn => {
          const isDuplicate = layout.connections.some(existing => 
            existing.x1 === conn.x1 && 
            existing.y1 === conn.y1 && 
            existing.x2 === conn.x2 && 
            existing.y2 === conn.y2
          );
          
          if (!isDuplicate) {
            layout.connections.push(conn);
          }
        });
        
      } else {
        // Для одного родителя
        const singleConnection = {
          type: 'parent-junction',
          x1: centerX,
          y1: bottomY,
          x2: centerX,
          y2: junctionY,
          hasToggleButton: true, // ВОЗВРАЩАЕМ исходное название
          toggleButtonX: centerX,
          toggleButtonY: bottomY + (junctionY - bottomY) / 2,
          nodeId: node.id,
          level: level
        };
        
        const isDuplicate = layout.connections.some(existing => 
          existing.x1 === singleConnection.x1 && 
          existing.y1 === singleConnection.y1 && 
          existing.x2 === singleConnection.x2 && 
          existing.y2 === singleConnection.y2
        );
        
        if (!isDuplicate) {
          layout.connections.push(singleConnection);
        }
      }
      
      // Размещаем детей
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (!child) continue;
        
        const childWidth = childWidths[i];
        const childCenterX = currentX + childWidth / 2;
        
        // Соединительные линии к детям
        if (node.children.length > 1) {
          layout.connections.push({
            type: 'child-connection',
            x1: centerX,
            y1: junctionY,
            x2: childCenterX,
            y2: junctionY,
            nodeId: node.id,
            level: level
          });
          
          layout.connections.push({
            type: 'child-connection',
            x1: childCenterX,
            y1: junctionY,
            x2: childCenterX,
            y2: bottomY + VERTICAL_GAP,
            nodeId: child.id,
            level: level + 1
          });
        } else {
          layout.connections.push({
            type: 'child-connection',
            x1: centerX,
            y1: junctionY,
            x2: centerX,
            y2: bottomY + VERTICAL_GAP,
            nodeId: child.id,
            level: level + 1
          });
        }
        
        // Рекурсивно обрабатываем ребенка
        processNode(
          child,
          level + 1,
          currentX,
          bottomY + VERTICAL_GAP,
          childWidth
        );
        
        // Переходим к следующей позиции
        currentX += childWidth + BRANCH_GAP;
      }
    } 
    // НОВОЕ: Если дети скрыты, показываем индикатор
    else if (hasChildren && childrenHidden) {
      const bottomY = personY + PERSON_HEIGHT;
      
      // Подсчитываем количество скрытых поколений
      const countHiddenLevels = (node, currentLevel) => {
        let maxLevel = currentLevel;
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            if (child) {
              maxLevel = Math.max(maxLevel, countHiddenLevels(child, currentLevel + 1));
            }
          }
        }
        return maxLevel;
      };
      
      const maxHiddenLevel = countHiddenLevels(node, level + 1);
      const hiddenLevelsCount = maxHiddenLevel - level;
      
      layout.connections.push({
        type: 'hidden-generation',
        x1: centerX,
        y1: bottomY,
        x2: centerX,
        y2: bottomY + 50,
        hasToggleButton: true, // ВОЗВРАЩАЕМ исходное название
        toggleButtonX: centerX,
        toggleButtonY: bottomY + 25,
        nodeId: node.id,
        level: level,
        hiddenLevelsCount: hiddenLevelsCount, // НОВОЕ: количество скрытых уровней
        isHidden: true
      });
    }
    
    return { width: nodeWidth, centerX: centerX };
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
  
  const padding = 80;
  
  return {
    minX: minX - padding,
    minY: minY - padding,
    width: (maxX - minX) + padding * 2,
    height: (maxY - minY) + padding * 2
  };
};