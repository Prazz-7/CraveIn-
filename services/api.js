import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyToken: () => api.get('/auth/verify')
};

export const restaurantAPI = {
  getAll: (limit, offset) => api.get('/restaurants/all', { params: { limit, offset } }),
  getNearby: (latitude, longitude, radius) => api.get('/restaurants/nearby', { params: { latitude, longitude, radius } }),
  getById: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/restaurants', data)
};

export const menuAPI = {
  getByRestaurant: (id) => api.get(`/menu/${id}`),
  add: (data) => api.post('/menu', data)
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders/customer/my-orders'),
  getById: (id) => api.get(`/orders/${id}`)
};

export default api;