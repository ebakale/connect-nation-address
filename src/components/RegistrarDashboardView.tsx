import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Globe, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  TrendingUp
} from "lucide-react";

// Import the components we need
import { AddressRequestApprovalPanel } from "./AddressRequestApprovalPanel";
import { AddressPublishingQueue } from "./AddressPublishingQueue";
import { AddressUnpublishingQueue } from "./AddressUnpublishingQueue";
import { QualityIssuesFixer } from "./QualityIssuesFixer";
import { RejectedAddressesPanel } from "./RejectedAddressesPanel";
import { QualityDashboard } from "./QualityDashboard";
import { AnalyticsReports } from "./AnalyticsReports";
import { ProvinceManagement } from "./ProvinceManagement";

interface RegistrarStats {
  totalAddresses: number;
  verifiedAddresses: number;
  publishedAddresses: number;
  pendingApprovals: number;
  flaggedAddresses: number;
  readyToPublish: number;
}

interface PendingRequest {
  id: string;
  street: string;
  city: string;
  region: string;
  created_at: string;
}

export const RegistrarDashboardView = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RegistrarStats>({
    totalAddresses: 0,
    verifiedAddresses: 0,
    publishedAddresses: 0,
    pendingApprovals: 0,
    flaggedAddresses: 0,
    readyToPublish: 0
  });
  const [recentRequests, setRecentRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    fetchRegistrarStats();
    fetchRecentRequests();
  }, []);

  const fetchRegistrarStats = async () => {
    try {
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
        supabase.from('address_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('flagged', true),
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('verified', true).eq('public', false)
      ]);

      let totalAddresses = addressesResult.count || 0;
      let verifiedAddresses = verifiedResult.count || 0;
      let publishedAddresses = publicResult.count || 0;
      const pendingApprovals = pendingResult.count || 0;
      const flaggedAddresses = flaggedResult.count || 0;
      let readyToPublish = readyToPublishResult.count || 0;

      // Override with service-side counts (bypass RLS) when available
      try {
        const { data: unified, error: unifiedError } = await supabase.functions.invoke('unified-address-statistics');
        if (!unifiedError && unified) {
          if (typeof unified.totalNARAddresses === 'number') totalAddresses = unified.totalNARAddresses;
          if (typeof unified.publishedAddresses === 'number') publishedAddresses = unified.publishedAddresses;
        }
      } catch (e) {
        console.warn('Falling back to client-side counts:', e);
      }

      setStats({
        totalAddresses,
        verifiedAddresses,
        publishedAddresses,
        pendingApprovals,
        flaggedAddresses,
        readyToPublish
      });
    } catch (error) {
      console.error('Error fetching registrar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('address_requests')
        .select('id, street, city, region, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentRequests(data || []);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    }
  };

  if (loading) {
    return <div className="p-4">{t('common:loading')}...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard:registrarDashboard')}</h2>
          <p className="text-muted-foreground">{t('dashboard:manageAddressRegistration')}</p>
        </div>
        <Badge variant="outline" className="text-sm">{t('dashboard:registrar')}</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard:overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('dashboard:approval')}</span>
            {stats.pendingApprovals > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {stats.pendingApprovals}
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
            {stats.flaggedAddresses > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {stats.flaggedAddresses}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
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
                <CardTitle className="text-sm font-medium">{t('dashboard:verifiedAddresses')}</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAddresses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('dashboard:verifiedAddressesInRegistry')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard:publishedAddresses')}</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.publishedAddresses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('dashboard:publiclyAccessible')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard:pendingApprovals')}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApprovals.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{t('dashboard:awaitingReview')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard:verificationRate')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalAddresses > 0 ? Math.round((stats.verifiedAddresses / stats.totalAddresses) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">{t('dashboard:addressesVerified')}</p>
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

            {/* Publication Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('dashboard:publicationSummary')}
                </CardTitle>
                <CardDescription>{t('dashboard:publicationMetrics')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('dashboard:readyToPublish')}</span>
                    <span className="text-sm font-medium">{stats.readyToPublish}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('dashboard:totalPublished')}</span>
                    <span className="text-sm font-medium">{stats.publishedAddresses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('dashboard:flaggedIssues')}</span>
                    <span className="text-sm font-medium text-destructive">{stats.flaggedAddresses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('dashboard:publicationRate')}</span>
                    <span className="text-sm font-medium">
                      {stats.verifiedAddresses > 0 ? Math.round((stats.publishedAddresses / stats.verifiedAddresses) * 100) : 0}%
                    </span>
                  </div>
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
                  <QualityIssuesFixer onClose={() => {}} onIssuesFixed={() => {}} />
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
                  <RejectedAddressesPanel onUpdate={() => {}} />
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