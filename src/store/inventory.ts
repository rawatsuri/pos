import { create } from 'zustand';
import { addProduct, getInventory, updateProduct, deleteProduct, updateStock } from '../api';
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

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ isLoading: true });
      const { data } = await getInventory();
      set({ products: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch products', isLoading: false });
      toast.error('Failed to fetch products');
    }
  },

  addProduct: async (productData) => {
    try {
      set({ isLoading: true });
      const { data } = await addProduct(productData);
      set((state) => ({
        products: [...state.products, data],
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
      const { data } = await updateProduct(id, productData);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...data } : product
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
      await deleteProduct(id);
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
      const { data } = await updateStock(id, quantity);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, stock: data.stock } : product
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