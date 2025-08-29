import { useState, useEffect } from 'react';
import { offlineStorage, OfflineAddress, OfflineIncident, OfflineUser } from '@/lib/offlineStorage';
import { useOffline } from './useOffline';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useOfflineAddresses = () => {
  const [addresses, setAddresses] = useState<OfflineAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, syncing: false });
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const { user } = useAuth();
  const { isOnline } = useOffline();

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      await offlineStorage.init();
      const data = await offlineStorage.getAddresses(user?.id);
      setAddresses(data);
    } catch (error) {
      console.error('Failed to load offline addresses:', error);
      toast.error('Failed to load cached addresses');
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (address: Omit<OfflineAddress, 'id' | 'created_at' | 'synced'>) => {
    try {
      const newAddress: OfflineAddress = {
        ...address,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        synced: isOnline
      };

      await offlineStorage.saveAddress(newAddress);
      setAddresses(prev => [...prev, newAddress]);

      if (!isOnline) {
        toast.info('Address saved offline. Will sync when connection returns.');
      }

      return newAddress;
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('Failed to save address');
      throw error;
    }
  };

  const syncAddresses = async (retryCount = 0) => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      setSyncErrors([]);
      const unsynced = await offlineStorage.getUnsyncedAddresses();
      
      if (unsynced.length === 0) {
        toast.info('No addresses to sync');
        return;
      }

      setSyncProgress({ current: 0, total: unsynced.length, syncing: true });
      let syncedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < unsynced.length; i++) {
        const address = unsynced[i];
        try {
          setSyncProgress(prev => ({ ...prev, current: i + 1 }));
          
          // Here you would normally sync with your backend
          // Simulate network delay and potential failure
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // For now, we'll just mark them as synced
          await offlineStorage.markAddressSynced(address.id);
          syncedCount++;
        } catch (error) {
          const errorMsg = `Failed to sync address ${address.street}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      setSyncProgress({ current: 0, total: 0, syncing: false });
      setSyncErrors(errors);

      if (errors.length > 0) {
        toast.warning(`Synced ${syncedCount}/${unsynced.length} addresses. ${errors.length} failed.`);
        
        // Auto-retry failed syncs with exponential backoff
        if (retryCount < 3 && errors.length < unsynced.length / 2) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          setTimeout(() => syncAddresses(retryCount + 1), delay);
        }
      } else {
        toast.success(`Successfully synced ${syncedCount} addresses`);
      }

      await loadAddresses();
    } catch (error) {
      setSyncProgress({ current: 0, total: 0, syncing: false });
      console.error('Failed to sync addresses:', error);
      toast.error('Failed to sync addresses');
      setSyncErrors([`Sync failed: ${error}`]);
    }
  };

  const getUnsyncedCount = async () => {
    try {
      const unsynced = await offlineStorage.getUnsyncedAddresses();
      return unsynced.length;
    } catch (error) {
      console.error('Failed to get unsynced count:', error);
      return 0;
    }
  };

  return {
    addresses,
    loading,
    saveAddress,
    syncAddresses,
    refreshAddresses: loadAddresses,
    syncProgress,
    syncErrors,
    getUnsyncedCount
  };
};

export const useOfflineIncidents = () => {
  const [incidents, setIncidents] = useState<OfflineIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, syncing: false });
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const { isOnline } = useOffline();

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      await offlineStorage.init();
      const data = await offlineStorage.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load offline incidents:', error);
      toast.error('Failed to load cached incidents');
    } finally {
      setLoading(false);
    }
  };

  const saveIncident = async (incident: Omit<OfflineIncident, 'id' | 'created_at' | 'synced'>) => {
    try {
      const newIncident: OfflineIncident = {
        ...incident,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        synced: isOnline
      };

      await offlineStorage.saveIncident(newIncident);
      setIncidents(prev => [...prev, newIncident]);

      if (!isOnline) {
        toast.info('Incident saved offline. Will sync when connection returns.');
      }

      return newIncident;
    } catch (error) {
      console.error('Failed to save incident:', error);
      toast.error('Failed to save incident');
      throw error;
    }
  };

  const syncIncidents = async (retryCount = 0) => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      setSyncErrors([]);
      const unsynced = await offlineStorage.getUnsyncedIncidents();
      
      if (unsynced.length === 0) {
        toast.info('No incidents to sync');
        return;
      }

      setSyncProgress({ current: 0, total: unsynced.length, syncing: true });
      let syncedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < unsynced.length; i++) {
        const incident = unsynced[i];
        try {
          setSyncProgress(prev => ({ ...prev, current: i + 1 }));
          
          // Here you would normally sync with your backend
          // Simulate network delay and potential failure
          await new Promise(resolve => setTimeout(resolve, 100));
          
          await offlineStorage.markIncidentSynced(incident.id);
          syncedCount++;
        } catch (error) {
          const errorMsg = `Failed to sync incident ${incident.incident_number}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      setSyncProgress({ current: 0, total: 0, syncing: false });
      setSyncErrors(errors);

      if (errors.length > 0) {
        toast.warning(`Synced ${syncedCount}/${unsynced.length} incidents. ${errors.length} failed.`);
        
        // Auto-retry failed syncs with exponential backoff
        if (retryCount < 3 && errors.length < unsynced.length / 2) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => syncIncidents(retryCount + 1), delay);
        }
      } else {
        toast.success(`Successfully synced ${syncedCount} incidents`);
      }

      await loadIncidents();
    } catch (error) {
      setSyncProgress({ current: 0, total: 0, syncing: false });
      console.error('Failed to sync incidents:', error);
      toast.error('Failed to sync incidents');
      setSyncErrors([`Sync failed: ${error}`]);
    }
  };

  const getUnsyncedCount = async () => {
    try {
      const unsynced = await offlineStorage.getUnsyncedIncidents();
      return unsynced.length;
    } catch (error) {
      console.error('Failed to get unsynced count:', error);
      return 0;
    }
  };

  return {
    incidents,
    loading,
    saveIncident,
    syncIncidents,
    refreshIncidents: loadIncidents,
    syncProgress,
    syncErrors,
    getUnsyncedCount
  };
};

export const useOfflineCache = () => {
  const cacheData = async (key: string, data: any, expiresInMs: number = 3600000) => {
    try {
      await offlineStorage.init();
      await offlineStorage.setCachedData(key, data, expiresInMs);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const getCachedData = async (key: string) => {
    try {
      await offlineStorage.init();
      return await offlineStorage.getCachedData(key);
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  };

  const clearExpiredCache = async () => {
    try {
      await offlineStorage.init();
      await offlineStorage.clearExpiredCache();
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  };

  return {
    cacheData,
    getCachedData,
    clearExpiredCache
  };
};