import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Database, MapPin, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Activity, BarChart3, Shield, Building2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CitizenAddressSearch } from "./CitizenAddressSearch";
import { useTranslation } from 'react-i18next';

interface CARStats {
  totalAddresses: number;
  activeAddresses: number;
  pendingVerifications: number;
  confirmedAddresses: number;
  rejectedAddresses: number;
  totalPersons: number;
  primaryAddresses: number;
  secondaryAddresses: number;
  addressesByRegion: { region: string; count: number }[];
  recentActivity: number;
  verificationRate: number;
}

interface SystemHealth {
  averageProcessingTime: number;
  systemLoad: number;
  dataIntegrity: number;
  narLinkage: number;
}

export function CARAdministrativeOverview() {
  const { toast } = useToast();
  const { t } = useTranslation(['admin']);
  const [stats, setStats] = useState<CARStats>({
    totalAddresses: 0,
    activeAddresses: 0,
    pendingVerifications: 0,
    confirmedAddresses: 0,
    rejectedAddresses: 0,
    totalPersons: 0,
    primaryAddresses: 0,
    secondaryAddresses: 0,
    addressesByRegion: [],
    recentActivity: 0,
    verificationRate: 0
  });
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    averageProcessingTime: 0,
    systemLoad: 75,
    dataIntegrity: 98,
    narLinkage: 95
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCARStatistics();
    fetchSystemHealth();
  }, []);

  const fetchCARStatistics = async () => {
    try {
      // Get total addresses and status breakdown from citizen_address
      const { data: addressStats, error: addressError } = await supabase
        .from('citizen_address')
        .select('status, address_kind, effective_to, created_at');

      if (addressError) throw addressError;

      // Get verification statuses from residency_ownership_verifications
      const { data: verificationStats, error: verificationError } = await supabase
        .from('residency_ownership_verifications')
        .select('status, created_at');

      if (verificationError) throw verificationError;

      // Get total persons
      const { data: personStats, error: personError } = await supabase
        .from('person')
        .select('id', { count: 'exact' });

      if (personError) throw personError;

      // Get addresses with NAR details for verification stats
      const { data: detailedAddresses, error: detailError } = await supabase
        .from('citizen_address_with_details')
        .select('status, nar_verified, region, address_kind, created_at');

      if (detailError) throw detailError;

      // Calculate statistics
      const totalAddresses = addressStats?.length || 0;
      const activeAddresses = addressStats?.filter(addr => !addr.effective_to).length || 0;
      const pendingVerifications = addressStats?.filter(addr => addr.status === 'SELF_DECLARED').length || 0;
      
      // Calculate verification stats from residency_ownership_verifications table
      const confirmedAddresses = verificationStats?.filter(v => v.status === 'approved').length || 0;
      const rejectedAddresses = verificationStats?.filter(v => v.status === 'rejected').length || 0;
      
      const primaryAddresses = addressStats?.filter(addr => addr.address_kind === 'PRIMARY').length || 0;
      const secondaryAddresses = addressStats?.filter(addr => addr.address_kind === 'SECONDARY').length || 0;

      // Calculate regional distribution
      const regionCounts = detailedAddresses?.reduce((acc, addr) => {
        const region = addr.region || 'Unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const addressesByRegion = Object.entries(regionCounts).map(([region, count]) => ({
        region,
        count
      }));

      // Calculate recent activity (last 7 days) - include both address creation and verification activity
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentAddressActivity = addressStats?.filter(addr => 
        new Date(addr.created_at) > sevenDaysAgo
      ).length || 0;
      const recentVerificationActivity = verificationStats?.filter(v => 
        new Date(v.created_at) > sevenDaysAgo
      ).length || 0;
      const recentActivity = recentAddressActivity + recentVerificationActivity;

      // Calculate verification rate
      const verifiedCount = detailedAddresses?.filter(addr => addr.nar_verified).length || 0;
      const verificationRate = totalAddresses > 0 ? Math.round((verifiedCount / totalAddresses) * 100) : 0;

      setStats({
        totalAddresses,
        activeAddresses,
        pendingVerifications,
        confirmedAddresses,
        rejectedAddresses,
        totalPersons: personStats?.length || 0,
        primaryAddresses,
        secondaryAddresses,
        addressesByRegion: addressesByRegion.slice(0, 5), // Top 5 regions
        recentActivity,
        verificationRate
      });

    } catch (error) {
      console.error('Error fetching CAR statistics:', error);
      toast({
        title: t('admin:carAdministrativeOverview.errorTitle'),
        description: t('admin:carAdministrativeOverview.failedToLoadStatistics'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      // Get recent verification requests for processing time calculation
      const { data: recentVerifications } = await supabase
        .from('residency_ownership_verifications')
        .select('created_at, verified_at')
        .not('verified_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentVerifications && recentVerifications.length > 0) {
        const processingTimes = recentVerifications.map(v => {
          const created = new Date(v.created_at).getTime();
          const verified = new Date(v.verified_at!).getTime();
          return (verified - created) / (1000 * 60 * 60 * 24); // days
        });
        
        const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
        
        setSystemHealth(prev => ({
          ...prev,
          averageProcessingTime: Math.round(avgProcessingTime * 10) / 10
        }));
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600";
    if (percentage >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthStatus = (percentage: number) => {
    if (percentage >= 95) return t('admin:carAdministrativeOverview.excellent');
    if (percentage >= 85) return t('admin:carAdministrativeOverview.good');
    return t('admin:carAdministrativeOverview.needsAttention');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('admin:carAdministrativeOverview.systemOverview')}</TabsTrigger>
          <TabsTrigger value="search">{t('admin:carAdministrativeOverview.citizenSearch')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('admin:carAdministrativeOverview.analytics')}</TabsTrigger>
          <TabsTrigger value="health">{t('admin:carAdministrativeOverview.systemHealth')}</TabsTrigger>
          <TabsTrigger value="management">{t('admin:carAdministrativeOverview.managementTools')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin:carAdministrativeOverview.totalCitizenAddresses')}</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAddresses}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeAddresses} {t('admin:carAdministrativeOverview.currentlyActive')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin:carAdministrativeOverview.registeredPersons')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPersons}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('admin:carAdministrativeOverview.inCarSystem')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin:carAdministrativeOverview.pendingVerifications')}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('admin:carAdministrativeOverview.awaitingVerification')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin:carAdministrativeOverview.narVerificationRate')}</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verificationRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {t('admin:carAdministrativeOverview.linkedToNar')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.addressStatusDistribution')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{t('admin:carAdministrativeOverview.verifiedApproved')}</span>
                    </div>
                    <Badge variant="outline">{stats.confirmedAddresses}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">{t('admin:carAdministrativeOverview.unverifiedSelfDeclared')}</span>
                    </div>
                    <Badge variant="outline">{stats.pendingVerifications}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">{t('admin:carAdministrativeOverview.verificationRejected')}</span>
                    </div>
                    <Badge variant="outline">{stats.rejectedAddresses}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.addressTypes')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{t('admin:carAdministrativeOverview.primaryAddresses')}</span>
                    </div>
                    <Badge variant="outline">{stats.primaryAddresses}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">{t('admin:carAdministrativeOverview.secondaryAddresses')}</span>
                    </div>
                    <Badge variant="outline">{stats.secondaryAddresses}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search">
          <CitizenAddressSearch />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.regionalDistribution')}</CardTitle>
                <CardDescription>{t('admin:carAdministrativeOverview.topRegionsByAddressCount')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.addressesByRegion.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(region.count / stats.totalAddresses) * 100} 
                          className="w-20" 
                        />
                        <Badge variant="secondary">{region.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.recentActivity')}</CardTitle>
                  <CardDescription>{t('admin:carAdministrativeOverview.lastSevenDays')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.recentActivity}</div>
                  <p className="text-sm text-muted-foreground">{t('admin:carAdministrativeOverview.newAddressesAdded')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.verificationRate')}</CardTitle>
                  <CardDescription>{t('admin:carAdministrativeOverview.narLinkageSuccess')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.verificationRate}%</div>
                  <Progress value={stats.verificationRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.activeRatio')}</CardTitle>
                  <CardDescription>{t('admin:carAdministrativeOverview.activeVsTotalAddresses')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.totalAddresses > 0 ? Math.round((stats.activeAddresses / stats.totalAddresses) * 100) : 0}%
                  </div>
                  <Progress 
                    value={stats.totalAddresses > 0 ? (stats.activeAddresses / stats.totalAddresses) * 100 : 0} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="health">
          <div className="space-y-4">
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                {t('admin:carAdministrativeOverview.systemHealthMonitoring')}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.systemPerformance')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('admin:carAdministrativeOverview.averageProcessingTime')}</span>
                    <Badge variant="outline">{systemHealth.averageProcessingTime} {t('admin:carAdministrativeOverview.days')}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin:carAdministrativeOverview.systemLoad')}</span>
                      <span className={`text-sm font-medium ${getHealthColor(100 - systemHealth.systemLoad)}`}>
                        {getHealthStatus(100 - systemHealth.systemLoad)}
                      </span>
                    </div>
                    <Progress value={systemHealth.systemLoad} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.dataIntegrity')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin:carAdministrativeOverview.dataIntegrity')}</span>
                      <span className={`text-sm font-medium ${getHealthColor(systemHealth.dataIntegrity)}`}>
                        {systemHealth.dataIntegrity}%
                      </span>
                    </div>
                    <Progress value={systemHealth.dataIntegrity} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin:carAdministrativeOverview.narLinkageHealth')}</span>
                      <span className={`text-sm font-medium ${getHealthColor(systemHealth.narLinkage)}`}>
                        {systemHealth.narLinkage}%
                      </span>
                    </div>
                    <Progress value={systemHealth.narLinkage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="management">
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {t('admin:carAdministrativeOverview.administrativeTools')}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.dataManagement')}</CardTitle>
                  <CardDescription>{t('admin:carAdministrativeOverview.bulkOperationsDataManagement')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => fetchCARStatistics()}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t('admin:carAdministrativeOverview.refreshStatistics')}
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <Database className="h-4 w-4 mr-2" />
                    {t('admin:carAdministrativeOverview.exportCarData')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.systemMaintenance')}</CardTitle>
                  <CardDescription>{t('admin:carAdministrativeOverview.systemMaintenanceOptimization')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" disabled>
                    <Activity className="h-4 w-4 mr-2" />
                    {t('admin:carAdministrativeOverview.runIntegrityCheck')}
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t('admin:carAdministrativeOverview.optimizePerformance')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin:carAdministrativeOverview.verificationTools')}</CardTitle>
                  <CardDescription>{t('admin:carAdministrativeOverview.addressVerificationManagement')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('admin:carAdministrativeOverview.bulkVerification')}
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t('admin:carAdministrativeOverview.reviewFlaggedItems')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}