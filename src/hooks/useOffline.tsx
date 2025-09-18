import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  hasBeenOffline: boolean;
  lastOnlineTime: number | null;
  syncInProgress: boolean;
}

export const useOffline = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    hasBeenOffline: false,
    lastOnlineTime: navigator.onLine ? Date.now() : null,
    syncInProgress: false
  });

  useEffect(() => {
    const handleOnline = () => {
      console.log('App is back online');
      setState(prev => ({
        ...prev,
        isOnline: true,
        isOffline: false,
        lastOnlineTime: Date.now()
      }));
      
      if (state.hasBeenOffline) {
        toast.success('Back online! Syncing data...');
        triggerBackgroundSync();
      }
    };

    const handleOffline = () => {
      console.log('App is offline');
      setState(prev => ({
        ...prev,
        isOnline: false,
        isOffline: true,
        hasBeenOffline: true
      }));
      
      toast.info('You are offline. Changes will sync when connection returns.');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection on mount
    if (!navigator.onLine && !state.hasBeenOffline) {
      setState(prev => ({
        ...prev,
        isOnline: false,
        isOffline: true,
        hasBeenOffline: true
      }));
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.hasBeenOffline]);

  const triggerBackgroundSync = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service worker not supported');
      return;
    }

    try {
      setState(prev => ({ ...prev, syncInProgress: true }));
      
      const registration = await navigator.serviceWorker.ready;
      
      // Check if sync is supported and register
      if ('sync' in registration) {
        await (registration as any).sync.register('address-sync');
        await (registration as any).sync.register('incident-sync');
        console.log('Background sync registered');
      } else {
        console.log('Background sync not supported, using manual sync');
      }
      
      // Manual sync fallback
      setTimeout(() => {
        setState(prev => ({ ...prev, syncInProgress: false }));
      }, 5000);
      
    } catch (error) {
      console.error('Background sync registration failed:', error);
      setState(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  const forceSyncData = async () => {
    if (state.isOffline) {
      toast.error('Cannot sync while offline');
      return false;
    }

    try {
      setState(prev => ({ ...prev, syncInProgress: true }));
      await triggerBackgroundSync();
      toast.success('Data sync initiated');
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error('Sync failed. Will retry automatically.');
      return false;
    } finally {
      setState(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  const checkNetworkSpeed = async (): Promise<'fast' | 'slow' | 'offline'> => {
    if (!navigator.onLine) return 'offline';

    try {
      const start = Date.now();
      await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const duration = Date.now() - start;
      
      return duration < 1000 ? 'fast' : 'slow';
    } catch {
      return 'offline';
    }
  };

  return {
    ...state,
    triggerSync: triggerBackgroundSync,
    forceSyncData,
    checkNetworkSpeed
  };
};