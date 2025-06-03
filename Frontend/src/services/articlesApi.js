// Frontend\src\services\articlesApi.js

// ОБНОВЛЕННЫЙ API_BASE_URL для разных окружений
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://familytree2.onrender.com/api';  // ВАШ РЕАЛЬНЫЙ URL
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

class ArticlesAPI {
  // Базовый метод для запросов
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Articles API Error [${endpoint}]:`, error);
      throw new Error(error.message || 'Ошибка сети');
    }
  }

  // Получить все статьи
  async getAllArticles() {
    const response = await this.request('/articles');
    return response.data;
  }

  // ОБНОВЛЕННЫЙ метод: Получить статьи персоны через новый endpoint
  async getPersonArticles(personId) {
    const response = await this.request(`/family/person/${personId}/articles`);
    return response.data;
  }

  // Получить конкретную статью
  async getArticle(articleId) {
    const response = await this.request(`/articles/${articleId}`);
    return response.data;
  }

  // ОБНОВЛЕННЫЙ метод: Создать статью БЕЗ АВТОРА
  async createArticle(articleData) {
    return await this.request('/articles', {
      method: 'POST',
      body: {
        title: articleData.title,
        photo: articleData.photo,
        description: articleData.description,
        content: articleData.content
        // Убираем personId - статьи создаются независимо
      }
    });
  }

  // ОБНОВЛЕННЫЙ метод: Обновление статьи БЕЗ АВТОРА
  async updateArticle(articleId, articleData) {
    return await this.request(`/articles/${articleId}`, {
      method: 'PUT',
      body: {
        title: articleData.title,
        photo: articleData.photo,
        description: articleData.description,
        content: articleData.content
        // Убираем изменение автора - связи управляются отдельно
      }
    });
  }

  // Удалить статью
  async deleteArticle(articleId) {
    return await this.request(`/articles/${articleId}`, {
      method: 'DELETE'
    });
  }

  // НОВЫЙ метод: Привязать статью к персоне
  async linkArticleToPerson(articleId, personId) {
    return await this.request(`/articles/${articleId}/link-person/${personId}`, {
      method: 'POST'
    });
  }

  // НОВЫЙ метод: Отвязать статью от персоны
  async unlinkArticleFromPerson(articleId, personId) {
    return await this.request(`/articles/${articleId}/unlink-person/${personId}`, {
      method: 'DELETE'
    });
  }

  // Проверка сервера
  async checkServerHealth() {
    try {
      await this.request('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

const articlesAPI = new ArticlesAPI();
export default articlesAPI;