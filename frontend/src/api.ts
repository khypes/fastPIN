import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Only reload if we're not already on the home page to prevent infinite loops
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

// CoinDrop API endpoints
export const coinDropApi = {
  getGames: () => api.get('/coindrop/games'),
  getProducts: (gameKey: string) => api.get(`/coindrop/games/${gameKey}/products`),
  validatePlayer: (gameKey: string, playerId: string, serverId?: string) =>
    api.post(`/coindrop/games/${gameKey}/validate`, { playerId, serverId }),
  createOrder: (data: {
    gameKey: string;
    productId?: string;
    amount?: number;
    playerId: string;
    serverId?: string;
  }) => api.post('/orders/coindrop', data),
};

export default api;
