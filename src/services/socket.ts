import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';
import { useOrderStore } from '../store/order';
import { useInventoryStore } from '../store/inventory';
import toast from 'react-hot-toast';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    const { token } = useAuthStore.getState();

    if (!token || this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      toast.success('Real-time connection established');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      toast.error('Connection error. Retrying...');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      toast.error('Connection lost. Reconnecting...');
    });

    // Real-time order updates
    this.socket.on('order:updated', (data) => {
      const { updateOrderInRealtime } = useOrderStore.getState();
      updateOrderInRealtime(data);
      toast.success(`Order #${data.orderId} status updated to ${data.status}`);
    });

    // Real-time inventory updates
    this.socket.on('inventory:updated', (data) => {
      const { updateStockInRealtime } = useInventoryStore.getState();
      updateStockInRealtime(data);
      if (data.stock <= data.minStock) {
        toast.warning(`Low stock alert: ${data.name}`);
      }
    });

    // Kitchen display system updates
    this.socket.on('kds:updated', (data) => {
      const { updateOrderInRealtime } = useOrderStore.getState();
      updateOrderInRealtime(data);
    });

    // Payment status updates
    this.socket.on('payment:updated', (data) => {
      const { updateOrderInRealtime } = useOrderStore.getState();
      updateOrderInRealtime(data);
      toast.success(`Payment received for Order #${data.orderId}`);
    });

    // Branch switch updates
    this.socket.on('branch:switched', (data) => {
      toast.success(`Connected to ${data.branchName}`);
    });
  }

  // Branch management
  joinBranch(branchId: string) {
    if (this.socket) {
      this.socket.emit('join-branch', branchId);
    }
  }

  // Order management
  emitOrderUpdate(data: { 
    orderId: string; 
    status: string; 
    branchId: string;
    items?: any[];
    total?: number;
  }) {
    if (this.socket) {
      this.socket.emit('order:update', data);
    }
  }

  // Inventory management
  emitInventoryUpdate(data: { 
    productId: string; 
    stock: number; 
    branchId: string;
    minStock: number;
    name: string;
  }) {
    if (this.socket) {
      this.socket.emit('inventory:update', data);
    }
  }

  // Payment processing
  emitPaymentUpdate(data: {
    orderId: string;
    amount: number;
    method: string;
    status: 'completed' | 'failed' | 'pending';
  }) {
    if (this.socket) {
      this.socket.emit('payment:update', data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = SocketService.getInstance();