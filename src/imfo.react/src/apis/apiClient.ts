import axios from 'axios';

const api = axios.create();

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('imfo:session-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;