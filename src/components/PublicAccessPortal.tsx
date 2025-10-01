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
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { useEnhancedGeolocation } from "@/hooks/useEnhancedGeolocation";
import { useTranslation } from "react-i18next";
import AddressCard from "@/components/AddressCard";

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
  const { toast } = useToast();
  const { trackSearch } = useSearchAnalytics();
  const { location, getCurrentPosition } = useEnhancedGeolocation({
    enableHighAccuracy: true,
    enableCaching: true
  });

  const { t } = useTranslation(["common","address"]);

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

  // Initialize location on component mount
  useEffect(() => {
    getCurrentPosition(true); // Use cached if available
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: t('address:publicPortal.searchRequiredTitle'),
        description: t('address:publicPortal.searchRequiredDescription'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const searchStartTime = Date.now();
    
    try {
      // Use the public search API
      const searchRequest = {
        query: searchQuery.trim(),
        limit: 20,
        includePrivate: false, // Public portal only shows public addresses
        ...(location && {
          coordinates: {
            lat: location.latitude,
            lng: location.longitude,
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

      // Track search analytics
      await trackSearch({
        query: searchQuery.trim(),
        searchType: 'address',
        resultCount: searchResult.results.length,
        successful: true,
        executionTime: Date.now() - searchStartTime,
        userLocation: location ? { lat: location.latitude, lng: location.longitude } : undefined
      });

      if (searchResult.results.length === 0) {
        toast({
          title: t('common:messages.noResults'),
          description: t('address:publicPortal.noResultsDescription'),
        });
      } else {
        toast({
          title: t('address:publicPortal.searchCompleteTitle'),
          description: t('address:publicPortal.foundAddressesCount', { count: searchResult.results.length }),
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Track failed search
      await trackSearch({
        query: searchQuery.trim(),
        searchType: 'address',
        resultCount: 0,
        successful: false,
        executionTime: Date.now() - searchStartTime,
        userLocation: location ? { lat: location.latitude, lng: location.longitude } : undefined
      });

      toast({
        title: t('address:publicPortal.searchErrorTitle'),
        description: t('address:publicPortal.searchErrorDescription'),
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
    const qrSearchStartTime = Date.now();
    
    try {
      const searchRequest = {
        query: uac.trim(),
        limit: 20,
        includePrivate: false,
        ...(location && {
          coordinates: {
            lat: location.latitude,
            lng: location.longitude,
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

      // Track QR search analytics
      await trackSearch({
        query: uac,
        searchType: 'uac',
        resultCount: searchResult.results.length,
        successful: true,
        executionTime: Date.now() - qrSearchStartTime,
        userLocation: location ? { lat: location.latitude, lng: location.longitude } : undefined
      });

      if (searchResult.results.length === 0) {
        toast({
          title: t('common:messages.noResults'),
          description: t('address:publicPortal.noAddressForUac'),
        });
      } else {
        toast({
          title: t('address:publicPortal.qrScannedTitle'),
          description: t('address:publicPortal.qrFoundAddressForUac', { uac }),
        });
      }
    } catch (error) {
      console.error('QR search error:', error);
      
      // Track failed QR search
      await trackSearch({
        query: uac,
        searchType: 'uac',
        resultCount: 0,
        successful: false,
        executionTime: Date.now() - qrSearchStartTime,
        userLocation: location ? { lat: location.latitude, lng: location.longitude } : undefined
      });

      toast({
      title: t('address:publicPortal.qrSearchErrorTitle'),
      description: t('address:publicPortal.qrSearchErrorDescription'),
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
  if (distance < 1000) return `${Math.round(distance)}${t('common:units.m')} ${t('address:publicPortal.awaySuffix')}`;
  return `${(distance / 1000).toFixed(1)}${t('common:units.km')} ${t('address:publicPortal.awaySuffix')}`;
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
          title: t('address:publicPortal.copiedTitle'),
          description: t('address:publicPortal.addressInfoCopied'),
        });
        break;
    }
  };

  return (
    <div className="mobile-viewport-stable bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 lg:py-8 max-w-4xl mobile-container">
        {/* Mobile-optimized Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-2 mobile-line-clamp-2">
            {t('address:publicPortal.title')}
          </h1>
          <p className="text-xs sm:text-sm lg:text-lg text-muted-foreground mb-3 sm:mb-4 px-1 sm:px-2 mobile-line-clamp-3">
            {t('address:publicPortal.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              {t('address:publicPortal.verifiedOnly')}
            </span>
            <span className="flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              {t('address:publicPortal.gpsAvailable')}
            </span>
          </div>
        </div>

        {/* Mobile-optimized Search Section */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('address:publicPortal.addressSearch')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t('address:publicPortal.searchDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="w-full">
                <Label htmlFor="search" className="text-xs sm:text-sm">{t('address:publicPortal.searchQueryLabel')}</Label>
                <Input
                  id="search"
                  placeholder={t('address:publicPortal.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full text-sm sm:text-base"
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
                  {loading ? t('address:publicPortal.searching') : t('common:buttons.search')}
                </Button>
              </div>
            </div>

            {/* Search Examples */}
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">{t('address:publicPortal.exampleSearches')}</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-center py-1"
                  onClick={() => setSearchQuery('GQ-BN-MAL-')}
                >
                  {t('address:publicPortal.exampleUac')}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-center py-1"
                  onClick={() => setSearchQuery('Malabo')}
                >
                  {t('address:publicPortal.exampleCity')}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-center py-1"
                  onClick={() => setSearchQuery('Independence Avenue')}
                >
                  {t('address:publicPortal.exampleStreet')}
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
                <div>{t('address:publicPortal.searchCompletedIn', { ms: searchMetadata.executionTime })}</div>
                <div>{t('address:publicPortal.queryLabel', { query: searchMetadata.query })}</div>
                <div>{t('address:publicPortal.typeLabel', { type: searchMetadata.searchType })}</div>
                {location && <div>{t('address:publicPortal.usingYourLocation')}</div>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">{`${t('address:searchResults')} (${searchResults.length})`}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((address, index) => (
                <AddressCard
                  key={index}
                  address={{
                    uac: address.uac,
                    country: address.country,
                    region: address.region,
                    city: address.city,
                    street: address.street,
                    building: address.building || '',
                    coordinates: {
                      lat: address.latitude,
                      lng: address.longitude
                    },
                    metadata: {
                      type: address.addressType,
                      description: address.distance ? formatDistance(address.distance) : '',
                      verified: address.verified
                    }
                  }}
                  onViewMap={() => {
                    const url = `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
                    window.open(url, '_blank');
                  }}
                />
              ))}
            </div>
          </div>
        )}


        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground px-4">
          <p className="mb-1">{t('address:publicPortal.footerAgencyName')}</p>
          <p>{t('address:publicPortal.footerTagline')}</p>
        </div>
      </div>
    </div>
  );
}