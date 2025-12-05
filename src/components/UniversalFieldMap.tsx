import React, { useState, useEffect } from 'react';
import { useMapProvider } from '@/hooks/useMapProvider';
import { OSMFieldMap } from '@/components/OSMFieldMap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UniversalFieldMapProps {
  onClose?: () => void;
}

// Dynamic import for Google Maps FieldMap to avoid loading Google Maps code when not needed
const GoogleFieldMap = React.lazy(() => import('@/components/FieldMap'));

export const UniversalFieldMap: React.FC<UniversalFieldMapProps> = ({ onClose }) => {
  const { t } = useTranslation('dashboard');
  const { provider, googleMapsError, isLoading, retryGoogleMaps } = useMapProvider();
  const [forceOSM, setForceOSM] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <MapPin className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">{t('fieldMap.loadingGoogleMaps')}</p>
        </div>
      </div>
    );
  }

  // Use OSM if Google Maps failed or user forced OSM
  if (provider === 'osm' || forceOSM) {
    return (
      <div className="space-y-4">
        {googleMapsError && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 dark:text-amber-400">
              {t('map.usingOpenStreetMapFallback')}
            </AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-300">
              {googleMapsError.includes('billing') 
                ? t('map.googleMapsBillingError')
                : googleMapsError}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={retryGoogleMaps}
                  className="mr-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('map.retryGoogleMaps')}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <OSMFieldMap onClose={onClose} />
      </div>
    );
  }

  // Use Google Maps
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          Google Maps
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setForceOSM(true)}
          className="text-xs h-6"
        >
          {t('map.switchToOpenStreetMap')}
        </Button>
      </div>
      <React.Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <MapPin className="h-8 w-8 animate-pulse text-muted-foreground" />
        </div>
      }>
        <GoogleFieldMap onClose={onClose} />
      </React.Suspense>
    </div>
  );
};

export default UniversalFieldMap;
