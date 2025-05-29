// Backend\server.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Пути к файлам
const DATA_FILE = path.join(__dirname, 'data', 'family-data.json');
const ARTICLES_FILE = path.join(__dirname, 'data', 'articles.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Увеличиваем лимит для фотографий
app.use(morgan('combined'));

// Инициализация данных при старте сервера
const initializeData = async () => {
    try {
        await fs.ensureDir(path.dirname(DATA_FILE));
        await fs.ensureDir(path.dirname(ARTICLES_FILE));
        await fs.ensureDir(BACKUP_DIR);
        
        // Инициализация семейных данных
        const dataExists = await fs.pathExists(DATA_FILE);
        if (!dataExists) {
            const defaultData = {
                id: "root-1",
                name: "Основатель рода",
                gender: "male",
                photo: null,
                lifeYears: "1900-1980",
                profession: "Основатель семьи",
                birthPlace: "Россия",
                biography: "Здесь будет история основателя вашего рода",
                spouse: null,
                children: []
            };
            
            await fs.writeJSON(DATA_FILE, defaultData, { spaces: 2 });
            console.log('Создан файл данных по умолчанию');
        }

        // Инициализация файла статей
        const articlesExists = await fs.pathExists(ARTICLES_FILE);
        if (!articlesExists) {
            const defaultArticles = [];
            await fs.writeJSON(ARTICLES_FILE, defaultArticles, { spaces: 2 });
            console.log('Создан файл статей по умолчанию');
        }
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
};

// Утилиты для работы с данными
const readFamilyData = async () => {
    try {
        const data = await fs.readJSON(DATA_FILE);
        return data;
    } catch (error) {
        console.error('Ошибка чтения данных:', error);
        throw new Error('Не удалось загрузить данные семьи');
    }
};

const writeFamilyData = async (data) => {
    try {
        await fs.writeJSON(DATA_FILE, data, { spaces: 2 });
        console.log('Данные сохранены');
        return true;
    } catch (error) {
        console.error('Ошибка записи данных:', error);
        throw new Error('Не удалось сохранить данные');
    }
};

// НОВЫЕ УТИЛИТЫ: Работа со статьями
const readArticlesData = async () => {
    try {
        const data = await fs.readJSON(ARTICLES_FILE);
        return data;
    } catch (error) {
        console.error('Ошибка чтения статей:', error);
        throw new Error('Не удалось загрузить статьи');
    }
};

const writeArticlesData = async (data) => {
    try {
        await fs.writeJSON(ARTICLES_FILE, data, { spaces: 2 });
        console.log('Статьи сохранены');
        return true;
    } catch (error) {
        console.error('Ошибка записи статей:', error);
        throw new Error('Не удалось сохранить статьи');
    }
};

// Поиск персоны в дереве
const findPersonById = (root, targetId) => {
    if (!root || !targetId) return null;
    
    const normalizedId = targetId.replace(/-spouse$/, '');
    
    if (root.id === normalizedId) {
        return root;
    }
    
    if (root.children && Array.isArray(root.children)) {
        for (const child of root.children) {
            if (!child) continue;
            const found = findPersonById(child, normalizedId);
            if (found) return found;
        }
    }
    
    return null;
};

// Поиск и удаление персоны из дерева
const removePersonById = (root, targetId) => {
    if (!root || !targetId) return false;
    
    if (root.children && Array.isArray(root.children)) {
        const initialLength = root.children.length;
        root.children = root.children.filter(child => child && child.id !== targetId);
        
        if (root.children.length < initialLength) {
            return true; // Персона была удалена
        }
        
        // Рекурсивно ищем в детях
        for (const child of root.children) {
            if (child && removePersonById(child, targetId)) {
                return true;
            }
        }
    }
    
    return false;
};

// API ROUTES

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Получить все данные семьи
app.get('/api/family', async (req, res) => {
    try {
        const familyData = await readFamilyData();
        res.json({
            success: true,
            data: familyData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Добавить ребенка
app.post('/api/family/child', async (req, res) => {
    try {
        const { parentId, childData } = req.body;
        
        if (!parentId || !childData?.name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Не указан родитель или имя ребенка'
            });
        }
        
        const familyData = await readFamilyData();
        const parent = findPersonById(familyData, parentId);
        
        if (!parent) {
            return res.status(404).json({
                success: false,
                message: 'Родитель не найден'
            });
        }
        
        const newChild = {
            id: uuidv4(),
            name: childData.name.trim(),
            gender: childData.gender || 'male',
            photo: childData.photo || null,
            lifeYears: childData.lifeYears || '',
            profession: childData.profession || '',
            birthPlace: childData.birthPlace || '',
            biography: childData.biography || '',
            spouse: null,
            children: []
        };
        
        if (!parent.children) {
            parent.children = [];
        }
        parent.children.push(newChild);
        
        await writeFamilyData(familyData);
        
        res.json({
            success: true,
            message: 'Ребенок успешно добавлен',
            data: familyData,
            newChild: newChild
        });
        
    } catch (error) {
        console.error('Ошибка добавления ребенка:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при добавлении ребенка'
        });
    }
});

// Добавить супруга
app.post('/api/family/spouse', async (req, res) => {
    try {
        const { personId, spouseData } = req.body;
        
        if (!personId || !spouseData?.name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Не указана персона или имя супруга'
            });
        }
        
        const familyData = await readFamilyData();
        const person = findPersonById(familyData, personId);
        
        if (!person) {
            return res.status(404).json({
                success: false,
                message: 'Персона не найдена'
            });
        }
        
        if (person.spouse) {
            return res.status(400).json({
                success: false,
                message: 'У этой персоны уже есть супруг(-а)'
            });
        }
        
        const newSpouse = {
            name: spouseData.name.trim(),
            gender: spouseData.gender || 'female',
            photo: spouseData.photo || null,
            lifeYears: spouseData.lifeYears || '',
            profession: spouseData.profession || '',
            birthPlace: spouseData.birthPlace || '',
            biography: spouseData.biography || ''
        };
        
        person.spouse = newSpouse;
        
        await writeFamilyData(familyData);
        
        res.json({
            success: true,
            message: 'Супруг(-а) успешно добавлен(-а)',
            data: familyData
        });
        
    } catch (error) {
        console.error('Ошибка добавления супруга:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при добавлении супруга'
        });
    }
});

// Редактировать персону
app.put('/api/family/person/:personId', async (req, res) => {
    try {
        const { personId } = req.params;
        const { personData, isSpouse } = req.body;
        
        if (!personId || !personData?.name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Не указан ID персоны или новые данные'
            });
        }
        
        const familyData = await readFamilyData();
        const person = findPersonById(familyData, personId);
        
        if (!person) {
            return res.status(404).json({
                success: false,
                message: 'Персона не найдена'
            });
        }
        
        const targetPerson = isSpouse ? person.spouse : person;
        
        if (!targetPerson) {
            return res.status(404).json({
                success: false,
                message: 'Целевая персона не найдена'
            });
        }
        
        // Обновляем данные персоны
        targetPerson.name = personData.name.trim();
        targetPerson.gender = personData.gender || targetPerson.gender;
        targetPerson.photo = personData.photo || null;
        targetPerson.lifeYears = personData.lifeYears || '';
        targetPerson.profession = personData.profession || '';
        targetPerson.birthPlace = personData.birthPlace || '';
        targetPerson.biography = personData.biography || '';
        
        await writeFamilyData(familyData);
        
        res.json({
            success: true,
            message: 'Данные персоны успешно обновлены',
            data: familyData
        });
        
    } catch (error) {
        console.error('Ошибка редактирования персоны:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при редактировании персоны'
        });
    }
});

