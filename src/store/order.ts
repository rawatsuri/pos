import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { syncService } from '../services/sync';
import { localDB } from '../services/db';
import { networkService } from '../services/network';
import api from '../services/api';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  tableNumber: string;
  createdAt: string;
  branchId: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  paymentMethod?: 'cash' | 'card' | 'upi';
}

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createNewOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  updateStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateOrderInRealtime: (data: Partial<Order> & { orderId: string }) => void;
  processPayment: (orderId: string, method: Order['paymentMethod']) => Promise<void>;
  setActiveOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // First, get local data
      const localOrders = await localDB.getAllItems('orders');
      set({ orders: localOrders as Order[] });

      // If online, fetch from server and update local
      if (networkService.isOnline()) {
        const response = await api.get('/orders');
        const serverOrders = response.data;
        
        // Update local database
        await Promise.all(
          serverOrders.map(order => 
            localDB.addItem('orders', { ...order, syncStatus: 'synced', lastModified: Date.now() })
          )
        );

        set({ orders: serverOrders });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't show error toast if we have local data
      if (get().orders.length === 0) {
        toast.error('Failed to fetch orders');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createNewOrder: async (orderData) => {
    try {
      set({ isLoading: true });
      const newOrder: Order = {
        ...orderData,
        id: `order-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // Always save to local first
      await syncService.addItem('orders', newOrder);
      
      set((state) => ({
        orders: [newOrder, ...state.orders],
        isLoading: false
      }));

      toast.success('Order created successfully');
    } catch (error) {
      set({ error: 'Failed to create order', isLoading: false });
      toast.error('Failed to create order');
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      set({ isLoading: true });
      
      // Update local first
      await syncService.updateItem('orders', orderId, { status });
      
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
        isLoading: false
      }));

      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      set({ error: 'Failed to update order status', isLoading: false });
      toast.error('Failed to update order status');
    }
  },

  updateOrderInRealtime: (data) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === data.orderId ? { ...order, ...data } : order
      )
    }));
  },

  processPayment: async (orderId, method) => {
    try {
      set({ isLoading: true });
      
      // Update local first
      await syncService.updateItem('orders', orderId, {
        paymentStatus: 'completed',
        paymentMethod: method
      });

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, paymentStatus: 'completed', paymentMethod: method } : order
        ),
        isLoading: false
      }));

      toast.success('Payment processed successfully');
    } catch (error) {
      set({ error: 'Failed to process payment', isLoading: false });
      toast.error('Failed to process payment');
    }
  },

  setActiveOrder: (order) => set({ activeOrder: order })
}));