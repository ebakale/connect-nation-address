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
import AddressCard from './AddressCard';

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
  autoShowDirections?: boolean;
}

const AddressMapViewer: React.FC<AddressMapViewerProps> = ({ address, onBack, autoShowDirections = false }) => {
  const [showDirections, setShowDirections] = useState(!!autoShowDirections);
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
    verified: address.verified,
    street: address.readable.split(', ')[0] || 'Unknown',
    building: '',
    city: address.readable.split(', ')[1] || 'Unknown',
    region: address.readable.split(', ')[2] || 'Unknown',
    country: address.readable.split(', ')[3] || 'Equatorial Guinea',
    latitude: address.coordinates.lat,
    longitude: address.coordinates.lng,
    address_type: address.type,
    public: true,
    description: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
      </Card>

      {/* Address Card and Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Address Card with QR Code */}
        <div className="space-y-4">
          <AddressCard 
            address={{
              uac: address.uac,
              country: address.readable.split(', ')[3] || 'Unknown',
              region: address.readable.split(', ')[2] || 'Unknown',
              city: address.readable.split(', ')[1] || 'Unknown',
              street: address.readable.split(', ')[0] || 'Unknown',
              building: '',
              coordinates: address.coordinates,
              metadata: {
                type: address.type,
                description: '',
                verified: address.verified
              }
            }}
            onViewMap={openInMaps}
          />
          
          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  variant="default"
                  onClick={() => setShowDirections(true)}
                  className="w-full flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Get Turn-by-Turn Directions
                </Button>
                
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
              </div>
            </CardContent>
          </Card>
        </div>

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
              highlightUac={address.uac}
              onLocationSelect={(location) => {
                toast({
                  title: "Address Selected",
                  description: `Selected ${location.uac}`,
                });
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Location Information</p>
                <p>• The QR code contains the UAC, coordinates, and address information for easy sharing</p>
                <p>• Click "Get Directions" to navigate from your current location or another address</p>
                <p>• Use "View on Map" button in the address card to open in your device's default map application</p>
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