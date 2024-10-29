import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { syncService } from '../services/sync';
import { localDB } from '../services/db';
import { networkService } from '../services/network';
import { billingService } from '../services/billing';
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
  customerPhone?: string;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'cash' | 'online' | 'partial';
  payments?: {
    cash?: number;
    online?: number;
    timestamp: string;
  }[];
  syncStatus?: 'pending' | 'synced' | 'failed';
}

// Demo orders for offline functionality
const demoOrders: Order[] = [
  {
    id: 'order-1',
    items: [
      { productId: '1', name: 'Margherita Pizza', quantity: 2, price: 12.99 },
      { productId: '2', name: 'Coca Cola', quantity: 2, price: 2.50 }
    ],
    total: 30.98,
    status: 'preparing',
    tableNumber: '12',
    createdAt: new Date().toISOString(),
    branchId: 'branch-1',
    paymentStatus: 'pending',
    paymentMethod: 'cash'
  },
  {
    id: 'order-2',
    items: [
      { productId: '3', name: 'Chicken Burger', quantity: 1, price: 8.99 },
      { productId: '4', name: 'French Fries', quantity: 1, price: 3.99 }
    ],
    total: 12.98,
    status: 'pending',
    tableNumber: '15',
    createdAt: new Date().toISOString(),
    branchId: 'branch-1',
    paymentStatus: 'pending',
    paymentMethod: 'cash'
  }
];

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
        try {
          const response = await api.get('/orders');
          const serverOrders = response.data;
          
          // Update local database
          await Promise.all(
            serverOrders.map(order => 
              localDB.addItem('orders', { ...order, syncStatus: 'synced', lastModified: Date.now() })
            )
          );

          set({ orders: serverOrders });
        } catch (error) {
          // Handle API error gracefully
          console.info('Using local/demo data due to API error');
          if (localOrders.length === 0) {
            set({ orders: demoOrders });
          }
        }
      } else {
        // If offline, use demo data if no local data
        if (localOrders.length === 0) {
          set({ orders: demoOrders });
        }
      }
    } catch (error) {
      // Handle any other errors without trying to clone error object
      console.error('Error fetching orders');
      set({ 
        orders: demoOrders,
        error: 'Failed to fetch orders. Using offline data.'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Rest of the store implementation remains the same
  createNewOrder: async (orderData) => {
    try {
      set({ isLoading: true });
      const newOrder: Order = {
        ...orderData,
        id: `order-${Date.now()}`,
        createdAt: new Date().toISOString(),
        syncStatus: 'pending'
      };

      await syncService.addItem('orders', newOrder);
      
      set((state) => ({
        orders: [newOrder, ...state.orders],
        isLoading: false
      }));

      if (orderData.paymentMethod === 'online' || orderData.paymentMethod === 'partial') {
        const bill = await billingService.generateBill(newOrder);
        await billingService.sendBill(bill, {
          sendTo: {
            whatsapp: orderData.customerPhone
          }
        });
      }

      toast.success('Order created successfully');
    } catch (error) {
      set({ error: 'Failed to create order', isLoading: false });
      toast.error('Failed to create order');
    }
  },

  processPayment: async (orderId, { cashAmount, onlineAmount, customerPhone }) => {
    try {
      set({ isLoading: true });
      
      const order = get().orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const payment = {
        cash: cashAmount,
        online: onlineAmount,
        timestamp: new Date().toISOString()
      };

      const updatedOrder = {
        ...order,
        payments: [...(order.payments || []), payment],
        paymentStatus: 'completed',
        customerPhone
      };

      await syncService.updateItem('orders', orderId, updatedOrder);
      
      if (onlineAmount > 0) {
        const bill = await billingService.generateBill(updatedOrder);
        await billingService.sendBill(bill, {
          sendTo: {
            whatsapp: customerPhone
          }
        });
      }

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? updatedOrder : o
        ),
        isLoading: false
      }));

      toast.success('Payment processed successfully');
    } catch (error) {
      set({ error: 'Failed to process payment', isLoading: false });
      toast.error('Failed to process payment');
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      set({ isLoading: true });
      
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

  setActiveOrder: (order) => set({ activeOrder: order })
}));