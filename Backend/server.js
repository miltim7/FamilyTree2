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
const BACKUP_DIR = path.join(__dirname, 'backups');

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Инициализация данных при старте сервера
const initializeData = async () => {
    try {
        await fs.ensureDir(path.dirname(DATA_FILE));
        await fs.ensureDir(BACKUP_DIR);
        
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
            console.log('✅ Создан файл данных по умолчанию');
        }
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
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
        console.log('💾 Данные сохранены');
        return true;
    } catch (error) {
        console.error('Ошибка записи данных:', error);
        throw new Error('Не удалось сохранить данные');
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

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

// 404 обработчик - ИСПРАВЛЕНО
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
            console.log('🚀====================================');
            console.log(`🌳 Family Tree Server запущен!`);
            console.log(`📡 Порт: ${PORT}`);
            console.log(`🌐 API: http://localhost:${PORT}/api/family`);
            console.log(`📁 Данные: ${DATA_FILE}`);
            console.log(`💾 Резервные копии: ${BACKUP_DIR}`);
            console.log('====================================🚀');
        });
        
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;