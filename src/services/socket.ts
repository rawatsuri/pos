import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';

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

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBranch(branchId: string) {
    if (this.socket) {
      this.socket.emit('join-branch', branchId);
    }
  }

  onOrderUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('order:updated', callback);
    }
  }

  onInventoryUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('inventory:updated', callback);
    }
  }

  updateOrderStatus(data: { orderId: string; status: string; branchId: string }) {
    if (this.socket) {
      this.socket.emit('order:update', data);
    }
  }

  updateInventory(data: { productId: string; stock: number; branchId: string }) {
    if (this.socket) {
      this.socket.emit('inventory:update', data);
    }
  }
}

export const socketService = SocketService.getInstance();