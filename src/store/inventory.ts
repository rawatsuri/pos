import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { socketService } from '../services/socket';

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
  branchId: string;
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
  updateStockInRealtime: (data: { productId: string; stock: number }) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/inventory');
      const data = await response.json();
      set({ products: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch products', isLoading: false });
      toast.error('Failed to fetch products');
    }
  },

  addProduct: async (productData) => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const newProduct = await response.json();
      
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
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const updatedProduct = await response.json();

      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...updatedProduct } : product
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
      await fetch(`/api/inventory/${id}`, {
        method: 'DELETE'
      });

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
      const product = get().products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');

      const response = await fetch(`/api/inventory/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      const updatedProduct = await response.json();

      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, stock: quantity } : product
        ),
        isLoading: false
      }));

      // Emit socket event for real-time inventory update
      socketService.emitInventoryUpdate({
        productId: id,
        stock: quantity,
        branchId: product.branchId,
        minStock: product.minStock,
        name: product.name
      });

      toast.success('Stock updated successfully');
    } catch (error) {
      set({ error: 'Failed to update stock', isLoading: false });
      toast.error('Failed to update stock');
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