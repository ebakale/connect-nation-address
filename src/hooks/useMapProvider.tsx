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
      // Try to fetch Google Maps API key
      const { data, error } = await supabase.functions.invoke('get-google-maps-token');
      
      if (error) {
        console.warn('Failed to fetch Google Maps API key:', error);
        setGoogleMapsError('API key unavailable');
        setProvider('osm');
        return;
      }

      if (!data?.apiKey) {
        console.warn('No Google Maps API key configured');
        setGoogleMapsError('API key not configured');
        setProvider('osm');
        return;
      }

      setGoogleMapsApiKey(data.apiKey);

      // Try to load Google Maps to check for billing errors
      const testScript = document.createElement('script');
      testScript.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&callback=__googleMapsTestCallback`;
      
      // Create a promise to handle the callback
      const loadPromise = new Promise<void>((resolve, reject) => {
        // Success callback
        (window as any).__googleMapsTestCallback = () => {
          delete (window as any).__googleMapsTestCallback;
          resolve();
        };

        // Error handler for billing/API errors
        const handleError = (event: ErrorEvent) => {
          if (event.message?.includes('BillingNotEnabledMapError') || 
              event.message?.includes('InvalidKeyMapError') ||
              event.message?.includes('ApiNotActivatedMapError') ||
              event.error?.message?.includes('BillingNotEnabled')) {
            reject(new Error('Google Maps billing not enabled'));
          }
        };

        window.addEventListener('error', handleError);
        
        testScript.onerror = () => {
          window.removeEventListener('error', handleError);
          reject(new Error('Failed to load Google Maps script'));
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          window.removeEventListener('error', handleError);
          if (provider === 'loading') {
            // If still loading, check if google.maps exists
            if (typeof google !== 'undefined' && google.maps) {
              resolve();
            } else {
              reject(new Error('Google Maps load timeout'));
            }
          }
        }, 10000);
      });

      // Only add script if not already loaded
      if (typeof google === 'undefined' || !google.maps) {
        document.head.appendChild(testScript);
      }

      await loadPromise;
      setProvider('google');
      
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
