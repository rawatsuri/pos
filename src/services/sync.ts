import { localDB } from './db';
import api from './api';
import { toast } from 'react-hot-toast';
import { networkService } from './network';

class SyncService {
  private static instance: SyncService;
  private syncInProgress = false;
  private syncInterval: number | null = null;
  private pendingSync: Set<string> = new Set();

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async initialize(): Promise<void> {
    await localDB.initialize();

    if (networkService.isOnline()) {
      this.startPeriodicSync();
    }

    networkService.addListener('online', () => {
      toast.success('Back online! Syncing data...');
      this.startPeriodicSync();
      this.syncAll();
    });

    networkService.addListener('offline', () => {
      toast.warning('You are offline. Changes will sync when connection is restored.');
      this.stopPeriodicSync();
    });
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) return;
    this.syncInterval = window.setInterval(() => this.syncAll(), 5 * 60 * 1000);
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
      const stores = ['orders', 'customers', 'products', 'employees'] as const;
      
      for (const store of stores) {
        if (this.pendingSync.has(store)) {
          await this.syncStore(store);
          this.pendingSync.delete(store);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncStore(storeName: 'orders' | 'customers' | 'products' | 'employees'): Promise<void> {
    const pendingItems = await localDB.getPendingSyncItems(storeName);
    
    for (const item of pendingItems) {
      try {
        const response = await api.post(`/sync/${storeName}`, {
          data: item,
          lastModified: item.lastModified
        });

        if (response.status === 200) {
          await localDB.updateSyncStatus(storeName, item.id, 'synced');
        } else {
          await localDB.updateSyncStatus(storeName, item.id, 'failed');
        }
      } catch (error) {
        await localDB.updateSyncStatus(storeName, item.id, 'failed');
      }
    }
  }

  async addItem<T extends 'orders' | 'customers' | 'products' | 'employees'>(
    storeName: T,
    item: any
  ): Promise<void> {
    await localDB.addItem(storeName, {
      ...item,
      syncStatus: 'pending',
      lastModified: Date.now()
    });

    this.pendingSync.add(storeName);

    if (networkService.isOnline()) {
      this.syncStore(storeName).catch(console.error);
    }
  }

  async updateItem<T extends 'orders' | 'customers' | 'products' | 'employees'>(
    storeName: T,
    id: string,
    updates: any
  ): Promise<void> {
    const item = await localDB.getItem(storeName, id);
    if (item) {
      await localDB.addItem(storeName, {
        ...item,
        ...updates,
        syncStatus: 'pending',
        lastModified: Date.now()
      });

      this.pendingSync.add(storeName);

      if (networkService.isOnline()) {
        this.syncStore(storeName).catch(console.error);
      }
    }
  }

  async deleteItem<T extends 'orders' | 'customers' | 'products' | 'employees'>(
    storeName: T,
    id: string
  ): Promise<void> {
    await localDB.deleteItem(storeName, id);
    
    if (networkService.isOnline()) {
      try {
        await api.delete(`/${storeName}/${id}`);
      } catch (error) {
        console.error(`Failed to delete ${storeName} item:`, error);
      }
    }
  }
}

export const syncService = SyncService.getInstance();