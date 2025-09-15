import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DuplicateMatch {
  id: string;
  uac: string;
  street?: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  public: boolean;
  distance_meters?: number;
}

interface DuplicateAnalysis {
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
  duplicateAnalysis: DuplicateAnalysis;
  onProceedAnyway: () => void;
  actionLabel?: string;
}

export function DuplicateAddressDialog({
  isOpen,
  onClose,
  duplicateAnalysis,
  onProceedAnyway,
  actionLabel = 'Proceed Anyway'
}: DuplicateAddressDialogProps) {
  const { t } = useTranslation('address');

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Potential Duplicate Addresses Detected</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Duplicate Check Summary</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-yellow-700 font-medium">Total Duplicates:</span>
                <span className="ml-2">{duplicateAnalysis.summary.total_duplicates}</span>
              </div>
              <div>
                <span className="text-yellow-700 font-medium">Coordinate Matches:</span>
                <span className="ml-2">{duplicateAnalysis.summary.coordinate_matches}</span>
              </div>
              <div>
                <span className="text-yellow-700 font-medium">Address Matches:</span>
                <span className="ml-2">{duplicateAnalysis.summary.address_matches}</span>
              </div>
            </div>
          </div>

          {/* Coordinate Duplicates */}
          {duplicateAnalysis.coordinate_duplicates.count > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Addresses with Similar Coordinates ({duplicateAnalysis.coordinate_duplicates.count})
              </h3>
              <div className="grid gap-2">
                {duplicateAnalysis.coordinate_duplicates.matches.map((match) => (
                  <Card key={match.id} className="border-orange-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">UAC: {match.uac}</span>
                            <Badge variant={match.verified ? "default" : "secondary"}>
                              {match.verified ? "Verified" : "Unverified"}
                            </Badge>
                            <Badge variant={match.public ? "outline" : "secondary"}>
                              {match.public ? "Public" : "Private"}
                            </Badge>
                          </div>
                          {match.street && (
                            <p className="text-sm text-muted-foreground">{match.street}</p>
                          )}
                          {match.latitude && match.longitude && (
                            <p className="text-xs text-muted-foreground">
                              {match.latitude}, {match.longitude}
                            </p>
                          )}
                        </div>
                        {match.distance_meters !== undefined && (
                          <div className="text-sm text-orange-600 font-medium">
                            {formatDistance(match.distance_meters)} away
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Address Duplicates */}
          {duplicateAnalysis.address_duplicates.count > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Building className="h-4 w-4" />
                Addresses with Identical Street Address ({duplicateAnalysis.address_duplicates.count})
              </h3>
              <div className="grid gap-2">
                {duplicateAnalysis.address_duplicates.matches.map((match) => (
                  <Card key={match.id} className="border-red-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">UAC: {match.uac}</span>
                            <Badge variant={match.verified ? "default" : "secondary"}>
                              {match.verified ? "Verified" : "Unverified"}
                            </Badge>
                            <Badge variant={match.public ? "outline" : "secondary"}>
                              {match.public ? "Public" : "Private"}
                            </Badge>
                          </div>
                          {match.latitude && match.longitude && (
                            <p className="text-xs text-muted-foreground">
                              {match.latitude}, {match.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">What should you do?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Review the existing addresses above to ensure they are not the same location</li>
              <li>• Check if the coordinates and addresses are accurate</li>
              <li>• Consider if this might be a legitimate new address (e.g., multiple units in same building)</li>
              <li>• If you're confident this is a unique address, you can proceed</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onProceedAnyway} className="bg-yellow-600 hover:bg-yellow-700">
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}