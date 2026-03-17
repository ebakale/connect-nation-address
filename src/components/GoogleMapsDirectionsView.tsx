import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Navigation,
  MapPin,
  Clock,
  Route,
  Loader2,
  AlertCircle,
  Car,
  Footprints,
  Bus,
  ExternalLink,
  LocateFixed,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/services/googleMapsService';

interface SearchResult {
  uac: string;
  readable: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  verified: boolean;
}

interface GoogleMapsDirectionsViewProps {
  destination: SearchResult;
  origin?: { lat: number; lng: number } | null;
  onClose: () => void;
}

const GoogleMapsDirectionsView: React.FC<GoogleMapsDirectionsViewProps> = ({
  destination,
  origin: providedOrigin,
  onClose,
}) => {
  const { t } = useTranslation('common');
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const hasCalculatedRef = useRef(false);
  const hasFittedBoundsRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(providedOrigin || null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(!providedOrigin);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode | null>(null);
  const [showSteps, setShowSteps] = useState(true);
  const [isRendererReady, setIsRendererReady] = useState(false);

  // Reset hasFittedBoundsRef when route truly changes (new directions or travel mode change)
  useEffect(() => {
    hasFittedBoundsRef.current = false;
  }, [directionsResponse?.routes?.[0]?.overview_polyline]);

  // Load Google Maps using singleton service
  useEffect(() => {
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
      setTravelMode(google.maps.TravelMode.DRIVING);
      return;
    }

    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true);
        setTravelMode(google.maps.TravelMode.DRIVING);
      })
      .catch((err) => {
        setLoadError(err.message || 'Failed to load Google Maps');
      });
  }, []);

  // Get user location if not provided
  useEffect(() => {
    if (providedOrigin) {
      setUserLocation(providedOrigin);
      setIsLoadingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      setError(t('directions.geolocationNotSupported'));
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (err) => {
        setError(t('directions.locationAccessDenied'));
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [providedOrigin]);

  // Calculate route when we have both origin and destination (using callback-based API for reliability)
  const calculateRoute = useCallback(() => {
    if (!userLocation || !isLoaded || !travelMode) {
      console.log('Cannot calculate route - missing:', { userLocation: !!userLocation, isLoaded, travelMode });
      return;
    }

    console.log('Calculating route from', userLocation, 'to', destination.coordinates);
    setIsLoadingDirections(true);
    setError(null);

    const directionsService = new google.maps.DirectionsService();

    // Timeout protection - 15 seconds
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      console.error('Route calculation timed out');
      setIsLoadingDirections(false);
      setError(t('directions.routeTimedOut'));
    }, 15000);

    const request: google.maps.DirectionsRequest = {
      origin: userLocation,
      destination: destination.coordinates,
      travelMode: travelMode,
    };

    // Use callback-based API (more reliable than Promise for error handling)
    directionsService.route(request, (result, status) => {
      clearTimeout(timeoutId);
      
      // Ignore if already timed out
      if (timedOut) {
        console.log('Ignoring late response - already timed out');
        return;
      }

      console.log('Directions API response - status:', status);

      if (status === google.maps.DirectionsStatus.OK && result) {
        console.log('Route calculated successfully');
        setDirectionsResponse(result);
        setIsLoadingDirections(false);
      } else {
        console.error('Directions error - status:', status);

        switch (status) {
          case google.maps.DirectionsStatus.ZERO_RESULTS:
            setError(t('directions.errorNoRoute'));
            break;
          case google.maps.DirectionsStatus.NOT_FOUND:
            setError(t('directions.errorNotFound'));
            break;
          case google.maps.DirectionsStatus.REQUEST_DENIED:
            setError(t('directions.errorRequestDenied'));
            break;
          case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
            setError(t('directions.errorOverQueryLimit'));
            break;
          case google.maps.DirectionsStatus.UNKNOWN_ERROR:
            setError(t('directions.errorServer'));
            break;
          default:
            setError(t('directions.errorGeneric', { status }));
        }
        setIsLoadingDirections(false);
      }
    });
  }, [userLocation, destination.coordinates, isLoaded, travelMode]);

  // Reset calculation flag when relevant deps change
  useEffect(() => {
    hasCalculatedRef.current = false;
  }, [userLocation?.lat, userLocation?.lng, travelMode]);

  // Calculate route when dependencies change (only once per set of deps)
  useEffect(() => {
    if (userLocation && isLoaded && travelMode && !hasCalculatedRef.current) {
      hasCalculatedRef.current = true;
      calculateRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, isLoaded, travelMode]);

  const changeTravelMode = (mode: google.maps.TravelMode) => {
    hasCalculatedRef.current = false; // Allow recalculation for new mode
    setTravelMode(mode);
    setDirectionsResponse(null);
  };

  const openInExternalMaps = () => {
    const destLat = destination.coordinates.lat;
    const destLng = destination.coordinates.lng;
    const userAgent = navigator.userAgent || navigator.vendor;

    let url = '';
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      url = userLocation
        ? `maps://maps.apple.com/?saddr=${userLocation.lat},${userLocation.lng}&daddr=${destLat},${destLng}&dirflg=d`
        : `maps://maps.apple.com/?daddr=${destLat},${destLng}&dirflg=d`;
    } else if (/android/i.test(userAgent)) {
      url = `google.navigation:q=${destLat},${destLng}&mode=d`;
    } else {
      url = userLocation
        ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destLat},${destLng}`
        : `https://www.google.com/maps/dir//${destLat},${destLng}`;
    }

    window.open(url, '_blank');
  };

  const recenterMap = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(14);
    }
  };

  const routeLeg = directionsResponse?.routes[0]?.legs[0];

  // Initialize map when loaded
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapContainerRef.current, {
      center: userLocation || destination.coordinates,
      zoom: 14,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      },
      streetViewControl: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE],
      },
      fullscreenControl: false,
      gestureHandling: 'greedy',
      scrollwheel: true,
      disableDoubleClickZoom: false,
      draggable: true,
    });

    mapRef.current = map;

    // Create directions renderer with preserveViewport to prevent automatic zoom changes
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      preserveViewport: true, // CRITICAL: Prevents setDirections() from auto-fitting bounds
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 5,
      },
    });
    setIsRendererReady(true);
  }, [isLoaded, userLocation, destination.coordinates]);

  // Update map with directions or markers
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !isRendererReady) return;

    // Clear previous markers when showing directions
    if (directionsResponse && directionsRendererRef.current) {
      console.log('Setting directions on renderer');
      
      // CRITICAL: Ensure renderer is attached to the map before setting directions
      directionsRendererRef.current.setMap(mapRef.current);
      directionsRendererRef.current.setDirections(directionsResponse);
      
      // Only fit bounds ONCE when route first loads - prevents zoom snapping back
      const route = directionsResponse.routes[0];
      if (route && route.bounds && mapRef.current && !hasFittedBoundsRef.current) {
        console.log('Fitting map to route bounds (first time only)');
        mapRef.current.fitBounds(route.bounds);
        hasFittedBoundsRef.current = true;
      }
      
      // Hide individual markers when directions are shown
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
      if (destMarkerRef.current) destMarkerRef.current.setMap(null);
    } else {
      // Show markers when no directions
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] } as any);
      }

      // User location marker
      if (userLocation) {
        if (!userMarkerRef.current) {
          userMarkerRef.current = new google.maps.Marker({
            position: userLocation,
            map: mapRef.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
        } else {
          userMarkerRef.current.setPosition(userLocation);
          userMarkerRef.current.setMap(mapRef.current);
        }
      }

      // Destination marker
      if (!destMarkerRef.current) {
        destMarkerRef.current = new google.maps.Marker({
          position: destination.coordinates,
          map: mapRef.current,
        });
      } else {
        destMarkerRef.current.setMap(mapRef.current);
      }
    }
  }, [isLoaded, isRendererReady, directionsResponse, userLocation, destination.coordinates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
      if (destMarkerRef.current) destMarkerRef.current.setMap(null);
      if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
    };
  }, []);

  // Loading state
  if (!isLoaded && !loadError) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t('directions.loadingMaps')}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">{t('directions.unableToLoadMaps')}</h2>
            <p className="text-muted-foreground">
              {loadError || t('directions.mapsLoadError')}
            </p>
            <Button onClick={onClose}>{t('buttons.close')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Navigation className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold text-sm sm:text-base">{t('directions.title')}</h2>
            <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none">
              To: {destination.uac}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openInExternalMaps}>
            <ExternalLink className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('directions.openInMaps')}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Travel mode selector */}
      <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
        <Button
          variant={travelMode === google.maps?.TravelMode?.DRIVING ? 'default' : 'outline'}
          size="sm"
          onClick={() => travelMode && changeTravelMode(google.maps.TravelMode.DRIVING)}
          disabled={!isLoaded}
        >
          <Car className="h-4 w-4 mr-1" />
          {t('directions.drive')}
        </Button>
        <Button
          variant={travelMode === google.maps?.TravelMode?.WALKING ? 'default' : 'outline'}
          size="sm"
          onClick={() => travelMode && changeTravelMode(google.maps.TravelMode.WALKING)}
          disabled={!isLoaded}
        >
          <Footprints className="h-4 w-4 mr-1" />
          {t('directions.walk')}
        </Button>
        <Button
          variant={travelMode === google.maps?.TravelMode?.TRANSIT ? 'default' : 'outline'}
          size="sm"
          onClick={() => travelMode && changeTravelMode(google.maps.TravelMode.TRANSIT)}
          disabled={!isLoaded}
        >
          <Bus className="h-4 w-4 mr-1" />
          {t('directions.transit')}
        </Button>
      </div>

      {/* Map container */}
      <div className="flex-1 relative" style={{ touchAction: 'manipulation' }}>
        <div ref={mapContainerRef} className="w-full h-full touch-manipulation" style={{ touchAction: 'manipulation' }} />

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Recenter button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 shadow-lg"
          onClick={recenterMap}
        >
          <LocateFixed className="h-4 w-4" />
        </Button>

        {/* Loading overlay */}
        {(isLoadingLocation || isLoadingDirections) && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="bg-background rounded-lg p-4 shadow-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">
                {isLoadingLocation ? t('directions.gettingLocation') : t('directions.calculatingRoute')}
              </span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && !isLoadingLocation && !isLoadingDirections && (
          <div className="absolute top-4 left-4 right-4">
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-sm text-destructive">{error}</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Route summary and steps */}
      {routeLeg && (
        <div className="border-t bg-background max-h-[40%] flex flex-col">
          {/* Summary */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                <span className="font-semibold">{routeLeg.distance?.text}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{routeLeg.duration?.text}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSteps(!showSteps)}
            >
              {showSteps ? (
                <>
                  {t('directions.hideSteps')} <ChevronDown className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  {t('directions.showSteps')} <ChevronUp className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Turn-by-turn directions */}
          {showSteps && (
            <>
              <Separator />
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {routeLeg.steps?.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm"
                          dangerouslySetInnerHTML={{ __html: step.instructions }}
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.distance?.text} · {step.duration?.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Destination */}
                  <div className="flex gap-3 pt-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Arrive at destination</p>
                      <p className="text-xs text-muted-foreground">{destination.readable}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMapsDirectionsView;
