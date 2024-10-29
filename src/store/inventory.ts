import { create } from 'zustand';
import { toast } from 'react-hot-toast';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  minStock: number;
  image?: string;
}

// Mock data for demo
const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Margherita Pizza',
    description: 'Classic tomato and mozzarella pizza',
    category: 'Main Course',
    price: 12.99,
    stock: 50,
    unit: 'pcs',
    minStock: 10
  },
  {
    id: 'p2',
    name: 'Coca Cola',
    description: '330ml can',
    category: 'Beverages',
    price: 2.50,
    stock: 100,
    unit: 'pcs',
    minStock: 20
  },
  {
    id: 'p3',
    name: 'Chicken Burger',
    description: 'Grilled chicken breast with lettuce and mayo',
    category: 'Main Course',
    price: 8.99,
    stock: 30,
    unit: 'pcs',
    minStock: 5
  }
];

interface InventoryState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: mockProducts,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ products: mockProducts, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch products', isLoading: false });
      toast.error('Failed to fetch products');
    }
  },

  addProduct: async (productData) => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProduct = {
        id: `p${Date.now()}`,
        ...productData
      };
      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false
      }));
      toast.success('Product added successfully');
    } catch (error) {
      set({ error: 'Failed to add product', isLoading: false });
      toast.error('Failed to add product');
    }
  },

  updateProduct: async (id, productData) => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...productData } : product
        ),
        isLoading: false
      }));
      toast.success('Product updated successfully');
    } catch (error) {
      set({ error: 'Failed to update product', isLoading: false });
      toast.error('Failed to update product');
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        isLoading: false
      }));
      toast.success('Product deleted successfully');
    } catch (error) {
      set({ error: 'Failed to delete product', isLoading: false });
      toast.error('Failed to delete product');
    }
  },

  updateStock: async (id, quantity) => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, stock: quantity } : product
        ),
        isLoading: false
      }));
      toast.success('Stock updated successfully');
    } catch (error) {
      set({ error: 'Failed to update stock', isLoading: false });
      toast.error('Failed to update stock');
    }
  }
}));