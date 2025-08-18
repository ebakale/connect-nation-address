import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  MapPin, 
  Smartphone, 
  Search, 
  Copy,
  ExternalLink,
  Target
} from 'lucide-react';
import { useAddresses } from '@/hooks/useAddresses';
import { useToast } from '@/hooks/use-toast';

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

interface AddressDirectionsProps {
  destination: SearchResult;
  onClose: () => void;
}

const AddressDirections: React.FC<AddressDirectionsProps> = ({ destination, onClose }) => {
  const [originType, setOriginType] = useState<'current' | 'uac'>('current');
  const [uacQuery, setUacQuery] = useState('');
  const [originAddress, setOriginAddress] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { searchAddresses } = useAddresses();
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard`,
    });
  };

  const searchOriginByUAC = async () => {
    if (!uacQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchAddresses(uacQuery);
      if (results.length > 0) {
        const result = results[0];
        const formattedResult: SearchResult = {
          uac: result.uac || '',
          readable: `${result.street || ''}${result.building ? ', ' + result.building : ''}, ${result.city || ''}, ${result.region || ''}, ${result.country || ''}`,
          coordinates: {
            lat: result.latitude || 0,
            lng: result.longitude || 0,
          },
          type: result.address_type || 'unknown',
          verified: result.verified || false,
        };
        setOriginAddress(formattedResult);
        toast({
          title: "Origin address found",
          description: `Using ${result.uac} as starting point`,
        });
      } else {
        toast({
          title: "Address not found",
          description: "No address found with that UAC code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search for address",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getDirections = (fromCoords?: { lat: number; lng: number }) => {
    const destLat = destination.coordinates.lat;
    const destLng = destination.coordinates.lng;
    
    let url = '';
    
    if (fromCoords) {
      // Directions from specific address
      const originLat = fromCoords.lat;
      const originLng = fromCoords.lng;
      
      const userAgent = navigator.userAgent || navigator.vendor;
      
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        // iOS - Apple Maps
        url = `http://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&dirflg=d`;
      } else if (/android/i.test(userAgent)) {
        // Android - Google Maps
        url = `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`;
      } else {
        // Desktop - Google Maps
        url = `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`;
      }
    } else {
      // Directions from current location
      const userAgent = navigator.userAgent || navigator.vendor;
      
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        // iOS - Apple Maps
        url = `http://maps.apple.com/?daddr=${destLat},${destLng}&dirflg=d`;
      } else if (/android/i.test(userAgent)) {
        // Android - Google Maps
        url = `https://www.google.com/maps/dir/current+location/${destLat},${destLng}`;
      } else {
        // Desktop - Google Maps
        url = `https://www.google.com/maps/dir/current+location/${destLat},${destLng}`;
      }
    }
    
    window.open(url, '_blank');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Get Directions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Destination Info */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Destination</Label>
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono font-semibold text-primary">
                    {destination.uac}
                  </span>
                  {destination.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-foreground">{destination.readable}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {destination.coordinates.lat.toFixed(4)}, {destination.coordinates.lng.toFixed(4)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {destination.type}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(
                  `${destination.coordinates.lat},${destination.coordinates.lng}`, 
                  "Coordinates"
                )}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Origin Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Starting Point</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={originType === 'current' ? 'default' : 'outline'}
              onClick={() => setOriginType('current')}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <Target className="h-5 w-5" />
              <span className="text-sm">Current Location</span>
            </Button>
            <Button 
              variant={originType === 'uac' ? 'default' : 'outline'}
              onClick={() => setOriginType('uac')}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <Search className="h-5 w-5" />
              <span className="text-sm">Address/UAC</span>
            </Button>
          </div>

          {originType === 'uac' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter UAC code or search address..."
                  value={uacQuery}
                  onChange={(e) => setUacQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchOriginByUAC()}
                />
                <Button 
                  onClick={searchOriginByUAC}
                  disabled={isSearching || !uacQuery.trim()}
                  variant="secondary"
                >
                  {isSearching ? "Searching..." : "Find"}
                </Button>
              </div>

              {originAddress && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono font-semibold text-primary">
                      {originAddress.uac}
                    </span>
                    {originAddress.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{originAddress.readable}</p>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {originAddress.coordinates.lat.toFixed(4)}, {originAddress.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => getDirections(originType === 'uac' ? originAddress?.coordinates : undefined)}
            disabled={originType === 'uac' && !originAddress}
            className="w-full flex items-center gap-2"
            variant="hero"
          >
            <Navigation className="h-4 w-4" />
            {originType === 'current' ? 'Get Directions from Current Location' : 'Get Directions from Selected Address'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              onClick={() => copyToClipboard(destination.uac, "UAC Code")}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy UAC
            </Button>
            <Button 
              variant="outline"
              onClick={() => copyToClipboard(destination.readable, "Full Address")}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Address
            </Button>
          </div>

          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Info */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Navigation Apps</p>
              <p>• On mobile: Opens your default maps app</p>
              <p>• On desktop: Opens Google Maps in browser</p>
              <p>• Supports Apple Maps (iOS) and Google Maps</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressDirections;