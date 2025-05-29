// Frontend\src\components\Modals.jsx

import React from 'react';
import { STYLES, NODE_STYLES } from '../constants/treeConstants';

// Модальное окно с информацией о персоне
export const PersonInfoModal = ({ modal, onClose }) => {
  if (!modal.isOpen || !modal.person) return null;

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
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Фотография (URL):</label>
          <input
            type="text"
            value={modal.photo}
            onChange={(e) => onModalChange({ photo: e.target.value })}
            style={STYLES.input}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
        
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
        
        <div style={STYLES.formGroup}>
          <label style={STYLES.label}>Фотография (URL):</label>
          <input
            type="text"
            value={modal.photo}
            onChange={(e) => onModalChange({ photo: e.target.value })}
            style={STYLES.input}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
        
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