import axios from 'axios';

type AccessTokenProvider = () => Promise<string | undefined> | string | undefined;

let accessTokenProvider: AccessTokenProvider | null = null;

export function setAccessTokenProvider(provider: AccessTokenProvider | null) {
  accessTokenProvider = provider;
}

const api = axios.create();

api.interceptors.request.use(
  async config => {
    if (!accessTokenProvider) {
      return config;
    }

    const token = await accessTokenProvider();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

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