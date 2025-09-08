/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
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
import AddressDetailModal from './AddressDetailModal';
import { 
  createMapLoader, 
  initializeGoogleMaps, 
  createStandardMap, 
  createCurrentLocationMarker, 
  createPOIMarker, 
  createStandardInfoWindow,
  createMapTypeToggle,
  MAP_CONFIG,
  STANDARD_LEGEND
} from '@/lib/mapConfig';

interface MapLocation {
  uac: string;
  coordinates: [number, number];
  name: string;
  type: string;
  verified: boolean;
}

const DashboardLocationMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const currentLocationMarker = useRef<google.maps.Marker | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [mapType, setMapType] = useState<string>('roadmap');
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [nearbyUAC, setNearbyUAC] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [poiMarkers, setPOIMarkers] = useState<google.maps.Marker[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<{
    uac: string;
    street: string;
    building?: string | null;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    address_type: string;
    verified: boolean;
    public: boolean;
    description?: string | null;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const { toast } = useToast();
  
  const {
    latitude,
    longitude,
    accuracy,
    error: locationError,
    loading: locationLoading,
    getCurrentPosition
  } = useGeolocation();

  // Fetch Google Maps API key using unified configuration
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const apiKey = await createMapLoader();
        setGoogleMapsApiKey(apiKey);
        console.log('Google Maps API key fetched successfully');
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        setMapError('Failed to load map API key. Please check your connection.');
      }
    };

    fetchGoogleMapsApiKey();
  }, []);

  // Auto request current location once API key is ready
  useEffect(() => {
    if (googleMapsApiKey && !latitude && !longitude && !locationLoading) {
      getCurrentPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleMapsApiKey]);

  // Fetch non-residential locations (POI) within 2km of current location
  useEffect(() => {
    const fetchPOILocations = async () => {
      if (!latitude || !longitude) {
        // No location yet: don't show unrelated POIs
        setLocations([]);
        return;
      }

      try {
        // Calculate precise degree tolerances for ~2000 meters (2km) at current latitude
        const latTol = 2000 / 111320; // ~0.018 degrees
        const lonTol = 2000 / (111320 * Math.cos((latitude * Math.PI) / 180));
        
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

        // Filter by exact distance (2km) and map to required format
        const filteredLocations: MapLocation[] = [];
        
        data?.forEach(addr => {
          const distance = calculateDistance(
            latitude, longitude,
            Number(addr.latitude), Number(addr.longitude)
          );
          
          if (distance <= 2000) {
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
        console.log(`Found ${filteredLocations.length} POIs within 2km`);
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
    return MAP_CONFIG.markers.colors[type as keyof typeof MAP_CONFIG.markers.colors] || MAP_CONFIG.markers.colors.residential;
  };

  const initializeMap = async () => {
    if (!mapContainer.current || !googleMapsApiKey) {
      console.log('Map initialization skipped - missing container or API key');
      return;
    }

    console.log('Initializing Google Maps...');

    try {
      await initializeGoogleMaps(googleMapsApiKey);

      const defaultCenter = latitude && longitude 
        ? { lat: latitude, lng: longitude }
        : MAP_CONFIG.defaultCenter;

      map.current = createStandardMap(mapContainer.current, {
        center: defaultCenter,
        zoom: latitude && longitude ? MAP_CONFIG.defaultCurrentLocationZoom : MAP_CONFIG.defaultZoom,
        mapType: mapType as google.maps.MapTypeId,
      });

      console.log('Google Maps loaded successfully');
      setIsMapReady(true);
      setMapError(null);
      
      // Add current location marker if available
      if (latitude && longitude) {
        updateCurrentLocationMarker(latitude, longitude);
      }

      // Add POI markers
      addPOIMarkers();

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setMapError('Failed to initialize map. Please check your connection.');
    }
  };

  // Helper to fetch full address details and open modal
  const openAddressDetails = async (uac: string) => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('uac, street, building, city, region, country, latitude, longitude, address_type, verified, public, description, created_at, updated_at')
        .eq('uac', uac)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({ title: 'Address not found', description: 'No address details found for this UAC.' });
        return;
      }

      setSelectedAddress({
        uac: data.uac,
        street: data.street,
        building: data.building,
        city: data.city,
        region: data.region,
        country: data.country,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        address_type: data.address_type,
        verified: data.verified,
        public: data.public,
        description: data.description,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
      setIsDetailOpen(true);
    } catch (err) {
      console.error('Failed to load address details:', err);
      toast({ title: 'Error', description: 'Failed to load address details. Please try again.' });
    }
  };

  const addPOIMarkers = () => {
    if (!map.current) return;

    // Clear existing POI markers
    poiMarkers.forEach(marker => marker.setMap(null));
    setPOIMarkers([]);

    const newMarkers: google.maps.Marker[] = [];

    locations.forEach(location => {
      const infoWindow = createStandardInfoWindow(
        location.name,
        location.type,
        {
          uac: location.uac,
          type: location.type,
          verified: location.verified,
          coordinates: { lat: location.coordinates[1], lng: location.coordinates[0] }
        }
      );

      const marker = createPOIMarker(
        map.current!,
        { lat: location.coordinates[1], lng: location.coordinates[0] },
        location.type,
        {
          title: `UAC: ${location.uac}`,
          onClick: () => openAddressDetails(location.uac),
          onHover: () => infoWindow.open(map.current, marker),
          onHoverEnd: () => infoWindow.close()
        }
      );

      newMarkers.push(marker);
    });

    setPOIMarkers(newMarkers);
  };

  const updateCurrentLocationMarker = (lat: number, lng: number) => {
    if (!map.current) return;

    // Remove existing marker
    if (currentLocationMarker.current) {
      currentLocationMarker.current.setMap(null);
    }

    // Create current location marker with unified flashing animation
    currentLocationMarker.current = createCurrentLocationMarker(
      map.current,
      { lat, lng },
      accuracy
    );

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <div style="font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="width: 8px; height: 8px; background: ${MAP_CONFIG.markers.colors.currentLocation}; border-radius: 50%; display: inline-block;"></span>
            Your Location
          </div>
          <div style="font-size: 14px; color: #666;">
            Accuracy: ${accuracy ? `±${Math.round(accuracy)}m` : 'Unknown'}
          </div>
        </div>
      `
    });

    currentLocationMarker.current.addListener('click', () => {
      infoWindow.open(map.current, currentLocationMarker.current);
    });

    // Center map on current location
    map.current.panTo({ lat, lng });
    map.current.setZoom(MAP_CONFIG.defaultCurrentLocationZoom);
  };

  // Initialize map when API key and locations are ready
  useEffect(() => {
    if (googleMapsApiKey && locations.length >= 0) {
      initializeMap();
    }
  }, [googleMapsApiKey, locations, mapType]);

  // Update current location marker when coordinates change
  useEffect(() => {
    if (latitude && longitude && map.current && isMapReady) {
      updateCurrentLocationMarker(latitude, longitude);
    }
  }, [latitude, longitude, accuracy, isMapReady]);

  // Update POI markers when locations change
  useEffect(() => {
    if (map.current && isMapReady) {
      addPOIMarkers();
    }
  }, [locations, isMapReady]);

  // Update map style when mapType changes
  useEffect(() => {
    if (map.current && isMapReady) {
      map.current.setMapTypeId(mapType as google.maps.MapTypeId);
    }
  }, [mapType, isMapReady]);

  const handleGetLocation = () => {
    getCurrentPosition();
  };

  const toggleMapType = createMapTypeToggle(map.current!);

  return (
    <div className="space-y-4">
      {/* Legend - Horizontal layout above map */}
      <Card className="bg-background/95 backdrop-blur">
        <CardContent className="p-3">
          <h4 className="font-semibold text-sm mb-3">{STANDARD_LEGEND.title}</h4>
          <div className="flex flex-wrap gap-4">
            {STANDARD_LEGEND.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className={`w-3 h-3 rounded-full ${item.special ? 'border-2 border-white shadow-lg' : ''}`}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="shadow-card h-96">
        <CardContent className="p-0 relative h-full">
          {/* Loading State */}
          {!isMapReady && !mapError && (
            <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center space-y-2">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
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
                    if (googleMapsApiKey) {
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
                onClick={toggleMapType}
              >
                {mapType === 'roadmap' ? (
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
                  Enable location to see nearby POIs (2km)
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

          {/* Stats - Bottom left */}
          {isMapReady && (
            <Card className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur">
              <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-semibold">{locations.length}</span>
                <span className="text-muted-foreground">POI within 2km</span>
              </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Address Detail Modal */}
      <AddressDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        address={selectedAddress}
      />
    </div>
  );
};

export default DashboardLocationMap;