import { create } from 'zustand';
import { toast } from 'react-hot-toast';

interface OrderItem {
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
}

// Mock data for demo
const mockOrders: Order[] = [
  {
    id: 'order-1',
    items: [
      { productId: 'p1', name: 'Margherita Pizza', quantity: 2, price: 12.99 },
      { productId: 'p2', name: 'Coca Cola', quantity: 2, price: 2.50 }
    ],
    total: 30.98,
    status: 'pending',
    tableNumber: '12',
    createdAt: new Date().toISOString(),
    branchId: 'branch-1'
  },
  {
    id: 'order-2',
    items: [
      { productId: 'p3', name: 'Chicken Burger', quantity: 1, price: 8.99 },
      { productId: 'p4', name: 'French Fries', quantity: 1, price: 3.99 }
    ],
    total: 12.98,
    status: 'preparing',
    tableNumber: '15',
    createdAt: new Date().toISOString(),
    branchId: 'branch-1'
  }
];

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createNewOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  updateStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setActiveOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ orders: mockOrders, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch orders', isLoading: false });
      toast.error('Failed to fetch orders');
    }
  },

  createNewOrder: async (orderData) => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...orderData
      };
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
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

  setActiveOrder: (order) => set({ activeOrder: order })
}));