// Frontend\src\constants\treeConstants.js

// Константы для размеров и отступов
export const TREE_CONSTANTS = {
  PERSON_WIDTH: 250,
  PERSON_HEIGHT: 140,
  VERTICAL_GAP: 180, // УВЕЛИЧЕНО: было 140, стало 180
  HORIZONTAL_GAP: 100, // УВЕЛИЧЕНО: было 60, стало 100
  BRANCH_GAP: 200, // УВЕЛИЧЕНО: было 120, стало 200
  MIN_SCALE: 0.1,
  MAX_SCALE: 2,
  ZOOM_FACTOR: 1.1,
  DRAG_THRESHOLD: 5,
  // НОВЫЕ КОНСТАНТЫ для улучшенного позиционирования
  MIN_CHILD_SPACING: 50, // Минимальное расстояние между детьми
  SPOUSE_GAP: 80, // Расстояние между супругами
  GENERATION_PADDING: 100, // Дополнительный отступ между поколениями
};

// Стили для компонентов
export const STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#ffffffc3',
    padding: '1rem',
    fontFamily: 'Montserrat, sans-serif',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '600',
    color: '#303133',
    marginBottom: '1rem',
    fontFamily: 'Montserrat, sans-serif',
  },
  svgContainer: {
    width: '100%',
    height: '80vh',
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1), 0 2px 4px -1px rgba(48, 49, 51, 0.06)',
    position: 'relative',
    marginBottom: '1rem',
  },
  activeMode: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    backgroundColor: '#c0a282',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    boxShadow: '0 1px 2px 0 rgba(48, 49, 51, 0.05)',
    zIndex: 10,
    fontSize: '0.875rem',
    fontFamily: 'Montserrat, sans-serif',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#303133',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    boxShadow: '0 2px 10px rgba(48, 49, 51, 0.2)',
    zIndex: 100,
    opacity: 1,
    transition: 'opacity 0.3s ease',
    fontFamily: 'Montserrat, sans-serif',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    border: 'none',
    fontWeight: '500',
    fontFamily: 'Montserrat, sans-serif',
  },
  greenButton: {
    backgroundColor: '#c0a282',
    color: 'white',
  },
  purpleButton: {
    backgroundColor: '#c0a282',
    color: 'white',
  },
  blueButton: {
    backgroundColor: '#c0a282',
    color: 'white',
  },
  grayButton: {
    backgroundColor: '#ffffffc3',
    color: '#303133',
    border: '1px solid #c0a282',
  },
  defaultViewButton: {
    backgroundColor: '#ffffffc3',
    color: '#303133',
    border: '1px solid #c0a282',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  instructionPanel: {
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(48, 49, 51, 0.1), 0 2px 4px -1px rgba(48, 49, 51, 0.06)',
    width: '100%',
    maxWidth: '28rem',
    fontFamily: 'Montserrat, sans-serif',
  },
  instructionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#303133',
    fontFamily: 'Montserrat, sans-serif',
  },
  instructionItems: {
    listStyleType: 'disc',
    paddingLeft: '1.25rem',
    lineHeight: '1.5',
    color: '#303133',
  },
  instructionItem: {
    marginBottom: '0.25rem',
  },
  // Стили для модальных окон
  modal: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(48, 49, 51, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 25px 50px -12px rgba(48, 49, 51, 0.25)',
    width: '100%',
    maxWidth: '32rem',
    maxHeight: '90vh',
    overflowY: 'auto',
    fontFamily: 'Montserrat, sans-serif',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    position: 'relative',
    color: '#303133',
    fontFamily: 'Montserrat, sans-serif',
  },
  modalCloseButton: {
    position: 'absolute',
    top: '-0.5rem',
    right: '-0.5rem',
    background: '#303133',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(48, 49, 51, 0.2)',
    transition: 'background-color 0.2s ease',
    fontFamily: 'Montserrat, sans-serif',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    color: '#303133',
    marginBottom: '0.5rem',
    fontWeight: '500',
    fontFamily: 'Montserrat, sans-serif',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #c0a282',
    borderRadius: '0.25rem',
    boxSizing: 'border-box',
    fontFamily: 'Montserrat, sans-serif',
    color: '#303133',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #c0a282',
    borderRadius: '0.25rem',
    boxSizing: 'border-box',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'Montserrat, sans-serif',
    color: '#303133',
  },
  radioGroup: {
    display: 'flex',
    gap: '1rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Montserrat, sans-serif',
    color: '#303133',
  },
  radioInput: {
    marginRight: '0.5rem',
  },
  selectedPerson: {
    padding: '0.5rem',
    backgroundColor: '#c0a282',
    color: 'white',
    borderRadius: '0.25rem',
    border: '1px solid #c0a282',
    fontFamily: 'Montserrat, sans-serif',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1.5rem',
  },
  selectionModeNotice: {
    position: 'fixed',
    top: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(48, 49, 51, 0.1), 0 4px 6px -2px rgba(48, 49, 51, 0.05)',
    zIndex: 50,
    maxWidth: '48rem',
    textAlign: 'center',
    color: 'white',
    backgroundColor: '#c0a282',
    fontFamily: 'Montserrat, sans-serif',
  },
  selectionModeTitle: {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  selectionModeButton: {
    marginTop: '0.5rem',
    backgroundColor: 'white',
    color: '#303133',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Montserrat, sans-serif',
  },
  infoText: {
    fontSize: '12px',
    color: '#303133',
    marginTop: '0.5rem',
    fontStyle: 'italic',
    fontFamily: 'Montserrat, sans-serif',
  },
};

