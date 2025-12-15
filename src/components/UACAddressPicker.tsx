import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, MapPin, Check, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAddresses } from '@/hooks/useAddresses';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface SelectedAddress {
  uac: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  latitude: number;
  longitude: number;
  address_type: string;
  description?: string;
  verified: boolean;
  public: boolean;
  completeness_score?: number;
}

interface UACAddressPickerProps {
  onAddressSelect?: (address: SelectedAddress) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  initialUAC?: string;
  showDescription?: boolean;
  showCoordinates?: boolean;
  allowPrivateAddresses?: boolean;
}

export const UACAddressPicker: React.FC<UACAddressPickerProps> = ({
  onAddressSelect,
  onClear,
  placeholder = "Enter UAC code or search address...",
  disabled = false,
  className,
  initialUAC = "",
  showDescription = true,
  showCoordinates = false,
  allowPrivateAddresses = false,
}) => {
  const [query, setQuery] = useState(initialUAC);
  const [results, setResults] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Ref to skip search after address selection
  const skipSearchRef = useRef<boolean>(false);

  const { searchAddresses } = useAddresses();
  const { toast } = useToast();

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchAddresses(searchQuery);
      
      // Filter results based on allowPrivateAddresses prop
      const filteredResults = allowPrivateAddresses 
        ? searchResults 
        : searchResults.filter(result => result.public === true);
        
      setResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search addresses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchAddresses, allowPrivateAddresses, toast]);

  // Debounce search - skip if we just selected an address
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleAddressSelect = (address: any) => {
    const selectedAddr: SelectedAddress = {
      uac: address.uac,
      country: address.country,
      region: address.region,
      city: address.city,
      street: address.street,
      building: address.building,
      latitude: address.latitude,
      longitude: address.longitude,
      address_type: address.address_type,
      description: address.description,
      verified: address.verified,
      public: address.public,
      completeness_score: address.completeness_score,
    };

    setSelectedAddress(selectedAddr);
    // Skip the next search triggered by query change
    skipSearchRef.current = true;
    setQuery(`${address.uac} - ${address.street}, ${address.city}`);
    setShowResults(false);
    
    onAddressSelect?.(selectedAddr);
    
    toast({
      title: "Address Selected",
      description: `Selected: ${address.uac}`,
    });
  };

  const handleClear = () => {
    setQuery("");
    setSelectedAddress(null);
    setResults([]);
    setShowResults(false);
    onClear?.();
  };

  const formatAddress = (address: any) => {
    const parts = [address.street];
    if (address.building) parts.unshift(address.building);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    return parts.join(', ');
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={disabled}
            className="pl-10 pr-20"
          />
          {isSearching && (
            <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {(query || selectedAddress) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Selected Address</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {selectedAddress.uac}
                    </Badge>
                    {selectedAddress.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                    {selectedAddress.public && (
                      <Badge variant="outline" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {formatAddress(selectedAddress)}
                  </p>
                  {showDescription && selectedAddress.description && (
                    <p className="text-xs text-muted-foreground italic">
                      {selectedAddress.description}
                    </p>
                  )}
                  {showCoordinates && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedAddress.latitude}, {selectedAddress.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="max-h-64 overflow-y-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Search Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {results.map((address, index) => (
              <div
                key={`${address.uac}-${index}`}
                onClick={() => handleAddressSelect(address)}
                className="p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      {address.uac}
                    </Badge>
                    <div className="flex gap-1">
                      {address.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                      {address.public && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatAddress(address)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {address.address_type} • {address.country}
                    </p>
                    {showDescription && address.description && (
                      <p className="text-xs text-muted-foreground italic">
                        {address.description}
                      </p>
                    )}
                    {showCoordinates && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {address.latitude}, {address.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && query.length > 2 && !isSearching && (
        <Card className="border-muted">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No addresses found matching "{query}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching by UAC code, street name, or city
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};