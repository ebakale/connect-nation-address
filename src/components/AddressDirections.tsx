import React, { useState, useEffect } from 'react';
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
  Target,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAddresses } from '@/hooks/useAddresses';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { searchAddresses } = useAddresses();
  const { toast } = useToast();
  const { t } = useTranslation('addresses');

  // Get current location on component mount
  useEffect(() => {
    if (originType === 'current') {
      getCurrentLocation();
    }
  }, [originType]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(coords);
        setIsGettingLocation(false);
        toast({
          title: "Location found",
          description: `Using your current location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('locationAccessDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('locationUnavailable');
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard`,
    });
  };

  const searchOriginByUAC = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAddresses(query);
      const formattedResults: SearchResult[] = results.map(result => ({
        uac: result.uac || '',
        readable: `${result.street || ''}${result.building ? ', ' + result.building : ''}, ${result.city || ''}, ${result.region || ''}, ${result.country || ''}`,
        coordinates: {
          lat: result.latitude || 0,
          lng: result.longitude || 0,
        },
        type: result.address_type || 'unknown',
        verified: result.verified || false,
      }));
      
      setSearchResults(formattedResults);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search for address",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectOriginAddress = (address: SearchResult) => {
    setOriginAddress(address);
    setUacQuery(address.uac);
    setSearchResults([]);
    toast({
      title: "Origin address selected",
      description: `Using ${address.uac} as starting point`,
    });
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (originType === 'uac') {
        searchOriginByUAC(uacQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [uacQuery, originType]);

  const getDirections = () => {
    const destLat = destination.coordinates.lat;
    const destLng = destination.coordinates.lng;
    
    // Validate coordinates
    if (!destLat || !destLng || isNaN(destLat) || isNaN(destLng)) {
      toast({
        title: "Invalid coordinates",
        description: "Invalid destination coordinates",
        variant: "destructive",
      });
      return;
    }
    
    let url = '';
    
    if (originType === 'uac' && originAddress) {
      // Directions from specific address
      const originLat = originAddress.coordinates.lat;
      const originLng = originAddress.coordinates.lng;
      
      if (!originLat || !originLng || isNaN(originLat) || isNaN(originLng)) {
        toast({
          title: "Invalid coordinates",
          description: "Invalid origin coordinates",
          variant: "destructive",
        });
        return;
      }
      
      const userAgent = navigator.userAgent || navigator.vendor;
      
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        // iOS - Use proper Apple Maps URL scheme
        url = `maps://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&dirflg=d`;
      } else if (/android/i.test(userAgent)) {
        // Android - Use Google Maps intent
        url = `google.navigation:q=${destLat},${destLng}&mode=d`;
      } else {
        // Desktop - Google Maps web
        url = `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`;
      }
    } else if (originType === 'current') {
      // Directions from current location
      const userAgent = navigator.userAgent || navigator.vendor;
      
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        // iOS - Apple Maps with current location
        if (currentLocation && currentLocation.lat && currentLocation.lng) {
          url = `maps://maps.apple.com/?saddr=${currentLocation.lat},${currentLocation.lng}&daddr=${destLat},${destLng}&dirflg=d`;
        } else {
          url = `maps://maps.apple.com/?daddr=${destLat},${destLng}&dirflg=d`;
        }
      } else if (/android/i.test(userAgent)) {
        // Android - Google Maps navigation
        url = `google.navigation:q=${destLat},${destLng}&mode=d`;
      } else {
        // Desktop - Google Maps web
        if (currentLocation && currentLocation.lat && currentLocation.lng) {
          url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${destLat},${destLng}`;
        } else {
          url = `https://www.google.com/maps/dir/My+Location/${destLat},${destLng}`;
        }
      }
    }
    
    if (url) {
      // For mobile apps, try the native scheme first, then fallback to web
      const userAgent = navigator.userAgent || navigator.vendor;
      
      if (/iPad|iPhone|iPod/.test(userAgent) && url.startsWith('maps://')) {
        // Try Apple Maps first, fallback to web
        const webUrl = url.replace('maps://maps.apple.com', 'https://maps.apple.com');
        try {
          window.location.href = url;
        } catch (error) {
          window.open(webUrl, '_blank');
        }
      } else if (/android/i.test(userAgent) && url.startsWith('google.navigation')) {
        // Try Google Maps app, fallback to web
        const webUrl = `https://www.google.com/maps/dir//${destLat},${destLng}`;
        try {
          window.location.href = url;
        } catch (error) {
          window.open(webUrl, '_blank');
        }
      } else {
        window.open(url, '_blank');
      }
    } else {
      toast({
        title: "Navigation error",
        description: "Unable to generate directions URL",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          {t('getDirectionsTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Destination Info */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('destination')}</Label>
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono font-semibold text-primary">
                    {destination.uac}
                  </span>
                  {destination.verified && (
                    <Badge variant="secondary" className="text-xs">
                      {t('display.verified')}
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
          <Label className="text-sm font-medium">{t('startingPoint')}</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={originType === 'current' ? 'default' : 'outline'}
              onClick={() => setOriginType('current')}
              className="h-auto p-3 flex flex-col items-center gap-2"
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : currentLocation ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Target className="h-5 w-5" />
              )}
              <span className="text-sm">{t('currentLocation')}</span>
            </Button>
            <Button 
              variant={originType === 'uac' ? 'default' : 'outline'}
              onClick={() => setOriginType('uac')}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <Search className="h-5 w-5" />
              <span className="text-sm">{t('registration.form.street')}</span>
            </Button>
          </div>

          {originType === 'current' && (
            <div className="space-y-2">
              {isGettingLocation && (
                <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Getting your location...</span>
                </div>
              )}
              
              {currentLocation && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground">{t('currentLocation')}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </span>
                </div>
              )}
              
              {locationError && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">{locationError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getCurrentLocation}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {originType === 'uac' && (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Enter UAC code or search address..."
                  value={uacQuery}
                  onChange={(e) => setUacQuery(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && !originAddress && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <Label className="text-xs text-muted-foreground">{t('searchResults')}</Label>
                  {searchResults.map((result, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => selectOriginAddress(result)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono font-semibold text-primary">
                          {result.uac}
                        </span>
                        {result.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{result.readable}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Origin Address */}
              {originAddress && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-primary">
                        {originAddress.uac}
                      </span>
                      {originAddress.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setOriginAddress(null);
                        setUacQuery('');
                        setSearchResults([]);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-foreground">{originAddress.readable}</p>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {originAddress.coordinates.lat.toFixed(4)}, {originAddress.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              )}

              {/* No Results Message */}
              {uacQuery.trim() && !isSearching && searchResults.length === 0 && !originAddress && (
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">No addresses found matching "{uacQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={getDirections}
            disabled={originType === 'uac' && !originAddress}
            className="w-full flex items-center justify-center gap-2 h-12"
            size="lg"
          >
            <Navigation className="h-5 w-5" />
            <span className="font-semibold">
              Navigate to {destination.uac}
            </span>
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