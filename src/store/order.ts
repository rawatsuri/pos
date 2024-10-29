import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { socketService } from '../services/socket';

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
      set({ isLoading: true });
      const response = await fetch('/api/orders');
      const data = await response.json();
      set({ orders: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch orders', isLoading: false });
      toast.error('Failed to fetch orders');
    }
  },

  createNewOrder: async (orderData) => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const newOrder = await response.json();
      
      set((state) => ({
        orders: [newOrder, ...state.orders],
        isLoading: false
      }));

      // Emit socket event for real-time updates
      socketService.emitOrderUpdate({
        orderId: newOrder.id,
        status: newOrder.status,
        branchId: newOrder.branchId,
        items: newOrder.items,
        total: newOrder.total
      });

      toast.success('Order created successfully');
    } catch (error) {
      set({ error: 'Failed to create order', isLoading: false });
      toast.error('Failed to create order');
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      set({ isLoading: true });
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updatedOrder = await response.json();

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
        isLoading: false
      }));

      // Emit socket event for real-time updates
      socketService.emitOrderUpdate({
        orderId,
        status,
        branchId: updatedOrder.branchId
      });

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
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      });
      const updatedOrder = await response.json();

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, paymentStatus: 'completed', paymentMethod: method } : order
        ),
        isLoading: false
      }));

      // Emit socket event for real-time payment update
      socketService.emitPaymentUpdate({
        orderId,
        amount: updatedOrder.total,
        method,
        status: 'completed'
      });

      toast.success('Payment processed successfully');
    } catch (error) {
      set({ error: 'Failed to process payment', isLoading: false });
      toast.error('Failed to process payment');
    }
  },

  setActiveOrder: (order) => set({ activeOrder: order })
}));