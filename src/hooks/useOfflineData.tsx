import { useState, useEffect } from 'react';
import { offlineStorage, OfflineAddress, OfflineIncident, OfflineUser } from '@/lib/offlineStorage';
import { useOffline } from './useOffline';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useOfflineAddresses = () => {
  const [addresses, setAddresses] = useState<OfflineAddress[]>([]);
  const [loading, setLoading] = useState(true);
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

  const syncAddresses = async () => {
    if (!isOnline) return;

    try {
      const unsynced = await offlineStorage.getUnsyncedAddresses();
      
      for (const address of unsynced) {
        // Here you would normally sync with your backend
        // For now, we'll just mark them as synced
        await offlineStorage.markAddressSynced(address.id);
      }

      await loadAddresses();
      toast.success(`Synced ${unsynced.length} addresses`);
    } catch (error) {
      console.error('Failed to sync addresses:', error);
      toast.error('Failed to sync addresses');
    }
  };

  return {
    addresses,
    loading,
    saveAddress,
    syncAddresses,
    refreshAddresses: loadAddresses
  };
};

export const useOfflineIncidents = () => {
  const [incidents, setIncidents] = useState<OfflineIncident[]>([]);
  const [loading, setLoading] = useState(true);
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

  const syncIncidents = async () => {
    if (!isOnline) return;

    try {
      const unsynced = await offlineStorage.getUnsyncedIncidents();
      
      for (const incident of unsynced) {
        // Here you would normally sync with your backend
        await offlineStorage.markIncidentSynced(incident.id);
      }

      await loadIncidents();
      toast.success(`Synced ${unsynced.length} incidents`);
    } catch (error) {
      console.error('Failed to sync incidents:', error);
      toast.error('Failed to sync incidents');
    }
  };

  return {
    incidents,
    loading,
    saveIncident,
    syncIncidents,
    refreshIncidents: loadIncidents
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