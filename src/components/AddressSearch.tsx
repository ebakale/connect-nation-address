import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAddresses } from '@/hooks/useAddresses';

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

interface AddressSearchProps {
  onSelectAddress?: (result: SearchResult) => void;
  className?: string;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onSelectAddress, className }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { searchAddresses } = useAddresses();

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

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    
    try {
      console.log('Starting search for:', query);
      // Search addresses from database using the RPC function
      const searchResults = await searchAddresses(query);
      console.log('Raw search results:', searchResults);
      
      // Convert the results to the SearchResult format
      const formattedResults = searchResults.map(convertToSearchResult);
      console.log('Formatted results:', formattedResults);
      setResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
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

  const handleSelectResult = (result: SearchResult) => {
    setShowResults(false);
    setQuery(result.readable);
    onSelectAddress?.(result);
  };
  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search by address, UAC code, or landmark..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !query.trim()}
          variant="hero"
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {showResults && (
        <Card className="mt-2 border shadow-lg">
          <CardContent className="p-0">
            {results.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.uac}
                    className={cn(
                      "p-3 hover:bg-accent cursor-pointer transition-colors",
                      index !== results.length - 1 && "border-b"
                    )}
                    onClick={() => handleSelectResult(result)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono font-semibold text-primary">
                            {result.uac}
                          </span>
                          {result.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground truncate">
                          {result.readable}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {result.type}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => openDirectionsForResult(result, e)}
                        aria-label="Get directions"
                        title="Get directions"
                      >
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No addresses found for "{query}"</p>
                <p className="text-sm mt-1">Try searching with a different term or UAC code</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddressSearch;