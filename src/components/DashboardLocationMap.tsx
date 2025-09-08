/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
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

  // Fetch Google Maps API key
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-token');
        if (error) throw error;
        setGoogleMapsApiKey(data.apiKey);
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

  const getMarkerIcon = (type: string): string => {
    const bgColor = getMarkerColor(type);
    
    const pinSvg = (iconPath: string) => `
      <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12s12 20 12 20 12-13.6 12-20S18.6 0 12 0z" fill="${bgColor}" stroke="#fff" stroke-width="2"/>
        <g transform="translate(6, 6)" fill="#fff">
          ${iconPath}
        </g>
      </svg>
    `;
    
    switch (type) {
      case 'commercial':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <rect x="1" y="1" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M3 5h6M3 7h4" stroke="currentColor" stroke-width="1"/>
        `))}`;
      case 'landmark':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <polygon points="6,1 10,9 2,9" fill="currentColor"/>
          <circle cx="6" cy="7" r="1" fill="${bgColor}"/>
        `))}`;
      case 'government':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <rect x="1" y="3" width="10" height="6" fill="currentColor"/>
          <polygon points="1,3 6,1 11,3" fill="currentColor"/>
          <rect x="3" y="5" width="1" height="3" fill="${bgColor}"/>
          <rect x="5" y="5" width="1" height="3" fill="${bgColor}"/>
          <rect x="7" y="5" width="1" height="3" fill="${bgColor}"/>
          <rect x="9" y="5" width="1" height="3" fill="${bgColor}"/>
        `))}`;
      case 'industrial':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <rect x="1" y="4" width="4" height="5" fill="currentColor"/>
          <rect x="6" y="2" width="4" height="7" fill="currentColor"/>
          <polygon points="2,4 3,3 4,4" fill="currentColor"/>
          <polygon points="7,2 8,1 9,2" fill="currentColor"/>
        `))}`;
      case 'residential':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <polygon points="6,1 11,6 11,9 1,9 1,6" fill="currentColor"/>
          <rect x="4" y="6" width="4" height="3" fill="${bgColor}"/>
          <rect x="5" y="7" width="2" height="1" fill="currentColor"/>
        `))}`;
      case 'hotel':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <rect x="2" y="2" width="8" height="7" rx="1" fill="currentColor"/>
          <rect x="3" y="4" width="1" height="1" fill="${bgColor}"/>
          <rect x="5" y="4" width="1" height="1" fill="${bgColor}"/>
          <rect x="7" y="4" width="1" height="1" fill="${bgColor}"/>
          <rect x="9" y="4" width="1" height="1" fill="${bgColor}"/>
          <rect x="3" y="6" width="1" height="1" fill="${bgColor}"/>
          <rect x="5" y="6" width="1" height="1" fill="${bgColor}"/>
          <rect x="7" y="6" width="1" height="1" fill="${bgColor}"/>
          <rect x="9" y="6" width="1" height="1" fill="${bgColor}"/>
        `))}`;
      case 'bank':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <polygon points="6,1 11,3 11,4 1,4 1,3" fill="currentColor"/>
          <rect x="2" y="4" width="1" height="4" fill="currentColor"/>
          <rect x="4" y="4" width="1" height="4" fill="currentColor"/>
          <rect x="6" y="4" width="1" height="4" fill="currentColor"/>
          <rect x="8" y="4" width="1" height="4" fill="currentColor"/>
          <rect x="10" y="4" width="1" height="4" fill="currentColor"/>
          <rect x="1" y="8" width="10" height="1" fill="currentColor"/>
        `))}`;
      case 'gas_station':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <rect x="2" y="3" width="5" height="6" fill="currentColor"/>
          <circle cx="4.5" cy="6" r="1.5" fill="${bgColor}"/>
          <rect x="8" y="2" width="2" height="7" fill="currentColor"/>
          <polygon points="8,2 9,1 10,2" fill="currentColor"/>
        `))}`;
      case 'restaurant':
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <circle cx="4" cy="3" r="1" fill="currentColor"/>
          <rect x="3.5" y="4" width="1" height="4" fill="currentColor"/>
          <path d="M7 2v2h1v4h-1" stroke="currentColor" stroke-width="1" fill="none"/>
          <path d="M9 2v6" stroke="currentColor" stroke-width="1"/>
        `))}`;
      default:
        return `data:image/svg+xml,${encodeURIComponent(pinSvg(`
          <circle cx="6" cy="6" r="3" fill="currentColor"/>
        `))}`;
    }
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'commercial': return '#9333ea'; // purple
      case 'landmark': return '#dc2626'; // red
      case 'government': return '#16a34a'; // green
      case 'industrial': return '#ea580c'; // orange
      case 'hotel': return '#0891b2'; // cyan
      case 'bank': return '#ca8a04'; // yellow
      case 'gas_station': return '#dc2626'; // red
      default: return '#3b82f6'; // blue
    }
  };

  const initializeMap = async () => {
    if (!mapContainer.current || !googleMapsApiKey) {
      console.log('Map initialization skipped - missing container or API key');
      return;
    }

    console.log('Initializing Google Maps...');

    try {
      const loader = new Loader({
        apiKey: googleMapsApiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      const defaultCenter = latitude && longitude 
        ? { lat: latitude, lng: longitude }
        : { lat: 1.7500, lng: 9.7506 }; // Default to Malabo

      map.current = new google.maps.Map(mapContainer.current, {
        center: defaultCenter,
        zoom: latitude && longitude ? 15 : 10,
        mapTypeId: mapType as google.maps.MapTypeId,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
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
      const marker = new google.maps.Marker({
        position: { lat: location.coordinates[1], lng: location.coordinates[0] },
        map: map.current,
        title: `UAC: ${location.uac}`,
        icon: {
          url: getMarkerIcon(location.type),
          scaledSize: new google.maps.Size(24, 32),
          anchor: new google.maps.Point(12, 32)
        },
        clickable: true,
        optimized: false,
      });

      let uacLabel: google.maps.OverlayView | null = null;

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Arial, sans-serif;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #111;">${location.name}</div>
            <div style="font-size: 12px; color: #6b7280; text-transform: capitalize; margin-bottom: 4px;">${location.type}</div>
            <div style="font-size: 12px; color: #1d4ed8; font-weight: 600;">UAC: ${location.uac}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Click marker for full details</div>
          </div>
        `
      });

      // Hover shows UAC label and brief info
      marker.addListener('mouseover', () => {
        // Create UAC label overlay
        uacLabel = new google.maps.OverlayView();
        uacLabel.onAdd = function() {
          const div = document.createElement('div');
          div.innerHTML = `<div style="
            background: rgba(34, 197, 94, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            backdrop-filter: blur(8px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            pointer-events: none;
            white-space: nowrap;
            border: 1px solid rgba(255,255,255,0.2);
          ">UAC: ${location.uac}</div>`;
          
          this.div = div;
          const panes = this.getPanes();
          if (panes && panes.overlayMouseTarget) {
            panes.overlayMouseTarget.appendChild(div);
          }
        };
        
        uacLabel.draw = function() {
          const projection = this.getProjection();
          if (projection) {
            const position = projection.fromLatLngToDivPixel(new google.maps.LatLng(location.coordinates[1], location.coordinates[0]));
            if (position && this.div) {
              this.div.style.left = (position.x - 30) + 'px';
              this.div.style.top = (position.y - 40) + 'px';
              this.div.style.position = 'absolute';
            }
          }
        };
        
        uacLabel.onRemove = function() {
          if (this.div && this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
          }
        };
        
        uacLabel.setMap(map.current);
        infoWindow.open(map.current, marker);
        
        // Increase marker size
        marker.setIcon({
          url: getMarkerIcon(location.type).replace('width="24" height="32"', 'width="28" height="36"'),
          scaledSize: new google.maps.Size(28, 36),
          anchor: new google.maps.Point(14, 36)
        });
      });
      
      marker.addListener('mouseout', () => {
        // Remove UAC label
        if (uacLabel) {
          uacLabel.setMap(null);
          uacLabel = null;
        }
        infoWindow.close();
        
        // Reset marker size
        marker.setIcon({
          url: getMarkerIcon(location.type),
          scaledSize: new google.maps.Size(24, 32),
          anchor: new google.maps.Point(12, 32)
        });
      });

      // Click opens address detail card
      marker.addListener('click', () => openAddressDetails(location.uac));

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

    // Create current location marker
    currentLocationMarker.current = new google.maps.Marker({
      position: { lat, lng },
      map: map.current,
      title: 'Your Location',
      icon: {
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="6" fill="#3b82f6" stroke="white" stroke-width="3"/>
            <circle cx="10" cy="10" r="10" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.3"/>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(20, 20),
        anchor: new google.maps.Point(10, 10)
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <div style="font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; display: inline-block;"></span>
            Your Location
          </div>
          <div style="font-size: 14px; color: #666;">
            Accuracy: ${accuracy ? `±${Math.round(accuracy)}m` : 'Unknown'}
          </div>
          ${nearbyUAC ? `<div style="font-size: 14px; font-weight: 500; color: #16a34a; margin-top: 4px;">UAC: ${nearbyUAC}</div>` : ''}
        </div>
      `
    });

    currentLocationMarker.current.addListener('click', () => {
      infoWindow.open(map.current, currentLocationMarker.current);
    });

    // Center map on current location
    map.current.panTo({ lat, lng });
    map.current.setZoom(16);
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

  const toggleMapType = () => {
    setMapType(prevType => 
      prevType === 'roadmap' ? 'satellite' : 'roadmap'
    );
  };

  return (
    <div className="space-y-4">
      {/* Legend - Horizontal layout above map */}
      <Card className="bg-background/95 backdrop-blur">
        <CardContent className="p-3">
          <h4 className="font-semibold text-sm mb-3">Points of Interest</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-2 h-2 text-white" />
              </div>
              <span>Commercial</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <Landmark className="w-2 h-2 text-white" />
              </div>
              <span>Landmark</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                <Building2 className="w-2 h-2 text-white" />
              </div>
              <span>Government</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Industrial</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
              <span>Your Location</span>
            </div>
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