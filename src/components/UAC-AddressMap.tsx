/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { X, Satellite, Map as MapIcon, ExternalLink, Maximize2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AddressData {
  id: string;
  uac: string;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  description?: string;
  address_type: string;
  verified: boolean;
  public: boolean;
}

interface UACAddressMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  onClose?: () => void;
  allowResize?: boolean;
  showOnlyPublic?: boolean;
  filterByRegion?: string;
  filterByCity?: string;
}

export const UACAddressMap: React.FC<UACAddressMapProps> = ({
  centerLat = 3.7558, // Default to Malabo center
  centerLng = 8.7813,
  zoom = 12,
  onClose,
  allowResize = true,
  showOnlyPublic = false,
  filterByRegion,
  filterByCity
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [mapType, setMapType] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.ROADMAP);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Fetch Google Maps API key
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-token');
        if (error) throw error;
        setGoogleMapsApiKey(data.apiKey);
        setIsApiReady(true);
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        setIsApiReady(false);
      }
    };

    fetchGoogleMapsApiKey();
  }, []);

  // Fetch addresses from database
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        let query = supabase
          .from('addresses')
          .select('*');

        if (showOnlyPublic) {
          query = query.eq('public', true);
        }

        if (filterByRegion) {
          query = query.eq('region', filterByRegion);
        }

        if (filterByCity) {
          query = query.eq('city', filterByCity);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setAddresses(data || []);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [showOnlyPublic, filterByRegion, filterByCity]);

  // Initialize map and markers
  useEffect(() => {
    if (!mapContainer.current || !googleMapsApiKey || !isApiReady || loading) return;

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
          center: { lat: centerLat, lng: centerLng },
          zoom: zoom,
          mapTypeId: mapType,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: false,
          zoomControl: true
        });

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add markers for each address
        addresses.forEach((address) => {
          createAddressMarker(address);
        });

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    initializeMap();
  }, [googleMapsApiKey, isApiReady, loading, addresses, centerLat, centerLng, zoom, mapType]);

  const createAddressMarker = (address: AddressData) => {
    if (!map.current) return;

    // Different colors for different address types and verification status
    const getMarkerColor = (addressType: string, verified: boolean, isPublic: boolean) => {
      if (!verified) return '#9ca3af'; // Gray for unverified
      if (isPublic) {
        switch (addressType) {
          case 'commercial': return '#3b82f6'; // Blue
          case 'government': return '#dc2626'; // Red
          case 'landmark': return '#7c3aed'; // Purple
          case 'residential': return '#16a34a'; // Green
          default: return '#f59e0b'; // Orange
        }
      }
      return '#6b7280'; // Gray for private
    };

    const markerColor = getMarkerColor(address.address_type, address.verified, address.public);

    // Create marker
    const marker = new google.maps.Marker({
      position: { lat: address.latitude, lng: address.longitude },
      map: map.current,
      title: `UAC: ${address.uac}`,
      icon: {
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" fill="${markerColor}" stroke="white" stroke-width="2"/>
            <circle cx="10" cy="10" r="4" fill="white"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(20, 20),
        anchor: new google.maps.Point(10, 10)
      }
    });

    // Create custom HTML overlay for persistent label
    class CustomLabel extends google.maps.OverlayView {
      private position: google.maps.LatLng;
      private content: string;
      private div?: HTMLDivElement;

      constructor(position: google.maps.LatLng, content: string) {
        super();
        this.position = position;
        this.content = content;
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.style.cssText = `
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid ${markerColor};
          border-radius: 8px;
          padding: 6px 8px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 11px;
          line-height: 1.2;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          backdrop-filter: blur(4px);
          min-width: 120px;
          max-width: 200px;
          pointer-events: none;
          z-index: 1000;
        `;
        
        this.div.innerHTML = this.content;
        
        const panes = this.getPanes();
        if (panes) {
          panes.overlayLayer.appendChild(this.div);
        }
      }

      draw() {
        if (this.div) {
          const overlayProjection = this.getProjection();
          const point = overlayProjection.fromLatLngToDivPixel(this.position);
          
          if (point) {
            this.div.style.left = (point.x - 60) + 'px'; // Center horizontally
            this.div.style.top = (point.y - 40) + 'px';  // Position above marker
          }
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
          this.div = undefined;
        }
      }
    }

    // Create the persistent label content
    const labelContent = `
      <div style="font-weight: bold; color: ${markerColor}; margin-bottom: 2px;">
        ${address.uac}
      </div>
      <div style="color: #374151; margin-bottom: 2px;">
        ${address.building ? `${address.building}<br/>` : ''}${address.street}
      </div>
      ${address.description ? `
        <div style="color: #6b7280; font-size: 10px; font-style: italic;">
          ${address.description.length > 50 ? address.description.substring(0, 50) + '...' : address.description}
        </div>
      ` : ''}
      <div style="margin-top: 2px;">
        <span style="
          background: ${address.verified ? '#16a34a' : '#f59e0b'}; 
          color: white; 
          padding: 1px 3px; 
          border-radius: 2px; 
          font-size: 8px; 
          margin-right: 2px;
        ">
          ${address.verified ? '✓' : '⚠'}
        </span>
        <span style="
          background: ${markerColor}; 
          color: white; 
          padding: 1px 3px; 
          border-radius: 2px; 
          font-size: 8px;
        ">
          ${address.address_type.charAt(0).toUpperCase()}
        </span>
      </div>
    `;

    // Create and add the custom label
    const customLabel = new CustomLabel(
      new google.maps.LatLng(address.latitude, address.longitude),
      labelContent
    );
    customLabel.setMap(map.current);

    // Create detailed info window that opens on click
    const detailedInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; max-width: 300px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="background: ${markerColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
              ${address.address_type.toUpperCase()}
            </span>
            ${address.verified ? '<span style="background: #16a34a; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">✓ VERIFIED</span>' : '<span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">⚠ UNVERIFIED</span>'}
            ${address.public ? '<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">PUBLIC</span>' : '<span style="background: #6b7280; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">PRIVATE</span>'}
          </div>
          
          <h3 style="font-weight: 600; font-size: 16px; margin: 0 0 8px 0; color: #1f2937;">
            UAC: ${address.uac}
          </h3>
          
          <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
            <p style="font-size: 13px; margin: 0; line-height: 1.4; color: #374151;">
              ${address.building ? `<strong>${address.building}</strong><br/>` : ''}
              ${address.street}<br/>
              ${address.city}, ${address.region}<br/>
              ${address.country}
            </p>
          </div>
          
          ${address.description ? `
            <div style="margin-bottom: 8px;">
              <p style="font-size: 12px; color: #6b7280; margin: 0; font-weight: 500;">Description:</p>
              <p style="font-size: 13px; margin: 4px 0 0 0; color: #374151; line-height: 1.4;">
                ${address.description}
              </p>
            </div>
          ` : ''}
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              Coordinates: ${address.latitude.toFixed(6)}, ${address.longitude.toFixed(6)}
            </p>
          </div>
          
          <div style="margin-top: 8px;">
            <button onclick="window.open('https://www.google.com/maps?q=${address.latitude},${address.longitude}', '_blank')" 
                    style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">
              Open in Google Maps
            </button>
          </div>
        </div>
      `
    });

    // Add click listener for detailed info
    marker.addListener('click', () => {
      detailedInfoWindow.open(map.current, marker);
    });

    markersRef.current.push(marker);
  };

  const toggleMapType = () => {
    setMapType(prevType => 
      prevType === google.maps.MapTypeId.SATELLITE 
        ? google.maps.MapTypeId.ROADMAP 
        : google.maps.MapTypeId.SATELLITE
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewWindow = () => {
    const mapUrl = `https://www.google.com/maps?q=${centerLat},${centerLng}&z=${zoom}`;
    window.open(mapUrl, '_blank');
  };

  if (!isApiReady) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Loading Google Maps...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">Loading addresses...</p>
      </div>
    );
  }

  return (
    <>
      <div className={`relative w-full rounded-lg overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'h-96'
      }`}>
        {/* Control buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <div className="flex bg-background/95 backdrop-blur-sm rounded-md p-1">
            <Button
              variant={mapType === google.maps.MapTypeId.SATELLITE ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleMapType}
              className="rounded-r-none text-xs px-3 py-1"
            >
              <Satellite className="h-3 w-3 mr-1" />
              Satellite
            </Button>
            <Button
              variant={mapType === google.maps.MapTypeId.ROADMAP ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleMapType}
              className="rounded-l-none text-xs px-3 py-1"
            >
              <MapIcon className="h-3 w-3 mr-1" />
              Map
            </Button>
          </div>
          
          {allowResize && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewWindow}
                className="bg-background/95 backdrop-blur-sm p-2"
                title="Open in Google Maps"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-background/95 backdrop-blur-sm p-2"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={isFullscreen ? toggleFullscreen : onClose}
              className="bg-background/95 backdrop-blur-sm p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Address count indicator */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-background/95 backdrop-blur-sm rounded-md px-3 py-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{addresses.length} Addresses</span>
            </div>
          </div>
        </div>

        <div ref={mapContainer} className="absolute inset-0" />
      </div>
      
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </>
  );
};