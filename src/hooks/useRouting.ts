import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  steps: RouteStep[];
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

interface UseRoutingResult {
  userLocation: Coordinates | null;
  destination: Coordinates | null;
  routeInfo: RouteInfo | null;
  isLoadingLocation: boolean;
  isLoadingDestination: boolean;
  locationError: string | null;
  destinationError: string | null;
  getUserLocation: () => Promise<Coordinates | null>;
  getDestinationFromUAC: (uac: string) => Promise<Coordinates | null>;
  clearRoute: () => void;
}

export const useRouting = (): UseRoutingResult => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingDestination, setIsLoadingDestination] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [destinationError, setDestinationError] = useState<string | null>(null);

  const getUserLocation = useCallback(async (): Promise<Coordinates | null> => {
    setIsLoadingLocation(true);
    setLocationError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation not supported');
        setIsLoadingLocation(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setIsLoadingLocation(false);
          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  const getDestinationFromUAC = useCallback(async (uac: string): Promise<Coordinates | null> => {
    setIsLoadingDestination(true);
    setDestinationError(null);

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('latitude, longitude')
        .eq('uac', uac)
        .single();

      if (error || !data) {
        setDestinationError('Address not found');
        setIsLoadingDestination(false);
        return null;
      }

      const coords = {
        lat: data.latitude,
        lng: data.longitude
      };
      setDestination(coords);
      setIsLoadingDestination(false);
      return coords;
    } catch (err) {
      setDestinationError('Failed to fetch address');
      setIsLoadingDestination(false);
      return null;
    }
  }, []);

  const clearRoute = useCallback(() => {
    setUserLocation(null);
    setDestination(null);
    setRouteInfo(null);
    setLocationError(null);
    setDestinationError(null);
  }, []);

  return {
    userLocation,
    destination,
    routeInfo,
    isLoadingLocation,
    isLoadingDestination,
    locationError,
    destinationError,
    getUserLocation,
    getDestinationFromUAC,
    clearRoute
  };
};
