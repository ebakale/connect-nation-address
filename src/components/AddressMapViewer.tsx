import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Navigation, 
  Copy, 
  ArrowLeft,
  ExternalLink,
  Maximize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MapView from './MapView';
import AddressDirections from './AddressDirections';

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

interface AddressMapViewerProps {
  address: SearchResult;
  onBack: () => void;
}

const AddressMapViewer: React.FC<AddressMapViewerProps> = ({ address, onBack }) => {
  const [showDirections, setShowDirections] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard`,
    });
  };

  const openInMaps = () => {
    const lat = address.coordinates.lat;
    const lng = address.coordinates.lng;
    const userAgent = navigator.userAgent || navigator.vendor;
    
    let url = '';
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      // iOS - Apple Maps
      url = `http://maps.apple.com/?q=${lat},${lng}`;
    } else if (/android/i.test(userAgent)) {
      // Android - Google Maps
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
      // Desktop - Google Maps
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    
    window.open(url, '_blank');
  };

  // Convert SearchResult to MapLocation format
  const mapLocation = {
    uac: address.uac,
    coordinates: [address.coordinates.lng, address.coordinates.lat] as [number, number],
    name: address.readable,
    type: address.type as 'residential' | 'commercial' | 'landmark' | 'government',
    verified: address.verified
  };

  if (showDirections) {
    return (
      <div className="space-y-4">
        <AddressDirections 
          destination={address} 
          onClose={() => setShowDirections(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Address Location
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-semibold text-primary">
                {address.uac}
              </span>
              {address.verified && (
                <Badge variant="secondary">
                  Verified
                </Badge>
              )}
              <Badge variant="outline">
                {address.type}
              </Badge>
            </div>
            
            <p className="text-foreground">{address.readable}</p>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="default"
              onClick={() => setShowDirections(true)}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
            <Button 
              variant="outline"
              onClick={openInMaps}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Maps
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="secondary"
              onClick={() => copyToClipboard(address.uac, "UAC Code")}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy UAC
            </Button>
            <Button 
              variant="secondary"
              onClick={() => copyToClipboard(
                `${address.coordinates.lat},${address.coordinates.lng}`, 
                "Coordinates"
              )}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Coords
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5" />
            Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MapView
            center={[address.coordinates.lng, address.coordinates.lat]}
            zoom={15}
            locations={[mapLocation]}
            onLocationSelect={(location) => {
              toast({
                title: "Address Selected",
                description: `Selected ${location.uac}`,
              });
            }}
          />
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Location Information</p>
                <p>• Click "Get Directions" to navigate from your current location or another address</p>
                <p>• Use "Open in Maps" to view in your device's default map application</p>
                <p>• Coordinates are provided with high precision for navigation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressMapViewer;