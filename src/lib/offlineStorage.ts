// IndexedDB wrapper for offline data storage
export interface OfflineAddress {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  address_type: string;
  description?: string;
  photo_url?: string;
  created_at: string;
  synced: boolean;
}

export interface OfflineIncident {
  id: string;
  incident_number: string;
  description: string;
  priority: string;
  status: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  created_at: string;
  synced: boolean;
}

export interface OfflineUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  last_synced: string;
}

class OfflineStorage {
  private dbName = 'ConnectNationOffline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create addresses store
        if (!db.objectStoreNames.contains('addresses')) {
          const addressStore = db.createObjectStore('addresses', { keyPath: 'id' });
          addressStore.createIndex('user_id', 'user_id', { unique: false });
          addressStore.createIndex('synced', 'synced', { unique: false });
        }

        // Create incidents store
        if (!db.objectStoreNames.contains('incidents')) {
          const incidentStore = db.createObjectStore('incidents', { keyPath: 'id' });
          incidentStore.createIndex('status', 'status', { unique: false });
          incidentStore.createIndex('synced', 'synced', { unique: false });
        }

        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Create cached data store
        if (!db.objectStoreNames.contains('cached_data')) {
          const cacheStore = db.createObjectStore('cached_data', { keyPath: 'key' });
          cacheStore.createIndex('expires_at', 'expires_at', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Address operations
  async saveAddress(address: OfflineAddress): Promise<void> {
    const store = await this.getStore('addresses', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(address);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAddresses(userId?: string): Promise<OfflineAddress[]> {
    const store = await this.getStore('addresses');
    return new Promise((resolve, reject) => {
      const request = userId ? store.index('user_id').getAll(userId) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedAddresses(): Promise<OfflineAddress[]> {
    const store = await this.getStore('addresses');
    return new Promise((resolve, reject) => {
      const request = store.index('synced').openCursor(IDBKeyRange.only(false));
      const results: OfflineAddress[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markAddressSynced(id: string): Promise<void> {
    const store = await this.getStore('addresses', 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const address = getRequest.result;
        if (address) {
          address.synced = true;
          const putRequest = store.put(address);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Incident operations
  async saveIncident(incident: OfflineIncident): Promise<void> {
    const store = await this.getStore('incidents', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(incident);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getIncidents(): Promise<OfflineIncident[]> {
    const store = await this.getStore('incidents');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedIncidents(): Promise<OfflineIncident[]> {
    const store = await this.getStore('incidents');
    return new Promise((resolve, reject) => {
      const request = store.index('synced').openCursor(IDBKeyRange.only(false));
      const results: OfflineIncident[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markIncidentSynced(id: string): Promise<void> {
    const store = await this.getStore('incidents', 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const incident = getRequest.result;
        if (incident) {
          incident.synced = true;
          const putRequest = store.put(incident);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // User operations
  async saveUser(user: OfflineUser): Promise<void> {
    const store = await this.getStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(id: string): Promise<OfflineUser | null> {
    const store = await this.getStore('users');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic cache operations
  async setCachedData(key: string, data: any, expiresInMs: number = 3600000): Promise<void> {
    const store = await this.getStore('cached_data', 'readwrite');
    const cacheItem = {
      key,
      data,
      created_at: Date.now(),
      expires_at: Date.now() + expiresInMs
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(cacheItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    const store = await this.getStore('cached_data');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expires_at > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredCache(): Promise<void> {
    const store = await this.getStore('cached_data', 'readwrite');
    const now = Date.now();
    
    return new Promise((resolve, reject) => {
      const request = store.index('expires_at').openCursor(IDBKeyRange.upperBound(now));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data
  async clearAll(): Promise<void> {
    if (!this.db) return;
    
    const storeNames = ['addresses', 'incidents', 'users', 'cached_data'];
    const promises = storeNames.map(async (storeName) => {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
    
    await Promise.all(promises);
  }
}

export const offlineStorage = new OfflineStorage();