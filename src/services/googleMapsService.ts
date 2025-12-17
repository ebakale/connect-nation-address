/// <reference types="google.maps" />
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

// Singleton state
let cachedApiKey: string | null = null;
let loadPromise: Promise<typeof google.maps> | null = null;
let isLoaded = false;
let loader: Loader | null = null;

/**
 * Check if Google Maps SDK is already loaded and available
 */
export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && typeof google !== 'undefined' && !!google.maps;
};

/**
 * Get cached API key without fetching (returns null if not cached)
 */
export const getCachedApiKey = (): string | null => cachedApiKey;

/**
 * Fetch and cache the Google Maps API key from Supabase
 */
export const fetchApiKey = async (): Promise<string | null> => {
  if (cachedApiKey) return cachedApiKey;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const { data, error } = await supabase.functions.invoke('get-google-maps-token', {
      body: {}
    });
    
    clearTimeout(timeoutId);
    
    if (error || !data?.apiKey) {
      console.warn('Google Maps API key unavailable:', error?.message || 'No key returned');
      return null;
    }
    
    cachedApiKey = data.apiKey;
    return cachedApiKey;
  } catch (error: any) {
    console.warn('Failed to fetch Google Maps API key:', error.message);
    return null;
  }
};

/**
 * Load Google Maps SDK - singleton pattern ensures it only loads once
 * Returns immediately if already loaded
 */
export const loadGoogleMaps = async (): Promise<typeof google.maps | null> => {
  // Already loaded - return immediately
  if (isGoogleMapsLoaded()) {
    return google.maps;
  }
  
  // Loading in progress - wait for it
  if (loadPromise) {
    return loadPromise;
  }
  
  // Start loading
  loadPromise = (async () => {
    try {
      // Get API key (from cache or fetch)
      const apiKey = await fetchApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }
      
      // Create loader singleton
      if (!loader) {
        loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });
      }
      
      // Load the SDK
      await loader.load();
      isLoaded = true;
      
      console.log('Google Maps SDK loaded successfully');
      return google.maps;
    } catch (error: any) {
      console.error('Failed to load Google Maps:', error.message);
      loadPromise = null; // Allow retry on next call
      throw error;
    }
  })();
  
  return loadPromise;
};

/**
 * Pre-warm Google Maps in the background
 * Silently fails - does not throw
 */
export const preloadGoogleMaps = (): void => {
  // Don't await - fire and forget
  loadGoogleMaps().catch(() => {
    // Silently ignore - pre-warming is optional
  });
};

/**
 * Get the current loading status
 */
export const getGoogleMapsStatus = (): {
  isLoaded: boolean;
  isLoading: boolean;
  hasApiKey: boolean;
} => ({
  isLoaded: isGoogleMapsLoaded(),
  isLoading: loadPromise !== null && !isLoaded,
  hasApiKey: cachedApiKey !== null
});

/**
 * Reset the service (useful for testing or forced reload)
 */
export const resetGoogleMapsService = (): void => {
  cachedApiKey = null;
  loadPromise = null;
  isLoaded = false;
  loader = null;
};
