import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crosshair, 
  Building2, 
  AlertCircle,
  Map,
  Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import AddressDetailModal from './AddressDetailModal';
import { OSM_CONFIG, createMarkerIcon, getMarkerColor } from '@/lib/osmConfig';
import 'leaflet/dist/leaflet.css';

interface MapLocation {
  uac: string;
  coordinates: [number, number];
  name: string;
  type: string;
  verified: boolean;
}

interface SearchResult {
  uac: string;
  readable: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  verified: boolean;
}

interface OSMDashboardLocationMapProps {
  searchedAddress?: SearchResult | null;
  onAddressSearched?: (address: SearchResult) => void;
}

// Map controller to handle view updates
const MapController: React.FC<{
  center?: [number, number];
  zoom?: number;
  searchedPosition?: [number, number] | null;
}> = ({ center, zoom, searchedPosition }) => {
  const map = useMap();
  
  useEffect(() => {
    if (searchedPosition) {
      map.flyTo(searchedPosition, 17, { duration: 1 });
    } else if (center) {
      map.flyTo(center, zoom || 15, { duration: 1 });
    }
  }, [map, center, zoom, searchedPosition]);
  
  return null;
};

// Create Leaflet icon from color
const createLeafletIcon = (color: string, size: number = 24) => {
  return L.icon({
    iconUrl: createMarkerIcon(color, size),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const OSMDashboardLocationMap: React.FC<OSMDashboardLocationMapProps> = ({ 
  searchedAddress, 
  onAddressSearched 
}) => {
  const { t } = useTranslation('dashboard');
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [locations, setLocations] = useState<MapLocation[]>([]);
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

  // Auto request current location on mount
  useEffect(() => {
    if (!latitude && !longitude && !locationLoading) {
      getCurrentPosition();
    }
  }, []);

  // Fetch non-residential locations (POI) within 2km of current location
  useEffect(() => {
    const fetchPOILocations = async () => {
      if (!latitude || !longitude) {
        setLocations([]);
        return;
      }

      try {
        const latTol = 2000 / 111320;
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

        const filteredLocations: MapLocation[] = [];
        
        data?.forEach(addr => {
          const distance = calculateDistance(
            latitude, longitude,
            Number(addr.latitude), Number(addr.longitude)
          );
          
          if (distance <= 2000) {
            filteredLocations.push({
              uac: addr.uac,
              coordinates: [Number(addr.latitude), Number(addr.longitude)] as [number, number],
              name: `${addr.street}, ${addr.city}`,
              type: addr.address_type,
              verified: addr.verified
            });
          }
        });

        setLocations(filteredLocations);
      } catch (error) {
        console.error('Error fetching POI locations:', error);
      }
    };

    fetchPOILocations();
  }, [latitude, longitude]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3;
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

  const mapCenter = useMemo<[number, number]>(() => {
    if (latitude && longitude) {
      return [latitude, longitude];
    }
    return OSM_CONFIG.defaultCenter;
  }, [latitude, longitude]);

  const searchedPosition = useMemo<[number, number] | null>(() => {
    if (searchedAddress?.coordinates) {
      return [searchedAddress.coordinates.lat, searchedAddress.coordinates.lng];
    }
    return null;
  }, [searchedAddress]);

  const tileLayer = mapType === 'satellite' 
    ? OSM_CONFIG.tileLayers.satellite 
    : OSM_CONFIG.tileLayers.standard;

  const legendItems = [
    { label: 'business', color: OSM_CONFIG.markerColors.business },
    { label: 'government', color: OSM_CONFIG.markerColors.government },
    { label: 'landmark', color: OSM_CONFIG.markerColors.landmark },
    { label: 'verified', color: OSM_CONFIG.markerColors.verified },
    { label: 'yourlocation', color: OSM_CONFIG.markerColors.userLocation, special: true },
  ];

  return (
    <div className="space-y-4">
      {/* Legend */}
      <Card className="bg-background/95 backdrop-blur">
        <CardContent className="p-3">
          <h4 className="font-semibold text-sm mb-3">{t('pointsOfInterest')}</h4>
          <div className="flex flex-wrap gap-4">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className={`w-3 h-3 rounded-full ${item.special ? 'border-2 border-white shadow-lg' : ''}`}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>{t(`legendLabels.${item.label}`)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="shadow-card h-96">
        <CardContent className="p-0 relative h-full">
          <MapContainer
            center={mapCenter}
            zoom={latitude && longitude ? 15 : OSM_CONFIG.defaultZoom}
            className="w-full h-full rounded-lg z-0"
            style={{ minHeight: '100%' }}
          >
            <TileLayer
              attribution={tileLayer.attribution}
              url={tileLayer.url}
            />
            <MapController 
              center={mapCenter} 
              zoom={15}
              searchedPosition={searchedPosition}
            />

            {/* Current location marker */}
            {latitude && longitude && (
              <>
                <Circle
                  center={[latitude, longitude]}
                  radius={accuracy || 50}
                  pathOptions={{
                    color: OSM_CONFIG.markerColors.userLocation,
                    fillColor: OSM_CONFIG.markerColors.userLocation,
                    fillOpacity: 0.15,
                    weight: 2
                  }}
                />
                <Marker
                  position={[latitude, longitude]}
                  icon={createLeafletIcon(OSM_CONFIG.markerColors.userLocation, 30)}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {t('yourLocation')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('accuracy')}: ±{Math.round(accuracy || 0)}m
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* POI markers */}
            {locations.map((location) => (
              <Marker
                key={location.uac}
                position={location.coordinates}
                icon={createLeafletIcon(getMarkerColor({ address_type: location.type, verified: location.verified }), 24)}
                eventHandlers={{
                  click: () => openAddressDetails(location.uac)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-sm">{location.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      UAC: {location.uac}
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {location.type}
                    </Badge>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => openAddressDetails(location.uac)}
                    >
                      {t('viewDetails')}
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Searched address marker */}
            {searchedAddress && searchedPosition && (
              <Marker
                position={searchedPosition}
                icon={createLeafletIcon(OSM_CONFIG.markerColors.selected, 32)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-sm">🔍 {searchedAddress.readable}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      UAC: {searchedAddress.uac}
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {searchedAddress.type}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Location Controls */}
          <div className="absolute top-4 left-4 z-[1000] space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-background/95 backdrop-blur"
              onClick={getCurrentPosition}
              disabled={locationLoading}
            >
              <Crosshair className="h-4 w-4 mr-2" />
              {locationLoading ? t('gettingLocation') : t('myLocation')}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="bg-background/95 backdrop-blur"
              onClick={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
            >
              {mapType === 'standard' ? (
                <>
                  <Layers className="h-4 w-4 mr-2" />
                  {t('satellite')}
                </>
              ) : (
                <>
                  <Map className="h-4 w-4 mr-2" />
                  {t('street')}
                </>
              )}
            </Button>
            
            {(!latitude || !longitude) && !locationLoading && (
              <Badge variant="outline" className="border-warning text-warning bg-warning/10 backdrop-blur">
                <AlertCircle className="h-3 w-3 mr-1" />
                {t('enableLocationMessage')}
              </Badge>
            )}
            
            {locationError && (
              <Badge variant="destructive" className="bg-destructive/90 backdrop-blur">
                <AlertCircle className="h-3 w-3 mr-1" />
                {t('locationError')}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <Card className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-semibold">{locations.length}</span>
                <span className="text-muted-foreground">{t('poiWithin2km')}</span>
              </div>
            </CardContent>
          </Card>
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

export default OSMDashboardLocationMap;
