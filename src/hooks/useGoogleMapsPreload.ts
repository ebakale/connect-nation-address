import { useEffect, useState } from 'react';
import { 
  loadGoogleMaps, 
  isGoogleMapsLoaded, 
  getGoogleMapsStatus,
  preloadGoogleMaps 
} from '@/services/googleMapsService';

interface UseGoogleMapsPreloadResult {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

/**
 * Hook to pre-load Google Maps SDK in the background
 * Call this in components where maps will likely be needed soon
 */
export const useGoogleMapsPreload = (autoPreload: boolean = true): UseGoogleMapsPreloadResult => {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-preload on mount if requested
  useEffect(() => {
    if (autoPreload && !isGoogleMapsLoaded()) {
      preloadGoogleMaps();
    }
  }, [autoPreload]);

  // Poll for status changes (in case loading started elsewhere)
  useEffect(() => {
    const checkStatus = () => {
      const status = getGoogleMapsStatus();
      setIsLoaded(status.isLoaded);
      setIsLoading(status.isLoading);
    };

    // Initial check
    checkStatus();

    // Check periodically while loading
    const interval = setInterval(() => {
      checkStatus();
      if (isGoogleMapsLoaded()) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loadGoogleMaps();
      setIsLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load Google Maps');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoaded,
    isLoading,
    error,
    load
  };
};

export default useGoogleMapsPreload;
