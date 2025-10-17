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
        description: "Search query must be at least 2 characters",
        variant: "destructive"
      });
      return;
    }

    if (!searchPurpose) {
      toast({
        title: t('common:status.error'),
        description: "Please select a search purpose",
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
          title: "No results found",
          description: "No searchable addresses match your query",
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: t('common:status.error'),
        description: error.message || "Failed to search addresses",
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
            <AlertTitle>Privacy & Security</AlertTitle>
            <AlertDescription>
              All searches are logged for security. Only public or region-visible addresses will appear. 
              Protected individuals (minors, etc.) are excluded from search results.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Name</Label>
              <Input
                id="search"
                placeholder={t('address:searchCitizenPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Search Purpose *</Label>
              <Select value={searchPurpose} onValueChange={setSearchPurpose} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DELIVERY">Package/Mail Delivery</SelectItem>
                  <SelectItem value="EMERGENCY_CONTACT">Emergency Contact</SelectItem>
                  <SelectItem value="GOVERNMENT_SERVICE">Government Service</SelectItem>
                  <SelectItem value="BUSINESS_CONTACT">Business Contact</SelectItem>
                  <SelectItem value="PERSONAL">Personal/Social</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional Details (Optional)</Label>
              <Textarea
                id="details"
                placeholder="Provide additional context for this search..."
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
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No searchable addresses found for "{searchQuery}"</p>
                <p className="text-sm mt-2">
                  Citizens must opt-in to make their addresses searchable
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
                          Protected
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
                                  Full address hidden (Region-only privacy)
                                </div>
                              </div>
                            </div>
                          )}

                          <Badge variant="outline" className="text-xs">
                            Status: {address.status}
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