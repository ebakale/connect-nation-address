import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building, AlertTriangle, Eye, ExternalLink, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddressMapDialog } from './AddressMapDialog';

export interface DuplicateMatch {
  id: string;
  uac: string;
  street?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  public: boolean;
  distance_meters?: number;
}

export interface DuplicateAnalysis {
  has_duplicates: boolean;
  coordinate_duplicates: {
    count: number;
    matches: DuplicateMatch[];
  };
  address_duplicates: {
    count: number;
    matches: DuplicateMatch[];
  };
  summary: {
    total_duplicates: number;
    coordinate_matches: number;
    address_matches: number;
  };
}

interface DuplicateAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateAnalysis: DuplicateAnalysis | null;
  onProceedAnyway?: () => void;
  onRejectAsDuplicate?: () => void;
  actionLabel?: string;
  showActions?: boolean;
  requestCoordinates?: { lat: number; lng: number };
}

export function DuplicateAddressDialog({
  isOpen,
  onClose,
  duplicateAnalysis,
  onProceedAnyway,
  onRejectAsDuplicate,
  actionLabel,
  showActions = true,
  requestCoordinates
}: DuplicateAddressDialogProps) {
  const { t } = useTranslation('address');
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedMapAddress, setSelectedMapAddress] = useState<DuplicateMatch | null>(null);

  if (!duplicateAnalysis) return null;

  const formatDistance = (meters: number | undefined) => {
    if (meters === undefined) return t('duplicates.distanceUnknown');
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handleViewOnMap = (match: DuplicateMatch) => {
    setSelectedMapAddress(match);
    setMapDialogOpen(true);
  };

  const handleOpenInMaps = (match: DuplicateMatch) => {
    if (match.latitude && match.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${match.latitude},${match.longitude}`,
        '_blank'
      );
    }
  };

  const renderMatchCard = (match: DuplicateMatch, type: 'coordinate' | 'address') => (
    <Card key={match.id} className={type === 'coordinate' ? 'border-orange-200' : 'border-red-200'}>
      <CardContent className="p-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-sm break-all">{t('duplicates.uacLabel')}: {match.uac}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant={match.verified ? "default" : "secondary"} className="text-xs">
                  {match.verified ? t('duplicates.verified') : t('duplicates.unverified')}
                </Badge>
                <Badge variant={match.public ? "outline" : "secondary"} className="text-xs">
                  {match.public ? t('duplicates.public') : t('duplicates.private')}
                </Badge>
              </div>
              {match.street && (
                <p className="text-sm text-muted-foreground break-words">{match.street}</p>
              )}
              {match.city && match.region && (
                <p className="text-xs text-muted-foreground">{match.city}, {match.region}</p>
              )}
              {match.latitude && match.longitude && (
                <p className="text-xs text-muted-foreground">
                  {match.latitude.toFixed(6)}, {match.longitude.toFixed(6)}
                </p>
              )}
            </div>
            {match.distance_meters !== undefined && (
              <div className={`text-sm font-medium whitespace-nowrap ${type === 'coordinate' ? 'text-orange-600' : 'text-red-600'}`}>
                {formatDistance(match.distance_meters)} {t('duplicates.away')}
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewOnMap(match)}
              className="text-xs flex items-center gap-1"
              disabled={!match.latitude || !match.longitude}
            >
              <Eye className="h-3 w-3" />
              {t('duplicates.viewOnMap')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenInMaps(match)}
              className="text-xs flex items-center gap-1"
              disabled={!match.latitude || !match.longitude}
            >
              <ExternalLink className="h-3 w-3" />
              {t('duplicates.openInMaps')}
            </Button>
            {requestCoordinates && match.latitude && match.longitude && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/${requestCoordinates.lat},${requestCoordinates.lng}/${match.latitude},${match.longitude}`,
                    '_blank'
                  );
                }}
                className="text-xs flex items-center gap-1"
              >
                <Navigation className="h-3 w-3" />
                {t('duplicates.getDirections')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <DialogTitle>{t('duplicates.dialogTitle')}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">{t('duplicates.summaryTitle')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-yellow-700 font-medium">{t('duplicates.totalDuplicates')}:</span>
                  <span className="ml-2">{duplicateAnalysis.summary.total_duplicates}</span>
                </div>
                <div>
                  <span className="text-yellow-700 font-medium">{t('duplicates.coordinateMatches')}:</span>
                  <span className="ml-2">{duplicateAnalysis.summary.coordinate_matches}</span>
                </div>
                <div>
                  <span className="text-yellow-700 font-medium">{t('duplicates.addressMatches')}:</span>
                  <span className="ml-2">{duplicateAnalysis.summary.address_matches}</span>
                </div>
              </div>
            </div>

            {/* Coordinate Duplicates */}
            {duplicateAnalysis.coordinate_duplicates.count > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('duplicates.similarCoordinatesTitle', { count: duplicateAnalysis.coordinate_duplicates.count })}
                </h3>
                <p className="text-sm text-muted-foreground">{t('duplicates.similarCoordinatesDesc')}</p>
                <div className="grid gap-2">
                  {duplicateAnalysis.coordinate_duplicates.matches.map((match) => 
                    renderMatchCard(match, 'coordinate')
                  )}
                </div>
              </div>
            )}

            {/* Address Duplicates */}
            {duplicateAnalysis.address_duplicates.count > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {t('duplicates.identicalAddressTitle', { count: duplicateAnalysis.address_duplicates.count })}
                </h3>
                <p className="text-sm text-muted-foreground">{t('duplicates.identicalAddressDesc')}</p>
                <div className="grid gap-2">
                  {duplicateAnalysis.address_duplicates.matches.map((match) => 
                    renderMatchCard(match, 'address')
                  )}
                </div>
              </div>
            )}

            {/* Guidance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">{t('duplicates.guidanceTitle')}</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {t('duplicates.guidanceItem1')}</li>
                <li>• {t('duplicates.guidanceItem2')}</li>
                <li>• {t('duplicates.guidanceItem3')}</li>
                <li>• {t('duplicates.guidanceItem4')}</li>
              </ul>
            </div>
          </div>

          {showActions && (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('duplicates.cancel')}
              </Button>
              {onRejectAsDuplicate && (
                <Button variant="destructive" onClick={onRejectAsDuplicate}>
                  {t('duplicates.rejectAsDuplicate')}
                </Button>
              )}
              {onProceedAnyway && (
                <Button onClick={onProceedAnyway} className="bg-yellow-600 hover:bg-yellow-700">
                  {actionLabel || t('duplicates.proceedAnyway')}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Map Dialog for viewing selected address */}
      {selectedMapAddress && (
        <AddressMapDialog
          isOpen={mapDialogOpen}
          onClose={() => {
            setMapDialogOpen(false);
            setSelectedMapAddress(null);
          }}
          address={{
            id: selectedMapAddress.id,
            latitude: selectedMapAddress.latitude || 0,
            longitude: selectedMapAddress.longitude || 0,
            street: selectedMapAddress.street || `UAC: ${selectedMapAddress.uac}`,
            city: selectedMapAddress.city || '',
            region: selectedMapAddress.region || '',
            country: ''
          }}
        />
      )}
    </>
  );
}