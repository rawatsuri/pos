import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AppDB extends DBSchema {
  orders: {
    key: string;
    value: {
      id: string;
      items: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
      }>;
      total: number;
      status: string;
      tableNumber: string;
      createdAt: string;
      syncStatus: 'pending' | 'synced' | 'failed';
      lastModified: number;
    };
    indexes: { 'by-status': string; 'by-sync': string };
  };
  customers: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address?: string;
      loyaltyPoints: number;
      syncStatus: 'pending' | 'synced' | 'failed';
      lastModified: number;
    };
    indexes: { 'by-sync': string };
  };
  products: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      category: string;
      price: number;
      stock: number;
      unit: string;
      minStock: number;
      syncStatus: 'pending' | 'synced' | 'failed';
      lastModified: number;
    };
    indexes: { 'by-category': string; 'by-sync': string };
  };
  employees: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      status: string;
      joinDate: string;
      syncStatus: 'pending' | 'synced' | 'failed';
      lastModified: number;
    };
    indexes: { 'by-role': string; 'by-sync': string };
  };
}

class LocalDatabase {
  private db: IDBPDatabase<AppDB> | null = null;
  private static instance: LocalDatabase;

  private constructor() {}

  static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase();
    }
    return LocalDatabase.instance;
  }

  async initialize(): Promise<void> {
    this.db = await openDB<AppDB>('pos-db', 1, {
      upgrade(db) {
        // Orders store
        const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
        orderStore.createIndex('by-status', 'status');
        orderStore.createIndex('by-sync', 'syncStatus');

        // Customers store
        const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
        customerStore.createIndex('by-sync', 'syncStatus');

        // Products store
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('by-category', 'category');
        productStore.createIndex('by-sync', 'syncStatus');

        // Employees store
        const employeeStore = db.createObjectStore('employees', { keyPath: 'id' });
        employeeStore.createIndex('by-role', 'role');
        employeeStore.createIndex('by-sync', 'syncStatus');
      },
    });
  }

  async addItem<T extends keyof AppDB>(
    storeName: T,
    item: AppDB[T]['value']
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put(storeName, item);
  }

  async getItem<T extends keyof AppDB>(
    storeName: T,
    id: string
  ): Promise<AppDB[T]['value'] | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get(storeName, id);
  }

  async getAllItems<T extends keyof AppDB>(
    storeName: T
  ): Promise<AppDB[T]['value'][]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll(storeName);
  }

  async getPendingSyncItems<T extends keyof AppDB>(
    storeName: T
  ): Promise<AppDB[T]['value'][]> {
    if (!this.db) throw new Error('Database not initialized');
    const index = this.db.transaction(storeName).store.index('by-sync');
    return index.getAll('pending');
  }

  async updateSyncStatus<T extends keyof AppDB>(
    storeName: T,
    id: string,
    status: 'synced' | 'failed'
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const item = await this.getItem(storeName, id);
    if (item) {
      await this.db.put(storeName, { ...item, syncStatus: status });
    }
  }

  async deleteItem<T extends keyof AppDB>(
    storeName: T,
    id: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete(storeName, id);
  }

  async clearStore<T extends keyof AppDB>(storeName: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.clear(storeName);
  }
}

export const localDB = LocalDatabase.getInstance();