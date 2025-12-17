import { useState, useEffect, useCallback } from 'react';
import { 
  loadGoogleMaps, 
  isGoogleMapsLoaded, 
  getGoogleMapsStatus 
} from '@/services/googleMapsService';

export type MapProvider = 'google' | 'osm' | 'loading';

interface UseMapProviderResult {
  provider: MapProvider;
  googleMapsError: string | null;
  isLoading: boolean;
  googleMapsApiKey: string | null;
  retryGoogleMaps: () => void;
}

export const useMapProvider = (): UseMapProviderResult => {
  const [provider, setProvider] = useState<MapProvider>('loading');
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkGoogleMaps = useCallback(async () => {
    setIsLoading(true);
    setGoogleMapsError(null);

    // Quick check if Google Maps is already loaded
    if (isGoogleMapsLoaded()) {
      setProvider('google');
      setIsLoading(false);
      return;
    }

    try {
      // Try to load Google Maps using singleton service
      await loadGoogleMaps();
      setProvider('google');
    } catch (error: any) {
      console.warn('Google Maps unavailable, using OSM fallback:', error.message);
      setGoogleMapsError(error.message || 'Google Maps unavailable');
      setProvider('osm');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (isGoogleMapsLoaded()) {
      setProvider('google');
      setIsLoading(false);
      return;
    }

    checkGoogleMaps();
  }, [checkGoogleMaps]);

  const retryGoogleMaps = useCallback(() => {
    setProvider('loading');
    checkGoogleMaps();
  }, [checkGoogleMaps]);

  // Get API key status from service
  const status = getGoogleMapsStatus();

  return {
    provider,
    googleMapsError,
    isLoading,
    googleMapsApiKey: status.hasApiKey ? 'cached' : null,
    retryGoogleMaps
  };
};
