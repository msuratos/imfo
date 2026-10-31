import axios from 'axios';

const api = axios.create();

// TODO: add the auth token to the request headers if it exists by using logto-react package

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