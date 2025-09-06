/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
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
  const map = useRef<google.maps.Map | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [mapType, setMapType] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.SATELLITE);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);

  // Fetch Google Maps API key from Supabase secrets
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-token');
        if (error) throw error;
        setGoogleMapsApiKey(data.apiKey);
        setIsApiReady(true);
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        // Fallback: ask user to input token temporarily
        const apiKey = prompt('Please enter your Google Maps API key:');
        if (apiKey) {
          setGoogleMapsApiKey(apiKey);
          setIsApiReady(true);
        }
      }
    };

    fetchGoogleMapsApiKey();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !googleMapsApiKey || !isApiReady) return;

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        // Initialize map
        map.current = new google.maps.Map(mapContainer.current!, {
          center: { lat: latitude, lng: longitude },
          zoom: 16,
          mapTypeId: mapType,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: false,
          zoomControl: true
        });

        // Add marker for the address location
        const marker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map.current,
          title: 'Requested Address',
          icon: {
            url: `data:image/svg+xml,${encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
                <circle cx="15" cy="15" r="6" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Requested Address</h3>
              <p style="font-size: 12px; margin: 0;">
                ${address.building ? `${address.building}, ` : ''}${address.street}<br/>
                ${address.city}, ${address.region}<br/>
                ${address.country}
              </p>
              <p style="font-size: 12px; color: #666; margin-top: 4px;">
                Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map.current, marker);
        });

        // Show info window immediately
        infoWindow.open(map.current, marker);

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    initializeMap();
  }, [googleMapsApiKey, latitude, longitude, address, mapType, isApiReady]);

  // Effect to handle map style changes
  useEffect(() => {
    if (map.current && isApiReady) {
      map.current.setMapTypeId(mapType);
    }
  }, [mapType, isApiReady]);

  const openInNewWindow = () => {
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&t=h`;
    window.open(mapUrl, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMapType = () => {
    setMapType(prevType => 
      prevType === google.maps.MapTypeId.SATELLITE 
        ? google.maps.MapTypeId.ROADMAP 
        : google.maps.MapTypeId.SATELLITE
    );
  };

  if (!isApiReady) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Loading Google Maps...</p>
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
              variant={mapType === google.maps.MapTypeId.SATELLITE ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleMapType}
              className="touch-target rounded-r-none text-xs px-2 py-1"
            >
              <Satellite className="h-3 w-3" />
              <span className="ml-1 text-xs">Sat</span>
            </Button>
            <Button
              variant={mapType === google.maps.MapTypeId.ROADMAP ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleMapType}
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