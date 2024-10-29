import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';
import { useOrderStore } from '../store/order';
import { useInventoryStore } from '../store/inventory';
import toast from 'react-hot-toast';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isConnecting = false;
  private connectionTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    const { token } = useAuthStore.getState();

    if (!token || this.socket?.connected || this.isConnecting) return;

    try {
      this.isConnecting = true;

      // Clear any existing connection timeout
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }

      // Set a connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (!this.socket?.connected) {
          console.info('WebSocket connection timed out, falling back to offline mode');
          this.disconnect();
        }
      }, 5000);

      const wsUrl = import.meta.env.VITE_WS_URL || window.location.origin.replace(/^http/, 'ws');

      this.socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 5000
      });

      this.setupEventListeners();
    } catch (error) {
      console.info('WebSocket connection failed, operating in offline mode');
      this.isConnecting = false;
      this.cleanup();
    }
  }

  private cleanup() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.info('WebSocket connected successfully');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.info('WebSocket connection failed, operating in offline mode');
        this.cleanup();
      }
    });

    this.socket.on('disconnect', () => {
      console.info('WebSocket disconnected, attempting to reconnect...');
    });

    // Real-time updates with error handling
    this.socket.on('order:updated', (data) => {
      try {
        const { updateOrderInRealtime } = useOrderStore.getState();
        updateOrderInRealtime(data);
        toast.success(`Order #${data.orderId} updated`);
      } catch (error) {
        console.warn('Error processing order update:', error);
      }
    });

    this.socket.on('inventory:updated', (data) => {
      try {
        const { updateStockInRealtime } = useInventoryStore.getState();
        updateStockInRealtime(data);
        if (data.stock <= data.minStock) {
          toast.warning(`Low stock alert: ${data.name}`);
        }
      } catch (error) {
        console.warn('Error processing inventory update:', error);
      }
    });
  }

  joinBranch(branchId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-branch', branchId);
    }
  }

  emitOrderUpdate(data: { 
    orderId: string; 
    status: string; 
    branchId: string;
    items?: any[];
    total?: number;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('order:update', data);
    }
  }

  emitInventoryUpdate(data: { 
    productId: string; 
    stock: number; 
    branchId: string;
    minStock: number;
    name: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('inventory:update', data);
    }
  }

  emitPaymentUpdate(data: {
    orderId: string;
    amount: number;
    method: string;
    status: 'completed' | 'failed' | 'pending';
  }) {
    if (this.socket?.connected) {
      this.socket.emit('payment:update', data);
    }
  }

  disconnect() {
    this.cleanup();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();

// Make socket service available globally for error handling
if (typeof window !== 'undefined') {
  (window as any).socketService = socketService;
}