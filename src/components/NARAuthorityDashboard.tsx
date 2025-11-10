import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  MapPin, 
  Plus, 
  CheckCircle, 
  FileCheck, 
  AlertCircle, 
  AlertTriangle,
  Globe, 
  Home,
  Clock,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { AddressCaptureForm } from "./AddressCaptureForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AddressRequestApprovalPanel } from "./AddressRequestApprovalPanel";
import { AddressPublishingQueue } from "./AddressPublishingQueue";
import { AddressUnpublishingQueue } from "./AddressUnpublishingQueue";
import { QualityIssuesFixer } from "./QualityIssuesFixer";
import { RejectedAddressesPanel } from "./RejectedAddressesPanel";
import { QualityDashboard } from "./QualityDashboard";
import { AnalyticsReports } from "./AnalyticsReports";
import { ProvinceManagement } from "./ProvinceManagement";

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

interface PendingRequest {
  id: string;
  street: string;
  city: string;
  region: string;
  created_at: string;
}

interface NARStats {
  total: number;
  verified: number;
  public: number;
  pending: number;
  flagged: number;
  readyToPublish: number;
}

export const NARAuthorityDashboard = () => {
  const { narAuthorityData, roleMetadata } = useUserRole();
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  const [addresses, setAddresses] = useState<NARAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NARStats>({
    total: 0,
    verified: 0,
    public: 0,
    pending: 0,
    flagged: 0,
    readyToPublish: 0
  });
  const [recentRequests, setRecentRequests] = useState<PendingRequest[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchAddresses();
    fetchRecentRequests();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Determine geographic scope
      const geographicScope = roleMetadata.find(m => m.scope_type === 'city' || m.scope_type === 'region' || m.scope_type === 'province');
      
      // Build pending requests query with geographic filtering
      let pendingQuery = supabase
        .from('address_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (geographicScope) {
        if (geographicScope.scope_type === 'city') {
          pendingQuery = pendingQuery.ilike('city', `%${geographicScope.scope_value}%`);
        } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
          pendingQuery = pendingQuery.ilike('region', `%${geographicScope.scope_value}%`);
        }
      }
      
      // Fetch all NAR addresses with scope filtering
      const [
        addressesResult,
        verifiedResult,
        publicResult,
        pendingResult,
        flaggedResult,
        readyToPublishResult
      ] = await Promise.all([
        supabase.from('addresses').select('id', { count: 'exact', head: true }),
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('verified', true),
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('public', true).eq('verified', true),
        pendingQuery,
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('flagged', true),
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('verified', true).eq('public', false)
      ]);

      let total = addressesResult.count || 0;
      let verified = verifiedResult.count || 0;
      let publicCount = publicResult.count || 0;
      const pending = pendingResult.count || 0;
      const flagged = flaggedResult.count || 0;
      let readyToPublish = readyToPublishResult.count || 0;

      // Override with service-side counts when available
      try {
        const { data: unified, error: unifiedError } = await supabase.functions.invoke('unified-address-statistics');
        if (!unifiedError && unified) {
          if (typeof unified.totalNARAddresses === 'number') total = unified.totalNARAddresses;
          if (typeof unified.publishedAddresses === 'number') publicCount = unified.publishedAddresses;
        }
      } catch (e) {
        console.warn('Falling back to client-side counts:', e);
      }

      // Fetch addresses created by this authority for the list
      const { data: authorityAddresses, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('created_by_authority', user.id)
        .eq('authority_type', 'nar_authority')
        .order('created_at', { ascending: false })
        .limit(10);

      if (addressError) throw addressError;

      setAddresses(authorityAddresses || []);
      setStats({ total, verified, public: publicCount, pending, flagged, readyToPublish });
    } catch (error) {
      console.error('Error fetching NAR addresses:', error);
      toast.error(t('dashboard:errorFetchingAddresses'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      // Apply geographic scope filtering
      const geographicScope = roleMetadata.find(m => m.scope_type === 'city' || m.scope_type === 'region' || m.scope_type === 'province');
      
      let query = supabase
        .from('address_requests')
        .select('id, street, city, region, created_at')
        .eq('status', 'pending');
      
      if (geographicScope) {
        if (geographicScope.scope_type === 'city') {
          query = query.ilike('city', `%${geographicScope.scope_value}%`);
        } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
          query = query.ilike('region', `%${geographicScope.scope_value}%`);
        }
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentRequests(data || []);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    }
  };

  const handleAddressCreated = async () => {
    setShowCreateDialog(false);
    await fetchAddresses();
    toast.success(t('dashboard:addressCreatedSuccessfully'));
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

  if (loading) {
    return <div className="p-4">{t('common:loading')}...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Authority Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t('dashboard:narAuthorityProfile')}
              </CardTitle>
              <CardDescription>{t('dashboard:yourJurisdictionAndPermissions')}</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">{t('dashboard:narAuthority')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('dashboard:authorityLevel')}</p>
              <Badge variant="default" className="flex items-center gap-1 w-fit">
                <Globe className="h-3 w-3" />
                {t('dashboard:nationalLevel')}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('dashboard:jurisdiction')}</p>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t('dashboard:nationalWide')}</span>
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

      {/* Main Tabs with All Registrar Functionality */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard:overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard:approval')}</span>
            {stats.pending > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="publishing" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard:publishing')}</span>
            {stats.readyToPublish > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {stats.readyToPublish}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard:quality')}</span>
            {stats.flagged > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {stats.flagged}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard:analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="provinces" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard:provinces')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard:totalAddresses')}</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('dashboard:verifiedAddressesInRegistry')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard:published')}</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.public.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('dashboard:publiclyAccessible')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard:pendingApprovals')}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('dashboard:awaitingReview')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard:publicationRate')}</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.public / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">{t('dashboard:addressesPublished')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('dashboard:recentAddressRequests')}
                </CardTitle>
                <CardDescription>{t('dashboard:latestSubmissions')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRequests.length > 0 ? (
                    recentRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {request.street}, {request.city}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.region} • {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{t('dashboard:pending')}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('dashboard:noPendingRequests')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Created Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  {t('dashboard:myCreatedAddresses')}
                </CardTitle>
                <CardDescription>{t('dashboard:addressesCreatedByYourAuthority')}</CardDescription>
              </CardHeader>
              <CardContent>
                {narAuthorityData.can_create_addresses && (
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full mb-4">
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
                      />
                    </DialogContent>
                  </Dialog>
                )}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {addresses.length > 0 ? (
                    addresses.slice(0, 5).map((address) => (
                      <div key={address.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {address.uac}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {address.street}, {address.city}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {address.verified && (
                            <Badge variant="secondary" className="text-xs">
                              {t('dashboard:verified')}
                            </Badge>
                          )}
                          {address.public && (
                            <Badge variant="outline" className="text-xs">
                              {t('dashboard:published')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('dashboard:noAddressesCreatedYet')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approval" className="space-y-6">
          <AddressRequestApprovalPanel />
        </TabsContent>

        <TabsContent value="publishing" className="space-y-6">
          <Tabs defaultValue="publish-queue" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="publish-queue">{t('dashboard:publishingQueue')}</TabsTrigger>
              <TabsTrigger value="published-addresses">{t('dashboard:publishedAddresses')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="publish-queue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:addressPublishingQueue')}</CardTitle>
                  <CardDescription>{t('dashboard:publishVerifiedAddresses')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddressPublishingQueue />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="published-addresses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:managePublishedAddresses')}</CardTitle>
                  <CardDescription>{t('dashboard:removeFromPublicRegistry')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddressUnpublishingQueue />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Tabs defaultValue="flagged-addresses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flagged-addresses">{t('dashboard:flaggedAddresses')}</TabsTrigger>
              <TabsTrigger value="rejected-requests">{t('dashboard:rejectedRequests')}</TabsTrigger>
              <TabsTrigger value="quality-metrics">{t('dashboard:qualityMetrics')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="flagged-addresses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:addressQualityManagement')}</CardTitle>
                  <CardDescription>{t('dashboard:reviewFlaggedAddresses')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <QualityIssuesFixer onClose={() => {}} onIssuesFixed={() => fetchAddresses()} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rejected-requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:rejectedAddressRequests')}</CardTitle>
                  <CardDescription>{t('dashboard:manageRejectedRequests')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RejectedAddressesPanel onUpdate={() => fetchAddresses()} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="quality-metrics" className="space-y-4">
              <QualityDashboard />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsReports />
        </TabsContent>

        <TabsContent value="provinces" className="space-y-6">
          <ProvinceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
