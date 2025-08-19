import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Settings, Layers, Maximize2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface MapLocation {
  uac: string;
  coordinates: [number, number]; // [lng, lat]
  name: string;
  type: 'residential' | 'commercial' | 'landmark' | 'government';
  verified: boolean;
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
  const map = useRef<mapboxgl.Map | null>(null);
  const [realLocations, setRealLocations] = useState<MapLocation[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  const [isTokenSet, setIsTokenSet] = useState(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    return !!(storedToken && storedToken.startsWith('pk.'));
  });

  const fetchMapLocations = async () => {
    try {
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('uac, latitude, longitude, street, building, address_type, verified, public')
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
        verified: addr.verified
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

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Add markers for each location
    allLocations.forEach((location) => {
      const marker = new mapboxgl.Marker({
        color: getMarkerColor(location.type, location.verified)
      })
        .setLngLat(location.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <p class="font-semibold text-sm">${location.uac}</p>
                <p class="text-xs text-gray-600">${location.name}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">${location.type}</span>
                  ${location.verified ? '<span class="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">Verified</span>' : ''}
                </div>
              </div>
            `)
        )
        .addTo(map.current!);

      marker.getElement().addEventListener('click', () => {
        onLocationSelect?.(location);
      });
    });

    // Fit map to show all markers
    if (allLocations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      allLocations.forEach(location => bounds.extend(location.coordinates));
      map.current.fitBounds(bounds, { padding: 50 });
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
    if (isTokenSet) {
      initializeMap();
    }

    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      // Validate token format (basic check)
      if (mapboxToken.startsWith('pk.')) {
        localStorage.setItem('mapbox_token', mapboxToken);
        setIsTokenSet(true);
      } else {
        alert('Please enter a valid Mapbox public token (starts with "pk.")');
      }
    } else {
      alert('Please enter a Mapbox token');
    }
  };

  if (!isTokenSet) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To display the interactive map, please enter your Mapbox public token.
          </p>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
            />
            <Button onClick={handleTokenSubmit} className="w-full" variant="hero">
              Initialize Map
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your token at{' '}
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
};

export default MapView;