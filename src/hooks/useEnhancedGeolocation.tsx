import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { offlineStorage } from '@/lib/offlineStorage';
import { toast } from 'sonner';

export interface EnhancedLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  cached?: boolean;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  enableCaching?: boolean;
  enableTracking?: boolean;
}

export const useEnhancedGeolocation = (options: LocationOptions = {}) => {
  const [location, setLocation] = useState<EnhancedLocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState<string | null>(null);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000, // 5 minutes
    enableCaching: true,
    enableTracking: false,
    ...options
  };

  // Cache location data
  const cacheLocation = useCallback(async (locationData: EnhancedLocationData) => {
    if (defaultOptions.enableCaching) {
      try {
        await offlineStorage.setCachedData('last_location', locationData, 600000); // 10 minutes
      } catch (error) {
        console.error('Failed to cache location:', error);
      }
    }
  }, [defaultOptions.enableCaching]);

  // Get cached location
  const getCachedLocation = useCallback(async (): Promise<EnhancedLocationData | null> => {
    if (!defaultOptions.enableCaching) return null;
    
    try {
      const cached = await offlineStorage.getCachedData('last_location');
      if (cached) {
        return { ...cached, cached: true };
      }
    } catch (error) {
      console.error('Failed to get cached location:', error);
    }
    return null;
  }, [defaultOptions.enableCaching]);

  // Request permissions
  const requestPermissions = async (): Promise<boolean> => {
    try {
      let permissionGranted = false;

      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();
        permissionGranted = permission.location === 'granted';
      } else {
        // Web platform
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          permissionGranted = permission.state === 'granted';
        } else {
          // Fallback for older browsers
          permissionGranted = 'geolocation' in navigator;
        }
      }

      if (!permissionGranted) {
        setError('Location permission denied');
        toast.error('Location access is required for this feature');
      }

      return permissionGranted;
    } catch (error) {
      console.error('Permission request failed:', error);
      setError('Failed to request location permission');
      return false;
    }
  };

  // Get current position with enhanced features
  const getCurrentPosition = useCallback(async (useCache: boolean = true): Promise<EnhancedLocationData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Try cached location first if enabled
      if (useCache) {
        const cached = await getCachedLocation();
        if (cached) {
          setLocation(cached);
          setLoading(false);
          return cached;
        }
      }

      // Check permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      let position;
      
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor for native platforms
        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: defaultOptions.enableHighAccuracy,
          timeout: defaultOptions.timeout,
          maximumAge: defaultOptions.maximumAge
        });
      } else {
        // Use web geolocation API
        position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: defaultOptions.enableHighAccuracy,
            timeout: defaultOptions.timeout,
            maximumAge: defaultOptions.maximumAge
          });
        });
      }

      const locationData: EnhancedLocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp || Date.now()
      };

      setLocation(locationData);
      await cacheLocation(locationData);
      
      toast.success('Location updated successfully');
      return locationData;

    } catch (error: any) {
      console.error('Geolocation error:', error);
      let errorMessage = 'Failed to get location';
      
      if (error.code) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Location access denied';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Location unavailable';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location request timed out';
            break;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [defaultOptions, cacheLocation, getCachedLocation]);

  // Start location tracking
  const startTracking = useCallback(async () => {
    if (tracking) return;

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setTracking(true);
      
      let id: string;

      if (Capacitor.isNativePlatform()) {
        id = await Geolocation.watchPosition({
          enableHighAccuracy: defaultOptions.enableHighAccuracy,
          timeout: defaultOptions.timeout,
          maximumAge: defaultOptions.maximumAge
        }, (position) => {
          if (position) {
            const locationData: EnhancedLocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: position.timestamp || Date.now()
            };
            
            setLocation(locationData);
            cacheLocation(locationData);
          }
        });
      } else {
        id = navigator.geolocation.watchPosition(
          (position) => {
            const locationData: EnhancedLocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: position.timestamp || Date.now()
            };
            
            setLocation(locationData);
            cacheLocation(locationData);
          },
          (error) => {
            console.error('Watch position error:', error);
            setError('Location tracking failed');
          },
          {
            enableHighAccuracy: defaultOptions.enableHighAccuracy,
            timeout: defaultOptions.timeout,
            maximumAge: defaultOptions.maximumAge
          }
        ).toString();
      }

      setWatchId(id);
      toast.success('Location tracking started');
      
    } catch (error) {
      console.error('Failed to start tracking:', error);
      setError('Failed to start location tracking');
      setTracking(false);
    }
  }, [tracking, defaultOptions, cacheLocation]);

  // Stop location tracking
  const stopTracking = useCallback(async () => {
    if (!tracking || !watchId) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.clearWatch({ id: watchId });
      } else {
        navigator.geolocation.clearWatch(parseInt(watchId));
      }
      
      setWatchId(null);
      setTracking(false);
      toast.success('Location tracking stopped');
      
    } catch (error) {
      console.error('Failed to stop tracking:', error);
    }
  }, [tracking, watchId]);

  // Auto-start tracking if enabled
  useEffect(() => {
    if (defaultOptions.enableTracking) {
      startTracking();
    }

    return () => {
      if (tracking && watchId) {
        stopTracking();
      }
    };
  }, [defaultOptions.enableTracking]);

  // Clear location
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    tracking,
    getCurrentPosition,
    startTracking,
    stopTracking,
    clearLocation,
    requestPermissions
  };
};