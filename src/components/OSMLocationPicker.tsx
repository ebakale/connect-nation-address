import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { OSM_CONFIG, createMarkerIcon } from '@/lib/osmConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface OSMLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lat: number, lng: number) => void;
  initialCenter?: [number, number];
}

// Create draggable marker icon
const createDraggableIcon = () => {
  return L.icon({
    iconUrl: createMarkerIcon(OSM_CONFIG.markerColors.selected, 40),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Component to handle map clicks and marker placement
const LocationSelector: React.FC<{
  position: [number, number] | null;
  onPositionChange: (pos: [number, number]) => void;
}> = ({ position, onPositionChange }) => {
  useMapEvents({
    click: (e) => {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    }
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      icon={createDraggableIcon()}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onPositionChange([pos.lat, pos.lng]);
        }
      }}
    />
  );
};

export const OSMLocationPicker: React.FC<OSMLocationPickerProps> = ({
  open,
  onOpenChange,
  onConfirm,
  initialCenter
}) => {
  const { t } = useTranslation('dashboard');
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  const handleConfirm = useCallback(() => {
    if (selectedPosition) {
      onConfirm(selectedPosition[0], selectedPosition[1]);
      setSelectedPosition(null);
      onOpenChange(false);
    }
  }, [selectedPosition, onConfirm, onOpenChange]);

  const handleClose = useCallback(() => {
    setSelectedPosition(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const center = initialCenter || OSM_CONFIG.defaultCenter;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('map.selectLocation', 'Select Location')}</DialogTitle>
        </DialogHeader>

        <div className="h-[400px] rounded-lg overflow-hidden border">
          <MapContainer
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution={OSM_CONFIG.attribution}
              url={OSM_CONFIG.tileLayer}
            />
            <LocationSelector
              position={selectedPosition}
              onPositionChange={setSelectedPosition}
            />
          </MapContainer>
        </div>

        <div className="text-sm text-muted-foreground">
          {selectedPosition ? (
            <p>
              {t('map.selectedCoordinates', 'Selected')}: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
            </p>
          ) : (
            <p>{t('map.clickToSelect', 'Click on the map to select a location')}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('common:cancel', 'Cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPosition}>
            {t('map.confirmLocation', 'Confirm Location')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
