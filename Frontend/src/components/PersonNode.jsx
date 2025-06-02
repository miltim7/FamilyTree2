// Frontend\src\components\PersonNode.jsx

import React from 'react';
import { NODE_STYLES } from '../constants/treeConstants';
import { findPersonById } from '../utils/familyUtils';

const PersonNode = ({ 
  node, 
  familyData, 
  hoveredPerson, 
  setHoveredPerson,
  selectedPerson,
  selectionMode,
  selectedBranch,
  shouldShowNode,
  onNodeClick,
  onBranchToggle
}) => {
  if (!node || !node.id || typeof node.type !== 'string') {
    return null;
  }
  
  const isSpouse = node.type === 'spouse';
  const nodeId = node.id;
  const shouldShow = shouldShowNode(nodeId);
  
  let personData = null;
  
  try {
    if (isSpouse) {
      const baseId = nodeId.split('-')[0];
      const mainPerson = findPersonById(familyData, baseId);
      personData = mainPerson?.spouse || null;
    } else {
      personData = findPersonById(familyData, nodeId);
    }
  } catch (error) {
    console.error('Ошибка при поиске данных персоны:', error);
  }
  
  // Определяем стили узла
  let nodeStyle = { ...NODE_STYLES.maleNode };
  
  // ИСПРАВЛЕННАЯ фильтрация - проверяем видимость узла
  const isFiltered = !shouldShow;
  if (isFiltered) {
    nodeStyle = { ...nodeStyle, ...NODE_STYLES.filteredNode };
  }
  
  if (selectedPerson === nodeId) {
    nodeStyle.stroke = NODE_STYLES.selectedMaleNode.stroke;
  }
  
  // ИСПРАВЛЕНО: правильная проверка скрытых поколений
  if (node.hasHiddenGeneration) {
    nodeStyle.stroke = NODE_STYLES.nodeWithHiddenGen.stroke;
    nodeStyle.strokeWidth = NODE_STYLES.nodeWithHiddenGen.strokeWidth;
    nodeStyle.strokeDasharray = NODE_STYLES.nodeWithHiddenGen.strokeDasharray;
  }
  
  if (selectionMode === 'parent' && hoveredPerson === nodeId) {
    nodeStyle.fill = NODE_STYLES.parentSelectionNode.fill;
    nodeStyle.stroke = NODE_STYLES.parentSelectionNode.stroke;
  }
  
  if (selectionMode === 'spouse' && hoveredPerson === nodeId) {
    if (isSpouse) {
      nodeStyle.fill = NODE_STYLES.disabledNode.fill;
      nodeStyle.stroke = NODE_STYLES.disabledNode.stroke;
    } else {
      const baseId = nodeId.split('-')[0];
      const mainPerson = findPersonById(familyData, baseId);
      
      if (mainPerson && !mainPerson.spouse) {
        nodeStyle.fill = NODE_STYLES.spouseSelectionNode.fill;
        nodeStyle.stroke = NODE_STYLES.spouseSelectionNode.stroke;
      } else {
        nodeStyle.fill = NODE_STYLES.disabledNode.fill;
        nodeStyle.stroke = NODE_STYLES.disabledNode.stroke;
      }
    }
  }
  
  let cursorStyle = selectionMode ? 'pointer' : 'pointer';
  
  if (selectionMode === 'spouse') {
    if (isSpouse) {
      cursorStyle = 'not-allowed';
    } else {
      const baseId = nodeId.split('-')[0];
      const mainPerson = findPersonById(familyData, baseId);
      
      if (mainPerson && mainPerson.spouse) {
        cursorStyle = 'not-allowed';
      }
    }
  }
  
  const isHovered = hoveredPerson === nodeId;
  const normalizedId = nodeId.replace(/-spouse$/, '');
  const isBranchSelected = selectedBranch === normalizedId;
  
  // Стили для фильтрации
  const elementOpacity = isFiltered ? 0.3 : 1;
  const imageStyle = {
    cursor: cursorStyle,
    opacity: elementOpacity,
    transition: 'opacity 0.25s ease',
    objectFit: 'cover'
  };
  
  const textStyle = {
    cursor: cursorStyle,
    transition: 'opacity 0.25s ease',
    opacity: elementOpacity,
    pointerEvents: 'none'
  };
  
  return (
    <g 
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`
      }}
      onMouseEnter={() => setHoveredPerson(node.id)}
      onMouseLeave={() => setHoveredPerson(null)}
    >
      <rect
        x={0}
        y={0}
        width={node.width}
        height={node.height}
        rx={8}
        ry={8}
        fill={nodeStyle.fill}
        stroke={nodeStyle.stroke}
        strokeWidth={nodeStyle.strokeWidth}
        strokeDasharray={nodeStyle.strokeDasharray || 'none'}
        style={{ 
          cursor: cursorStyle,
          transition: 'fill 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease, opacity 0.25s ease',
          opacity: elementOpacity
        }}
        onClick={(e) => onNodeClick(e, node.id, node.type, node.name)}
      />
      
      {/* Фотография */}
      {node.photo ? (
        <image
          x={(node.width - 60) / 2}
          y={10}
          width={60}
          height={60}
          href={node.photo}
          clipPath="circle(30px at 30px 30px)"
          style={imageStyle}
          onClick={(e) => onNodeClick(e, node.id, node.type, node.name)}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <g style={{ opacity: elementOpacity, transition: 'opacity 0.25s ease' }}>
          <circle
            cx={node.width / 2}
            cy={40}
            r={30}
            fill="#ffffffc3"
            stroke="#c0a282"
            strokeWidth={1}
            style={{ cursor: cursorStyle }}
            onClick={(e) => onNodeClick(e, node.id, node.type, node.name)}
          />
          <text
            x={node.width / 2}
            y={45}
            style={{
              fontSize: '24px',
              fill: '#c0a282',
              textAnchor: 'middle',
              dominantBaseline: 'middle',
              cursor: cursorStyle,
              pointerEvents: 'none',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            👤
          </text>
        </g>
      )}
      
      {/* ОБНОВЛЕННАЯ ИКОНКА ВЕТКИ РОДСТВЕННИКА - теперь и для супругов */}
      <g
        style={{
          ...NODE_STYLES.branchIcon,
          // Показываем иконку при hover (если не отфильтрована) ИЛИ если ветка активна
          opacity: (isHovered && !isFiltered) || isBranchSelected ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onClick={(e) => {
          e.stopPropagation();
          // ИСПРАВЛЕНО: используем правильный ID для переключения ветки
          // Для супругов тоже используем ID основной персоны
          onBranchToggle(normalizedId);
        }}
      >
        <circle
          cx={node.width - 20}
          cy={20}
          r={10}
          style={isBranchSelected ? NODE_STYLES.branchIconBackgroundActive : NODE_STYLES.branchIconBackground}
        />
        {/* Иконка дерева */}
        <g transform={`translate(${node.width - 20}, 20)`}>
          {/* Ствол */}
          <line
            x1={0}
            y1={2}
            x2={0}
            y2={7}
            style={isBranchSelected ? NODE_STYLES.branchIconTreeActive : NODE_STYLES.branchIconTree}
          />
          {/* Ветки */}
          <line
            x1={-4}
            y1={-2}
            x2={0}
            y2={2}
            style={isBranchSelected ? NODE_STYLES.branchIconTreeActive : NODE_STYLES.branchIconTree}
          />
          <line
            x1={4}
            y1={-2}
            x2={0}
            y2={2}
            style={isBranchSelected ? NODE_STYLES.branchIconTreeActive : NODE_STYLES.branchIconTree}
          />
          <line
            x1={-6}
            y1={-6}
            x2={-4}
            y2={-2}
            style={isBranchSelected ? NODE_STYLES.branchIconTreeActive : NODE_STYLES.branchIconTree}
          />
          <line
            x1={6}
            y1={-6}
            x2={4}
            y2={-2}
            style={isBranchSelected ? NODE_STYLES.branchIconTreeActive : NODE_STYLES.branchIconTree}
          />
        </g>
      </g>
      
      {/* Текст имени */}
      <text
        x={node.width / 2}
        y={85}
        style={{
          ...NODE_STYLES.nodeText,
          ...textStyle,
          fontSize: '13px',
          fontWeight: 'bold'
        }}
      >
        {node.name && node.name.length > 25 ? node.name.substring(0, 25) + '...' : node.name || 'Без имени'}
      </text>
      
      {/* Вторая строка имени если длинное */}
      {node.name && node.name.length > 25 && (
        <text
          x={node.width / 2}
          y={100}
          style={{
            ...NODE_STYLES.nodeText,
            ...textStyle,
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          {node.name.substring(25, 50)}
        </text>
      )}
      
      {/* Текст годов жизни */}
      <text
        x={node.width / 2}
        y={node.name && node.name.length > 25 ? 115 : 100}
        style={{
          ...NODE_STYLES.nodeSubText,
          ...textStyle,
          fontSize: '11px'
        }}
      >
        {node.lifeYears || 'Годы не указаны'}
      </text>
    </g>
  );
};

export default PersonNode;