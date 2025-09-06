/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Settings, Layers, Maximize2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AddressDetailModal from './AddressDetailModal';

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
const DEFAULT_CENTER: [number, number] = [8.7833, 3.7500];

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

  // Fetch Google Maps API key from Supabase edge function
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-token');
        if (error) throw error;
        if (data?.apiKey) {
          setGoogleMapsApiKey(data.apiKey);
          setIsApiReady(true);
        }
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        setApiError('Failed to fetch Google Maps API key');
      }
    };
    
    fetchGoogleMapsApiKey();
  }, []);

  const fetchMapLocations = async () => {
    try {
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('uac, latitude, longitude, street, building, address_type, verified, public, city, region, country, description, created_at, updated_at')
        .eq('verified', true)
        .eq('public', true);

      if (error) {
        console.error("Error fetching addresses:", error);
        return [];
      }

      return addresses.map(addr => ({
        uac: addr.uac,
        coordinates: [parseFloat(addr.longitude.toString()), parseFloat(addr.latitude.toString())] as [number, number],
        name: `${addr.street}${addr.building ? `, ${addr.building}` : ''}`,
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
      })) as MapLocation[];
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
      const loader = new Loader({
        apiKey: googleMapsApiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: center[1], lng: center[0] },
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
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

    // Add markers for each location
    allLocations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.coordinates[1], lng: location.coordinates[0] },
        map: map.current,
        title: `UAC: ${location.uac}`, // Show UAC on hover
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="${getMarkerColor(location.type, location.verified)}" stroke="white" stroke-width="2"/>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        }
      });

      // Click handler to open address details modal
      marker.addListener('click', () => {
        setSelectedAddress(location);
        setIsModalOpen(true);
        onLocationSelect?.(location);
      });

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
    if (!verified) return '#6b7280'; // gray
    
    switch (type) {
      case 'residential': return '#3b82f6'; // blue
      case 'commercial': return '#8b5cf6'; // purple
      case 'landmark': return '#ef4444'; // red
      case 'government': return '#059669'; // green
      default: return '#3b82f6';
    }
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
              Legend
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Residential</span>
              </div>
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