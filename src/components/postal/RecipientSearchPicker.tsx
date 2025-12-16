import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Check, Loader2, User, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAddresses } from '@/hooks/useAddresses';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export interface SelectedRecipientAddress {
  uac: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  latitude?: number;
  longitude?: number;
  address_type?: string;
  description?: string;
  verified?: boolean;
  public?: boolean;
  // Person/Dependent info for name search
  recipientName?: string;
  isDependent?: boolean;
  dependentType?: string;
  guardianName?: string;
}

interface PersonSearchResult {
  person_id: string | null;
  dependent_id?: string;
  full_name: string;
  email: string | null;
  is_protected: boolean;
  is_dependent: boolean;
  dependent_type?: string;
  relationship_to_guardian?: string;
  guardian_name?: string;
  addresses: Array<{
    uac: string;
    unit_uac?: string;
    street?: string;
    city?: string;
    region?: string;
    country?: string;
    building?: string;
    latitude?: number;
    longitude?: number;
    privacy_level?: string;
    status?: string;
  }>;
  address_count: number;
}

interface RecipientSearchPickerProps {
  onAddressSelect?: (address: SelectedRecipientAddress, recipientName?: string) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

type SearchMode = 'address' | 'name';

export const RecipientSearchPicker: React.FC<RecipientSearchPickerProps> = ({
  onAddressSelect,
  onClear,
  placeholder,
  disabled = false,
  className,
}) => {
  const { t } = useTranslation('postal');
  const [searchMode, setSearchMode] = useState<SearchMode>('address');
  const [query, setQuery] = useState('');
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [personResults, setPersonResults] = useState<PersonSearchResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SelectedRecipientAddress | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const { searchAddresses } = useAddresses();
  const { toast } = useToast();
  
  // Use ref to avoid infinite loop - searchAddresses changes every render
  const searchAddressesRef = useRef(searchAddresses);
  searchAddressesRef.current = searchAddresses;

  // Format address for display
  const formatSelectedAddressDisplay = (address: { uac: string; street?: string; city?: string; recipientName?: string }) => {
    if (address.recipientName) {
      return `${address.recipientName} - ${address.uac}`;
    }
    return `${address.uac} - ${address.street || ''}, ${address.city || ''}`;
  };

  // Debounced search - use ref to avoid infinite loop
  useEffect(() => {
    if (selectedAddress) {
      const expectedDisplay = formatSelectedAddressDisplay(selectedAddress);
      if (query === expectedDisplay) {
        return;
      }
    }

    if (!query.trim() || query.length < 2) {
      setAddressResults([]);
      setPersonResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (searchMode === 'address') {
          const results = await searchAddressesRef.current(query);
          setAddressResults(results);
          setShowResults(true);
        } else {
          const { data, error } = await supabase.functions.invoke('search-citizen-addresses', {
            body: {
              query,
              purpose: 'DELIVERY',
              purposeDetails: 'Postal delivery order recipient search',
              limit: 20,
            },
          });
          if (!error) {
            setPersonResults(data?.results || []);
            setShowResults(true);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchMode, selectedAddress]);

  // Handle address selection from address mode
  const handleAddressSelect = (address: any) => {
    const selectedAddr: SelectedRecipientAddress = {
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
    };

    setSelectedAddress(selectedAddr);
    setQuery(formatSelectedAddressDisplay(address));
    setShowResults(false);
    
    onAddressSelect?.(selectedAddr);
    
    toast({
      title: t('recipient.addressSelected'),
      description: `${address.uac}`,
    });
  };

  // Handle address selection from person/name mode
  const handlePersonAddressSelect = (person: PersonSearchResult, address: PersonSearchResult['addresses'][0]) => {
    const selectedAddr: SelectedRecipientAddress = {
      uac: address.uac,
      country: address.country || '',
      region: address.region || '',
      city: address.city || '',
      street: address.street || '',
      building: address.building,
      latitude: address.latitude,
      longitude: address.longitude,
      recipientName: person.full_name,
      isDependent: person.is_dependent,
      dependentType: person.dependent_type,
      guardianName: person.guardian_name,
    };

    setSelectedAddress(selectedAddr);
    setQuery(formatSelectedAddressDisplay({ ...address, recipientName: person.full_name }));
    setShowResults(false);
    setExpandedPerson(null);
    
    onAddressSelect?.(selectedAddr, person.full_name);
    
    toast({
      title: t('recipient.addressSelected'),
      description: `${person.full_name} - ${address.uac}`,
    });
  };

  const handleClear = () => {
    setQuery('');
    setSelectedAddress(null);
    setAddressResults([]);
    setPersonResults([]);
    setShowResults(false);
    setExpandedPerson(null);
    onClear?.();
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    if (selectedAddress) {
      const expectedDisplay = formatSelectedAddressDisplay(selectedAddress);
      if (newValue !== expectedDisplay) {
        setSelectedAddress(null);
        setShowResults(false);
        onClear?.();
      }
    }
  };

  const toggleSearchMode = async () => {
    const newMode = searchMode === 'address' ? 'name' : 'address';
    setSearchMode(newMode);
    setAddressResults([]);
    setPersonResults([]);
    setShowResults(false);
    setExpandedPerson(null);
    // Re-trigger search if there's a query
    if (query.length >= 2) {
      setIsSearching(true);
      try {
        if (newMode === 'address') {
          const results = await searchAddressesRef.current(query);
          setAddressResults(results);
          setShowResults(true);
        } else {
          const { data, error } = await supabase.functions.invoke('search-citizen-addresses', {
            body: {
              query,
              purpose: 'DELIVERY',
              purposeDetails: 'Postal delivery order recipient search',
              limit: 20,
            },
          });
          if (!error) {
            setPersonResults(data?.results || []);
            setShowResults(true);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsSearching(false);
    }
  };

  const formatAddress = (address: any) => {
    const parts = [];
    if (address.building) parts.push(address.building);
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    return parts.join(', ') || 'N/A';
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return searchMode === 'address' 
      ? t('recipient.searchByAddress')
      : t('recipient.searchByName');
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Search Mode Toggle */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{t('recipient.searchMode')}:</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleSearchMode}
          disabled={disabled}
          className="gap-2"
        >
          {searchMode === 'address' ? (
            <>
              <MapPin className="h-4 w-4" />
              {t('recipient.modeAddress')}
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              {t('recipient.modeName')}
            </>
          )}
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={getPlaceholder()}
            value={query}
            onChange={handleQueryChange}
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
                  <span className="font-medium text-primary">{t('recipient.selectedAddress')}</span>
                </div>
                <div className="space-y-1 text-sm">
                  {selectedAddress.recipientName && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedAddress.recipientName}</span>
                      {selectedAddress.isDependent && (
                        <Badge variant="secondary" className="text-xs">
                          {t(`recipient.dependentTypes.${selectedAddress.dependentType?.toLowerCase() || 'minor'}`)}
                        </Badge>
                      )}
                    </div>
                  )}
                  {selectedAddress.guardianName && (
                    <p className="text-xs text-muted-foreground">
                      {t('recipient.careOf')}: {selectedAddress.guardianName}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {selectedAddress.uac}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {formatAddress(selectedAddress)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Mode Results */}
      {showResults && searchMode === 'address' && addressResults.length > 0 && (
        <Card className="max-h-64 overflow-y-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('recipient.addressResults')} ({addressResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {addressResults.map((address, index) => (
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
                          {t('common:verified')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium break-words">
                      {formatAddress(address)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {address.address_type} • {address.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Name Mode Results */}
      {showResults && searchMode === 'name' && personResults.length > 0 && (
        <Card className="max-h-80 overflow-y-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('recipient.personResults')} ({personResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {personResults.map((person, index) => {
              const personKey = person.person_id || person.dependent_id || `person-${index}`;
              const isExpanded = expandedPerson === personKey;
              
              return (
                <div
                  key={personKey}
                  className="rounded-lg border overflow-hidden"
                >
                  {/* Person Header */}
                  <div
                    onClick={() => setExpandedPerson(isExpanded ? null : personKey)}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{person.full_name}</span>
                        {person.is_dependent && (
                          <Badge variant="secondary" className="text-xs">
                            {t(`recipient.dependentTypes.${person.dependent_type?.toLowerCase() || 'minor'}`)}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {person.address_count} {person.address_count === 1 ? t('recipient.address') : t('recipient.addresses')}
                      </Badge>
                    </div>
                    {person.guardian_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('recipient.careOf')}: {person.guardian_name}
                      </p>
                    )}
                  </div>

                  {/* Expanded Addresses */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 p-2 space-y-2">
                      {person.addresses.map((address, addrIndex) => (
                        <div
                          key={`${address.uac}-${addrIndex}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePersonAddressSelect(person, address);
                          }}
                          className="p-2 rounded bg-background border cursor-pointer hover:border-primary transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              {address.uac}
                            </Badge>
                            {address.status && (
                              <Badge variant="secondary" className="text-xs">
                                {t(`status.${address.status.toLowerCase()}`)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground break-words">
                            {formatAddress(address)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && query.length > 2 && !isSearching && 
       ((searchMode === 'address' && addressResults.length === 0) ||
        (searchMode === 'name' && personResults.length === 0)) && (
        <Card className="border-muted">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchMode === 'address' 
                ? t('recipient.noAddressResults', { query })
                : t('recipient.noNameResults', { query })
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchMode === 'address' 
                ? t('recipient.tryNameSearch')
                : t('recipient.tryAddressSearch')
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
