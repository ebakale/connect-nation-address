import { useState, useCallback } from 'react';
import { loadGoogleMaps } from '@/services/googleMapsService';

export interface DirectionsResult {
  route: google.maps.DirectionsRoute | null;
  distance: string;
  duration: string;
  steps: google.maps.DirectionsStep[];
}

export interface UseGoogleDirectionsResult {
  userLocation: google.maps.LatLngLiteral | null;
  directionsResult: DirectionsResult | null;
  isLoadingLocation: boolean;
  isLoadingDirections: boolean;
  locationError: string | null;
  directionsError: string | null;
  getUserLocation: () => Promise<google.maps.LatLngLiteral | null>;
  calculateRoute: (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    travelMode?: google.maps.TravelMode
  ) => Promise<DirectionsResult | null>;
  clearDirections: () => void;
}

export const useGoogleDirections = (): UseGoogleDirectionsResult => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [directionsResult, setDirectionsResult] = useState<DirectionsResult | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);

  const getUserLocation = useCallback(async (): Promise<google.maps.LatLngLiteral | null> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return null;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setIsLoadingLocation(false);
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  const calculateRoute = useCallback(
    async (
      origin: google.maps.LatLngLiteral,
      destination: google.maps.LatLngLiteral,
      travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
    ): Promise<DirectionsResult | null> => {
      setIsLoadingDirections(true);
      setDirectionsError(null);

      try {
        // Ensure Google Maps is loaded
        await loadGoogleMaps();

        const directionsService = new google.maps.DirectionsService();

        return new Promise((resolve) => {
          directionsService.route(
            {
              origin,
              destination,
              travelMode,
            },
            (result, status) => {
              setIsLoadingDirections(false);

              if (status === google.maps.DirectionsStatus.OK && result) {
                const route = result.routes[0];
                const leg = route.legs[0];

                const directionsData: DirectionsResult = {
                  route,
                  distance: leg.distance?.text || '',
                  duration: leg.duration?.text || '',
                  steps: leg.steps || [],
                };

                setDirectionsResult(directionsData);
                resolve(directionsData);
              } else {
                let errorMessage = 'Could not calculate route';
                switch (status) {
                  case google.maps.DirectionsStatus.NOT_FOUND:
                    errorMessage = 'Origin or destination not found';
                    break;
                  case google.maps.DirectionsStatus.ZERO_RESULTS:
                    errorMessage = 'No route found between these locations';
                    break;
                  case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
                    errorMessage = 'Too many requests. Please try again later';
                    break;
                  case google.maps.DirectionsStatus.REQUEST_DENIED:
                    errorMessage = 'Directions request denied';
                    break;
                }
                setDirectionsError(errorMessage);
                resolve(null);
              }
            }
          );
        });
      } catch (error) {
        setIsLoadingDirections(false);
        setDirectionsError('Failed to load Google Maps');
        return null;
      }
    },
    []
  );

  const clearDirections = useCallback(() => {
    setDirectionsResult(null);
    setDirectionsError(null);
  }, []);

  return {
    userLocation,
    directionsResult,
    isLoadingLocation,
    isLoadingDirections,
    locationError,
    directionsError,
    getUserLocation,
    calculateRoute,
    clearDirections,
  };
};
