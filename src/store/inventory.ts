import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  minStock: number;
  branchId: string;
  updatedAt: string;
}

interface InventoryState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  updateStockInRealtime: (data: { productId: string; stock: number }) => void;
}

// Demo data for initial state
const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Tomatoes',
    description: 'Fresh tomatoes',
    category: 'Vegetables',
    price: 2.99,
    stock: 45,
    unit: 'kg',
    minStock: 20,
    branchId: 'default-branch',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Chicken Breast',
    description: 'Fresh chicken breast',
    category: 'Meat',
    price: 8.99,
    stock: 15,
    unit: 'kg',
    minStock: 20,
    branchId: 'default-branch',
    updatedAt: new Date().toISOString()
  }
];

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: demoProducts,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/inventory');
      set({ products: response.data, isLoading: false });
    } catch (error) {
      console.info('Using demo data due to API unavailability');
      set({ 
        products: demoProducts, 
        isLoading: false,
        error: null // Don't set error for demo mode
      });
    }
  },

  addProduct: async (productData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/inventory', productData);
      set((state) => ({
        products: [...state.products, response.data],
        isLoading: false
      }));
      toast.success('Product added successfully');
    } catch (error) {
      // Fallback to demo mode
      const newProduct = {
        ...productData,
        id: `demo-${Date.now()}`,
        updatedAt: new Date().toISOString()
      };
      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false,
        error: null
      }));
      toast.success('Product added successfully (Demo Mode)');
    }
  },

  updateProduct: async (id, productData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put(`/inventory/${id}`, productData);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...response.data } : product
        ),
        isLoading: false
      }));
      toast.success('Product updated successfully');
    } catch (error) {
      // Fallback to demo mode
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...productData, updatedAt: new Date().toISOString() } : product
        ),
        isLoading: false,
        error: null
      }));
      toast.success('Product updated successfully (Demo Mode)');
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/inventory/${id}`);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        isLoading: false
      }));
      toast.success('Product deleted successfully');
    } catch (error) {
      // Fallback to demo mode
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        isLoading: false,
        error: null
      }));
      toast.success('Product deleted successfully (Demo Mode)');
    }
  },

  updateStock: async (id, quantity) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.patch(`/inventory/${id}/stock`, { quantity });
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, stock: quantity } : product
        ),
        isLoading: false
      }));
      toast.success('Stock updated successfully');
    } catch (error) {
      // Fallback to demo mode
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, stock: quantity, updatedAt: new Date().toISOString() } : product
        ),
        isLoading: false,
        error: null
      }));
      toast.success('Stock updated successfully (Demo Mode)');
    }
  },

  updateStockInRealtime: (data) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === data.productId ? { ...product, stock: data.stock } : product
      )
    }));
  }
}));