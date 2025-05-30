// Frontend\src\components\FamilyTree.jsx

import React, { useState, useEffect } from 'react';
import { STYLES } from '../constants/treeConstants';
import { useFamilyTree } from '../hooks/useFamilyTree';
import { useTreeNavigation } from '../hooks/useTreeNavigation';
import { generateTreeLayout, getBoundaries } from '../utils/treeLayoutUtils';
import { findPersonById, getBloodRelatives } from '../utils/familyUtils';
import PersonNode from './PersonNode';
import TreeConnections from './TreeConnections';
import RecentArticles from './RecentArticles';
import { PersonInfoModal, EditPersonModal, AddSpouseModal, AddChildModal } from './Modals';

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
          isSpouse: isSpouse,
          personId: baseId
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
      {/* УБРАЛИ ЗАГОЛОВОК "Семейное древо" */}
      
      {/* ИСПРАВЛЕННЫЙ БЛОК: Кнопки к границам и ниже */}
      <div style={{
        position: 'relative',
        width: '100%',
        marginBottom: '1rem',
        marginLeft: '30px',
        height: '60px' // Увеличиваем высоту для размещения кнопок ниже
      }}>
        
        {/* ЛЕВАЯ ГРУППА: К САМОЙ ЛЕВОЙ ГРАНИЦЕ И НИЖЕ */}
        <div style={{
          position: 'absolute',
          left: '-1rem', // Сдвигаем еще левее
          top: '30px', // Опускаем кнопки ниже
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Основные кнопки */}
          <button
            onClick={familyTreeState.openChildModal}
            style={{ 
              ...STYLES.button, 
              ...STYLES.greenButton,
              opacity: familyTreeState.loading ? 0.5 : 1,
              fontSize: '0.875rem',
              padding: '0.4rem 0.8rem'
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
              opacity: familyTreeState.loading ? 0.5 : 1,
              fontSize: '0.875rem',
              padding: '0.4rem 0.8rem'
            }}
            disabled={familyTreeState.loading}
          >
            Добавить супруга(-у)
          </button>

          {/* Дополнительные кнопки */}
          <button
            onClick={navigationState.centerTree}
            style={{ 
              ...STYLES.button, 
              ...STYLES.defaultViewButton,
              fontSize: '0.875rem',
              padding: '0.4rem 0.8rem'
            }}
          >
            Центрировать
          </button>
          
          <button
            onClick={familyTreeState.loadFamilyData}
            style={{ 
              ...STYLES.button, 
              ...STYLES.grayButton,
              opacity: familyTreeState.loading ? 0.5 : 1,
              fontSize: '0.875rem',
              padding: '0.4rem 0.8rem'
            }}
            disabled={familyTreeState.loading}
          >
            {familyTreeState.loading ? 'Загрузка...' : 'Обновить'}
          </button>
          
          {/* Условные кнопки */}
          {familyTreeState.selectedBranch && (
            <button
              onClick={() => familyTreeState.setSelectedBranch(null)}
              style={{ 
                ...STYLES.button, 
                ...STYLES.defaultViewButton,
                fontSize: '0.875rem',
                padding: '0.4rem 0.8rem'
              }}
            >
              Показать всех
            </button>
          )}
          
          {Object.keys(familyTreeState.hiddenGenerations).length > 0 && (
            <button
              onClick={familyTreeState.resetHiddenGenerations}
              style={{ 
                ...STYLES.button, 
                ...STYLES.defaultViewButton,
                fontSize: '0.875rem',
                padding: '0.4rem 0.8rem'
              }}
            >
              Вид по умолчанию
            </button>
          )}
        </div>

        {/* ПРАВАЯ ГРУППА: К САМОЙ ПРАВОЙ ГРАНИЦЕ И НИЖЕ */}
        <div style={{
          position: 'absolute',
          right: '20px', // Сдвигаем еще правее
          top: '30px', // Опускаем кнопки ниже
          display: 'flex',
          gap: '0.25rem',
          alignItems: 'center'
        }}>
          
          {/* Навигационные кнопки в ряд */}
          
          {/* 1. Стрелка вверх */}
          <button
            onClick={navigationState.moveUp}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: '0.5rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Переместить вверх"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 2. Стрелка влево */}
          <button
            onClick={navigationState.moveLeft}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: '0.5rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Переместить влево"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 3. Стрелка вниз */}
          <button
            onClick={navigationState.moveDown}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: '0.5rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Переместить вниз"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 4. Стрелка вправо */}
          <button
            onClick={navigationState.moveRight}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: '0.5rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Переместить вправо"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 5. Кнопка зума + */}
          <button
            onClick={navigationState.zoomIn}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: '0.5rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Увеличить масштаб"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* 6. Кнопка зума - */}
          <button
            onClick={navigationState.zoomOut}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: '0.5rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Уменьшить масштаб"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Контейнер с тонкой границей */}
      <div style={{
        ...STYLES.svgContainer,
        border: '1px solid #c0a282',
        boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1), 0 2px 4px -1px rgba(48, 49, 51, 0.06)'
      }} data-svg-container="true">
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

      {/* НОВЫЙ БЛОК: Последние статьи вместо инструкции */}
      <RecentArticles 
        articles={familyTreeState.recentArticles}
        loading={familyTreeState.articlesLoading}
      />
      
      {/* Модальные окна */}
      <PersonInfoModal 
        modal={familyTreeState.personInfoModal}
        onClose={familyTreeState.cancelModals}
        onEdit={familyTreeState.openEditModal}
        onDelete={familyTreeState.deletePerson}
      />

      <EditPersonModal 
        modal={familyTreeState.editModal}
        onModalChange={(updates) => familyTreeState.setEditModal(prev => ({ ...prev, ...updates }))}
        onClose={familyTreeState.cancelModals}
        onConfirm={familyTreeState.confirmEditPerson}
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