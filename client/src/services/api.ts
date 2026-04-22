import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Wardrobe ──────────────────────────────────────────────
export const wardrobeService = {
  getAll: () => api.get('/wardrobe'),
  addItem: (data: FormData) => api.post('/wardrobe', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteItem: (id: string) => api.delete(`/wardrobe/${id}`),
};

// ── Outfits ───────────────────────────────────────────────
export const outfitService = {
  getAll: () => api.get('/outfits'),
  generate: () => api.post('/outfits/generate'),
};

// ── Inspiration ───────────────────────────────────────────
export const inspirationService = {
  getAll: (tag?: string) => api.get('/inspiration', { params: tag ? { tag } : {} }),
};

// ── Marketplace ───────────────────────────────────────────
export const marketplaceService = {
  getAll: (filters?: { category?: string; tag?: string }) => api.get('/marketplace', { params: filters }),
  createListing: (data: FormData) =>
    api.post('/marketplace', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Auth ──────────────────────────────────────────────────
export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  signup: (data: any) => api.post('/auth/signup', data),
};

// ── Interceptor ───────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
