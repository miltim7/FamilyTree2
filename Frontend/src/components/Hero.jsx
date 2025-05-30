import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Базовые стили
    const baseHeroStyle = {
        backgroundImage: 'url(/assets/hero.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(2px)'
    };

    // Адаптивные вычисления
    const getResponsiveStyles = () => {
        const { width } = windowSize;
        const styles = {
            heroStyle: {},
            cardStyle: {},
            titleStyle: {},
            subtitleStyle: {},
            buttonsStyle: {},
            buttonStyle: {}
        };

        // Высота героя
        styles.heroStyle = {
            ...baseHeroStyle,
            height: width < 768 ? '100vh' : 'calc(100vh - 80px)',
            marginTop: width < 768 ? '0' : '-43px',
            padding: width < 480 ? '1rem' : '2rem 1rem'
        };

        // Стили карточки
        let cardPadding, cardWidth;
        if (width < 320) {
            cardPadding = '1.2rem';
            cardWidth = '96%';
        } else if (width < 480) {
            cardPadding = '1.5rem';
            cardWidth = '94%';
        } else if (width < 768) {
            cardPadding = '1.8rem';
            cardWidth = '92%';
        } else {
            cardPadding = '2.5rem 3rem';
            cardWidth = '90%';
        }
        
        styles.cardStyle = {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: cardPadding,
            textAlign: 'center',
            maxWidth: '1000px',
            width: cardWidth,
            boxShadow: '0 25px 50px -12px rgba(48, 49, 51, 0.25)',
            border: '1px solid rgba(192, 162, 130, 0.2)',
            position: 'relative',
            zIndex: 2
        };

        // Заголовок
        let titleFontSize;
        if (width < 320) titleFontSize = '1.5rem';
        else if (width < 480) titleFontSize = '1.7rem';
        else if (width < 576) titleFontSize = '2rem';
        else if (width < 768) titleFontSize = '2.2rem';
        else if (width < 992) titleFontSize = '2.5rem';
        else titleFontSize = '3rem';
        
        styles.titleStyle = {
            fontFamily: "'Miroslav', Arial, sans-serif",
            fontSize: titleFontSize,
            color: 'rgb(207, 170, 99)',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
            textShadow: '1px 1px 2px rgba(48, 49, 51, 0.1)',
            letterSpacing: '0.5px'
        };

        // Подзаголовок
        let subtitleFontSize;
        if (width < 320) subtitleFontSize = '0.8rem';
        else if (width < 480) subtitleFontSize = '0.9rem';
        else if (width < 576) subtitleFontSize = '1rem';
        else if (width < 768) subtitleFontSize = '1.1rem';
        else subtitleFontSize = '1.2rem';
        
        styles.subtitleStyle = {
            fontSize: subtitleFontSize,
            color: '#303133',
            lineHeight: '1.6',
            marginBottom: '2rem',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '400',
            maxWidth: '800px',
            margin: '0 auto 2rem auto'
        };

        // Контейнер кнопок
        styles.buttonsStyle = {
            display: 'flex',
            gap: width < 480 ? '0.8rem' : '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexDirection: width < 576 ? 'column' : 'row',
            alignItems: 'center'
        };

        // Кнопки
        let buttonPadding, buttonMinWidth, buttonFontSize;
        if (width < 320) {
            buttonPadding = '0.7rem 1.2rem';
            buttonMinWidth = '140px';
            buttonFontSize = '0.9rem';
        } else if (width < 480) {
            buttonPadding = '0.8rem 1.5rem';
            buttonMinWidth = '150px';
            buttonFontSize = '1rem';
        } else {
            buttonPadding = '1.2rem 2.5rem';
            buttonMinWidth = '180px';
            buttonFontSize = '1.1rem';
        }
        
        styles.buttonStyle = {
            borderRadius: '0.5rem',
            padding: buttonPadding,
            fontSize: buttonFontSize,
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
            transition: 'all 0.2s ease',
            minWidth: buttonMinWidth,
            textAlign: 'center'
        };

        return styles;
    };

    const {
        heroStyle,
        cardStyle,
        titleStyle,
        subtitleStyle,
        buttonsStyle,
        buttonStyle
    } = getResponsiveStyles();

    const primaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#303133',
        color: 'white',
        border: 'none',
        textDecoration: 'none'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        color: '#303133',
        border: '2px solid #c0a282'
    };

    return (
        <div style={heroStyle}>
            <div style={overlayStyle}></div>
            <div style={cardStyle}>
                <h1 style={titleStyle}>
                    Добро пожаловать на сайт, посвященный родословной семьи Шуховцевых!
                </h1>

                <p style={subtitleStyle}>
                    Здесь вы сможете узнать о богатой истории и наследии семьи, исследовать
                    генеалогическое древо и прочитать статьи о предках. История семьи Шуховцевых — это
                    наша общая память!
                </p>

                <div style={buttonsStyle}>
                    <a
                        onClick={() => {
                            const offset = 80;
                            const element = document.getElementById('tree-container');
                            if (element) {
                                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                                const offsetPosition = elementPosition - offset;

                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth',
                                });
                            }
                        }}
                        style={primaryButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1a1a1a';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(48, 49, 51, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#303133';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Семейное Древо
                    </a>

                    <button
                        style={secondaryButtonStyle}
                        onClick={() => navigate('/articles')}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#c0a282';
                            e.target.style.color = 'white';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(192, 162, 130, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#303133';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Статьи
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;