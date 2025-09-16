import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, MapPin, CheckCircle, AlertTriangle, Info, 
  Navigation, Phone, Clock, Shield
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QRCodeScanner } from "@/components/QRCodeScanner";

interface PublicAddress {
  uac: string;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  latitude: number;
  longitude: number;
  addressType: string;
  verified: boolean;
  completenessScore: number;
  distance?: number;
}

interface SearchResult {
  results: PublicAddress[];
  totalCount: number;
  searchMetadata: {
    query: string;
    searchType: string;
    executionTime: number;
  };
}

interface PublicAccessPortalProps {
  onNavigateToEmergency?: (addressData?: PublicAddress) => void;
}

export function PublicAccessPortal({ onNavigateToEmergency }: PublicAccessPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      console.log('PublicAccessPortal unmounting - clearing state');
      setSearchQuery('');
      setSearchResults([]);
      setSearchMetadata(null);
      setLoading(false);
    };
  }, []);

  // Get user location for proximity search
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter an address, UAC, or location to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use the public search API
      const searchRequest = {
        query: searchQuery.trim(),
        limit: 20,
        includePrivate: false, // Public portal only shows public addresses
        ...(userLocation && {
          coordinates: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 10000 // 10km radius
          }
        })
      };

      const { data, error } = await supabase.functions.invoke('address-search-api', {
        body: searchRequest
      });

      if (error) throw error;

      const searchResult: SearchResult = data;
      setSearchResults(searchResult.results || []);
      setSearchMetadata(searchResult.searchMetadata);

      if (searchResult.results.length === 0) {
        toast({
          title: "No Results",
          description: "No public addresses found matching your search",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${searchResult.results.length} address(es)`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search addresses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanResult = async (uac: string) => {
    setSearchQuery(uac);
    // Auto-search with the scanned UAC
    setLoading(true);
    try {
      const searchRequest = {
        query: uac.trim(),
        limit: 20,
        includePrivate: false,
        ...(userLocation && {
          coordinates: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 10000
          }
        })
      };

      const { data, error } = await supabase.functions.invoke('address-search-api', {
        body: searchRequest
      });

      if (error) throw error;

      const searchResult: SearchResult = data;
      setSearchResults(searchResult.results || []);
      setSearchMetadata(searchResult.searchMetadata);

      if (searchResult.results.length === 0) {
        toast({
          title: "No Results",
          description: "No address found for this UAC",
        });
      } else {
        toast({
          title: "QR Code Scanned",
          description: `Found address for UAC: ${uac}`,
        });
      }
    } catch (error) {
      console.error('QR search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for the scanned UAC",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyCall = () => {
    // In a real implementation, this would connect to emergency services
    toast({
      title: "Emergency Services",
      description: "Connecting to emergency services...",
    });
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1000) return `${Math.round(distance)}m away`;
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Equatorial Guinea Address Portal
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Public address lookup and verification system
          </p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Verified Addresses Only
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              GPS Coordinates Available
            </span>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Address Search
            </CardTitle>
            <CardDescription>
              Search by street name, UAC (Unique Address Code), city, or building name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search">Search Query</Label>
                <Input
                  id="search"
                  placeholder="Enter UAC, street name, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2 items-end">
                <QRCodeScanner 
                  onScanResult={handleQRScanResult}
                  variant="button"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="h-10"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Search Examples */}
            <div className="text-sm text-muted-foreground">
              <p className="mb-1">Example searches:</p>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery('GQ-BN-MAL-')}
                >
                  UAC: GQ-BN-MAL-*
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery('Malabo')}
                >
                  City: Malabo
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery('Independence Avenue')}
                >
                  Street: Independence Avenue
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Metadata */}
        {searchMetadata && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Search completed in {searchMetadata.executionTime}ms • 
              Query: "{searchMetadata.query}" • 
              Type: {searchMetadata.searchType}
              {userLocation && ' • Using your location for proximity'}
            </AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Search Results ({searchResults.length})</h2>
            
            {searchResults.map((address, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Address Information */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {address.building && `${address.building}, `}
                            {address.street}
                          </h3>
                          <p className="text-muted-foreground">
                            {address.city}, {address.region}, {address.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {address.verified && (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant={getQualityColor(address.completenessScore)}>
                            {address.completenessScore}% Complete
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">UAC:</span> 
                          <span className="ml-2 font-mono text-primary">{address.uac}</span>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <span className="ml-2 capitalize">{address.addressType}</span>
                        </div>
                        <div>
                          <span className="font-medium">Coordinates:</span>
                          <span className="ml-2 font-mono text-xs">
                            {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                          </span>
                        </div>
                        {address.distance && (
                          <div>
                            <span className="font-medium">Distance:</span>
                            <span className="ml-2">{formatDistance(address.distance)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(address.uac);
                          toast({
                            title: "Copied",
                            description: "UAC copied to clipboard",
                          });
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Copy UAC
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const coords = `${address.latitude},${address.longitude}`;
                          navigator.clipboard.writeText(coords);
                          toast({
                            title: "Copied",
                            description: "Coordinates copied to clipboard",
                          });
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Copy Coordinates
                      </Button>

                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (onNavigateToEmergency) {
                            onNavigateToEmergency(address);
                            toast({
                              title: "Navigating to Emergency Report",
                              description: "Address information will be pre-filled",
                            });
                          }
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Report Issue Here
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}


        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Equatorial Guinea National Digital Address Agency</p>
          <p>Serving citizens with reliable address information since 2024</p>
        </div>
      </div>
    </div>
  );
}