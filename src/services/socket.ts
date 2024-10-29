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

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    // Real-time order updates
    this.socket.on('order:updated', (data) => {
      // Handle order updates
    });

    // Real-time inventory updates
    this.socket.on('inventory:updated', (data) => {
      // Handle inventory updates
    });

    // Kitchen display system updates
    this.socket.on('kds:updated', (data) => {
      // Handle KDS updates
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Branch management
  joinBranch(branchId: string) {
    if (this.socket) {
      this.socket.emit('join-branch', branchId);
    }
  }

  // Order management
  updateOrderStatus(data: { orderId: string; status: string; branchId: string }) {
    if (this.socket) {
      this.socket.emit('order:update', data);
    }
  }

  // Inventory management
  updateInventory(data: { productId: string; stock: number; branchId: string }) {
    if (this.socket) {
      this.socket.emit('inventory:update', data);
    }
  }

  // Kitchen display system
  updateKDS(data: { orderId: string; status: string; branchId: string }) {
    if (this.socket) {
      this.socket.emit('kds:update', data);
    }
  }
}

export const socketService = SocketService.getInstance();