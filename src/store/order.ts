import { create } from 'zustand';
import { createOrder, getOrders, updateOrderStatus } from '../api';
import { socketService } from '../services/socket';
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

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createNewOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  updateStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setActiveOrder: (order: Order | null) => void;
  handleRealTimeUpdate: (updatedOrder: Partial<Order>) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    try {
      set({ isLoading: true });
      const { data } = await getOrders();
      set({ orders: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch orders', isLoading: false });
      toast.error('Failed to fetch orders');
    }
  },

  createNewOrder: async (orderData) => {
    try {
      set({ isLoading: true });
      const { data } = await createOrder(orderData);
      set((state) => ({
        orders: [data, ...state.orders],
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
      await updateOrderStatus(orderId, status);
      
      const order = get().orders.find(o => o.id === orderId);
      if (order) {
        socketService.updateOrderStatus({
          orderId,
          status,
          branchId: order.branchId
        });
      }

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

  setActiveOrder: (order) => set({ activeOrder: order }),

  handleRealTimeUpdate: (updatedOrder) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      )
    }));
  }
}));