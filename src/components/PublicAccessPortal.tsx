import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, MapPin, CheckCircle, AlertTriangle, Info, 
  Navigation, Phone, Clock, Shield, Share2, QrCode, Mail, MessageCircle
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";

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

  const handleShare = (address: PublicAddress, method: 'whatsapp' | 'email' | 'copy') => {
    const addressText = `${address.building ? address.building + ', ' : ''}${address.street}, ${address.city}, ${address.region}, ${address.country}`;
    const shareMessage = `Address: ${addressText}\nUAC: ${address.uac}\nCoordinates: ${address.latitude}, ${address.longitude}\nVerified: ${address.verified ? 'Yes' : 'No'}`;
    
    switch (method) {
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'email':
        const emailSubject = `Address Information - ${addressText}`;
        const emailBody = shareMessage + '\n\nShared from Equatorial Guinea Address Portal';
        const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(emailUrl);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareMessage);
        toast({
          title: "Copied",
          description: "Address information copied to clipboard",
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Equatorial Guinea Address Portal
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground mb-4 px-2">
            Public address lookup and verification system
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <span className="flex items-center justify-center gap-1">
              <Shield className="h-4 w-4" />
              Verified Addresses Only
            </span>
            <span className="flex items-center justify-center gap-1">
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
            <div className="space-y-3 sm:space-y-0">
              <div className="w-full">
                <Label htmlFor="search">Search Query</Label>
                <Input
                  id="search"
                  placeholder="Enter UAC, street name, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <QRCodeScanner 
                  onScanResult={handleQRScanResult}
                  variant="button"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="w-full sm:w-auto h-10"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Search Examples */}
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Example searches:</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-center py-1"
                  onClick={() => setSearchQuery('GQ-BN-MAL-')}
                >
                  UAC: GQ-BN-MAL-*
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-center py-1"
                  onClick={() => setSearchQuery('Malabo')}
                >
                  City: Malabo
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-center py-1"
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
            <Info className="h-4 w-4 flex-shrink-0" />
            <AlertDescription className="text-sm">
              <div className="space-y-1 sm:space-y-0">
                <div>Search completed in {searchMetadata.executionTime}ms</div>
                <div>Query: "{searchMetadata.query}"</div>
                <div>Type: {searchMetadata.searchType}</div>
                {userLocation && <div>Using your location for proximity</div>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Search Results ({searchResults.length})</h2>
            
            {searchResults.map((address, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-4 lg:grid-cols-3">
                    {/* Address Information */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">
                            {address.building && `${address.building}, `}
                            {address.street}
                          </h3>
                          <p className="text-sm text-muted-foreground break-words">
                            {address.city}, {address.region}, {address.country}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                          {address.verified && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant={getQualityColor(address.completenessScore)} className="text-xs">
                            {address.completenessScore}% Complete
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="break-all">
                          <span className="font-medium">UAC:</span> 
                          <span className="ml-2 font-mono text-primary text-xs">{address.uac}</span>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <span className="ml-2 capitalize">{address.addressType}</span>
                        </div>
                        <div className="break-all">
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
                    <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-start"
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
                        className="w-full justify-start"
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
                        className="w-full justify-start"
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

                      {/* Share Options */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Address
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Share Address</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* QR Code */}
                            <div className="flex flex-col items-center space-y-2">
                              <h4 className="text-sm font-medium">QR Code</h4>
                              <QRCodeGenerator 
                                uac={address.uac}
                                addressText={`${address.building ? address.building + ', ' : ''}${address.street}, ${address.city}, ${address.region}`}
                                variant="button"
                                size="md"
                              />
                              <p className="text-xs text-muted-foreground text-center px-2">
                                Click above to generate and download QR code
                              </p>
                            </div>
                            
                            <Separator />
                            
                            {/* Share Options */}
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                variant="outline"
                                className="justify-start w-full"
                                onClick={() => handleShare(address, 'whatsapp')}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Share via WhatsApp
                              </Button>
                              
                              <Button
                                variant="outline"
                                className="justify-start w-full"
                                onClick={() => handleShare(address, 'email')}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Share via Email
                              </Button>
                              
                              <Button
                                variant="outline"
                                className="justify-start w-full"
                                onClick={() => handleShare(address, 'copy')}
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Copy to Clipboard
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full justify-start"
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
        <div className="text-center mt-8 text-sm text-muted-foreground px-4">
          <p className="mb-1">Equatorial Guinea National Digital Address Agency</p>
          <p>Serving citizens with reliable address information since 2024</p>
        </div>
      </div>
    </div>
  );
}