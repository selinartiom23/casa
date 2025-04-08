import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// Добавляем обработчик для запросов
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Добавляем обработчик для ответов
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Сервер вернул ошибку
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data.message || 'Server error');
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error('Network error:', error.request);
      return Promise.reject('Network error. Please check your connection and try again.');
    } else {
      // Ошибка при настройке запроса
      console.error('Request setup error:', error.message);
      return Promise.reject('Request error. Please try again.');
    }
  }
);

export default instance; 