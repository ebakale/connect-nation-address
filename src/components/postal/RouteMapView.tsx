import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Navigation, MapPin, X, ExternalLink, Clock, Route as RouteIcon, ChevronRight } from 'lucide-react';
import { useRouting } from '@/hooks/useRouting';
import { OSM_CONFIG } from '@/lib/osmConfig';

interface RouteMapViewProps {
  deliveryUAC: string;
  recipientName: string;
  recipientAddress: string;
  onClose: () => void;
}

interface RouteStep {
  instruction: string;
  distance: number;
}

// Component to handle routing
const RoutingControl: React.FC<{
  origin: L.LatLng;
  destination: L.LatLng;
  onRouteCalculated: (distance: number, duration: number, steps: RouteStep[]) => void;
  onRouteError: () => void;
}> = ({ origin, destination, onRouteCalculated, onRouteError }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!map || !origin || !destination) return;

    // Remove existing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create routing control using the global L.Routing
    const LRouting = (L as any).Routing;
    if (!LRouting) {
      onRouteError();
      return;
    }

    const routingControl = LRouting.control({
      waypoints: [origin, destination],
      router: LRouting.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        styles: [{ color: 'hsl(215, 85%, 45%)', weight: 5, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    });

    routingControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        const steps: RouteStep[] = route.instructions?.map((inst: any) => ({
          instruction: inst.text || '',
          distance: inst.distance || 0
        })) || [];
        
        onRouteCalculated(route.summary.totalDistance, route.summary.totalTime, steps);
      }
    });

    routingControl.on('routingerror', () => {
      onRouteError();
    });

    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, origin, destination, onRouteCalculated, onRouteError]);

  return null;
};

export const RouteMapView: React.FC<RouteMapViewProps> = ({
  deliveryUAC,
  recipientName,
  recipientAddress,
  onClose
}) => {
  const { t } = useTranslation('postal');
  const { 
    userLocation, 
    destination, 
    isLoadingLocation, 
    isLoadingDestination,
    locationError,
    destinationError,
    getUserLocation, 
    getDestinationFromUAC 
  } = useRouting();

  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [routeError, setRouteError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Create custom marker icons
  const originIcon = L.divIcon({
    html: `<div style="
      width: 24px; 
      height: 24px; 
      background: hsl(215, 85%, 45%); 
      border-radius: 50%; 
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const destinationIcon = L.divIcon({
    html: `<div style="
      width: 30px; 
      height: 30px; 
      background: hsl(0, 72%, 45%); 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });

  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      await Promise.all([
        getUserLocation(),
        getDestinationFromUAC(deliveryUAC)
      ]);
      setIsInitializing(false);
    };
    initialize();
  }, [deliveryUAC, getUserLocation, getDestinationFromUAC]);

  const handleRouteCalculated = (distance: number, duration: number, steps: RouteStep[]) => {
    setRouteDistance(distance);
    setRouteDuration(duration);
    setRouteSteps(steps);
    setRouteError(false);
  };

  const handleRouteError = () => {
    setRouteError(true);
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  const openExternalMaps = () => {
    if (!destination) return;
    
    const { lat, lng } = destination;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`maps://maps.apple.com/?daddr=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  const isLoading = isInitializing || isLoadingLocation || isLoadingDestination;
  const hasError = locationError || destinationError || routeError;
  const canShowRoute = userLocation && destination && !isLoading;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <Navigation className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">{t('routing.title')}</h2>
            <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
              {recipientName}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('routing.calculating')}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && hasError && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {locationError ? t('routing.locationError') : 
                 destinationError ? t('routing.destinationError') : 
                 t('routing.routeError')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {locationError || destinationError || t('routing.routeError')}
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={openExternalMaps} variant="default" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('routing.openInMaps')}
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full">
                  {t('routing.close')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map and Route Info */}
      {canShowRoute && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Route Summary */}
          <div className="p-3 bg-card border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {routeDistance !== null && (
                  <div className="flex items-center gap-1.5">
                    <RouteIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{formatDistance(routeDistance)}</span>
                  </div>
                )}
                {routeDuration !== null && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{formatDuration(routeDuration)}</span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={openExternalMaps}>
                <ExternalLink className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">{t('routing.openInMaps')}</span>
              </Button>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={13}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                url={OSM_CONFIG.tileLayer}
                attribution={OSM_CONFIG.attribution}
              />
              
              {/* Origin Marker */}
              <Marker position={[userLocation.lat, userLocation.lng]} icon={originIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-medium">{t('routing.yourLocation')}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
                <Popup>
                  <div>
                    <p className="font-medium">{recipientName}</p>
                    <p className="text-sm text-muted-foreground">{recipientAddress}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Routing Control */}
              <RoutingControl
                origin={L.latLng(userLocation.lat, userLocation.lng)}
                destination={L.latLng(destination.lat, destination.lng)}
                onRouteCalculated={handleRouteCalculated}
                onRouteError={handleRouteError}
              />
            </MapContainer>
          </div>

          {/* Turn-by-turn Instructions */}
          {routeSteps.length > 0 && (
            <div className="h-48 border-t bg-card">
              <div className="p-2 border-b bg-muted/50">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <RouteIcon className="h-4 w-4" />
                  {t('routing.steps')} ({routeSteps.length})
                </h3>
              </div>
              <ScrollArea className="h-36">
                <div className="divide-y">
                  {routeSteps.map((step, index) => (
                    <div key={index} className="p-3 flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0 mt-0.5">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{step.instruction}</p>
                        {step.distance > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistance(step.distance)}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
