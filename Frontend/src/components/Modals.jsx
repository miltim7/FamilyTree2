// Frontend\src\components\Modals.jsx

import React from 'react';
import { STYLES, NODE_STYLES } from '../constants/treeConstants';
import PhotoUpload from './PhotoUpload';

// Модальное окно с информацией о персоне
export const PersonInfoModal = ({ modal, onClose, onEdit, onDelete }) => {
  if (!modal.isOpen || !modal.person) return null;

  const canDelete = modal.personId !== 'root-1'; // Нельзя удалить основателя

  return (
    <div style={STYLES.modal}>
      <div style={STYLES.modalContent}>
        <h2 style={STYLES.modalTitle}>
          Информация о персоне
          <button
            onClick={onClose}
            style={STYLES.modalCloseButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#303133'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#303133'}
          >
            ×
          </button>
        </h2>
        
        <div style={NODE_STYLES.personInfoModal}>
          {/* Фотография */}
          <div>
            {modal.person.photo ? (
              <img
                src={modal.person.photo}
                alt={modal.person.name}
                style={NODE_STYLES.personPhoto}
              />
            ) : (
              <div style={{...NODE_STYLES.personPhoto, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#c0a282'}}>
                USER
              </div>
            )}
          </div>
          
          {/* Информация */}
          <div style={NODE_STYLES.personDetails}>
            <h3 style={NODE_STYLES.personName}>{modal.person.name || 'Имя не указано'}</h3>
            
            <div style={NODE_STYLES.personField}>
              <div style={NODE_STYLES.fieldLabel}>Пол:</div>
              <div style={NODE_STYLES.fieldValue}>{modal.person.gender === 'male' ? 'Мужской' : 'Женский'}</div>
            </div>
            
            <div style={NODE_STYLES.personField}>
              <div style={NODE_STYLES.fieldLabel}>Годы жизни:</div>
              <div style={NODE_STYLES.fieldValue}>{modal.person.lifeYears || 'Не указаны'}</div>
            </div>
            
            <div style={NODE_STYLES.personField}>
              <div style={NODE_STYLES.fieldLabel}>Профессия:</div>
              <div style={NODE_STYLES.fieldValue}>{modal.person.profession || 'Не указана'}</div>
            </div>
            
            <div style={NODE_STYLES.personField}>
              <div style={NODE_STYLES.fieldLabel}>Место рождения:</div>
              <div style={NODE_STYLES.fieldValue}>{modal.person.birthPlace || 'Не указано'}</div>
            </div>
            
            {modal.person.biography && (
              <div style={NODE_STYLES.personField}>
                <div style={NODE_STYLES.fieldLabel}>Биография:</div>
                <div style={NODE_STYLES.fieldValue}>{modal.person.biography}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* НОВЫЕ КНОПКИ: Редактировать и Удалить */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #c0a282'
        }}>
          <button
            onClick={() => onEdit(modal.person, modal.isSpouse, modal.personId)}
            style={{ 
              ...STYLES.button, 
              ...STYLES.blueButton,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Редактировать
          </button>
          
          {canDelete && (
            <button
              onClick={() => onDelete(modal.personId, modal.isSpouse)}
              style={{ 
                ...STYLES.button,
                backgroundColor: '#303133',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// НОВОЕ МОДАЛЬНОЕ ОКНО: Редактирование персоны
export const EditPersonModal = ({ 
  modal, 
  onModalChange, 
  onClose, 
  onConfirm 
}) => {
  if (!modal.isOpen) return null;

  return (
    <div style={STYLES.modal}>
      <div style={STYLES.modalContent}>
        <h2 style={STYLES.modalTitle}>
          Редактировать персону
          <button
            onClick={onClose}
            style={STYLES.modalCloseButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#303133'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#303133'}
          >
            ×
          </button>
        </h2>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>ФИО:</label>
          <input
            type="text"
            value={modal.name}
            onChange={(e) => onModalChange({ name: e.target.value })}
            style={STYLES.input}
            placeholder="Введите полное имя"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Пол:</label>
          <div style={STYLES.radioGroup}>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="editGender"
                checked={modal.gender === 'male'}
                onChange={() => onModalChange({ gender: 'male' })}
                style={STYLES.radioInput}
              />
              Мужской
            </label>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="editGender"
                checked={modal.gender === 'female'}
                onChange={() => onModalChange({ gender: 'female' })}
                style={STYLES.radioInput}
              />
              Женский
            </label>
          </div>
        </div>
        
        {/* НОВЫЙ КОМПОНЕНТ ЗАГРУЗКИ ФОТО */}
        <PhotoUpload
          photo={modal.photo}
          onPhotoChange={(photo) => onModalChange({ photo })}
          placeholder="Перетащите новое фото или нажмите для выбора"
        />
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Годы жизни:</label>
          <input
            type="text"
            value={modal.lifeYears}
            onChange={(e) => onModalChange({ lifeYears: e.target.value })}
            style={STYLES.input}
            placeholder="например: 1980-н.в. или 1950-2020"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Профессия:</label>
          <input
            type="text"
            value={modal.profession}
            onChange={(e) => onModalChange({ profession: e.target.value })}
            style={STYLES.input}
            placeholder="Введите профессию"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Место рождения:</label>
          <input
            type="text"
            value={modal.birthPlace}
            onChange={(e) => onModalChange({ birthPlace: e.target.value })}
            style={STYLES.input}
            placeholder="Введите место рождения"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Биография:</label>
          <textarea
            value={modal.biography}
            onChange={(e) => onModalChange({ biography: e.target.value })}
            style={STYLES.textarea}
            placeholder="Краткая биография персоны"
          />
        </div>
        
        <div style={STYLES.modalButtons}>
          <button
            onClick={onClose}
            style={{ ...STYLES.button, ...STYLES.grayButton }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{ 
              ...STYLES.button, 
              ...STYLES.greenButton,
              opacity: !modal.name.trim() ? 0.5 : 1,
              cursor: !modal.name.trim() ? 'not-allowed' : 'pointer'
            }}
            disabled={!modal.name.trim()}
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

// Модальное окно для добавления супруга
export const AddSpouseModal = ({ 
  modal, 
  onModalChange, 
  onClose, 
  onStartSelection, 
  onConfirm 
}) => {
  if (!modal.isOpen) return null;

  return (
    <div style={STYLES.modal}>
      <div style={STYLES.modalContent}>
        <h2 style={STYLES.modalTitle}>
          Добавить супруга(-у)
          <button
            onClick={onClose}
            style={STYLES.modalCloseButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#303133'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#303133'}
          >
            ×
          </button>
        </h2>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>ФИО:</label>
          <input
            type="text"
            value={modal.name}
            onChange={(e) => onModalChange({ name: e.target.value })}
            style={STYLES.input}
            placeholder="Введите полное имя"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Пол:</label>
          <div style={STYLES.radioGroup}>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="spouseGender"
                checked={modal.gender === 'male'}
                onChange={() => onModalChange({ gender: 'male' })}
                style={STYLES.radioInput}
              />
              Мужской
            </label>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="spouseGender"
                checked={modal.gender === 'female'}
                onChange={() => onModalChange({ gender: 'female' })}
                style={STYLES.radioInput}
              />
              Женский
            </label>
          </div>
        </div>
        
        {/* НОВЫЙ КОМПОНЕНТ ЗАГРУЗКИ ФОТО */}
        <PhotoUpload
          photo={modal.photo}
          onPhotoChange={(photo) => onModalChange({ photo })}
        />
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Годы жизни:</label>
          <input
            type="text"
            value={modal.lifeYears}
            onChange={(e) => onModalChange({ lifeYears: e.target.value })}
            style={STYLES.input}
            placeholder="например: 1980-н.в. или 1950-2020"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Профессия:</label>
          <input
            type="text"
            value={modal.profession}
            onChange={(e) => onModalChange({ profession: e.target.value })}
            style={STYLES.input}
            placeholder="Введите профессию"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Место рождения:</label>
          <input
            type="text"
            value={modal.birthPlace}
            onChange={(e) => onModalChange({ birthPlace: e.target.value })}
            style={STYLES.input}
            placeholder="Введите место рождения"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Биография:</label>
          <textarea
            value={modal.biography}
            onChange={(e) => onModalChange({ biography: e.target.value })}
            style={STYLES.textarea}
            placeholder="Краткая биография персоны"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Персона для добавления супруга(-и):</label>
          {modal.targetPersonId ? (
            <div style={STYLES.selectedPerson}>
              {modal.targetPersonName || `ID: ${modal.targetPersonId}`}
            </div>
          ) : (
            <button
              onClick={onStartSelection}
              style={{ ...STYLES.button, ...STYLES.blueButton, width: '100%' }}
            >
              Выбрать персону
            </button>
          )}
          <div style={STYLES.infoText}>
            После нажатия на кнопку, выберите карточку персоны на дереве.
          </div>
        </div>
        
        <div style={STYLES.modalButtons}>
          <button
            onClick={onClose}
            style={{ ...STYLES.button, ...STYLES.grayButton }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{ 
              ...STYLES.button, 
              ...STYLES.greenButton,
              opacity: !modal.name.trim() || !modal.targetPersonId ? 0.5 : 1,
              cursor: !modal.name.trim() || !modal.targetPersonId ? 'not-allowed' : 'pointer'
            }}
            disabled={!modal.name.trim() || !modal.targetPersonId}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

// Модальное окно для добавления ребенка
export const AddChildModal = ({ 
  modal, 
  onModalChange, 
  onClose, 
  onStartSelection, 
  onConfirm 
}) => {
  if (!modal.isOpen) return null;

  return (
    <div style={STYLES.modal}>
      <div style={STYLES.modalContent}>
        <h2 style={STYLES.modalTitle}>
          Добавить ребенка
          <button
            onClick={onClose}
            style={STYLES.modalCloseButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#303133'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#303133'}
          >
            ×
          </button>
        </h2>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>ФИО:</label>
          <input
            type="text"
            value={modal.name}
            onChange={(e) => onModalChange({ name: e.target.value })}
            style={STYLES.input}
            placeholder="Введите полное имя"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Пол:</label>
          <div style={STYLES.radioGroup}>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="childGender"
                value="male"
                checked={modal.gender === 'male'}
                onChange={() => onModalChange({ gender: 'male' })}
                style={STYLES.radioInput}
              />
              Мужской
            </label>
            <label style={STYLES.radioLabel}>
              <input
                type="radio"
                name="childGender"
                value="female"
                checked={modal.gender === 'female'}
                onChange={() => onModalChange({ gender: 'female' })}
                style={STYLES.radioInput}
              />
              Женский
            </label>
          </div>
        </div>
        
        {/* НОВЫЙ КОМПОНЕНТ ЗАГРУЗКИ ФОТО */}
        <PhotoUpload
          photo={modal.photo}
          onPhotoChange={(photo) => onModalChange({ photo })}
        />
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Годы жизни:</label>
          <input
            type="text"
            value={modal.lifeYears}
            onChange={(e) => onModalChange({ lifeYears: e.target.value })}
            style={STYLES.input}
            placeholder="например: 2005-н.в. или 1950-2020"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Профессия:</label>
          <input
            type="text"
            value={modal.profession}
            onChange={(e) => onModalChange({ profession: e.target.value })}
            style={STYLES.input}
            placeholder="Введите профессию"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Место рождения:</label>
          <input
            type="text"
            value={modal.birthPlace}
            onChange={(e) => onModalChange({ birthPlace: e.target.value })}
            style={STYLES.input}
            placeholder="Введите место рождения"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Биография:</label>
          <textarea
            value={modal.biography}
            onChange={(e) => onModalChange({ biography: e.target.value })}
            style={STYLES.textarea}
            placeholder="Краткая биография персоны"
          />
        </div>
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Родители:</label>
          {modal.parentId ? (
            <div style={STYLES.selectedPerson}>
              {modal.parentName}
            </div>
          ) : (
            <button
              onClick={onStartSelection}
              style={{ ...STYLES.button, ...STYLES.blueButton, width: '100%' }}
            >
              Выбрать родителя
            </button>
          )}
        </div>
        
        <div style={STYLES.modalButtons}>
          <button
            onClick={onClose}
            style={{ ...STYLES.button, ...STYLES.grayButton }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{ 
              ...STYLES.button, 
              ...STYLES.greenButton,
              opacity: !modal.name.trim() || !modal.parentId ? 0.5 : 1,
              cursor: !modal.name.trim() || !modal.parentId ? 'not-allowed' : 'pointer'
            }}
            disabled={!modal.name.trim() || !modal.parentId}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};