// Frontend\src\services\articlesApi.js

const API_BASE_URL = 'http://localhost:5000/api';

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

  // Получить статьи персоны
  async getPersonArticles(personId) {
    const response = await this.request(`/articles/person/${personId}`);
    return response.data;
  }

  // Получить конкретную статью
  async getArticle(articleId) {
    const response = await this.request(`/articles/${articleId}`);
    return response.data;
  }

  // Создать статью
  async createArticle(articleData) {
    return await this.request('/articles', {
      method: 'POST',
      body: articleData
    });
  }

  // Обновить статью
  async updateArticle(articleId, articleData) {
    return await this.request(`/articles/${articleId}`, {
      method: 'PUT',
      body: articleData
    });
  }

  // Удалить статью
  async deleteArticle(articleId) {
    return await this.request(`/articles/${articleId}`, {
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