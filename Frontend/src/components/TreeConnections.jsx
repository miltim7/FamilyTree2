// Frontend\src\components\TreeConnections.jsx

import React from 'react';
import { NODE_STYLES } from '../constants/treeConstants';

const TreeConnections = ({ 
  connections, 
  hoveredPerson, 
  setHoveredPerson,
  isGenerationHidden,
  onToggleGeneration,
  shouldShowNode // Функция для проверки видимости узла
}) => {
  if (!connections || !Array.isArray(connections)) {
    return null;
  }

  return (
    <g>
      {connections.map((conn, idx) => {
        if (!conn) return null;
        
        const isDashed = conn.type === 'hidden-generation';
        
        // УЛУЧШЕННАЯ ЛОГИКА: Определяем прозрачность линии на основе видимости связанных узлов
        let lineOpacity = 1;
        
        if (shouldShowNode && conn.nodeId) {
          // Проверяем видимость основного узла
          const nodeVisible = shouldShowNode(conn.nodeId);
          // Проверяем видимость супруга
          const spouseVisible = shouldShowNode(`${conn.nodeId}-spouse`);
          
          // Для разных типов соединений применяем разную логику
          if (conn.type === 'couple') {
            // Линия между супругами - если один из них не виден, линия потухает
            if (!nodeVisible || !spouseVisible) {
              lineOpacity = 0.3;
            }
          } else if (conn.type === 'parent-junction' || conn.type === 'child-connection') {
            // Линии родитель-ребенок - если родитель не виден, линия потухает
            if (!nodeVisible && !spouseVisible) {
              lineOpacity = 0.3;
            }
          } else if (conn.type === 'hidden-generation') {
            // Пунктирные линии скрытых поколений
            if (!nodeVisible && !spouseVisible) {
              lineOpacity = 0.3;
            }
          }
        }
        
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
                opacity: isDashed ? 0.7 * lineOpacity : lineOpacity, // Применяем фильтрацию
                transition: 'opacity 0.25s ease'
              }}
            />
            
            {/* Текст для скрытого поколения */}
            {isDashed && conn.isHidden && (
              <g style={{ opacity: lineOpacity, transition: 'opacity 0.25s ease' }}>
                {/* Фон для текста для лучшей читаемости */}
                <rect
                  x={conn.x1 + 10}
                  y={conn.y1 + (conn.y2 - conn.y1) / 2 - 8}
                  width={60}
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
                  ... скрыто
                </text>
              </g>
            )}
            
            {/* Кнопка управления на линии */}
            {conn.hasToggleButton && (
              <g
                key={`toggle-${idx}`}
                style={{
                  ...NODE_STYLES.lineToggleButton,
                  // Показываем кнопку только если узел виден и есть hover или поколение скрыто
                  opacity: (isGenerationHidden(conn.nodeId) || hoveredPerson === conn.nodeId || hoveredPerson === `${conn.nodeId}-spouse`) && lineOpacity > 0.5 ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleGeneration(conn.nodeId);
                }}
                onMouseEnter={() => setHoveredPerson(conn.nodeId)}
                onMouseLeave={() => setHoveredPerson(null)}
              >
                <circle
                  cx={conn.toggleButtonX}
                  cy={conn.toggleButtonY}
                  r={12}
                  style={NODE_STYLES.lineToggleButtonBackground}
                />
                
                {conn.isHidden || isGenerationHidden(conn.nodeId) ? (
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
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

export default TreeConnections;