import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { OSM_CONFIG, createMarkerIcon, getMarkerColor } from '@/lib/osmConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Home, Landmark, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface OSMMapLocation {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  type?: string;
  verified?: boolean;
  address_type?: string;
  business_address_type?: string;
  uac?: string;
  street?: string;
  city?: string;
  region?: string;
}

interface OSMMapViewProps {
  locations?: OSMMapLocation[];
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (location: OSMMapLocation) => void;
  highlightUac?: string;
  showLegend?: boolean;
  className?: string;
}

// Component to handle map center updates
const MapCenterUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

// Create Leaflet icon from SVG
const createLeafletIcon = (color: string, size: number = 30) => {
  return L.icon({
    iconUrl: createMarkerIcon(color, size),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

export const OSMMapView: React.FC<OSMMapViewProps> = ({
  locations = [],
  center,
  zoom = 12,
  onLocationSelect,
  highlightUac,
  showLegend = true,
  className = ''
}) => {
  const { t } = useTranslation('dashboard');
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    center || OSM_CONFIG.defaultCenter
  );
  const [selectedLocation, setSelectedLocation] = useState<OSMMapLocation | null>(null);

  useEffect(() => {
    if (center) {
      setMapCenter(center);
    } else if (locations.length > 0) {
      // Center on first location if no center provided
      setMapCenter([locations[0].latitude, locations[0].longitude]);
    }
  }, [center, locations]);

  const getIcon = (location: OSMMapLocation) => {
    const isHighlighted = highlightUac && location.uac === highlightUac;
    const color = isHighlighted 
      ? OSM_CONFIG.markerColors.selected 
      : getMarkerColor(location);
    const size = isHighlighted ? 40 : 30;
    return createLeafletIcon(color, size);
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'business':
        return <Building2 className="h-4 w-4" />;
      case 'residential':
        return <Home className="h-4 w-4" />;
      case 'landmark':
      case 'government':
        return <Landmark className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className={`relative h-full ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution={OSM_CONFIG.attribution}
          url={OSM_CONFIG.tileLayer}
        />
        <MapCenterUpdater center={mapCenter} zoom={zoom} />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={getIcon(location)}
            eventHandlers={{
              click: () => {
                setSelectedLocation(location);
                onLocationSelect?.(location);
              }
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(location.address_type)}
                  <span className="font-semibold">
                    {location.name || location.street || 'Address'}
                  </span>
                </div>
                {location.uac && (
                  <p className="text-xs text-muted-foreground mb-1">
                    UAC: {location.uac}
                  </p>
                )}
                {location.street && (
                  <p className="text-sm">{location.street}</p>
                )}
                {location.city && (
                  <p className="text-sm text-muted-foreground">
                    {location.city}, {location.region}
                  </p>
                )}
                <div className="mt-2">
                  <Badge variant={location.verified ? 'default' : 'secondary'}>
                    {location.verified ? t('fieldMap.verified') : t('fieldMap.draft')}
                  </Badge>
                </div>
                {onLocationSelect && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => onLocationSelect(location)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {t('common:viewDetails', 'View Details')}
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showLegend && (
        <Card className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs">{t('map.legend', 'Legend')}</CardTitle>
          </CardHeader>
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
            <div className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: OSM_CONFIG.markerColors.business }}
              />
              <span>{t('common:business', 'Business')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="absolute top-4 right-4 z-[1000]">
        <Badge variant="outline" className="bg-background/95 backdrop-blur-sm">
          {locations.length} {t('fieldMap.total')}
        </Badge>
      </div>
    </div>
  );
};
