import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Search, User, MapPin, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface CitizenSearchResult {
  person: {
    id: string;
    auth_user_id: string | null;
    national_id: string | null;
    created_at: string;
  };
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  addresses: Array<{
    id: string;
    address_kind: string;
    scope: string;
    status: string;
    uac: string;
    unit_uac: string | null;
    effective_from: string;
    effective_to: string | null;
    street: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    building: string | null;
    latitude: number | null;
    longitude: number | null;
    nar_verified: boolean | null;
    nar_public: boolean | null;
    created_at: string;
    source: string | null;
    notes: string | null;
  }>;
}

export const CitizenAddressSearch = () => {
  const { toast } = useToast();
  const { t } = useTranslation(['address', 'common']);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitizenSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: t('common:status.error'),
        description: t('address:searchError'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Search strategy:
      // 1. If query looks like an ID (numbers/alphanumeric), search by national_id
      // 2. Otherwise search by name in profiles table
      // 3. Join with citizen addresses and address details

      let personResults: any[] = [];

      // Check if query looks like an ID (contains numbers or is alphanumeric)
      const looksLikeId = /\d/.test(searchQuery) || /^[A-Za-z0-9]+$/.test(searchQuery);

      if (looksLikeId) {
        // Search by national ID
        const { data: personsByID, error: idError } = await supabase
          .from('person')
          .select('*')
          .ilike('national_id', `%${searchQuery.trim()}%`);

        if (idError) throw idError;
        personResults = personsByID || [];
      }

      // Also search by name in profiles (always do this as names can contain numbers)
      const { data: profilesByName, error: nameError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .ilike('full_name', `%${searchQuery.trim()}%`);

      if (nameError) throw nameError;

      // Get person records for profile matches
      if (profilesByName && profilesByName.length > 0) {
        const userIds = profilesByName.map(p => p.user_id);
        const { data: personsByName, error: personError } = await supabase
          .from('person')
          .select('*')
          .in('auth_user_id', userIds);

        if (personError) throw personError;
        
        // Merge results, avoiding duplicates
        const existingPersonIds = new Set(personResults.map(p => p.id));
        const newPersons = (personsByName || []).filter(p => !existingPersonIds.has(p.id));
        personResults = [...personResults, ...newPersons];
      }

      if (personResults.length === 0) {
        // Fallback: show profile hits even if person linkage is missing
        const results: CitizenSearchResult[] = (profilesByName || []).map((p: any) => ({
          person: {
            id: '',
            auth_user_id: p.user_id || null,
            national_id: null,
            created_at: ''
          },
          profile: {
            full_name: p.full_name || null,
            email: p.email || null,
            phone: p.phone || null
          },
          addresses: []
        }));
        setSearchResults(results);
        return;
      }

      // Get profiles for all found persons
      const authUserIds = personResults
        .map(p => p.auth_user_id)
        .filter(id => id !== null);

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', authUserIds);

      if (profileError) throw profileError;

      // Get addresses for all found persons
      const personIds = personResults.map(p => p.id);
      const { data: addresses, error: addressError } = await supabase
        .from('citizen_address_with_details')
        .select('*')
        .in('person_id', personIds)
        .order('created_at', { ascending: false });

      if (addressError) throw addressError;

      // Combine the data
      const results: CitizenSearchResult[] = personResults.map(person => {
        const profile = profiles?.find(p => p.user_id === person.auth_user_id) || null;
        const personAddresses = addresses?.filter(a => a.person_id === person.id) || [];

        return {
          person,
          profile,
          addresses: personAddresses
        };
      });

      setSearchResults(results);

    } catch (error) {
      console.error('Error searching citizens:', error);
      toast({
        title: t('common:status.error'),
        description: t('common:messages.loadingError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'SELF_DECLARED':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SELF_DECLARED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const formatAddress = (address: any) => {
    const parts = [
      address.building,
      address.street,
      address.city,
      address.region,
      address.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : t('address:addressDetailsNotAvailable');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('address:searchCitizenAddresses')}
          </CardTitle>
          <CardDescription>
            {t('address:searchCitizenDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={t('address:searchCitizenPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? t('address:searchingCitizens') : t('common:buttons.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : searchResults.length === 0 ? (
            <Alert>
              <Search className="h-4 w-4" />
              <AlertDescription>
                {t('address:noMatchingCitizens', { query: searchQuery })}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  {t('address:searchResultsCount', { 
                    count: searchResults.length,
                    plural: searchResults.length !== 1 ? t('address:citizensPlural') : t('address:citizensSingular')
                  })}
                </h3>
              </div>

              {searchResults.map((result, index) => (
                <Card key={result.person.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {result.profile?.full_name || t('address:nameNotAvailable')}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {result.person.national_id && (
                            <span>{t('address:citizenId', { id: result.person.national_id })}</span>
                          )}
                          {result.profile?.email && (
                            <span>{t('address:citizenEmail', { email: result.profile.email })}</span>
                          )}
                          {result.profile?.phone && (
                            <span>{t('address:citizenPhone', { phone: result.profile.phone })}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {t('address:addressCountLabel', { 
                          count: result.addresses.length,
                          plural: result.addresses.length !== 1 ? t('address:addressesPlural') : t('address:addressesSingular')
                        })}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {result.addresses.length === 0 ? (
                      <Alert>
                        <MapPin className="h-4 w-4" />
                        <AlertDescription>
                          {t('address:noAddressesForCitizen')}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {t('address:registeredAddresses')}
                        </h4>
                        
                        {result.addresses.map((address, addrIndex) => (
                          <div key={address.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant={address.address_kind === 'PRIMARY' ? 'default' : 'secondary'}>
                                    {t(`address:${address.address_kind === 'PRIMARY' ? 'primaryAddress' : 'secondaryAddress'}`)}
                                  </Badge>
                                  <Badge variant="outline">
                                    {t(`address:scope_${address.scope?.toLowerCase() || 'unknown'}`)}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={getStatusColor(address.status)}
                                  >
                                    {getStatusIcon(address.status)}
                                    <span className="ml-1">{t(`address:${address.status.toLowerCase()}Status`)}</span>
                                  </Badge>
                                  {address.nar_verified && (
                                    <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                                      {t('address:narVerifiedBadge')}
                                    </Badge>
                                  )}
                                  {address.nar_public && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                      {t('address:publicBadge')}
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <p className="font-mono text-sm text-primary">
                                    {t('address:uac')}: {address.uac}
                                    {address.unit_uac && ` | ${t('address:unitLabel')}: ${address.unit_uac}`}
                                  </p>
                                  <p className="text-sm">
                                    {formatAddress(address)}
                                  </p>
                                  {address.latitude && address.longitude && (
                                    <p className="text-xs text-muted-foreground">
                                      {t('address:coordinates')}: {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {t('address:addedOn', { date: new Date(address.created_at).toLocaleDateString() })}
                                  </span>
                                  <span>
                                    {t('address:validFromDate', { date: new Date(address.effective_from).toLocaleDateString() })}
                                  </span>
                                  {address.effective_to && (
                                    <span>
                                      {t('address:validUntilDate', { date: new Date(address.effective_to).toLocaleDateString() })}
                                    </span>
                                  )}
                                  {address.source && (
                                    <span>{t('address:sourceLabel', { source: address.source })}</span>
                                  )}
                                </div>

                                {address.notes && (
                                  <div className="text-xs bg-muted p-2 rounded">
                                    <span className="font-medium">{t('address:addressNotes')}</span> {address.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {index < searchResults.length - 1 && <Separator className="mt-4" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};