// src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api';

class FamilyTreeAPI {
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
      console.error(`API Error [${endpoint}]:`, error);
      throw new Error(error.message || 'Ошибка сети');
    }
  }

  // Получить все данные семьи
  async getFamilyData() {
    const response = await this.request('/family');
    return response.data;
  }

  // Добавить ребенка
  async addChild(parentId, childData) {
    return await this.request('/family/child', {
      method: 'POST',
      body: { parentId, childData }
    });
  }

  // Добавить супруга
  async addSpouse(personId, spouseData) {
    return await this.request('/family/spouse', {
      method: 'POST',
      body: { personId, spouseData }
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

const familyTreeAPI = new FamilyTreeAPI();
export default familyTreeAPI;