import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkGoogleMaps = useCallback(async () => {
    setIsLoading(true);
    setGoogleMapsError(null);

    try {
      // Quick check if Google Maps is already loaded
      if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
        setGoogleMapsApiKey('already-loaded');
        setProvider('google');
        setIsLoading(false);
        return;
      }

      // Try to fetch Google Maps API key with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const { data, error } = await supabase.functions.invoke('get-google-maps-token', {
        body: {}
      });
      
      clearTimeout(timeoutId);

      if (error || !data?.apiKey) {
        console.warn('Google Maps API key unavailable, using OSM');
        setGoogleMapsError('API key unavailable');
        setProvider('osm');
        setIsLoading(false);
        return;
      }

      setGoogleMapsApiKey(data.apiKey);
      
      // For verification dialog, prefer OSM for faster loading
      // Google Maps can be slow to initialize
      setProvider('osm');
      setIsLoading(false);
      
    } catch (error: any) {
      console.warn('Google Maps error, falling back to OpenStreetMap:', error.message);
      setGoogleMapsError(error.message || 'Unknown error');
      setProvider('osm');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if Google Maps is already loaded and working
    if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
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

  return {
    provider,
    googleMapsError,
    isLoading,
    googleMapsApiKey,
    retryGoogleMaps
  };
};
