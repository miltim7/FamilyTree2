// Frontend\src\components\TreeConnections.jsx

import React, { useState } from 'react';
import { NODE_STYLES } from '../constants/treeConstants';

const TreeConnections = ({ 
  connections, 
  hoveredPerson, 
  setHoveredPerson,
  hiddenFromLevel, // ОБНОВЛЕНО: получаем уровень скрытия
  onHideGenerations, // НОВОЕ: функция скрытия поколений
  shouldShowNode
}) => {
  // НОВОЕ: Состояние для tooltip'ов
  const [hoveredButton, setHoveredButton] = useState(null);

  if (!connections || !Array.isArray(connections)) {
    return null;
  }

  // НОВАЯ ФУНКЦИЯ: Проверка должна ли быть видна кнопка
  const shouldShowToggleButton = (conn) => {
    if (!conn.hasToggleButton) return false;
    
    // Показываем кнопку если:
    // 1. Есть hover на узле
    // 2. Или если есть скрытые поколения начиная с этого уровня или ниже
    const isHovered = hoveredPerson === conn.nodeId || hoveredPerson === `${conn.nodeId}-spouse`;
    const hasHiddenGenerations = hiddenFromLevel !== null && hiddenFromLevel >= conn.level;
    
    return isHovered || hasHiddenGenerations || conn.isHidden;
  };

  // НОВАЯ ФУНКЦИЯ: Получение текста для индикатора скрытого поколения
  const getHiddenText = (conn) => {
    if (conn.hiddenLevelsCount) {
      return `...скрыто ${conn.hiddenLevelsCount} ${conn.hiddenLevelsCount === 1 ? 'поколение' : 'поколений'}`;
    }
    return '...скрыто';
  };

  return (
    <g>
      {connections.map((conn, idx) => {
        if (!conn) return null;
        
        const isDashed = conn.type === 'hidden-generation';
        
        // Определяем прозрачность линии на основе видимости связанных узлов
        let lineOpacity = 1;
        
        if (shouldShowNode && conn.nodeId) {
          const nodeVisible = shouldShowNode(conn.nodeId);
          const spouseVisible = shouldShowNode(`${conn.nodeId}-spouse`);
          
          if (conn.type === 'couple') {
            if (!nodeVisible || !spouseVisible) {
              lineOpacity = 0.3;
            }
          } else if (conn.type === 'parent-junction' || conn.type === 'child-connection') {
            if (!nodeVisible && !spouseVisible) {
              lineOpacity = 0.3;
            }
          } else if (conn.type === 'hidden-generation') {
            if (!nodeVisible && !spouseVisible) {
              lineOpacity = 0.3;
            }
          }
        }

        const isButtonHovered = hoveredButton === idx;
        const isButtonVisible = shouldShowToggleButton(conn) && lineOpacity > 0.5;
        const isHidden = conn.isHidden || (hiddenFromLevel !== null && hiddenFromLevel <= conn.level);
        
        return (
          <g key={`conn-group-${idx}`}>
            <line
              key={`conn-${idx}`}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke={NODE_STYLES.connection.stroke}
              strokeWidth={NODE_STYLES.connection.strokeWidth}
              strokeDasharray={isDashed ? "8,4" : "0"}
              style={{
                opacity: isDashed ? 0.7 * lineOpacity : lineOpacity,
                transition: 'opacity 0.25s ease'
              }}
            />
            
            {/* ОБНОВЛЕННЫЙ текст для скрытого поколения */}
            {isDashed && conn.isHidden && (
              <g style={{ opacity: lineOpacity, transition: 'opacity 0.25s ease' }}>
                <rect
                  x={conn.x1 + 10}
                  y={conn.y1 + (conn.y2 - conn.y1) / 2 - 8}
                  width={120} // УВЕЛИЧЕНО для нового текста
                  height={16}
                  fill="white"
                  fillOpacity={0.9}
                  rx={3}
                />
                <text
                  x={conn.x1 + 15}
                  y={conn.y1 + (conn.y2 - conn.y1) / 2}
                  style={NODE_STYLES.hiddenIndicatorText}
                >
                  {getHiddenText(conn)}
                </text>
              </g>
            )}
            
            {/* ОБНОВЛЕННАЯ кнопка управления на линии */}
            {conn.hasToggleButton && (
              <g
                key={`toggle-${idx}`}
                style={{
                  ...NODE_STYLES.lineToggleButton,
                  opacity: isButtonVisible ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // НОВОЕ: Вызываем функцию скрытия поколений по уровню
                  onHideGenerations(conn.level);
                }}
                onMouseEnter={() => {
                  setHoveredPerson(conn.nodeId);
                  setHoveredButton(idx);
                }}
                onMouseLeave={() => {
                  setHoveredPerson(null);
                  setHoveredButton(null);
                }}
              >
                <circle
                  cx={conn.toggleButtonX}
                  cy={conn.toggleButtonY}
                  r={12}
                  style={NODE_STYLES.lineToggleButtonBackground}
                />
                
                {/* ОБНОВЛЕННАЯ логика иконки */}
                {isHidden ? (
                  // Плюс для показа
                  <g>
                    <line
                      x1={conn.toggleButtonX - 6}
                      y1={conn.toggleButtonY}
                      x2={conn.toggleButtonX + 6}
                      y2={conn.toggleButtonY}
                      style={NODE_STYLES.lineToggleButtonIcon}
                    />
                    <line
                      x1={conn.toggleButtonX}
                      y1={conn.toggleButtonY - 6}
                      x2={conn.toggleButtonX}
                      y2={conn.toggleButtonY + 6}
                      style={NODE_STYLES.lineToggleButtonIcon}
                    />
                  </g>
                ) : (
                  // Минус для скрытия
                  <line
                    x1={conn.toggleButtonX - 6}
                    y1={conn.toggleButtonY}
                    x2={conn.toggleButtonX + 6}
                    y2={conn.toggleButtonY}
                    style={NODE_STYLES.lineToggleButtonIcon}
                  />
                )}

                {/* ОБНОВЛЕННЫЙ tooltip для кнопок +/- - в стиле сайта */}
                {isButtonHovered && isButtonVisible && (
                  <foreignObject
                    x={conn.toggleButtonX - 100}
                    y={conn.toggleButtonY - 45}
                    width={200}
                    height={30}
                    style={{ pointerEvents: 'none', overflow: 'visible' }}
                  >
                    <div style={{
                      backgroundColor: '#c0a282',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '500',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(192, 162, 130, 0.3)',
                      width: 'fit-content',
                      margin: '0 auto',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {isHidden ? 'Показать скрытые поколения' : 'Скрыть поколения ниже'}
                    </div>
                  </foreignObject>
                )}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

export default TreeConnections;