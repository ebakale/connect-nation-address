import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, MapPin, Plus, CheckCircle, FileCheck, AlertCircle, Building2, Map } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { AddressCaptureForm } from "./AddressCaptureForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface NARAddress {
  id: string;
  uac: string;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  verified: boolean;
  public: boolean;
  created_at: string;
}

export const NARAuthorityDashboard = () => {
  const { narAuthorityData } = useUserRole();
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  const [addresses, setAddresses] = useState<NARAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    public: 0,
    pending: 0
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('created_by_authority', user.id)
        .eq('authority_type', 'nar_authority')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const verified = data?.filter(a => a.verified).length || 0;
      const publicCount = data?.filter(a => a.public).length || 0;
      const pending = total - verified;
      
      setStats({ total, verified, public: publicCount, pending });
    } catch (error) {
      console.error('Error fetching NAR addresses:', error);
      toast.error(t('dashboard:errorFetchingAddresses'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddressCreated = async () => {
    setShowCreateDialog(false);
    await fetchAddresses();
    toast.success(t('dashboard:addressCreatedSuccessfully'));
  };

  const getAuthorityLevelBadge = (level: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline", label: string }> = {
      national: { variant: "default", label: t('dashboard:nationalLevel') },
      regional: { variant: "secondary", label: t('dashboard:regionalLevel') },
      municipal: { variant: "outline", label: t('dashboard:municipalLevel') },
      local: { variant: "outline", label: t('dashboard:localLevel') }
    };
    
    const config = variants[level] || variants.local;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!narAuthorityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t('dashboard:narAuthorityNotFound')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('dashboard:narAuthorityDataNotAvailable')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authority Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('dashboard:narAuthorityProfile')}
          </CardTitle>
          <CardDescription>{t('dashboard:yourJurisdictionAndPermissions')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('dashboard:authorityLevel')}</p>
              {getAuthorityLevelBadge(narAuthorityData.authority_level)}
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('dashboard:jurisdiction')}</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {narAuthorityData.jurisdiction_city ? 
                    `${narAuthorityData.jurisdiction_city}, ${narAuthorityData.jurisdiction_region || ''}` :
                    narAuthorityData.jurisdiction_region || t('dashboard:nationalWide')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">{t('dashboard:permissions')}</p>
            <div className="flex flex-wrap gap-2">
              {narAuthorityData.can_create_addresses && (
                <Badge variant="secondary" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {t('dashboard:createAddresses')}
                </Badge>
              )}
              {narAuthorityData.can_verify_addresses && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {t('dashboard:verifyAddresses')}
                </Badge>
              )}
              {narAuthorityData.can_update_addresses && (
                <Badge variant="secondary" className="gap-1">
                  <FileCheck className="h-3 w-3" />
                  {t('dashboard:updateAddresses')}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard:totalAddresses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard:verified')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard:published')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.public}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard:pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Address Button */}
      {narAuthorityData.can_create_addresses && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard:createNewAddress')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('dashboard:createNARAddress')}</DialogTitle>
            </DialogHeader>
            <AddressCaptureForm 
              onSuccess={handleAddressCreated}
              defaultRegion={narAuthorityData.jurisdiction_region || undefined}
              defaultCity={narAuthorityData.jurisdiction_city || undefined}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Addresses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('dashboard:myCreatedAddresses')}
          </CardTitle>
          <CardDescription>
            {t('dashboard:addressesCreatedByYourAuthority')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t('common:buttons.loading')}</p>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t('dashboard:noAddressesCreatedYet')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{address.uac}</code>
                        {address.verified && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {t('dashboard:verified')}
                          </Badge>
                        )}
                        {address.public && (
                          <Badge variant="outline">{t('dashboard:published')}</Badge>
                        )}
                      </div>
                      <p className="font-medium">{address.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.building && `${address.building}, `}
                        {address.city}, {address.region}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('dashboard:createdOn')}: {new Date(address.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
