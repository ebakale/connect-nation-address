import React, { useState } from 'react';
import { useMapProvider } from '@/hooks/useMapProvider';
import { OSMMapView, OSMMapLocation } from '@/components/OSMMapView';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UniversalLocationMapProps {
  latitude: number;
  longitude: number;
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    building?: string;
    uac?: string;
    verified?: boolean;
  };
  onClose: () => void;
  allowResize?: boolean;
}

// Dynamic import for Google Maps component
const GoogleAddressLocationMap = React.lazy(() => 
  import('@/components/AddressLocationMap').then(m => ({ default: m.AddressLocationMap }))
);

export const UniversalLocationMap: React.FC<UniversalLocationMapProps> = ({
  latitude,
  longitude,
  address,
  onClose,
  allowResize = true
}) => {
  const { t } = useTranslation('dashboard');
  const { provider, googleMapsError, isLoading, retryGoogleMaps } = useMapProvider();
  const [forceOSM, setForceOSM] = useState(false);

  // Convert to OSM location format
  const osmLocation: OSMMapLocation = {
    id: address.uac || 'address',
    latitude,
    longitude,
    name: address.building || address.street,
    street: address.street,
    city: address.city,
    region: address.region,
    uac: address.uac,
    verified: address.verified
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <MapPin className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  // Use OSM if Google Maps failed or user forced OSM
  if (provider === 'osm' || forceOSM) {
    return (
      <div className="space-y-2">
        {googleMapsError && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 dark:text-amber-400 text-sm">
              {t('map.usingOpenStreetMapFallback')}
            </AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-300 text-xs">
              <Button 
                variant="outline" 
                size="sm"
                onClick={retryGoogleMaps}
                className="mt-1 h-6 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('map.retryGoogleMaps')}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="relative h-full min-h-[300px] rounded-lg overflow-hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 z-[1000] bg-background/95 backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </Button>
          <OSMMapView
            locations={[osmLocation]}
            center={[latitude, longitude]}
            zoom={16}
            showLegend={false}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  // Use Google Maps
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <MapPin className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    }>
      <GoogleAddressLocationMap
        latitude={latitude}
        longitude={longitude}
        address={address}
        onClose={onClose}
        allowResize={allowResize}
      />
    </React.Suspense>
  );
};

export default UniversalLocationMap;
