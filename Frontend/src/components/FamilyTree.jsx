// Frontend\src\components\FamilyTree.jsx

import React, { useState, useEffect } from 'react';
import { STYLES } from '../constants/treeConstants';
import { useAuth } from '../contexts/AuthContext';
import { useFamilyTree } from '../hooks/useFamilyTree';
import { useTreeNavigation } from '../hooks/useTreeNavigation';
import { generateTreeLayout, getBoundaries } from '../utils/treeLayoutUtils';
import { findPersonById, getBloodRelatives } from '../utils/familyUtils';
import PersonNode from './PersonNode';
import TreeConnections from './TreeConnections';
import RecentArticles from './RecentArticles';
import { PersonInfoModal, EditPersonModal, AddSpouseModal, AddChildModal } from './Modals';

const FamilyTree = () => {
  // НОВОЕ: Получаем статус авторизации
  const { isAuthenticated } = useAuth();

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
          shouldShowNode={shouldShowNode} // НОВЫЙ ПАРАМЕТР
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
    <div id='tree-container' style={STYLES.container}>

      {/* УПРОЩЕННЫЙ АДАПТИВНЫЙ БЛОК КНОПОК */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0 1rem',
        width: '100%'
      }}>

        {/* ЛЕВАЯ ГРУППА: Основные кнопки */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          {/* CRUD кнопки - только для авторизованных */}
          {isAuthenticated && (
            <>
              <button
                onClick={familyTreeState.openChildModal}
                style={{
                  ...STYLES.button,
                  ...STYLES.greenButton,
                  opacity: familyTreeState.loading ? 0.5 : 1,
                  fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                  padding: window.innerWidth < 768 ? '0.4rem 0.6rem' : '0.4rem 0.8rem',
                  whiteSpace: 'nowrap'
                }}
                disabled={familyTreeState.loading}
              >
                {window.innerWidth < 768 ? '+ Ребенок' : 'Добавить ребенка'}
              </button>

              <button
                onClick={familyTreeState.openSpouseModal}
                style={{
                  ...STYLES.button,
                  ...STYLES.purpleButton,
                  opacity: familyTreeState.loading ? 0.5 : 1,
                  fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                  padding: window.innerWidth < 768 ? '0.4rem 0.6rem' : '0.4rem 0.8rem',
                  whiteSpace: 'nowrap'
                }}
                disabled={familyTreeState.loading}
              >
                {window.innerWidth < 768 ? '+ Супруг' : 'Добавить супруга(-у)'}
              </button>

              <button
                onClick={familyTreeState.loadFamilyData}
                style={{
                  ...STYLES.button,
                  ...STYLES.grayButton,
                  opacity: familyTreeState.loading ? 0.5 : 1,
                  fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                  padding: window.innerWidth < 768 ? '0.4rem 0.6rem' : '0.4rem 0.8rem',
                  whiteSpace: 'nowrap'
                }}
                disabled={familyTreeState.loading}
              >
                {familyTreeState.loading ? 'Загрузка...' : 'Обновить'}
              </button>
            </>
          )}

          {/* Навигационные кнопки - доступны всем */}
          <button
            onClick={navigationState.centerTree}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
              padding: window.innerWidth < 768 ? '0.4rem 0.6rem' : '0.4rem 0.8rem',
              whiteSpace: 'nowrap'
            }}
          >
            {window.innerWidth < 768 ? 'Центр' : 'Центрировать'}
          </button>

          {/* Условные кнопки - доступны всем */}
          {familyTreeState.selectedBranch && (
            <button
              onClick={() => familyTreeState.setSelectedBranch(null)}
              style={{
                ...STYLES.button,
                ...STYLES.defaultViewButton,
                fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                padding: window.innerWidth < 768 ? '0.4rem 0.6rem' : '0.4rem 0.8rem',
                whiteSpace: 'nowrap'
              }}
            >
              {window.innerWidth < 768 ? 'Все' : 'Показать всех'}
            </button>
          )}

          {Object.keys(familyTreeState.hiddenGenerations).length > 0 && (
            <button
              onClick={familyTreeState.resetHiddenGenerations}
              style={{
                ...STYLES.button,
                ...STYLES.defaultViewButton,
                fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem',
                padding: window.innerWidth < 768 ? '0.4rem 0.6rem' : '0.4rem 0.8rem',
                whiteSpace: 'nowrap'
              }}
            >
              {window.innerWidth < 768 ? 'Сброс' : 'Вид по умолчанию'}
            </button>
          )}
        </div>

        {/* ПРАВАЯ ГРУППА: Навигационные кнопки со стрелками */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          alignItems: 'center',
          flexShrink: 0
        }}>

          <button
            onClick={navigationState.moveUp}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: window.innerWidth < 768 ? '0.4rem' : '0.5rem',
              minWidth: window.innerWidth < 768 ? '32px' : '36px',
              height: window.innerWidth < 768 ? '32px' : '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Переместить вверх"
          >
            <svg width={window.innerWidth < 768 ? "12" : "16"} height={window.innerWidth < 768 ? "12" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={navigationState.moveLeft}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: window.innerWidth < 768 ? '0.4rem' : '0.5rem',
              minWidth: window.innerWidth < 768 ? '32px' : '36px',
              height: window.innerWidth < 768 ? '32px' : '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Переместить влево"
          >
            <svg width={window.innerWidth < 768 ? "12" : "16"} height={window.innerWidth < 768 ? "12" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={navigationState.moveDown}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: window.innerWidth < 768 ? '0.4rem' : '0.5rem',
              minWidth: window.innerWidth < 768 ? '32px' : '36px',
              height: window.innerWidth < 768 ? '32px' : '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Переместить вниз"
          >
            <svg width={window.innerWidth < 768 ? "12" : "16"} height={window.innerWidth < 768 ? "12" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={navigationState.moveRight}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: window.innerWidth < 768 ? '0.4rem' : '0.5rem',
              minWidth: window.innerWidth < 768 ? '32px' : '36px',
              height: window.innerWidth < 768 ? '32px' : '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Переместить вправо"
          >
            <svg width={window.innerWidth < 768 ? "12" : "16"} height={window.innerWidth < 768 ? "12" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={navigationState.zoomIn}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: window.innerWidth < 768 ? '0.4rem' : '0.5rem',
              minWidth: window.innerWidth < 768 ? '32px' : '36px',
              height: window.innerWidth < 768 ? '32px' : '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Увеличить масштаб"
          >
            <svg width={window.innerWidth < 768 ? "12" : "16"} height={window.innerWidth < 768 ? "12" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={navigationState.zoomOut}
            style={{
              ...STYLES.button,
              ...STYLES.defaultViewButton,
              padding: window.innerWidth < 768 ? '0.4rem' : '0.5rem',
              minWidth: window.innerWidth < 768 ? '32px' : '36px',
              height: window.innerWidth < 768 ? '32px' : '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Уменьшить масштаб"
          >
            <svg width={window.innerWidth < 768 ? "12" : "16"} height={window.innerWidth < 768 ? "12" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

      {/* Последние статьи */}
      <RecentArticles
        articles={familyTreeState.recentArticles}
        loading={familyTreeState.articlesLoading}
      />

      {/* ОБНОВЛЕННЫЕ модальные окна - только для авторизованных */}
      {isAuthenticated && (
        <>
          <PersonInfoModal
            modal={familyTreeState.personInfoModal}
            onClose={familyTreeState.cancelModals}
            onEdit={familyTreeState.openEditModal}
            onDelete={familyTreeState.deletePerson}
            isAuthenticated={isAuthenticated}
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
        </>
      )}

      {/* Модальное окно персоны для неавторизованных (только просмотр) */}
      {!isAuthenticated && (
        <PersonInfoModal
          modal={familyTreeState.personInfoModal}
          onClose={familyTreeState.cancelModals}
          onEdit={() => { }}
          onDelete={() => { }}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Уведомление о режиме выбора - только для авторизованных */}
      {isAuthenticated && familyTreeState.selectionMode && (
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