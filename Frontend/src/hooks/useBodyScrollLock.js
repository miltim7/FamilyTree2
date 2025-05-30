// Frontend\src\hooks\useBodyScrollLock.js

import { useEffect } from 'react';

export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      
      // Блокируем скролл
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // При размонтировании восстанавливаем скролл
      return () => {
        // ИСПРАВЛЕНИЕ: Временно отключаем плавный скролл
        const originalBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        
        // Восстанавливаем стили
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Мгновенно возвращаемся к сохраненной позиции
        window.scrollTo(0, scrollY);
        
        // Восстанавливаем исходное поведение скролла
        requestAnimationFrame(() => {
          document.documentElement.style.scrollBehavior = originalBehavior;
        });
      };
    }
  }, [isLocked]);
};