import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (credentials: { email: string; password: string }) =>
  api.post('/auth/login', credentials);

export const register = (userData: { name: string; email: string; password: string; role: string }) =>
  api.post('/auth/register', userData);

// Orders API
export const getOrders = () => api.get('/orders');
export const createOrder = (orderData: any) => api.post('/orders', orderData);
export const updateOrderStatus = (id: string, status: string) =>
  api.patch(`/orders/${id}/status`, { status });

// Inventory API
export const getInventory = () => api.get('/inventory');
export const addProduct = (productData: any) => api.post('/inventory', productData);
export const updateProduct = (id: string, productData: any) =>
  api.put(`/inventory/${id}`, productData);
export const deleteProduct = (id: string) => api.delete(`/inventory/${id}`);
export const updateStock = (id: string, quantity: number) =>
  api.patch(`/inventory/${id}/stock`, { quantity });

// Customers API
export const getCustomers = () => api.get('/customers');
export const addCustomer = (customerData: any) => api.post('/customers', customerData);
export const updateCustomer = (id: string, customerData: any) =>
  api.put(`/customers/${id}`, customerData);
export const deleteCustomer = (id: string) => api.delete(`/customers/${id}`);
export const getCustomerOrders = (id: string) => api.get(`/customers/${id}/orders`);

// Employees API
export const getEmployees = () => api.get('/employees');
export const addEmployee = (employeeData: any) => api.post('/employees', employeeData);
export const updateEmployee = (id: string, employeeData: any) =>
  api.put(`/employees/${id}`, employeeData);
export const deleteEmployee = (id: string) => api.delete(`/employees/${id}`);
export const getEmployeeStats = (id: string) => api.get(`/employees/${id}/stats`);