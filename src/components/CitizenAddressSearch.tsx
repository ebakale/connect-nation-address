import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, User, MapPin, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface SearchResult {
  person_id: string;
  full_name: string;
  email?: string;
  is_protected: boolean;
  addresses: Array<{
    uac: string;
    unit_uac?: string;
    street?: string;
    city?: string;
    region?: string;
    country?: string;
    building?: string;
    privacy_level: string;
    status: string;
  }>;
  address_count: number;
}

const getStatusKey = (status: string | null | undefined) => {
  if (!status) return 'unknown';
  const normalized = status.toLowerCase();
  const lastSegment = normalized.split('.').pop() || normalized;
  return lastSegment;
};

export const CitizenAddressSearch = () => {
  const { toast } = useToast();
  const { t } = useTranslation(['address', 'common']);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPurpose, setSearchPurpose] = useState<string>('');
  const [purposeDetails, setPurposeDetails] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      toast({
        title: t('common:status.error'),
        description: t('address:searchCitizenPlaceholder'),
        variant: "destructive"
      });
      return;
    }

    if (!searchPurpose) {
      toast({
        title: t('common:status.error'),
        description: t('address:labels.searchPurpose'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setHasSearched(false);

    try {
      const { data, error } = await supabase.functions.invoke('search-citizen-addresses', {
        body: {
          query: searchQuery,
          purpose: searchPurpose,
          purposeDetails: purposeDetails || undefined,
          limit: 20,
        },
      });

      if (error) throw error;

      setSearchResults(data.results || []);
      setHasSearched(true);

      if (data.results?.length === 0) {
        toast({
          title: t('common:search.noResults'),
          description: t('common:search.noResultsDescription'),
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: t('common:status.error'),
        description: error.message || t('common:search.searchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle>{t('address:searchCitizenAddresses')}</CardTitle>
          </div>
          <CardDescription>
            {t('address:searchCitizenDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertTitle>{t('common:security.privacy')}</AlertTitle>
            <AlertDescription>
              {t('common:security.searchLogged')}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">{t('address:labels.searchByName')}</Label>
              <Input
                id="search"
                placeholder={t('address:searchCitizenPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">{t('address:labels.searchPurpose')} *</Label>
              <Select value={searchPurpose} onValueChange={setSearchPurpose} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder={t('address:placeholders.selectPurpose')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DELIVERY">{t('common:searchPurpose.delivery')}</SelectItem>
                  <SelectItem value="EMERGENCY_CONTACT">{t('common:searchPurpose.emergency')}</SelectItem>
                  <SelectItem value="GOVERNMENT_SERVICE">{t('common:searchPurpose.government')}</SelectItem>
                  <SelectItem value="BUSINESS_CONTACT">{t('common:searchPurpose.business')}</SelectItem>
                  <SelectItem value="PERSONAL">{t('common:searchPurpose.personal')}</SelectItem>
                  <SelectItem value="OTHER">{t('common:searchPurpose.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">{t('address:labels.additionalDetails')}</Label>
              <Textarea
                id="details"
                placeholder={t('address:placeholders.provideContext')}
                value={purposeDetails}
                onChange={(e) => setPurposeDetails(e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t('address:searchingCitizens') : t('common:buttons.search')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>{t('common:search.results')} ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t('common:search.noResults')}</p>
                <p className="text-sm mt-2">
                  {t('common:search.optInRequired')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{result.full_name}</h3>
                        {result.email && (
                          <p className="text-sm text-muted-foreground">{result.email}</p>
                        )}
                      </div>
                      {result.is_protected && (
                        <Badge variant="destructive">
                          <Shield className="h-3 w-3 mr-1" />
                          {t('common:security.protected')}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {result.addresses.map((address, addrIdx) => (
                        <div key={addrIdx} className="bg-muted/50 rounded p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="font-mono">
                              {address.uac}
                            </Badge>
                            <Badge 
                              variant={address.privacy_level === 'PUBLIC' ? 'default' : 'secondary'}
                            >
                              {address.privacy_level}
                            </Badge>
                          </div>

                          {address.street && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="text-sm">
                                {address.building && <div className="font-medium">{address.building}</div>}
                                <div>{address.street}</div>
                                <div className="text-muted-foreground">
                                  {address.city}, {address.region}
                                </div>
                                <div className="text-muted-foreground">{address.country}</div>
                              </div>
                            </div>
                          )}

                          {!address.street && address.city && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="text-sm text-muted-foreground">
                                <div>{address.city}, {address.region}</div>
                                <div>{address.country}</div>
                                <div className="text-xs italic mt-1">
                                  {t('common:privacy.regionOnly')}
                                </div>
                              </div>
                            </div>
                          )}

                          <Badge variant="outline" className="text-xs">
                            {t('common:status.status')}: {t(`common:status.${getStatusKey(address.status)}`, getStatusKey(address.status))}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};