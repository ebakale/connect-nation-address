import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  hasBeenOffline: boolean;
  lastOnlineTime: number | null;
  syncInProgress: boolean;
}

/**
 * Callback registered by data hooks to run their sync when connectivity resumes.
 * Use `useOfflineSyncRegistry` to register handlers; `useOffline` fires them all.
 */
type SyncHandler = () => Promise<void>;

const syncRegistry: Set<SyncHandler> = new Set();

/** Register a sync callback that fires automatically when the app comes back online. */
export const registerOfflineSyncHandler = (handler: SyncHandler) => {
  syncRegistry.add(handler);
  return () => syncRegistry.delete(handler);
};

export const useOffline = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    hasBeenOffline: false,
    lastOnlineTime: navigator.onLine ? Date.now() : null,
    syncInProgress: false
  });

  // Ref avoids stale closure — always reflects current hasBeenOffline without re-binding listeners
  const hasBeenOfflineRef = useRef(false);

  const triggerBackgroundSync = useCallback(async () => {
    if (!navigator.onLine) return;

    setState(prev => ({ ...prev, syncInProgress: true }));

    try {
      // Fire all registered data-layer sync handlers in parallel
      if (syncRegistry.size > 0) {
        await Promise.allSettled([...syncRegistry].map(fn => fn()));
      }

      // Also register Service Worker background sync tags as fallback
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if ('sync' in registration) {
            await (registration as any).sync.register('address-sync');
            await (registration as any).sync.register('incident-sync');
          }
        } catch {
          // SW not available in this context — silent fallback
        }
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    } finally {
      setState(prev => ({ ...prev, syncInProgress: false }));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        isOnline: true,
        isOffline: false,
        lastOnlineTime: Date.now()
      }));

      // Use ref — not stale captured state — to decide whether to sync
      if (hasBeenOfflineRef.current) {
        toast.success('Back online! Syncing data...');
        triggerBackgroundSync();
      }
    };

    const handleOffline = () => {
      hasBeenOfflineRef.current = true;
      setState(prev => ({
        ...prev,
        isOnline: false,
        isOffline: true,
        hasBeenOffline: true
      }));
      toast.info('You are offline. Changes will sync when connection returns.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      hasBeenOfflineRef.current = true;
      setState(prev => ({ ...prev, isOnline: false, isOffline: true, hasBeenOffline: true }));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // triggerBackgroundSync is stable (useCallback with no deps), so this is correct
  }, [triggerBackgroundSync]);

  const forceSyncData = async () => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline');
      return false;
    }

    try {
      await triggerBackgroundSync();
      toast.success('Data sync completed');
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error('Sync failed. Will retry automatically.');
      return false;
    }
  };

  const checkNetworkSpeed = async (): Promise<'fast' | 'slow' | 'offline'> => {
    if (!navigator.onLine) return 'offline';

    try {
      const start = Date.now();
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
      return Date.now() - start < 1000 ? 'fast' : 'slow';
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
