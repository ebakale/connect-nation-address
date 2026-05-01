import { useState, useEffect, useCallback } from 'react';
import { offlineStorage, OfflineAddress, OfflineIncident, OfflineUser } from '@/lib/offlineStorage';
import { useOffline, registerOfflineSyncHandler } from './useOffline';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOfflineAddresses = () => {
  const [addresses, setAddresses] = useState<OfflineAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, syncing: false });
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const { role } = useUserRole();

  const isFieldAgent = role === 'field_agent';

  const loadAddresses = useCallback(async () => {
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
  }, [user?.id]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const saveAddress = async (address: Omit<OfflineAddress, 'id' | 'created_at' | 'synced'>) => {
    try {
      const newAddress: OfflineAddress = {
        ...address,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        synced: isOnline,
        last_sync_attempt: null,
        sync_retry_count: 0
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

  const syncAddresses = useCallback(async (retryCount = 0) => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      setSyncErrors([]);
      const unsynced = await offlineStorage.getUnsyncedAddresses();

      if (unsynced.length === 0) return;

      setSyncProgress({ current: 0, total: unsynced.length, syncing: true });
      let syncedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < unsynced.length; i++) {
        const address = unsynced[i];
        try {
          setSyncProgress(prev => ({ ...prev, current: i + 1 }));

          if (isFieldAgent) {
            const { error: insertError } = await supabase
              .from('address_requests')
              .insert({
                requester_id: user?.id,
                country: address.country || 'Equatorial Guinea',
                region: address.region || '',
                city: address.city || '',
                street: address.street || '',
                building: address.building || null,
                latitude: address.latitude,
                longitude: address.longitude,
                address_type: address.address_type || 'residential',
                description: address.description || null,
                status: 'pending',
                request_type: 'create_address',
                claimant_type: 'field_agent',
                justification: 'Field agent offline address capture'
              });

            if (insertError) throw insertError;
          } else {
            const { error: insertError } = await supabase
              .from('addresses')
              .insert({
                user_id: user?.id,
                country: address.country || 'Equatorial Guinea',
                region: address.region || '',
                city: address.city || '',
                street: address.street || '',
                building: address.building || null,
                latitude: address.latitude,
                longitude: address.longitude,
                address_type: address.address_type || 'residential',
                description: address.description || null,
                uac: `EQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                verified: false,
                public: false
              });

            if (insertError) throw insertError;
          }

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
        if (retryCount < 3 && errors.length < unsynced.length / 2) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => syncAddresses(retryCount + 1), delay);
        }
      } else if (syncedCount > 0) {
        toast.success(`Successfully synced ${syncedCount} addresses`);
      }

      await loadAddresses();
    } catch (error) {
      setSyncProgress({ current: 0, total: 0, syncing: false });
      console.error('Failed to sync addresses:', error);
      toast.error('Failed to sync addresses');
      setSyncErrors([`Sync failed: ${error}`]);
    }
  }, [isFieldAgent, loadAddresses, user?.id]);

  // Auto-sync when connectivity resumes
  useEffect(() => {
    const unsubscribe = registerOfflineSyncHandler(async () => { await syncAddresses(); });
    return () => { unsubscribe; };
  }, [syncAddresses]);

  const getUnsyncedCount = async () => {
    try {
      const unsynced = await offlineStorage.getUnsyncedAddresses();
      return unsynced.length;
    } catch {
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
  const { user } = useAuth();
  const { isOnline } = useOffline();

  const loadIncidents = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const saveIncident = async (incident: Omit<OfflineIncident, 'id' | 'created_at' | 'synced'>) => {
    try {
      const newIncident: OfflineIncident = {
        ...incident,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        synced: isOnline,
        last_sync_attempt: null,
        sync_retry_count: 0
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

  const syncIncidents = useCallback(async (retryCount = 0) => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      setSyncErrors([]);
      const unsynced = await offlineStorage.getUnsyncedIncidents();

      if (unsynced.length === 0) return;

      setSyncProgress({ current: 0, total: unsynced.length, syncing: true });
      let syncedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < unsynced.length; i++) {
        const incident = unsynced[i];
        try {
          setSyncProgress(prev => ({ ...prev, current: i + 1 }));

          const { error: insertError } = await supabase
            .from('incidents')
            .insert({
              reported_by: user?.id,
              incident_number: incident.incident_number,
              description: incident.description,
              priority: incident.priority,
              status: incident.status,
              latitude: incident.latitude ?? null,
              longitude: incident.longitude ?? null,
              address: incident.address ?? null,
              created_at: incident.created_at
            });

          if (insertError) throw insertError;

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
        if (retryCount < 3 && errors.length < unsynced.length / 2) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => syncIncidents(retryCount + 1), delay);
        }
      } else if (syncedCount > 0) {
        toast.success(`Successfully synced ${syncedCount} incidents`);
      }

      await loadIncidents();
    } catch (error) {
      setSyncProgress({ current: 0, total: 0, syncing: false });
      console.error('Failed to sync incidents:', error);
      toast.error('Failed to sync incidents');
      setSyncErrors([`Sync failed: ${error}`]);
    }
  }, [loadIncidents, user?.id]);

  // Auto-sync when connectivity resumes
  useEffect(() => {
    const unsubscribe = registerOfflineSyncHandler(async () => { await syncIncidents(); });
    return () => { unsubscribe; };
  }, [syncIncidents]);

  const getUnsyncedCount = async () => {
    try {
      const unsynced = await offlineStorage.getUnsyncedIncidents();
      return unsynced.length;
    } catch {
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
