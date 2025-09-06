import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Crosshair, 
  Building2, 
  Landmark, 
  ShoppingBag,
  Navigation,
  AlertCircle,
  Map,
  Satellite
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';

interface MapLocation {
  uac: string;
  coordinates: [number, number];
  name: string;
  type: string;
  verified: boolean;
}

const DashboardLocationMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const currentLocationMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapStyle, setMapStyle] = useState<string>('mapbox://styles/mapbox/light-v11');
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [nearbyUAC, setNearbyUAC] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const { toast } = useToast();
  
  const {
    latitude,
    longitude,
    accuracy,
    error: locationError,
    loading: locationLoading,
    getCurrentPosition
  } = useGeolocation();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
        console.log('Mapbox token fetched successfully');
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setMapError('Failed to load map token. Please check your connection.');
        // Try localStorage fallback
        const localToken = localStorage.getItem('mapboxToken');
        if (localToken) {
          setMapboxToken(localToken);
          setMapError(null);
          console.log('Using stored Mapbox token');
        }
      }
    };

    fetchMapboxToken();
  }, []);

  // Auto request current location once map token is ready
  useEffect(() => {
    if (mapboxToken && !latitude && !longitude && !locationLoading) {
      getCurrentPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken]);

  // Fetch non-residential locations (POI) within 200m of current location
  useEffect(() => {
    const fetchPOILocations = async () => {
      if (!latitude || !longitude) {
        // No location yet: don't show unrelated POIs
        setLocations([]);
        return;
      }

      try {
        // Calculate precise degree tolerances for ~200 meters at current latitude
        const latTol = 200 / 111320; // ~0.001796 degrees
        const lonTol = 200 / (111320 * Math.cos((latitude * Math.PI) / 180));
        
        const { data, error } = await supabase
          .from('addresses')
          .select('uac, latitude, longitude, street, city, address_type, verified')
          .eq('verified', true)
          .neq('address_type', 'residential')
          .eq('public', true)
          .gte('latitude', latitude - latTol)
          .lte('latitude', latitude + latTol)
          .gte('longitude', longitude - lonTol)
          .lte('longitude', longitude + lonTol);

        if (error) throw error;

        // Filter by exact distance (200m) and map to required format
        const filteredLocations: MapLocation[] = [];
        
        data?.forEach(addr => {
          const distance = calculateDistance(
            latitude, longitude,
            Number(addr.latitude), Number(addr.longitude)
          );
          
          if (distance <= 200) {
            filteredLocations.push({
              uac: addr.uac,
              coordinates: [addr.longitude, addr.latitude] as [number, number],
              name: `${addr.street}, ${addr.city}`,
              type: addr.address_type,
              verified: addr.verified
            });
          }
        });

        setLocations(filteredLocations);
        console.log(`Found ${filteredLocations.length} POIs within 200m`);
      } catch (error) {
        console.error('Error fetching POI locations:', error);
      }
    };

    fetchPOILocations();
  }, [latitude, longitude]);

  // Check for nearby UAC when location changes
  useEffect(() => {
    if (latitude && longitude) {
      checkNearbyUAC(latitude, longitude);
    }
  }, [latitude, longitude]);

  const checkNearbyUAC = async (lat: number, lng: number) => {
    try {
      // Check for addresses within 20 meters (approximately 0.0002 degrees)
      const tolerance = 0.0002;
      
      const { data, error } = await supabase
        .from('addresses')
        .select('uac, latitude, longitude, street')
        .eq('verified', true)
        .gte('latitude', lat - tolerance)
        .lte('latitude', lat + tolerance)
        .gte('longitude', lng - tolerance)
        .lte('longitude', lng + tolerance);

      if (error) throw error;

      // Calculate exact distance to find closest UAC within 20m
      let closestUAC: string | null = null;
      let minDistance = Infinity;

      data?.forEach(addr => {
        const distance = calculateDistance(
          lat, lng, 
          Number(addr.latitude), Number(addr.longitude)
        );
        
        if (distance <= 20 && distance < minDistance) {
          minDistance = distance;
          closestUAC = addr.uac;
        }
      });

      setNearbyUAC(closestUAC);
    } catch (error) {
      console.error('Error checking nearby UAC:', error);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'commercial': return '#9333ea'; // purple
      case 'landmark': return '#dc2626'; // red
      case 'government': return '#16a34a'; // green
      case 'industrial': return '#ea580c'; // orange
      default: return '#3b82f6'; // blue
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) {
      console.log('Map initialization skipped - missing container or token');
      return;
    }

    console.log('Initializing map with token');
    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: longitude && latitude ? [longitude, latitude] : [9.7506, 1.7500], // Default to Malabo
        zoom: longitude && latitude ? 15 : 10,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsMapReady(true);
        setMapError(null);
        
        // Add current location marker if available
        if (latitude && longitude) {
          updateCurrentLocationMarker(latitude, longitude);
        }

        // Add POI markers
        locations.forEach(location => {
          const el = document.createElement('div');
          el.className = 'marker-poi';
          el.style.backgroundColor = getMarkerColor(location.type);
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          const marker = new mapboxgl.Marker(el)
            .setLngLat(location.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div class="p-2">
                    <div class="font-semibold">${location.name}</div>
                    <div class="text-sm text-gray-600 capitalize">${location.type}</div>
                    <div class="text-xs text-blue-600">${location.uac}</div>
                  </div>
                `)
            )
            .addTo(map.current!);
        });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please refresh the page.');
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please check your connection.');
    }
  };

  const updateCurrentLocationMarker = (lat: number, lng: number) => {
    if (!map.current) return;

    // Remove existing marker
    if (currentLocationMarker.current) {
      currentLocationMarker.current.remove();
    }

    // Create current location marker
    const el = document.createElement('div');
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.backgroundColor = '#3b82f6';
    el.style.border = '3px solid white';
    el.style.borderRadius = '50%';
    el.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';

    currentLocationMarker.current = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <div class="font-semibold flex items-center gap-2">
                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                Your Location
              </div>
              <div class="text-sm text-gray-600">
                Accuracy: ${accuracy ? `±${Math.round(accuracy)}m` : 'Unknown'}
              </div>
              ${nearbyUAC ? `<div class="text-sm font-medium text-green-600 mt-1">UAC: ${nearbyUAC}</div>` : ''}
            </div>
          `)
      )
      .addTo(map.current);

    // Center map on current location
    map.current.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1000
    });
  };

  // Initialize map when token and locations are ready
  useEffect(() => {
    if (mapboxToken && locations.length >= 0) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, locations, mapStyle]);

  // Update current location marker when coordinates change
  useEffect(() => {
    if (latitude && longitude && map.current && isMapReady) {
      updateCurrentLocationMarker(latitude, longitude);
    }
  }, [latitude, longitude, accuracy, isMapReady]);

  // Update map style when style changes
  useEffect(() => {
    if (map.current && isMapReady) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle, isMapReady]);

  const handleGetLocation = () => {
    getCurrentPosition();
  };

  const toggleMapStyle = () => {
    setMapStyle(prevStyle => 
      prevStyle === 'mapbox://styles/mapbox/light-v11' 
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/light-v11'
    );
  };

  return (
    <Card className="shadow-card h-96">
      <CardContent className="p-0 relative h-full">
        {/* Loading State */}
        {!isMapReady && !mapError && (
          <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center space-y-2">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {mapError && (
          <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center space-y-2 p-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-sm text-destructive font-medium">Map Error</p>
              <p className="text-xs text-muted-foreground">{mapError}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setMapError(null);
                  setIsMapReady(false);
                  if (mapboxToken) {
                    initializeMap();
                  }
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div 
          ref={mapContainer} 
          className={`w-full h-full rounded-lg ${!isMapReady ? 'hidden' : ''}`} 
        />
        
        {/* Location Controls */}
        {isMapReady && (
          <div className="absolute top-4 left-4 z-10 space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-background/95 backdrop-blur"
              onClick={handleGetLocation}
              disabled={locationLoading}
            >
              <Crosshair className="h-4 w-4 mr-2" />
              {locationLoading ? 'Getting Location...' : 'My Location'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="bg-background/95 backdrop-blur"
              onClick={toggleMapStyle}
            >
              {mapStyle === 'mapbox://styles/mapbox/light-v11' ? (
                <>
                  <Satellite className="h-4 w-4 mr-2" />
                  Satellite
                </>
              ) : (
                <>
                  <Map className="h-4 w-4 mr-2" />
                  Street
                </>
              )}
            </Button>
            
            {(!latitude || !longitude) && !locationLoading && (
              <Badge variant="outline" className="border-warning text-warning bg-warning/10 backdrop-blur">
                <AlertCircle className="h-3 w-3 mr-1" />
                Enable location to see nearby POIs (200m)
              </Badge>
            )}
            
            {nearbyUAC && (
              <Badge className="bg-success/90 text-success-foreground backdrop-blur">
                <MapPin className="h-3 w-3 mr-1" />
                UAC: {nearbyUAC}
              </Badge>
            )}
            
            {locationError && (
              <Badge variant="destructive" className="bg-destructive/90 backdrop-blur">
                <AlertCircle className="h-3 w-3 mr-1" />
                Location Error
              </Badge>
            )}
          </div>
        )}

        {/* Legend */}
        {isMapReady && (
          <Card className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm mb-2">Points of Interest</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Commercial</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Landmark</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span>Government</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Industrial</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
                  <span>Your Location</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {isMapReady && (
          <Card className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur">
            <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-semibold">{locations.length}</span>
              <span className="text-muted-foreground">POI within 200m</span>
            </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardLocationMap;