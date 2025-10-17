import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, MapPin, AlertTriangle, Loader2, Lock, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePerson } from '@/hooks/useCAR';
import { useTranslation } from 'react-i18next';

interface AddressPrivacy {
  id: string;
  uac: string;
  unit_uac?: string;
  address_kind: string;
  privacy_level: 'PRIVATE' | 'REGION_ONLY' | 'PUBLIC';
  searchable_by_public: boolean;
  status: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
}

export function AddressPrivacySettings() {
  const { t } = useTranslation(['common', 'address']);
  const { toast } = useToast();
  const { person } = usePerson();
  const [addresses, setAddresses] = useState<AddressPrivacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (person?.id) {
      fetchAddresses();
    }
  }, [person?.id]);

  const fetchAddresses = async () => {
    if (!person?.id) return;

    try {
      setLoading(true);
      
      // Fetch citizen addresses
      const { data: citizenAddresses, error: caError } = await supabase
        .from('citizen_address')
        .select('id, uac, unit_uac, address_kind, privacy_level, searchable_by_public, status')
        .eq('person_id', person.id)
        .is('effective_to', null)
        .order('address_kind', { ascending: false });

      if (caError) throw caError;

      if (!citizenAddresses || citizenAddresses.length === 0) {
        setAddresses([]);
        return;
      }

      // Fetch address details from NAR addresses table
      const uacs = citizenAddresses.map(ca => ca.uac);
      const { data: narAddresses } = await supabase
        .from('addresses')
        .select('uac, street, city, region, country')
        .in('uac', uacs);

      const formattedAddresses = citizenAddresses.map(addr => {
        const narAddr = narAddresses?.find(na => na.uac === addr.uac);
        return {
          id: addr.id,
          uac: addr.uac,
          unit_uac: addr.unit_uac,
          address_kind: addr.address_kind,
          privacy_level: addr.privacy_level || 'PRIVATE',
          searchable_by_public: addr.searchable_by_public || false,
          status: addr.status,
          street: narAddr?.street,
          city: narAddr?.city,
          region: narAddr?.region,
          country: narAddr?.country,
        };
      });

      setAddresses(formattedAddresses);
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      toast({
        title: t('common:error'),
        description: error.message || "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (
    addressId: string,
    privacyLevel: 'PRIVATE' | 'REGION_ONLY' | 'PUBLIC',
    searchable: boolean
  ) => {
    try {
      setUpdating(addressId);

      const { error } = await supabase
        .from('citizen_address')
        .update({
          privacy_level: privacyLevel,
          searchable_by_public: searchable,
          privacy_updated_at: new Date().toISOString(),
          privacy_updated_by: person?.auth_user_id,
        })
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: "Privacy settings updated successfully",
      });

      fetchAddresses();
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: t('common:error'),
        description: error.message || "Failed to update privacy settings",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case 'PUBLIC':
        return <Globe className="h-4 w-4" />;
      case 'REGION_ONLY':
        return <Eye className="h-4 w-4" />;
      case 'PRIVATE':
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getPrivacyDescription = (level: string) => {
    switch (level) {
      case 'PUBLIC':
        return 'Full address visible when searchable is enabled';
      case 'REGION_ONLY':
        return 'Only city and region visible when searchable is enabled';
      case 'PRIVATE':
      default:
        return 'Never visible in public searches (admins/verifiers only)';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Address Privacy Settings</CardTitle>
          </div>
          <CardDescription>
            Control who can find and view your addresses through the citizen search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Privacy Information</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>• PRIVATE: Your address will never appear in public searches (only visible to administrators and verifiers)</p>
              <p>• REGION ONLY: Only your city and region will be shown if you enable searchability</p>
              <p>• PUBLIC: Full address details will be shown if you enable searchability</p>
              <p className="font-semibold mt-2">All searches are logged with the searcher's identity and purpose for your safety.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No addresses found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={address.address_kind === 'PRIMARY' ? 'default' : 'secondary'}>
                        {address.address_kind}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {address.uac}
                      </Badge>
                    </div>
                    {address.street && (
                      <div className="text-sm text-muted-foreground">
                        <div>{address.street}</div>
                        <div>{address.city}, {address.region}, {address.country}</div>
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {getPrivacyIcon(address.privacy_level)}
                    {address.privacy_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`privacy-${address.id}`}>Privacy Level</Label>
                  <Select
                    value={address.privacy_level}
                    onValueChange={(value: 'PRIVATE' | 'REGION_ONLY' | 'PUBLIC') => {
                      updatePrivacySettings(address.id, value, address.searchable_by_public);
                    }}
                    disabled={updating === address.id}
                  >
                    <SelectTrigger id={`privacy-${address.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVATE">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Private - Never Searchable</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="REGION_ONLY">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>Region Only - City/Region Visible</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PUBLIC">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Public - Full Address Visible</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getPrivacyDescription(address.privacy_level)}
                  </p>
                </div>

                {address.privacy_level !== 'PRIVATE' && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor={`searchable-${address.id}`} className="text-base">
                        Allow Public Search
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {address.searchable_by_public 
                          ? 'This address can be found by other citizens'
                          : 'This address is hidden from public searches'
                        }
                      </p>
                    </div>
                    <Switch
                      id={`searchable-${address.id}`}
                      checked={address.searchable_by_public}
                      onCheckedChange={(checked) => {
                        updatePrivacySettings(address.id, address.privacy_level, checked);
                      }}
                      disabled={updating === address.id}
                    />
                  </div>
                )}

                {address.privacy_level === 'PRIVATE' && (
                  <Alert>
                    <EyeOff className="h-4 w-4" />
                    <AlertDescription>
                      This address is completely private and will never appear in public searches, 
                      regardless of the searchable setting.
                    </AlertDescription>
                  </Alert>
                )}

                {updating === address.id && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating privacy settings...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
