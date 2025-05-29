// Frontend\src\components\PhotoUpload.jsx

import React, { useState, useRef } from 'react';
import { STYLES } from '../constants/treeConstants';

const PhotoUpload = ({ photo, onPhotoChange, placeholder = "Перетащите фото сюда или нажмите для выбора" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(photo || '');
  const fileInputRef = useRef(null);

  // Конвертация файла в base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Обработка файлов
  const handleFiles = async (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        setPreviewUrl(base64);
        onPhotoChange(base64);
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        alert('Ошибка при загрузке файла');
      }
    }
  };

  // Drag & Drop обработчики
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // Клик по области загрузки
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Выбор файла через input
  const handleFileSelect = (e) => {
    const files = e.target.files;
    handleFiles(files);
  };

  // Удаление фото
  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Обновляем preview при изменении внешнего photo
  React.useEffect(() => {
    setPreviewUrl(photo || '');
  }, [photo]);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={STYLES.label}>Фотография:</label>
      
      {/* Область загрузки */}
      <div
        style={{
          border: `2px dashed ${isDragging ? '#c0a282' : '#c0a282'}`,
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#ffffffc3' : 'white',
          transition: 'all 0.3s ease',
          position: 'relative',
          minHeight: previewUrl ? '200px' : '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={previewUrl}
              alt="Предварительный просмотр"
              style={{
                maxWidth: '100%',
                maxHeight: '160px',
                borderRadius: '4px',
                objectFit: 'contain'
              }}
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: '#303133',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Montserrat, sans-serif'
              }}
              title="Удалить фото"
            >
              ×
            </button>
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#303133',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Нажмите для замены фото
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              fontSize: '48px',
              color: '#c0a282',
              marginBottom: '8px'
            }}>
              📷
            </div>
            <div style={{
              fontSize: '14px',
              color: '#303133',
              fontFamily: 'Montserrat, sans-serif',
              textAlign: 'center'
            }}>
              {placeholder}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#303133',
              fontFamily: 'Montserrat, sans-serif',
              marginTop: '4px',
              opacity: 0.7
            }}>
              Поддерживаются: JPG, PNG, GIF (до 5MB)
            </div>
          </div>
        )}
      </div>

      {/* Скрытый input для выбора файлов */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Поле для URL (дополнительная опция) */}
      <div style={{ marginTop: '8px' }}>
        <input
          type="text"
          value={previewUrl.startsWith('data:') ? '' : previewUrl}
          onChange={(e) => {
            const url = e.target.value;
            setPreviewUrl(url);
            onPhotoChange(url);
          }}
          style={STYLES.input}
          placeholder="Или вставьте ссылку на фото"
        />
      </div>
    </div>
  );
};

export default PhotoUpload;