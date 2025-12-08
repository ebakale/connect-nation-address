import React, { Suspense, lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapProvider } from '@/hooks/useMapProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, Map } from 'lucide-react';
import OSMDashboardLocationMap from './OSMDashboardLocationMap';

// Lazy load Google Maps component
const GoogleDashboardLocationMap = lazy(() => import('./DashboardLocationMap'));

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

interface UniversalDashboardLocationMapProps {
  searchedAddress?: SearchResult | null;
  onAddressSearched?: (address: SearchResult) => void;
}

const UniversalDashboardLocationMap: React.FC<UniversalDashboardLocationMapProps> = (props) => {
  const { t } = useTranslation('dashboard');
  const { provider, googleMapsError, isLoading, retryGoogleMaps } = useMapProvider();
  const [forceOSM, setForceOSM] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-96 bg-muted/50 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground">{t('loadingMap') || 'Loading map...'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Use OSM if forced or if Google Maps failed
  if (forceOSM || provider === 'osm') {
    return (
      <div className="space-y-2">
        {googleMapsError && (
          <Alert variant="default" className="border-warning bg-warning/10">
            <MapPin className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm">
                {t('usingOpenStreetMapFallback') || 'Using OpenStreetMap (Google Maps unavailable)'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={retryGoogleMaps}
                className="gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                {t('retryGoogleMaps') || 'Retry Google Maps'}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <OSMDashboardLocationMap {...props} />
      </div>
    );
  }

  // Use Google Maps
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setForceOSM(true)}
          className="text-xs text-muted-foreground gap-1"
        >
          <Map className="h-3 w-3" />
          {t('switchToOpenStreetMap') || 'Switch to OpenStreetMap'}
        </Button>
      </div>
      <Suspense fallback={
        <div className="h-96 bg-muted/50 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground">{t('loadingGoogleMaps') || 'Loading Google Maps...'}</p>
          </div>
        </div>
      }>
        <GoogleDashboardLocationMap {...props} />
      </Suspense>
    </div>
  );
};

export default UniversalDashboardLocationMap;
