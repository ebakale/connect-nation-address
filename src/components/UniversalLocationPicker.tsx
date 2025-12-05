import React, { useState } from 'react';
import { useMapProvider } from '@/hooks/useMapProvider';
import { OSMLocationPicker } from '@/components/OSMLocationPicker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UniversalLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lat: number, lng: number) => void;
  initialCenter?: [number, number];
}

// Dynamic import for Google Maps location picker
const GoogleMapLocationPicker = React.lazy(() => import('@/components/MapLocationPicker'));

export const UniversalLocationPicker: React.FC<UniversalLocationPickerProps> = ({
  open,
  onOpenChange,
  onConfirm,
  initialCenter
}) => {
  const { t } = useTranslation('dashboard');
  const { provider, googleMapsError, isLoading, retryGoogleMaps } = useMapProvider();
  const [forceOSM, setForceOSM] = useState(false);

  // Show loading state in dialog
  if (isLoading && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('map.selectLocation')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <MapPin className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Use OSM if Google Maps failed or user forced OSM
  if (provider === 'osm' || forceOSM) {
    return (
      <>
        {googleMapsError && open && (
          <Alert variant="default" className="fixed top-4 right-4 z-[2000] max-w-sm border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 dark:text-amber-400 text-sm">
              {t('map.usingOpenStreetMapFallback')}
            </AlertTitle>
          </Alert>
        )}
        <OSMLocationPicker
          open={open}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          initialCenter={initialCenter}
        />
      </>
    );
  }

  // Use Google Maps
  return (
    <React.Suspense fallback={
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('map.selectLocation')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <MapPin className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    }>
      <GoogleMapLocationPicker
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    </React.Suspense>
  );
};

export default UniversalLocationPicker;
