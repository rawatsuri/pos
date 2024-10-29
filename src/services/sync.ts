import { localDB } from './db';
import api from './api';
import { toast } from 'react-hot-toast';
import { networkService } from './network';

class SyncService {
  private static instance: SyncService;
  private syncInProgress = false;
  private syncInterval: number | null = null;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async initialize(): Promise<void> {
    // Initialize local database
    await localDB.initialize();

    // Start periodic sync if online
    if (networkService.isOnline()) {
      this.startPeriodicSync();
    }

    // Listen for online/offline events
    networkService.addListener('online', () => {
      this.startPeriodicSync();
      this.syncAll(); // Immediate sync when coming online
    });

    networkService.addListener('offline', () => {
      this.stopPeriodicSync();
    });
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) return;
    this.syncInterval = window.setInterval(() => this.syncAll(), 5 * 60 * 1000); // Sync every 5 minutes
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncAll(): Promise<void> {
    if (this.syncInProgress || !networkService.isOnline()) return;

    try {
      this.syncInProgress = true;
      await Promise.all([
        this.syncStore('orders'),
        this.syncStore('customers'),
        this.syncStore('products'),
        this.syncStore('employees')
      ]);
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync data with server');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncStore(storeName: 'orders' | 'customers' | 'products' | 'employees'): Promise<void> {
    const pendingItems = await localDB.getPendingSyncItems(storeName);
    
    for (const item of pendingItems) {
      try {
        await api.post(`/sync/${storeName}`, {
          data: item,
          lastModified: item.lastModified
        });
        await localDB.updateSyncStatus(storeName, item.id, 'synced');
      } catch (error) {
        await localDB.updateSyncStatus(storeName, item.id, 'failed');
      }
    }
  }

  async syncItem(storeName: 'orders' | 'customers' | 'products' | 'employees', item: any): Promise<void> {
    await localDB.addItem(storeName, item);
    
    if (networkService.isOnline()) {
      try {
        await this.syncStore(storeName);
      } catch (error) {
        console.error(`Failed to sync ${storeName}:`, error);
      }
    }
  }
}

export const syncService = SyncService.getInstance();