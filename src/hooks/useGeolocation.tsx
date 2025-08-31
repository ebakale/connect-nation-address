import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const {
    enableHighAccuracy = true,
    timeout = 30000, // Increased to 30 seconds for web browsers
    maximumAge = 60000,
  } = options;

  const getCurrentPosition = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Try Capacitor Geolocation first (for mobile)
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge,
      });

      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    } catch (capacitorError) {
      // Fallback to browser geolocation
      if (!navigator.geolocation) {
        setState(prev => ({
          ...prev,
          error: 'Geolocation is not supported by this device',
          loading: false,
        }));
        return;
      }

      const handleSuccess = (position: GeolocationPosition) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      };

      const handleError = (error: GeolocationPositionError) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services in your device settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your connection.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location timed out. Move to open sky and try again.';
            break;
          default:
            errorMessage = 'An unknown location error occurred.';
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      };

      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    }
  };

  const requestPermission = async () => {
    try {
      // Request permissions for Capacitor
      const permissions = await Geolocation.requestPermissions();
      if (permissions.location === 'granted') {
        await getCurrentPosition();
      } else {
        setState(prev => ({
          ...prev,
          error: 'Location permission denied. Please enable location access in your device settings.',
          loading: false,
        }));
      }
    } catch (error) {
      // Fallback for web
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (permission.state === 'granted' || permission.state === 'prompt') {
            await getCurrentPosition();
          } else {
            setState(prev => ({
              ...prev,
              error: 'Location permission denied. Please enable location access in your browser settings.',
              loading: false,
            }));
          }
        } catch (error) {
          await getCurrentPosition();
        }
      } else {
        await getCurrentPosition();
      }
    }
  };

  const clearLocation = () => {
    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      error: null,
      loading: false,
    });
  };

  return {
    ...state,
    getCurrentPosition: requestPermission,
    clearLocation,
  };
};