// Удалить персону
app.delete('/api/family/person/:personId', async (req, res) => {
    try {
        const { personId } = req.params;
        const { isSpouse } = req.body;
        
        if (!personId) {
            return res.status(400).json({
                success: false,
                message: 'Не указан ID персоны'
            });
        }
        
        const familyData = await readFamilyData();
        
        if (isSpouse) {
            // Удаляем супруга
            const person = findPersonById(familyData, personId);
            if (!person || !person.spouse) {
                return res.status(404).json({
                    success: false,
                    message: 'Супруг не найден'
                });
            }
            
            person.spouse = null;
        } else {
            // Проверяем, что это не корневая персона
            if (familyData.id === personId) {
                return res.status(400).json({
                    success: false,
                    message: 'Нельзя удалить основателя рода'
                });
            }
            
            // Удаляем персону из дерева
            const removed = removePersonById(familyData, personId);
            if (!removed) {
                return res.status(404).json({
                    success: false,
                    message: 'Персона не найдена для удаления'
                });
            }
        }
        
        await writeFamilyData(familyData);
        
        res.json({
            success: true,
            message: isSpouse ? 'Супруг успешно удален' : 'Персона успешно удалена',
            data: familyData
        });
        
    } catch (error) {
        console.error('Ошибка удаления персоны:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при удалении персоны'
        });
    }
});

