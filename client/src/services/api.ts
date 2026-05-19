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
  updateItem: (id: string, data: FormData) => api.put(`/wardrobe/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyze: (data: { imageBase64: string }) => api.post('/wardrobe/analyze', data),
};

// ── Outfits ───────────────────────────────────────────────
export const outfitService = {
  getAll: () => api.get('/outfits'),
  generate: () => api.post('/outfits/generate'),
  save: (data: Record<string, unknown>) => api.post('/outfits', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/outfits/${id}`, data),
  delete: (id: string) => api.delete(`/outfits/${id}`),
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
  login: (data: Record<string, unknown>) => api.post('/auth/login', data),
  signup: (data: Record<string, unknown>) => api.post('/auth/signup', data),
};

// ── Interceptors ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
