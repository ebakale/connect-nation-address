/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Settings, Layers, Maximize2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AddressDetailModal from './AddressDetailModal';
import { 
  createMapLoader, 
  initializeGoogleMaps, 
  createStandardMap, 
  createPOIMarker, 
  createStandardInfoWindow,
  MAP_CONFIG,
  STANDARD_LEGEND
} from '@/lib/mapConfig';

interface MapLocation {
  uac: string;
  coordinates: [number, number]; // [lng, lat]
  name: string;
  type: 'residential' | 'commercial' | 'landmark' | 'government';
  verified: boolean;
  street: string;
  building?: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  address_type: string;
  public: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  locations?: MapLocation[];
  onLocationSelect?: (location: MapLocation) => void;
}

// Default center: Malabo, Equatorial Guinea
const DEFAULT_CENTER: [number, number] = [MAP_CONFIG.defaultCenter.lng, MAP_CONFIG.defaultCenter.lat];

const MapView: React.FC<MapViewProps> = ({ 
  center = DEFAULT_CENTER, 
  zoom = 12, 
  locations = [],
  onLocationSelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [realLocations, setRealLocations] = useState<MapLocation[]>([]);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [isApiReady, setIsApiReady] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<MapLocation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const markers = useRef<google.maps.Marker[]>([]);

  // Fetch Google Maps API key using unified configuration
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const apiKey = await createMapLoader();
        setGoogleMapsApiKey(apiKey);
        setIsApiReady(true);
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        setApiError('Failed to fetch Google Maps API key');
      }
    };
    
    fetchGoogleMapsApiKey();
  }, []);

  const fetchMapLocations = async () => {
    try {
      console.log('Fetching map locations...');
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('uac, latitude, longitude, street, building, address_type, verified, public, city, region, country, description, created_at, updated_at')
        .eq('verified', true)
        .eq('public', true);

      if (error) {
        console.error("Error fetching addresses:", error);
        return [];
      }

      console.log(`Fetched ${addresses?.length || 0} addresses from database:`, addresses);

      const mappedLocations = addresses.map(addr => {
        // Extract readable name from description for imported Google Maps locations
        let displayName = `${addr.street}${addr.building ? `, ${addr.building}` : ''}`;
        
        // If this is a Google Maps import with Plus Code as street, use description instead
        if (addr.description && addr.description.startsWith('Imported from Google Maps:')) {
          const businessName = addr.description.replace('Imported from Google Maps: ', '');
          displayName = businessName;
        }
        
        return {
          uac: addr.uac,
          coordinates: [parseFloat(addr.longitude.toString()), parseFloat(addr.latitude.toString())] as [number, number],
          name: displayName,
          type: addr.address_type as 'residential' | 'commercial' | 'landmark' | 'government',
          verified: addr.verified,
          street: addr.street,
          building: addr.building,
          city: addr.city,
          region: addr.region,
          country: addr.country,
          latitude: parseFloat(addr.latitude.toString()),
          longitude: parseFloat(addr.longitude.toString()),
          address_type: addr.address_type,
          public: addr.public,
          description: addr.description,
          created_at: addr.created_at,
          updated_at: addr.updated_at
        };
      }) as MapLocation[];

      console.log('Mapped locations for map:', mappedLocations);
      return mappedLocations;
    } catch (error) {
      console.error("Error processing addresses:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadMapLocations = async () => {
      if (locations.length === 0) {
        const fetchedLocations = await fetchMapLocations();
        setRealLocations(fetchedLocations);
      }
    };
    
    loadMapLocations();
  }, [locations]);

  // Use real locations from database or passed locations
  const allLocations = locations.length > 0 ? locations : realLocations;

  const initializeMap = async () => {
    if (!mapContainer.current || !googleMapsApiKey) return;

    try {
      await initializeGoogleMaps(googleMapsApiKey);

      map.current = createStandardMap(mapContainer.current, {
        center: { lat: center[1], lng: center[0] },
        zoom: zoom,
      });

      console.log('Google Maps loaded for MapView');
      addMarkersToMap();

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setApiError('Failed to initialize map');
    }
  };

  const addMarkersToMap = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add markers for each location using unified configuration
    allLocations.forEach((location) => {
      // Debug log to check data
      console.log('Creating marker for location:', location);
      
      // Ensure we have required data
      if (!location.uac || !location.coordinates || location.coordinates.length !== 2) {
        console.warn('Skipping location with missing data:', location);
        return;
      }

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
          onClick: () => {
            console.log('Marker clicked:', location);
            setSelectedAddress(location);
            setIsModalOpen(true);
            onLocationSelect?.(location);
          },
          onHover: () => infoWindow.open(map.current, marker),
          onHoverEnd: () => infoWindow.close()
        }
      );

      markers.current.push(marker);
    });

    // Fit map to show all markers
    if (allLocations.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      allLocations.forEach(location => {
        bounds.extend(new google.maps.LatLng(location.coordinates[1], location.coordinates[0]));
      });
      map.current!.fitBounds(bounds);
    }
  };

  const getMarkerColor = (type: string, verified: boolean) => {
    if (!verified) return MAP_CONFIG.markers.colors.unverified;
    return MAP_CONFIG.markers.colors[type as keyof typeof MAP_CONFIG.markers.colors] || MAP_CONFIG.markers.colors.residential;
  };

  useEffect(() => {
    if (isApiReady) {
      initializeMap();
    }
  }, [isApiReady, googleMapsApiKey]);

  useEffect(() => {
    if (map.current && isApiReady) {
      addMarkersToMap();
    }
  }, [allLocations, isApiReady]);

  if (!isApiReady) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          {apiError ? (
            <div className="text-center space-y-4">
              <div className="text-sm text-destructive">{apiError}</div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Failed to load Google Maps. Please refresh the page.
                </p>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Refresh Page
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-card">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Map Legend */}
        <Card className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur">
          <CardContent className="p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              {STANDARD_LEGEND.title}
            </h4>
            <div className="space-y-1">
              {STANDARD_LEGEND.items.slice(0, -1).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
              Hover for UAC • Click for details
            </div>
          </CardContent>
        </Card>

        {/* Address Count */}
        <Card className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold">{allLocations.length}</span>
              <span className="text-muted-foreground">addresses mapped</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Detail Modal */}
      <AddressDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        address={selectedAddress}
      />
    </>
  );
};

export default MapView;