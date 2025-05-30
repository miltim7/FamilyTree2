// Frontend\src\components\Navigation.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLoginModal from './AdminLoginModal';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, login, logout } = useAuth();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const handleAuthClick = () => {
        if (isAuthenticated) {
            logout();
        } else {
            setLoginModalOpen(true);
        }
    };

    const handleLogin = async (password) => {
        return await login(password);
    };

    // Базовые стили для фиксированной навигации
    const baseNavStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#ffffffc3',
        borderBottom: '1px solid #c0a282',
        fontFamily: 'Montserrat, sans-serif',
        boxShadow: '0 2px 8px rgba(48, 49, 51, 0.15)',
        backdropFilter: 'blur(10px)'
    };

    // Общий стиль для иконок соцсетей
    const socialIconStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        WebkitTapHighlightColor: 'transparent', // Убирает подсветку на мобильных
        ':hover': {
            backgroundColor: 'transparent'
        },
        ':active': {
            backgroundColor: 'transparent'
        }
    };

    if (isMobile) {
        return (
            <div>
                <nav style={{
                    ...baseNavStyle,
                    padding: '0.75rem 1rem',
                    minHeight: '140px' // ТОЧНАЯ высота для мобильных
                }}>
                    {/* Логотип */}
                    <div onClick={() => navigate('/')}
                        style={{
                            fontFamily: "'Miroslav', Arial, sans-serif",
                            fontSize: '1.25rem',
                            color: '#303133',
                            textAlign: 'center',
                            marginBottom: '0.75rem',
                            lineHeight: '1.2',
                            cursor: 'pointer'
                        }}>
                        Шуховцевы-Шеховцевы
                    </div>

                    {/* Кнопки навигации */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                    }}>
                        <a href="/#tree-container" onClick={(e) => {
                            if (location.pathname === '/') {
                                e.preventDefault();
                                const el = document.getElementById('tree-container');
                                if (el) {
                                    const y = el.getBoundingClientRect().top + window.scrollY - 140;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                }
                            }
                        }}
                            style={{
                                flex: 1,
                                padding: '0.6rem 0.5rem',
                                border: '1px solid #c0a282',
                                borderRadius: '0.375rem',
                                backgroundColor: location.pathname === '/' ? '#c0a282' : '#ffffffc3',
                                color: location.pathname === '/' ? 'white' : '#303133',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '0.85rem',
                                fontWeight: '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none'
                            }}
                        >
                            Семейное древо
                        </a>

                        <button
                            onClick={() => navigate('/articles')}
                            style={{
                                flex: 1,
                                padding: '0.6rem 0.5rem',
                                border: '1px solid #c0a282',
                                borderRadius: '0.375rem',
                                backgroundColor: location.pathname.includes('/articles') ? '#c0a282' : '#ffffffc3',
                                color: location.pathname.includes('/articles') ? 'white' : '#303133',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Статьи
                        </button>
                    </div>

                    {/* Нижняя панель */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.7rem',
                            color: '#303133'
                        }}>
                            <span>Вопросы →</span>

                            <a
                                href="https://vk.com/history_shukhovtsev"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    ...socialIconStyle,
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f8f8f8'
                                }}
                                title="ВКонтакте"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="16" height="16" fill="#CFAA62">
                                    <path d="M235.25 76.72c1.57-5.2 0-9-7.4-9h-24.5c-6.2 0-9.05 3.27-10.6 6.87 0 0-12.4 30.1-30 49.6-5.7 5.7-8.3 7.5-11.4 7.5-1.57 0-3.8-1.8-3.8-6.98V76.72c0-6.2-1.8-9-7-9h-38.6c-4 0-6.3 2.9-6.3 5.6 0 5.8 8.6 7.2 9.5 23.6v35.6c0 7.8-1.4 9.2-4.5 9.2-8.3 0-28.5-30.5-40.5-65.3-2.4-6.9-4.7-9.6-10.9-9.6H30.4c-7 0-8.4 3.3-8.4 6.8 0 6.3 8.3 37.6 38.6 78.9 20.2 28.9 48.6 44.5 74.3 44.5 15.5 0 17.4-3.5 17.4-9.6v-22.3c0-6.9 1.5-8.2 6.3-8.2 3.6 0 9.8 1.8 24.2 15.3 16.5 16.5 19.2 24.2 28.5 24.2h24.5c7 0 10.5-3.5 8.5-10.4-2.2-6.9-10.2-17-20.6-29.1-5.7-6.7-14.2-14-16.7-17.7-3.6-4.8-2.6-7 0-11.3-.1 0 29.4-41.3 32.5-55.3Z" />
                                </svg>
                            </a>

                            <a
                                href="https://api.whatsapp.com/send/?phone=79000880989&text=Здравствуйте! У меня есть вопрос по семейному древу Шуховцевых-Шеховцевых"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    ...socialIconStyle,
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f8f8f8'
                                }}
                                title="WhatsApp"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="14" height="14" fill="#CFAA62">
                                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                                </svg>
                            </a>
                        </div>

                        <button
                            onClick={handleAuthClick}
                            style={{
                                padding: '0.5rem',
                                border: '1px solid #c0a282',
                                borderRadius: '0.375rem',
                                backgroundColor: isAuthenticated ? '#c0a282' : '#ffffffc3',
                                color: isAuthenticated ? 'white' : '#c0a282',
                                cursor: 'pointer',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            title={isAuthenticated ? 'Выйти из админ панели' : 'Войти в админ панель'}
                        >
                            {isAuthenticated ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16,17 21,12 16,7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <circle cx="12" cy="16" r="1" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            )}
                        </button>
                    </div>
                </nav>

                <AdminLoginModal
                    isOpen={loginModalOpen}
                    onClose={() => setLoginModalOpen(false)}
                    onLogin={handleLogin}
                />
            </div>
        );
    }

    // Десктопная версия
    return (
        <div>
            <nav style={{
                ...baseNavStyle,
                padding: '1rem 2rem',
                minHeight: '80px', // ТОЧНАЯ высота для десктопа
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div onClick={() => navigate('/')}
                    style={{
                        fontFamily: "'Miroslav', Arial, sans-serif",
                        fontSize: '1.7rem',
                        color: '#303133',
                        cursor: 'pointer'
                    }}>
                    Шуховцевы-Шеховцевы
                </div>

                <div style={{
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <a href="/#tree-container" onClick={(e) => {
                        if (location.pathname === '/') {
                            e.preventDefault();
                            const el = document.getElementById('tree-container');
                            if (el) {
                                const y = el.getBoundingClientRect().top + window.scrollY - 80;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                            }
                        }
                    }}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #c0a282',
                            borderRadius: '0.375rem',
                            backgroundColor: location.pathname === '/' ? '#c0a282' : '#ffffffc3',
                            color: location.pathname === '/' ? 'white' : '#303133',
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textDecoration: 'none'
                        }}
                    >
                        Семейное древо
                    </a>

                    <button
                        onClick={() => navigate('/articles')}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #c0a282',
                            borderRadius: '0.375rem',
                            backgroundColor: location.pathname.includes('/articles') ? '#c0a282' : '#ffffffc3',
                            color: location.pathname.includes('/articles') ? 'white' : '#303133',
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Статьи
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#303133'
                    }}>
                        <span>По любым вопросам →</span>

                        <a
                            href="https://vk.com/history_shukhovtsev"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                ...socialIconStyle,
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                backgroundColor: '#f8f8f8'
                            }}
                            title="ВКонтакте"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="32" height="32" fill="#CFAA62">
                                <path d="M235.25 76.72c1.57-5.2 0-9-7.4-9h-24.5c-6.2 0-9.05 3.27-10.6 6.87 0 0-12.4 30.1-30 49.6-5.7 5.7-8.3 7.5-11.4 7.5-1.57 0-3.8-1.8-3.8-6.98V76.72c0-6.2-1.8-9-7-9h-38.6c-4 0-6.3 2.9-6.3 5.6 0 5.8 8.6 7.2 9.5 23.6v35.6c0 7.8-1.4 9.2-4.5 9.2-8.3 0-28.5-30.5-40.5-65.3-2.4-6.9-4.7-9.6-10.9-9.6H30.4c-7 0-8.4 3.3-8.4 6.8 0 6.3 8.3 37.6 38.6 78.9 20.2 28.9 48.6 44.5 74.3 44.5 15.5 0 17.4-3.5 17.4-9.6v-22.3c0-6.9 1.5-8.2 6.3-8.2 3.6 0 9.8 1.8 24.2 15.3 16.5 16.5 19.2 24.2 28.5 24.2h24.5c7 0 10.5-3.5 8.5-10.4-2.2-6.9-10.2-17-20.6-29.1-5.7-6.7-14.2-14-16.7-17.7-3.6-4.8-2.6-7 0-11.3-.1 0 29.4-41.3 32.5-55.3Z" />
                            </svg>
                        </a>

                        <a
                            href="https://api.whatsapp.com/send/?phone=79000880989&text=Здравствуйте! У меня есть вопрос по семейному древу Шуховцевых-Шеховцевых"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                ...socialIconStyle,
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                backgroundColor: '#f8f8f8'
                            }}
                            title="WhatsApp"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="30" height="30" fill="#CFAA62">
                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                            </svg>
                        </a>
                    </div>

                    <button
                        onClick={handleAuthClick}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #c0a282',
                            borderRadius: '0.375rem',
                            backgroundColor: isAuthenticated ? '#c0a282' : '#ffffffc3',
                            color: isAuthenticated ? 'white' : '#c0a282',
                            cursor: 'pointer',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        title={isAuthenticated ? 'Выйти из админ панели' : 'Войти в админ панель'}
                    >
                        {isAuthenticated ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16,17 21,12 16,7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        )}
                    </button>
                </div>
            </nav>

            <AdminLoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onLogin={handleLogin}
            />
        </div>
    );
};

export default Navigation;