// Frontend\src\components\FamilyTree.jsx

import React, { useState, useEffect } from 'react';
import { STYLES } from '../constants/treeConstants';
import { useFamilyTree } from '../hooks/useFamilyTree';
import { useTreeNavigation } from '../hooks/useTreeNavigation';
import { generateTreeLayout, getBoundaries } from '../utils/treeLayoutUtils';
import { findPersonById, getBloodRelatives } from '../utils/familyUtils';
import PersonNode from './PersonNode';
import TreeConnections from './TreeConnections';
import { PersonInfoModal, AddSpouseModal, AddChildModal } from './Modals';

const FamilyTree = () => {
  // Используем кастомные хуки
  const familyTreeState = useFamilyTree();
  
  // Состояние для дерева
  const [treeLayout, setTreeLayout] = useState(null);
  const [boundaries, setBoundaries] = useState({ minX: 0, minY: 0, width: 800, height: 600 });

  // Хук навигации
  const navigationState = useTreeNavigation(treeLayout, boundaries);

  // Обновление макета при изменении данных или скрытых поколений
  useEffect(() => {
    if (familyTreeState.familyData) {
      updateTreeLayout();
    }
  }, [familyTreeState.familyData, familyTreeState.hiddenGenerations]);
  
  // Обновление макета дерева
  const updateTreeLayout = () => {
    try {
      const layout = generateTreeLayout(familyTreeState.familyData, familyTreeState.hiddenGenerations);
      const newBoundaries = getBoundaries(layout);
      
      setTreeLayout(layout);
      setBoundaries(newBoundaries);
    } catch (error) {
      console.error('Ошибка при обновлении макета дерева:', error);
    }
  };

  // Функция проверки, должен ли узел быть виден
  const shouldShowNode = (nodeId) => {
    if (!familyTreeState.selectedBranch) return true;
    
    const isSpouse = nodeId.includes('-spouse');
    const normalizedId = nodeId.replace(/-spouse$/, '');
    const bloodRelatives = getBloodRelatives(familyTreeState.familyData, familyTreeState.selectedBranch);
    
    if (bloodRelatives.has(normalizedId)) return true;
    
    if (isSpouse) {
      return bloodRelatives.has(normalizedId);
    }
    
    return false;
  };

  // Обработка клика по узлу
  const handleNodeClick = (e, nodeId, nodeType, nodeName) => {
    if (!nodeId) return;
    
    e.stopPropagation();
    
    if (familyTreeState.selectionMode === 'parent') {
      handleParentSelection(nodeId);
    } 
    else if (familyTreeState.selectionMode === 'spouse') {
      handleSpouseSelection(nodeId);
    } 
    else {
      // Показываем модальное окно с информацией о персоне
      const isSpouse = nodeType === 'spouse';
      const baseId = nodeId.replace(/-spouse$/, '');
      const person = findPersonById(familyTreeState.familyData, baseId);
      
      if (person) {
        const personData = isSpouse ? person.spouse : person;
        familyTreeState.setPersonInfoModal({
          isOpen: true,
          person: personData,
          isSpouse: isSpouse
        });
      }
    }
  };

  // Обработка выбора родителя
  const handleParentSelection = (personId) => {
    try {
      const baseId = personId.replace(/-spouse$/, '');
      const person = findPersonById(familyTreeState.familyData, baseId);
      
      if (!person) {
        console.error('Родитель не найден:', baseId);
        familyTreeState.showNotification("Родитель не найден");
        return;
      }
      
      let parentName = person.name || `ID: ${baseId}`;
      if (person.spouse) {
        parentName += ` и ${person.spouse.name || 'Супруг(а)'}`;
      }
      
      familyTreeState.setChildModal({
        ...familyTreeState.childModal,
        parentId: baseId,
        parentName: parentName,
        isOpen: true
      });
      
      familyTreeState.setSelectionMode(null);
    } catch (error) {
      console.error('Ошибка при выборе родителя:', error);
      familyTreeState.showNotification("Произошла ошибка при выборе родителя");
    }
  };
  
  // Обработка выбора персоны для супруга
  const handleSpouseSelection = (nodeId) => {
    try {
      const isSpouse = nodeId.includes('-spouse');
      
      if (isSpouse) {
        familyTreeState.showNotification("Нельзя добавить супруга к супругу");
        return;
      }
      
      const baseId = nodeId.replace(/-spouse$/, '');
      const person = findPersonById(familyTreeState.familyData, baseId);
      
      if (!person) {
        familyTreeState.showNotification("Персона не найдена");
        console.error("Персона не найдена:", baseId);
        return;
      }
      
      if (person.spouse) {
        familyTreeState.showNotification("У этой персоны уже есть супруг(-а)");
        return;
      }
      
      familyTreeState.setSpouseModal(prev => ({
        ...prev,
        targetPersonId: baseId,
        targetPersonName: person.name,
        isOpen: true
      }));
      
      familyTreeState.setSelectionMode(null);
      
    } catch (error) {
      console.error("Ошибка при выборе персоны:", error);
      familyTreeState.showNotification("Произошла ошибка при выборе персоны");
    }
  };

  // Индикатор загрузки
  if (familyTreeState.loading) {
    return (
      <div style={STYLES.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #ffffffc3',
            borderTop: '4px solid #c0a282',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <h2 style={{ color: '#303133', fontFamily: 'Montserrat, sans-serif' }}>Загрузка семейного дерева...</h2>
          <p style={{ color: '#303133', fontFamily: 'Montserrat, sans-serif' }}>Подключение к серверу...</p>
        </div>
      </div>
    );
  }

  // Ошибка подключения
  if (!familyTreeState.isServerConnected) {
    return (
      <div style={STYLES.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1)',
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#303133', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif' }}>
            Сервер недоступен
          </h2>
          <p style={{ fontSize: '1rem', color: '#303133', marginBottom: '0.5rem', lineHeight: '1.5', fontFamily: 'Montserrat, sans-serif' }}>
            Не удается подключиться к серверу семейного дерева.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#303133', marginBottom: '0.5rem', fontFamily: 'Montserrat, sans-serif' }}>
            Убедитесь, что сервер запущен на порту 5000
          </p>
          <button 
            onClick={familyTreeState.loadFamilyData}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              border: 'none',
              fontWeight: '500',
              backgroundColor: '#c0a282',
              color: 'white',
              marginTop: '1rem',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Ошибка данных
  if (familyTreeState.error) {
    return (
      <div style={STYLES.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#303133', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif' }}>
            Ошибка загрузки данных
          </h2>
          <p style={{ fontSize: '1rem', color: '#303133', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif' }}>
            {familyTreeState.error}
          </p>
          <button 
            onClick={familyTreeState.loadFamilyData}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              border: 'none',
              fontWeight: '500',
              backgroundColor: '#c0a282',
              color: 'white',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Обновить данные
          </button>
        </div>
      </div>
    );
  }

  // Рендеринг дерева
  const renderFamilyTree = () => {
    if (!treeLayout || !treeLayout.nodes || !Array.isArray(treeLayout.nodes) || treeLayout.nodes.length === 0) {
      return <text x="100" y="100" fontSize="16" fill="#303133" fontFamily="Montserrat, sans-serif">Нет данных для отображения</text>;
    }
    
    return (
      <g>
        {/* Соединительные линии */}
        <TreeConnections 
          connections={treeLayout.connections}
          hoveredPerson={familyTreeState.hoveredPerson}
          setHoveredPerson={familyTreeState.setHoveredPerson}
          isGenerationHidden={familyTreeState.isGenerationHidden}
          onToggleGeneration={familyTreeState.toggleGeneration}
        />
        
        {/* Узлы (персоны и супруги) */}
        {treeLayout.nodes.map((node, index) => (
          <PersonNode
            key={`node-${node.id}-${index}`}
            node={node}
            familyData={familyTreeState.familyData}
            hoveredPerson={familyTreeState.hoveredPerson}
            setHoveredPerson={familyTreeState.setHoveredPerson}
            selectedPerson={familyTreeState.selectedPerson}
            selectionMode={familyTreeState.selectionMode}
            selectedBranch={familyTreeState.selectedBranch}
            shouldShowNode={shouldShowNode}
            onNodeClick={handleNodeClick}
            onBranchToggle={familyTreeState.toggleBranch}
          />
        ))}
      </g>
    );
  };
  
  // Основной рендер
  return (
    <div style={STYLES.container}>
      <h1 style={STYLES.title}>
        Семейное древо 
        {!familyTreeState.isServerConnected && (
          <span style={{
            fontSize: '1rem',
            color: '#303133',
            backgroundColor: '#ffffffc3',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #c0a282',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Офлайн
          </span>
        )}
      </h1>
      
      <div style={STYLES.svgContainer} data-svg-container="true">
        {familyTreeState.selectionMode && (
          <div style={STYLES.activeMode}>
            {familyTreeState.selectionMode === 'parent' ? 'Режим выбора родителя' : 'Режим выбора персоны для супруга'}
          </div>
        )}
        
        <svg
          ref={navigationState.svgRef}
          width="100%"
          height="100%"
          style={{ 
            cursor: navigationState.isDragging ? 'grabbing' : (familyTreeState.selectionMode ? 'pointer' : 'grab'),
            userSelect: 'none',
            touchAction: 'none'
          }}
          onMouseDown={familyTreeState.selectionMode ? undefined : navigationState.handleMouseDown}
          onDoubleClick={navigationState.handleDoubleClick}
        >
          <g transform={`translate(${navigationState.position.x}, ${navigationState.position.y}) scale(${navigationState.scale})`}>
            {renderFamilyTree()}
          </g>
        </svg>
      </div>
      
      {/* Кнопки управления */}
      <div style={STYLES.buttonsContainer}>
        <button
          onClick={familyTreeState.openChildModal}
          style={{ 
            ...STYLES.button, 
            ...STYLES.greenButton,
            opacity: familyTreeState.loading ? 0.5 : 1
          }}
          disabled={familyTreeState.loading}
        >
          Добавить ребенка
        </button>
        
        <button
          onClick={familyTreeState.openSpouseModal}
          style={{ 
            ...STYLES.button, 
            ...STYLES.purpleButton,
            opacity: familyTreeState.loading ? 0.5 : 1
          }}
          disabled={familyTreeState.loading}
        >
          Добавить супруга(-у)
        </button>
        
        {familyTreeState.selectedBranch && (
          <button
            onClick={() => familyTreeState.setSelectedBranch(null)}
            style={{ ...STYLES.button, ...STYLES.defaultViewButton }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Показать всех родственников
          </button>
        )}
        
        {Object.keys(familyTreeState.hiddenGenerations).length > 0 && (
          <button
            onClick={familyTreeState.resetHiddenGenerations}
            style={{ ...STYLES.button, ...STYLES.defaultViewButton }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Вид по умолчанию
          </button>
        )}
        
        <button
          onClick={navigationState.centerTree}
          style={{ ...STYLES.button, ...STYLES.defaultViewButton }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L12 20M20 12L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 7L7 17M7 7L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Центрировать
        </button>
        
        <button
          onClick={familyTreeState.loadFamilyData}
          style={{ 
            ...STYLES.button, 
            ...STYLES.grayButton,
            opacity: familyTreeState.loading ? 0.5 : 1
          }}
          disabled={familyTreeState.loading}
        >
          {familyTreeState.loading ? 'Загрузка...' : 'Обновить'}
        </button>
      </div>

      {/* Инструкция */}
      <div style={STYLES.instructionPanel}>
        <h3 style={STYLES.instructionTitle}>Инструкция</h3>
        <ul style={STYLES.instructionItems}>
          <li style={STYLES.instructionItem}>Нажмите "Добавить ребенка", чтобы добавить нового человека с выбором родителя</li>
          <li style={STYLES.instructionItem}>Нажмите "Добавить супруга(-у)" для добавления пары к персоне</li>
          <li style={STYLES.instructionItem}><strong>Кликните на карточку персоны</strong> - откроется модальное окно с подробной информацией</li>
          <li style={STYLES.instructionItem}>Кликните на кнопку '-' на линии, чтобы скрыть поколение</li>
          <li style={STYLES.instructionItem}>Кликните на кнопку '+' на пунктирной линии, чтобы показать скрытое поколение</li>
          <li style={STYLES.instructionItem}><strong>Наведите на карточку персоны</strong> - появится иконка дерева в правом верхнем углу</li>
          <li style={STYLES.instructionItem}><strong>Кликните на иконку дерева</strong> - отобразится только ветка этого родственника (предки, потомки, супруги)</li>
          <li style={STYLES.instructionItem}><strong>Повторный клик на иконку</strong> или кнопку "Показать всех родственников" вернет полный вид</li>
          <li style={STYLES.instructionItem}>Используйте Ctrl + колесо мыши для масштабирования и перетаскивание для навигации</li>
          <li style={STYLES.instructionItem}><strong>Все изменения автоматически сохраняются на сервере!</strong></li>
        </ul>
      </div>
      
      {/* Модальные окна */}
      <PersonInfoModal 
        modal={familyTreeState.personInfoModal}
        onClose={familyTreeState.cancelModals}
      />
      
      <AddSpouseModal 
        modal={familyTreeState.spouseModal}
        onModalChange={(updates) => familyTreeState.setSpouseModal(prev => ({ ...prev, ...updates }))}
        onClose={familyTreeState.cancelModals}
        onStartSelection={familyTreeState.startSpousePersonSelection}
        onConfirm={familyTreeState.confirmAddSpouse}
      />
      
      <AddChildModal 
        modal={familyTreeState.childModal}
        onModalChange={(updates) => familyTreeState.setChildModal(prev => ({ ...prev, ...updates }))}
        onClose={familyTreeState.cancelModals}
        onStartSelection={familyTreeState.startParentSelection}
        onConfirm={familyTreeState.confirmAddChild}
      />
      
      {/* Уведомление о режиме выбора */}
      {familyTreeState.selectionMode && (
        <div style={STYLES.selectionModeNotice}>
          <div style={STYLES.selectionModeTitle}>
            {familyTreeState.selectionMode === 'parent' ? 'Режим выбора родителя' : 'Режим выбора персоны для супруга'}
          </div>
          <div>
            {familyTreeState.selectionMode === 'parent' 
              ? 'Выберите родителя для ребенка. Нажмите на любую персону в дереве.'
              : 'Выберите персону для добавления супруга(-и). Нажмите на персону без супруга.'
            }
          </div>
          <button
            onClick={familyTreeState.cancelModals}
            style={STYLES.selectionModeButton}
          >
            Отмена выбора
          </button>
        </div>
      )}
      
      {/* Уведомления */}
      {familyTreeState.notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          boxShadow: '0 2px 10px rgba(48, 49, 51, 0.2)',
          zIndex: 100,
          opacity: 1,
          transition: 'opacity 0.3s ease',
          backgroundColor: familyTreeState.notification.type === 'success' ? '#c0a282' : '#303133',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {familyTreeState.notification.message}
        </div>
      )}
    </div>
  );
};

export default FamilyTree;