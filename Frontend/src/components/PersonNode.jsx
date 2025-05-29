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
  let nodeStyle = {};
  
  if (personData && personData.gender === 'male') {
    nodeStyle = { ...NODE_STYLES.maleNode };
  } else if (personData && personData.gender === 'female') {
    nodeStyle = { ...NODE_STYLES.femaleNode };
  } else {
    nodeStyle = { 
      fill: "#f0f4f8", 
      stroke: "#c2cfd6", 
      strokeWidth: 2,
      transition: 'fill 0.3s, stroke 0.3s, stroke-width 0.3s, opacity 0.3s'
    };
  }
  
  // Применяем фильтрацию по ветке
  if (!shouldShow) {
    nodeStyle = { ...nodeStyle, ...NODE_STYLES.filteredNode };
  }
  
  if (selectedPerson === nodeId) {
    if (personData?.gender === 'male') {
      nodeStyle.stroke = NODE_STYLES.selectedMaleNode.stroke;
    } else {
      nodeStyle.stroke = NODE_STYLES.selectedFemaleNode.stroke;
    }
  }
  
  if (node.hasHiddenGeneration) {
    nodeStyle.stroke = NODE_STYLES.nodeWithHiddenGen.stroke;
    nodeStyle.strokeWidth = NODE_STYLES.nodeWithHiddenGen.strokeWidth;
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
  
  let cursorStyle = selectionMode ? 'pointer' : 'pointer'; // Всегда pointer для показа информации
  
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
        style={{ 
          cursor: cursorStyle,
          transition: 'fill 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease, opacity 0.25s ease',
          opacity: nodeStyle.opacity || 1
        }}
        onClick={(e) => onNodeClick(e, node.id, node.type, node.name)}
      />
      
      {/* Фотография - в верху карточки, большего размера */}
      {node.photo ? (
        <image
          x={(node.width - 60) / 2} // Центрируем фото по горизонтали
          y={10}
          width={60}
          height={60}
          href={node.photo}
          clipPath="circle(30px at 30px 30px)"
          style={{ cursor: cursorStyle }}
          onClick={(e) => onNodeClick(e, node.id, node.type, node.name)}
        />
      ) : (
        <g>
          <circle
            cx={node.width / 2} // Центрируем по горизонтали
            cy={40}
            r={30}
            fill="#e5e7eb"
            stroke="#d1d5db"
            strokeWidth={1}
            style={{ cursor: cursorStyle }}
            onClick={(e) => onNodeClick(e, node.id, node.type, node.name)}
          />
          <text
            x={node.width / 2}
            y={45}
            style={{
              fontSize: '24px',
              fill: '#9ca3af',
              textAnchor: 'middle',
              dominantBaseline: 'middle',
              cursor: cursorStyle,
              pointerEvents: 'none'
            }}
          >
            👤
          </text>
        </g>
      )}
      
      {/* Иконка ветки родственника - только для основных персон (не супругов) */}
      {!isSpouse && (
        <g
          style={{
            ...NODE_STYLES.branchIcon,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          onClick={(e) => {
            e.stopPropagation();
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
      )}
      
      {/* Имя персоны - под фотографией */}
      <text
        x={node.width / 2}
        y={85} // Под фотографией
        style={{
          ...NODE_STYLES.nodeText,
          cursor: cursorStyle,
          transition: 'opacity 0.25s ease',
          opacity: nodeStyle.opacity || 1,
          pointerEvents: 'none',
          fontSize: '13px',
          fontWeight: 'bold'
        }}
      >
        {node.name && node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name || 'Без имени'}
      </text>
      
      {/* Вторая строка имени если длинное */}
      {node.name && node.name.length > 20 && (
        <text
          x={node.width / 2}
          y={100}
          style={{
            ...NODE_STYLES.nodeText,
            cursor: cursorStyle,
            transition: 'opacity 0.25s ease',
            opacity: nodeStyle.opacity || 1,
            pointerEvents: 'none',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          {node.name.substring(20, 40)}
        </text>
      )}
      
      {/* Годы жизни - под именем */}
      <text
        x={node.width / 2}
        y={node.name && node.name.length > 20 ? 115 : 100}
        style={{
          ...NODE_STYLES.nodeSubText,
          cursor: cursorStyle,
          transition: 'opacity 0.25s ease',
          opacity: nodeStyle.opacity || 1,
          pointerEvents: 'none',
          fontSize: '11px'
        }}
      >
        {node.lifeYears || 'Годы не указаны'}
      </text>
    </g>
  );
};

export default PersonNode;