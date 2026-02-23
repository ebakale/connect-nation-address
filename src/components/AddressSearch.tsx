import React, { useState } from 'react';
import { ContextualHelp } from '@/components/ContextualHelp';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAddresses } from '@/hooks/useAddresses';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { EnhancedAddressDetailModal } from '@/components/EnhancedAddressDetailModal';

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

interface AddressData {
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

interface AddressSearchProps {
  onSelectAddress?: (result: SearchResult) => void;
  className?: string;
  onRegisterAddress?: () => void;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onSelectAddress, className, onRegisterAddress }) => {
  const { t } = useTranslation('dashboard');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchAddresses } = useAddresses();
  const { addSearch } = useRecentSearches();

  // Convert search result to SearchResult format
  const convertToSearchResult = (searchResult: any): SearchResult => ({
    uac: searchResult.uac || '',
    readable: `${searchResult.street || ''}${searchResult.building ? ', ' + searchResult.building : ''}, ${searchResult.city || ''}, ${searchResult.region || ''}, ${searchResult.country || ''}`,
    coordinates: {
      lat: searchResult.latitude || 0,
      lng: searchResult.longitude || 0,
    },
    type: searchResult.address_type || 'unknown',
    verified: searchResult.verified || false,
  });

  // Convert search result to AddressData format for the modal
  const convertToAddressData = (searchResult: any): AddressData => ({
    uac: searchResult.uac || '',
    street: searchResult.street || '',
    city: searchResult.city || '',
    region: searchResult.region || '',
    country: searchResult.country || '',
    building: searchResult.building || undefined,
    latitude: searchResult.latitude || 0,
    longitude: searchResult.longitude || 0,
    addressType: searchResult.address_type || 'unknown',
    verified: searchResult.verified || false,
    completenessScore: searchResult.completeness_score || 0,
    distance: searchResult.distance || undefined,
  });

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    
    try {
      // Search addresses from database using the RPC function
      const searchResults = await searchAddresses(query);
      
      // Convert the results to the SearchResult format and store raw results
      const formattedResults = searchResults.map(convertToSearchResult);
      setResults(formattedResults);
      
      // Store raw results for detailed modal
      setResults(formattedResults.map((result, index) => ({
        ...result,
        rawData: searchResults[index]
      })));

      // Track the search in recent searches
      await addSearch({
        search_query: query.trim(),
        search_type: 'address',
        results_count: searchResults.length,
        metadata: {
          timestamp: new Date().toISOString(),
          hasResults: searchResults.length > 0
        }
      });
      
      // Clear the search field after successful search
      setQuery('');
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);

      // Still track failed searches (for analytics)
      await addSearch({
        search_query: query.trim(),
        search_type: 'address',
        results_count: 0,
        metadata: {
          timestamp: new Date().toISOString(),
          hasResults: false,
          error: true
        }
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const openDirectionsForResult = (result: SearchResult, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const lat = result.coordinates.lat;
    const lng = result.coordinates.lng;
    const userAgent = navigator.userAgent || navigator.vendor;
    let url = '';

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      // iOS - Apple Maps
      url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
    } else if (/android/i.test(userAgent)) {
      // Android - Google Maps
      url = `https://www.google.com/maps/dir/current+location/${lat},${lng}`;
    } else {
      // Desktop - Google Maps
      url = `https://www.google.com/maps/dir/current+location/${lat},${lng}`;
    }

    window.open(url, '_blank');
  };

  const handleSelectResult = (result: SearchResult, rawResult?: any) => {
    console.log('AddressSearch: Address selected:', result);
    setShowResults(false);
    
    // Open the enhanced modal with detailed address information
    if (rawResult) {
      const addressData = convertToAddressData(rawResult);
      setSelectedAddress(addressData);
      setIsModalOpen(true);
    }
    
    console.log('AddressSearch: Calling onSelectAddress with:', result);
    onSelectAddress?.(result);
  };

  const handleQRScanResult = async (uac: string) => {
    console.log('QR Code scanned:', uac);
    setQuery(uac);
    
    // Automatically search for the scanned UAC
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const searchResults = await searchAddresses(uac);
      const formattedResults = searchResults.map(convertToSearchResult);
      const resultsWithRawData = formattedResults.map((result, index) => ({
        ...result,
        rawData: searchResults[index]
      }));
      setResults(resultsWithRawData);
      
      // If exactly one result found, auto-select it
      if (formattedResults.length === 1) {
        handleSelectResult(formattedResults[0], searchResults[0]);
      }
    } catch (error) {
      console.error('QR search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            <ContextualHelp 
              content="UAC format: UAC-[Country]-[Region]-[City]-[Number]. Example: UAC-CM-CE-YDE-001. You can also search by street name or city."
              side="bottom"
            />
          </div>
          <Textarea
            placeholder="Try: UAC-CM-CE-YDE-001 or 'Rue de la Joie, Yaoundé'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-8 pr-10 min-h-[40px] max-h-[40px] resize-none overflow-hidden text-sm placeholder:text-xs"
            rows={1}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <QRCodeScanner 
            onScanResult={handleQRScanResult}
            variant="button"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !query.trim()}
            variant="default"
            size="sm"
          >
            {isSearching ? t('searching') : t('common:buttons.search')}
          </Button>
        </div>
      </div>

      {showResults && (
        <Card className="mt-2 border shadow-lg w-full">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-3 pt-2 pb-1 flex items-center justify-between border-b">
                  <Badge variant="secondary" className="text-xs">
                    {results.length} {results.length === 1 ? 'result' : 'results'}
                  </Badge>
                </div>
                <div className="max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.uac}
                    className={cn(
                      "p-3 hover:bg-accent cursor-pointer transition-colors",
                      index !== results.length - 1 && "border-b"
                    )}
                    onClick={() => handleSelectResult(result, (result as any).rawData)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs sm:text-sm font-mono font-semibold text-primary break-all">
                            {result.uac}
                          </span>
                          {result.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-success/10 text-success whitespace-nowrap">
                              {t('verified')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-foreground break-words line-clamp-2">
                          {result.readable}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="break-all">{result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}</span>
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {result.type}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleSelectResult(result, (result as any).rawData); }}
                        aria-label={t('viewOnMap')}
                        title={t('viewOnMap')}
                        className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
              </>
            ) : !isSearching ? (
              <div className="p-4 sm:p-6 text-center text-muted-foreground">
                <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">{t('noAddressesFound', { query })}</p>
                <p className="text-xs sm:text-sm mt-1">{t('tryDifferentSearch')}</p>
                {onRegisterAddress && (
                  <div className="mt-4">
                    <p className="text-xs sm:text-sm mb-2">{t('addressNotFound')}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onRegisterAddress}
                    >
                      {t('registerItNow')}
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Address Detail Modal */}
      <EnhancedAddressDetailModal
        address={selectedAddress}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default AddressSearch;