import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { X, Satellite, Map as MapIcon, ExternalLink, Maximize2 } from 'lucide-react';
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
  allowResize?: boolean;
}

export const AddressLocationMap: React.FC<AddressLocationMapProps> = ({
  latitude,
  longitude,
  address,
  onClose,
  allowResize = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets'>('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

    const getMapStyle = (style: 'satellite' | 'streets') => {
      return style === 'satellite' 
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/streets-v12';
    };

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(mapStyle),
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
  }, [mapboxToken, latitude, longitude, address, mapStyle]);

  // Effect to handle map style changes
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    const getMapStyle = (style: 'satellite' | 'streets') => {
      return style === 'satellite' 
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/streets-v12';
    };

    map.current.setStyle(getMapStyle(mapStyle));
  }, [mapStyle, mapboxToken]);

  const openInNewWindow = () => {
    const addressStr = encodeURIComponent(
      `${address.building ? `${address.building}, ` : ''}${address.street}, ${address.city}, ${address.region}, ${address.country}`
    );
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&t=h`;
    window.open(mapUrl, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <>
      <div className={`relative w-full rounded-lg overflow-hidden transition-all duration-300 mobile-container ${
        isFullscreen ? 'fixed inset-0 z-50 mobile-viewport-stable w-screen mobile-spacing' : 'h-64 sm:h-80 md:h-96'
      }`}>
        {/* Mobile-optimized Control buttons */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          <div className="flex bg-background/95 backdrop-blur-sm rounded-md p-1">
            <Button
              variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapStyle('satellite')}
              className="touch-target rounded-r-none text-xs px-2 py-1"
            >
              <Satellite className="h-3 w-3" />
              <span className="ml-1 text-xs">Sat</span>
            </Button>
            <Button
              variant={mapStyle === 'streets' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapStyle('streets')}
              className="touch-target rounded-l-none text-xs px-2 py-1"
            >
              <MapIcon className="h-3 w-3" />
              <span className="ml-1 text-xs">Map</span>
            </Button>
          </div>
          
          {allowResize && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewWindow}
                className="touch-target bg-background/95 backdrop-blur-sm p-2"
                title="Open in Google Maps"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="touch-target bg-background/95 backdrop-blur-sm p-2"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={isFullscreen ? toggleFullscreen : onClose}
            className="touch-target bg-background/95 backdrop-blur-sm p-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div ref={mapContainer} className="absolute inset-0 mobile-container" />
      </div>
      
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 touch-target"
          onClick={toggleFullscreen}
          onTouchEnd={toggleFullscreen}
        />
      )}
    </>
  );
};