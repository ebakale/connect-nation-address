import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AddressLocationMapProps {
  latitude: number;
  longitude: number;
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    building?: string;
  };
  onClose: () => void;
}

export const AddressLocationMap: React.FC<AddressLocationMapProps> = ({
  latitude,
  longitude,
  address,
  onClose
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Fetch Mapbox token from Supabase secrets
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        // Fallback: ask user to input token temporarily
        const token = prompt('Please enter your Mapbox public token (you can find it at https://mapbox.com/ in your account dashboard):');
        if (token) {
          setMapboxToken(token);
        }
      }
    };

    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [longitude, latitude],
      zoom: 16
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add marker for the address location
    const marker = new mapboxgl.Marker({
      color: '#ef4444'
    })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm mb-1">Requested Address</h3>
              <p class="text-xs">
                ${address.building ? `${address.building}, ` : ''}${address.street}<br/>
                ${address.city}, ${address.region}<br/>
                ${address.country}
              </p>
              <p class="text-xs text-gray-600 mt-1">
                Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
              </p>
            </div>
          `)
      )
      .addTo(map.current);

    // Show popup immediately
    marker.getPopup().addTo(map.current);

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, latitude, longitude, address]);

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={onClose}
        className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur-sm"
      >
        <X className="h-4 w-4" />
      </Button>
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};