// НОВЫЕ API ROUTES ДЛЯ СТАТЕЙ

// Получить все статьи
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await readArticlesData();
        res.json({
            success: true,
            data: articles,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Получить статьи конкретной персоны
app.get('/api/articles/person/:personId', async (req, res) => {
    try {
        const { personId } = req.params;
        const articles = await readArticlesData();
        const personArticles = articles.filter(article => article.personId === personId);
        
        res.json({
            success: true,
            data: personArticles,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Получить конкретную статью
app.get('/api/articles/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;
        const articles = await readArticlesData();
        const article = articles.find(a => a.id === articleId);
        
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Статья не найдена'
            });
        }
        
        res.json({
            success: true,
            data: article,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Создать новую статью
app.post('/api/articles', async (req, res) => {
    try {
        const { personId, title, photo, description, content } = req.body;
        
        if (!personId || !title?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Не указана персона или название статьи'
            });
        }
        
        // Проверяем, что персона существует
        const familyData = await readFamilyData();
        const person = findPersonById(familyData, personId);
        
        if (!person) {
            return res.status(404).json({
                success: false,
                message: 'Персона не найдена'
            });
        }
        
        const articles = await readArticlesData();
        
        const newArticle = {
            id: uuidv4(),
            personId: personId,
            personName: person.name, // Сохраняем имя для удобства
            title: title.trim(),
            photo: photo || null,
            description: description || '',
            content: content || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        articles.push(newArticle);
        await writeArticlesData(articles);
        
        res.json({
            success: true,
            message: 'Статья успешно создана',
            data: newArticle
        });
        
    } catch (error) {
        console.error('Ошибка создания статьи:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при создании статьи'
        });
    }
});

// Обновить статью
app.put('/api/articles/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;
        const { title, photo, description, content } = req.body;
        
        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Название статьи не может быть пустым'
            });
        }
        
        const articles = await readArticlesData();
        const articleIndex = articles.findIndex(a => a.id === articleId);
        
        if (articleIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Статья не найдена'
            });
        }
        
        // Обновляем статью
        articles[articleIndex] = {
            ...articles[articleIndex],
            title: title.trim(),
            photo: photo || null,
            description: description || '',
            content: content || '',
            updatedAt: new Date().toISOString()
        };
        
        await writeArticlesData(articles);
        
        res.json({
            success: true,
            message: 'Статья успешно обновлена',
            data: articles[articleIndex]
        });
        
    } catch (error) {
        console.error('Ошибка обновления статьи:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при обновлении статьи'
        });
    }
});

// Удалить статью
app.delete('/api/articles/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;
        
        const articles = await readArticlesData();
        const articleIndex = articles.findIndex(a => a.id === articleId);
        
        if (articleIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Статья не найдена'
            });
        }
        
        const deletedArticle = articles[articleIndex];
        articles.splice(articleIndex, 1);
        
        await writeArticlesData(articles);
        
        res.json({
            success: true,
            message: 'Статья успешно удалена',
            data: deletedArticle
        });
        
    } catch (error) {
        console.error('Ошибка удаления статьи:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при удалении статьи'
        });
    }
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

// 404 обработчик
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Маршрут ${req.originalUrl} не найден`
    });
});

// Инициализация и запуск сервера
const startServer = async () => {
    try {
        await initializeData();
        
        app.listen(PORT, () => {
            console.log('====================================');
            console.log(`Family Tree Server запущен!`);
            console.log(`Порт: ${PORT}`);
            console.log(`API: http://localhost:${PORT}/api/family`);
            console.log(`API статей: http://localhost:${PORT}/api/articles`);
            console.log(`Данные: ${DATA_FILE}`);
            console.log(`Статьи: ${ARTICLES_FILE}`);
            console.log(`Резервные копии: ${BACKUP_DIR}`);
            console.log('====================================');
        });
        
    } catch (error) {
        console.error('Ошибка запуска сервера:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;