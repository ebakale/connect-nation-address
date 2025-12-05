import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { OSM_CONFIG, createMarkerIcon, getMarkerColor } from '@/lib/osmConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface FieldAddress {
  id: string;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  verified: boolean;
  address_type: string;
  uac: string;
}

interface OSMFieldMapProps {
  onClose?: () => void;
}

// Component to handle map operations
const MapController: React.FC<{ 
  center: [number, number] | null;
  userLocation: [number, number] | null;
}> = ({ center, userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 15);
    } else if (center) {
      map.setView(center, 12);
    }
  }, [map, center, userLocation]);
  
  return null;
};

// Create Leaflet icon
const createLeafletIcon = (color: string, size: number = 24) => {
  return L.icon({
    iconUrl: createMarkerIcon(color, size),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

export const OSMFieldMap: React.FC<OSMFieldMapProps> = ({ onClose }) => {
  const { t } = useTranslation('dashboard');
  const { roleMetadata } = useUserRole();
  
  const [addresses, setAddresses] = useState<FieldAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrafts, setShowDrafts] = useState(true);
  const [showVerified, setShowVerified] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(OSM_CONFIG.defaultCenter);

  // Get geographical scope from role metadata
  const geographicScope = roleMetadata.find(m => 
    m.scope_type === 'region' || m.scope_type === 'province' || m.scope_type === 'city'
  );
  const isNationalScope = !geographicScope || !geographicScope.scope_value || 
    geographicScope.scope_value === 'national' || geographicScope.scope_value === 'National';

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('addresses')
        .select('id, latitude, longitude, street, city, region, country, verified, address_type, uac')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      // Apply geographic scope filter
      if (!isNationalScope && geographicScope) {
        if (geographicScope.scope_type === 'city') {
          query = query.ilike('city', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
          query = query.ilike('region', geographicScope.scope_value);
        }
      }

      const { data, error } = await query.limit(500);
      
      if (error) throw error;
      setAddresses(data || []);
      
      // Center map on first address if available
      if (data && data.length > 0) {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error(t('fieldMap.failedToLoadAddresses'));
    } finally {
      setLoading(false);
    }
  }, [geographicScope, isNationalScope, t]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('fieldMap.geolocationNotSupported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];
        setUserLocation(newLocation);
        toast.success(t('fieldMap.locationFound', 'Location found'));
      },
      (error) => {
        console.error('Error getting location:', {
          code: error.code,
          message: error.message
        });
        
        let errorMessage = t('fieldMap.unableToGetLocation');
        if (error.code === 1) {
          errorMessage = t('fieldMap.locationPermissionDenied');
        } else if (error.code === 3) {
          errorMessage = t('fieldMap.locationTimeout');
        }
        toast.error(errorMessage);
      }
    );
  };

  // Filter addresses based on toggle states
  const filteredAddresses = addresses.filter(addr => {
    if (addr.verified && !showVerified) return false;
    if (!addr.verified && !showDrafts) return false;
    return true;
  });

  // Statistics
  const stats = {
    drafts: addresses.filter(a => !a.verified).length,
    verified: addresses.filter(a => a.verified).length,
    total: addresses.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">{t('fieldMap.loadingGoogleMaps')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{t('fieldMap.title')}</h3>
          <Badge variant="outline" className="text-xs">
            OpenStreetMap
          </Badge>
          {!isNationalScope && geographicScope && (
            <Badge variant="secondary" className="text-xs">
              {t('fieldMap.scope')}: {geographicScope.scope_value}
            </Badge>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-drafts"
                checked={showDrafts}
                onCheckedChange={setShowDrafts}
              />
              <Label htmlFor="show-drafts" className="text-sm">
                {t('fieldMap.showDrafts')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-verified"
                checked={showVerified}
                onCheckedChange={setShowVerified}
              />
              <Label htmlFor="show-verified" className="text-sm">
                {t('fieldMap.showVerified')}
              </Label>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={getCurrentLocation}>
                <Navigation className="h-4 w-4 mr-1" />
                {t('fieldMap.myLocation')}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchAddresses}>
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('fieldMap.refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <div className="relative h-[500px] rounded-lg overflow-hidden border">
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution={OSM_CONFIG.attribution}
            url={OSM_CONFIG.tileLayer}
          />
          <MapController center={mapCenter} userLocation={userLocation} />
          
          {/* User location marker */}
          {userLocation && (
            <>
              <Circle
                center={userLocation}
                radius={100}
                pathOptions={{ 
                  color: OSM_CONFIG.markerColors.userLocation,
                  fillColor: OSM_CONFIG.markerColors.userLocation,
                  fillOpacity: 0.2
                }}
              />
              <Marker
                position={userLocation}
                icon={createLeafletIcon(OSM_CONFIG.markerColors.userLocation, 20)}
              >
                <Popup>{t('fieldMap.yourLocation', 'Your Location')}</Popup>
              </Marker>
            </>
          )}
          
          {/* Address markers */}
          {filteredAddresses.map((address) => (
            <Marker
              key={address.id}
              position={[address.latitude, address.longitude]}
              icon={createLeafletIcon(getMarkerColor(address), 24)}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <p className="font-medium text-sm">{address.street}</p>
                  <p className="text-xs text-muted-foreground">
                    {address.city}, {address.region}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    UAC: {address.uac}
                  </p>
                  <Badge 
                    variant={address.verified ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {address.verified ? t('fieldMap.verified') : t('fieldMap.draft')}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <Card className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm">
          <CardContent className="py-2 px-3 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: OSM_CONFIG.markerColors.verified }}
              />
              <span>{t('fieldMap.verified')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: OSM_CONFIG.markerColors.draft }}
              />
              <span>{t('fieldMap.drafts')}</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: OSM_CONFIG.markerColors.userLocation }}
                />
                <span>{t('fieldMap.yourLocation', 'You')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{t('fieldMap.drafts')}: <strong>{stats.drafts}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span>{t('fieldMap.verified')}: <strong>{stats.verified}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span>{t('fieldMap.total')}: <strong>{stats.total}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