// Стили для узлов дерева - ВСЕ КАРТОЧКИ ОДНОГО ЦВЕТА
export const NODE_STYLES = {
  // Единый стиль для всех карточек
  maleNode: {
    fill: '#ffffffc3',
    stroke: '#c0a282',
    strokeWidth: 2,
    transition: 'fill 0.3s, stroke 0.3s, stroke-width 0.3s, opacity 0.3s',
  },
  femaleNode: {
    fill: '#ffffffc3',
    stroke: '#c0a282',
    strokeWidth: 2,
    transition: 'fill 0.3s, stroke 0.3s, stroke-width 0.3s, opacity 0.3s',
  },
  selectedMaleNode: {
    stroke: '#303133',
    transition: 'stroke 0.3s',
  },
  selectedFemaleNode: {
    stroke: '#303133',
    transition: 'stroke 0.3s',
  },
  parentSelectionNode: {
    fill: '#c0a282',
    stroke: '#303133',
    transition: 'fill 0.3s, stroke 0.3s',
  },
  spouseSelectionNode: {
    fill: '#c0a282',
    stroke: '#303133',
    transition: 'fill 0.3s, stroke 0.3s',
  },
  disabledNode: {
    fill: '#ffffffc3',
    stroke: '#c0a282',
    opacity: 0.5,
    transition: 'fill 0.3s, stroke 0.3s',
  },
  nodeText: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '13px',
    fontWeight: '600',
    fill: '#303133',
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    transition: 'opacity 0.3s',
  },
  nodeSubText: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '11px',
    fill: '#303133',
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    transition: 'opacity 0.3s',
  },
  connection: {
    stroke: '#c0a282',
    strokeWidth: 2,
    transition: 'opacity 0.5s, stroke-dasharray 0.5s',
  },
  nodeWithHiddenGen: {
    stroke: '#c0a282',      // ← ИСПРАВЛЕНО: тот же цвет что и обычные
    strokeDasharray: '5,5', // ← НОВОЕ: пунктирная линия для индикации
    strokeWidth: 2,         // ← ИСПРАВЛЕНО: такая же толщина
    transition: 'stroke 0.3s, stroke-width 0.3s',
  },
  // Стили для кнопок на линиях
  lineToggleButton: {
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  lineToggleButtonBackground: {
    fill: 'white',
    stroke: '#c0a282',
    strokeWidth: 2,
    filter: 'drop-shadow(0 2px 6px rgba(192, 162, 130, 0.25))',
  },
  lineToggleButtonIcon: {
    stroke: '#c0a282',
    strokeWidth: 2,
    strokeLinecap: 'round',
  },
  // Стили для индикации скрытого поколения
  hiddenIndicatorText: {
    fontSize: '12px',
    fill: '#303133',
    fontStyle: 'italic',
    textAnchor: 'start',
    dominantBaseline: 'middle',
    fontFamily: 'Montserrat, sans-serif',
  },
  // Стили для иконки ветки родственника
  branchIcon: {
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  branchIconVisible: {
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.3s ease',
  },
  branchIconBackground: {
    fill: 'white',
    stroke: '#c0a282',
    strokeWidth: 2,
    filter: 'drop-shadow(0 2px 6px rgba(192, 162, 130, 0.25))',
  },
  branchIconBackgroundActive: {
    fill: '#c0a282',
    stroke: '#c0a282',
    strokeWidth: 2,
    filter: 'drop-shadow(0 2px 6px rgba(192, 162, 130, 0.4))',
  },
  branchIconTree: {
    stroke: '#c0a282',
    strokeWidth: 2,
    strokeLinecap: 'round',
    fill: 'none',
  },
  branchIconTreeActive: {
    stroke: 'white',
    strokeWidth: 2,
    strokeLinecap: 'round',
    fill: 'none',
  },
  // Стили для узлов при фильтрации по ветке
  filteredNode: {
    opacity: 0.3,
    transition: 'opacity 0.3s ease',
  },
  // Стили для модального окна с информацией о персоне
  personInfoModal: {
    display: 'flex',
    gap: '1rem',
  },
  personPhoto: {
    width: '120px',
    height: '120px',
    borderRadius: '8px',
    objectFit: 'cover',
    backgroundColor: '#ffffffc3',
    border: '2px solid #c0a282',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#303133',
    fontFamily: 'Montserrat, sans-serif',
  },
  personField: {
    marginBottom: '0.75rem',
  },
  fieldLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#303133',
    marginBottom: '0.25rem',
    fontFamily: 'Montserrat, sans-serif',
  },
  fieldValue: {
    fontSize: '0.875rem',
    color: '#303133',
    lineHeight: '1.4',
    fontFamily: 'Montserrat, sans-serif',
  },
  // Стили для фото на карточке
  cardPhoto: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    backgroundColor: '#ffffffc3',
    border: '1px solid #c0a282',
  },
  defaultPhoto: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffffffc3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#c0a282',
    border: '1px solid #c0a282',
  },
};