class NetworkService {
  private static instance: NetworkService;
  private listeners: { [key: string]: Function[] } = {
    online: [],
    offline: []
  };

  private constructor() {
    window.addEventListener('online', () => this.notifyListeners('online'));
    window.addEventListener('offline', () => this.notifyListeners('offline'));
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  addListener(event: 'online' | 'offline', callback: Function): void {
    this.listeners[event].push(callback);
  }

  removeListener(event: 'online' | 'offline', callback: Function): void {
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private notifyListeners(event: 'online' | 'offline'): void {
    this.listeners[event].forEach(callback => callback());
  }
}

export const networkService = NetworkService.getInstance();