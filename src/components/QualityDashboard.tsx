import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  MapPin, CheckCircle, AlertTriangle, TrendingUp, Database,
  RefreshCw, Download, Eye, Clock, Settings, Users, BarChart3
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { QualityIssuesFixer } from './QualityIssuesFixer';

interface CoverageAnalytics {
  nationalSummary: {
    totalRegions: number;
    totalCities: number;
    totalAddresses: number;
    verifiedAddresses: number;
    publishedAddresses: number;
    averageCompleteness: number;
    overallCoverage: number;
  };
  regionalBreakdown: Array<{
    region: string;
    cities: number;
    addressesRegistered: number;
    addressesVerified: number;
    addressesPublished: number;
    verificationRate: number;
    publicationRate: number;
    coveragePercentage: number;
    averageCompleteness: number;
  }>;
  cityBreakdown: Array<{
    region: string;
    city: string;
    addressesRegistered: number;
    addressesVerified: number;
    addressesPublished: number;
    verificationRate: number;
    publicationRate: number;
    coveragePercentage: number;
    averageCompleteness: number;
    lastUpdated: string;
  }>;
  qualityMetrics: {
    averageCompleteness: number;
    lowQualityAddresses: number;
    duplicateCount: number;
    pendingVerification: number;
  };
  carMetrics?: {
    totalCitizenAddresses: number;
    pendingVerificationAddresses: number;
    confirmedAddresses: number;
    rejectedAddresses: number;
    duplicatePersonRecords: number;
    averageVerificationTimeHours: number;
  };
}

export function QualityDashboard() {
  const { t, i18n } = useTranslation('admin');
  
  // Debug logs to verify runtime translations
  const currentLang = i18n.resolvedLanguage || i18n.language;
  console.log('=== Quality Dashboard i18n Debug ===');
  console.log('Current language:', currentLang);
  console.log('Title translation:', t('quality.title'));
  console.log('Refresh button translation:', t('quality.refreshData'));
  console.log('Full quality block:', i18n.getResource(currentLang, 'admin', 'quality'));
  
  // Warning if non-English language shows English text
  if (currentLang !== 'en' && t('quality.title') === 'Quality Dashboard') {
    console.warn('⚠️ Non-English language active but English title detected. Check deployed bundle or cache.');
  }
  const { roleMetadata, loading: roleLoading } = useUserRole();
  const [analytics, setAnalytics] = useState<CoverageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQualityIssues, setShowQualityIssues] = useState(false);
  const [showQualityFixer, setShowQualityFixer] = useState(false);
  const [realTimeQualityMetrics, setRealTimeQualityMetrics] = useState({
    lowQualityAddresses: 0,
    duplicateCount: 0,
    pendingVerification: 0
  });
  const [carMetrics, setCARMetrics] = useState({
    totalCitizenAddresses: 0,
    pendingVerificationAddresses: 0,
    confirmedAddresses: 0,
    rejectedAddresses: 0,
    duplicatePersonRecords: 0,
    averageVerificationTimeHours: 0
  });
  const { toast } = useToast();

  // Get geographical scope from role metadata
  const geographicScope = roleMetadata.find(m => 
    m.scope_type === 'region' || m.scope_type === 'province' || m.scope_type === 'city' || m.scope_type === 'geographic'
  );

  const fetchQualityMetrics = async () => {
    try {
      // Build base query with geographical scope filter
      const buildQuery = (baseQuery: any) => {
        if (!geographicScope) return baseQuery;
        
        if (geographicScope.scope_type === 'city') {
          return baseQuery.ilike('city', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
          return baseQuery.ilike('region', geographicScope.scope_value);
        } else if (geographicScope.scope_type === 'geographic') {
          return baseQuery.or(`city.ilike.${geographicScope.scope_value},region.ilike.${geographicScope.scope_value}`);
        }
        return baseQuery;
      };

      // Fetch low quality addresses with scope filter
      let lowQualityQuery = supabase
        .from('addresses')
        .select('*')
        .lt('completeness_score', 85);
      lowQualityQuery = buildQuery(lowQualityQuery);
      
      const { data: lowQualityAddresses, error: lowQualityError } = await lowQualityQuery;
      if (lowQualityError) throw lowQualityError;

      // Fetch pending verification requests with scope filter
      let pendingQuery = supabase
        .from('address_requests')
        .select('*')
        .eq('status', 'pending');
      pendingQuery = buildQuery(pendingQuery);
      
      const { data: pendingRequests, error: pendingError } = await pendingQuery;
      if (pendingError) throw pendingError;

      // Fetch all addresses for duplicate detection with scope filter
      let allAddressesQuery = supabase
        .from('addresses')
        .select('*');
      allAddressesQuery = buildQuery(allAddressesQuery);
      
      const { data: allAddresses, error: allAddressesError } = await allAddressesQuery
        .order('created_at', { ascending: true });
      if (allAddressesError) throw allAddressesError;

      // Detect duplicates using same logic as QualityIssuesFixer
      const processed = new Set();
      let duplicateGroupCount = 0;

      allAddresses?.forEach((address, index) => {
        if (processed.has(address.id)) return;

        const duplicates = [];
        
        // Check against remaining addresses
        for (let i = index + 1; i < allAddresses.length; i++) {
          const compareAddress = allAddresses[i];
          if (processed.has(compareAddress.id)) continue;

          // Check for duplicates using same criteria as QualityIssuesFixer
          const addressMatch = address.region === compareAddress.region && 
                              address.city === compareAddress.city &&
                              address.street === compareAddress.street &&
                              address.building === compareAddress.building;
          
          // Precise coordinate proximity (within ~22 meters for true duplicates)
          const latDiff = Math.abs(address.latitude - compareAddress.latitude);
          const lngDiff = Math.abs(address.longitude - compareAddress.longitude);
          const coordinateMatch = latDiff < 0.0002 && lngDiff < 0.0002;

          // Only consider as duplicates if BOTH address AND coordinates match closely
          if (addressMatch && coordinateMatch) {
            duplicates.push(compareAddress);
            processed.add(compareAddress.id);
          }
        }

        if (duplicates.length > 0) {
          duplicateGroupCount++;
          processed.add(address.id);
        }
      });

      setRealTimeQualityMetrics({
        lowQualityAddresses: lowQualityAddresses?.length || 0,
        duplicateCount: duplicateGroupCount,
        pendingVerification: pendingRequests?.length || 0
      });

    } catch (error) {
      console.error('Error fetching quality metrics:', error);
    }
  };

  const fetchCARMetrics = async () => {
    try {
      // Call the function to update CAR quality metrics
      await supabase.rpc('update_car_quality_metrics');
      
      // Fetch the latest CAR metrics
      const { data, error } = await supabase
        .from('car_quality_metrics')
        .select('*')
        .order('date_measured', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setCARMetrics({
          totalCitizenAddresses: data.total_citizen_addresses,
          pendingVerificationAddresses: data.pending_verification_addresses,
          confirmedAddresses: data.confirmed_addresses,
          rejectedAddresses: data.rejected_addresses,
          duplicatePersonRecords: data.duplicate_person_records,
          averageVerificationTimeHours: data.average_verification_time_hours
        });
      }
    } catch (error) {
      console.error('Error fetching CAR metrics:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const body: any = {};
      if (geographicScope) {
        body.scope_type = geographicScope.scope_type;
        body.scope_value = geographicScope.scope_value;
      }
      const { data, error } = await supabase.functions.invoke('coverage-analytics-api', { body });
      
      if (error) throw error;
      
      setAnalytics(data);
      
      // Also fetch real-time quality metrics and CAR metrics
      await fetchQualityMetrics();
      await fetchCARMetrics();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: t('quality.errorTitle'),
        description: t('quality.failedToFetchAnalytics'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  useEffect(() => {
    if (!roleLoading) {
      fetchAnalytics();
    }
  }, [roleLoading, geographicScope?.scope_type, geographicScope?.scope_value]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{t('quality.noAnalyticsData')}</p>
        </CardContent>
      </Card>
    );
  }

  const { nationalSummary, regionalBreakdown, cityBreakdown, qualityMetrics } = analytics;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const pieData = [
    { name: t('quality.verified'), value: nationalSummary.verifiedAddresses, color: COLORS[0] },
    { name: t('quality.unverified'), value: nationalSummary.totalAddresses - nationalSummary.verifiedAddresses, color: COLORS[1] },
  ];

  const qualityPieData = [
    { name: t('quality.highQuality'), value: nationalSummary.totalAddresses - realTimeQualityMetrics.lowQualityAddresses, color: COLORS[0] },
    { name: t('quality.lowQualityBelow85'), value: realTimeQualityMetrics.lowQualityAddresses, color: COLORS[3] },
  ];
  
  // Show Quality Issues Fixer if requested
  if (showQualityFixer) {
    return (
      <QualityIssuesFixer 
        onClose={() => setShowQualityFixer(false)}
        onIssuesFixed={() => {
          fetchAnalytics();
          fetchQualityMetrics();
        }}
      />
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('quality.title')}</h1>
          <p className="text-muted-foreground">{t('quality.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('quality.refreshData')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('quality.exportQualityReport')}
          </Button>
        </div>
      </div>

      {/* National Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('quality.totalAddresses')}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalSummary.totalAddresses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('quality.across')} {nationalSummary.totalRegions} {t('quality.regions')}, {nationalSummary.totalCities} {t('quality.cities')}
            </p>
          </CardContent>
        </Card>
        
        {/* CAR-specific metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('quality.verifiedAddresses')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carMetrics.totalCitizenAddresses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {carMetrics.confirmedAddresses.toLocaleString()} {t('quality.confirmed')}, {carMetrics.pendingVerificationAddresses.toLocaleString()} {t('quality.pending')}
            </p>
            {carMetrics.duplicatePersonRecords > 0 && (
              <Badge variant="destructive" className="mt-2">
                {carMetrics.duplicatePersonRecords} {t('quality.duplicatePersonsNeedMerging')}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('quality.carProcessingTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carMetrics.averageVerificationTimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {t('quality.averageVerificationTime')}
            </p>
            {carMetrics.averageVerificationTimeHours > 48 && (
              <Badge variant="destructive" className="mt-2">{t('quality.slowProcessing')}</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('quality.qualityScore')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalSummary.overallCoverage}%</div>
            <Progress value={nationalSummary.overallCoverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {nationalSummary.verifiedAddresses.toLocaleString()} {t('quality.verified')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('quality.completenessRate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityMetrics.averageCompleteness}%</div>
            <Progress value={qualityMetrics.averageCompleteness} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {t('quality.averageCompletenessScore')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('quality.pendingVerification')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeQualityMetrics.pendingVerification}</div>
            <p className="text-xs text-muted-foreground">
              {t('quality.requestsAwaitingVerification')}
            </p>
            {realTimeQualityMetrics.pendingVerification > 50 && (
              <Badge variant="destructive" className="mt-2">{t('quality.highBacklog')}</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="regional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regional">{t('quality.regionalOverview')}</TabsTrigger>
          <TabsTrigger value="quality">{t('quality.qualityMetrics')}</TabsTrigger>
          <TabsTrigger value="car">{t('quality.carAnalytics')}</TabsTrigger>
          <TabsTrigger value="cities">{t('quality.cityBreakdown')}</TabsTrigger>
        </TabsList>

        <TabsContent value="regional" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Regional Bar Chart */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>{t('quality.addressesByRegion')}</CardTitle>
                <CardDescription>{t('quality.totalRegisteredAddresses')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="addressesRegistered" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Verification Status Pie Chart */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>{t('quality.verificationStatus')}</CardTitle>
                <CardDescription>{t('quality.distributionVerifiedVsUnverified')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Regional Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quality.regionalPerformance')}</CardTitle>
              <CardDescription>{t('quality.detailedMetricsByRegion')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('quality.region')}</th>
                      <th className="text-right p-2">{t('quality.cities')}</th>
                      <th className="text-right p-2">{t('quality.addresses')}</th>
                      <th className="text-right p-2">{t('quality.verified')}</th>
                      <th className="text-right p-2">{t('quality.published')}</th>
                      <th className="text-right p-2">{t('quality.qualityScore')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionalBreakdown.map((region, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{region.region}</td>
                        <td className="text-right p-2">{region.cities}</td>
                        <td className="text-right p-2">{region.addressesRegistered.toLocaleString()}</td>
                        <td className="text-right p-2">
                          <Badge variant={region.verificationRate > 80 ? "default" : "secondary"}>
                            {region.verificationRate}%
                          </Badge>
                        </td>
                        <td className="text-right p-2">
                          <Badge variant={region.publicationRate > 60 ? "default" : "secondary"}>
                            {region.publicationRate}%
                          </Badge>
                        </td>
                        <td className="text-right p-2">
                          <Badge variant={region.averageCompleteness > 80 ? "default" : "destructive"}>
                            {region.averageCompleteness}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quality Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quality.dataQualityDistribution')}</CardTitle>
                <CardDescription>{t('quality.addressCompletenessScores')}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={qualityPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {qualityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quality Issues */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quality.qualityIssues')}</CardTitle>
                <CardDescription>{t('quality.itemsRequiringAttention')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('quality.lowQualityAddresses')}</span>
                  <Badge variant="destructive">{realTimeQualityMetrics.lowQualityAddresses}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('quality.pendingVerification')}</span>
                  <Badge variant="secondary">{realTimeQualityMetrics.pendingVerification}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('quality.duplicateAddresses')}</span>
                  <Badge variant="outline">{realTimeQualityMetrics.duplicateCount}</Badge>
                </div>
                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowQualityIssues(!showQualityIssues)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showQualityIssues ? t('quality.hideQualityIssues') : t('quality.viewQualityIssues')}
                  </Button>
                  <Button 
                    onClick={() => setShowQualityFixer(true)}
                    size="sm"
                    className="w-full mt-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('quality.fixIssues')}
                  </Button>
                </div>
                
                {showQualityIssues && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="text-sm font-medium text-foreground">{t('quality.qualityIssuesBreakdown')}</div>
                    
                    {realTimeQualityMetrics.lowQualityAddresses > 0 && (
                      <div className="p-3 border rounded-lg bg-destructive/5">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="font-medium text-sm">{t('quality.lowQualityAddresses')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.lowQualityAddresses} {t('quality.lowQualityDescription')}
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.duplicateCount > 0 && (
                      <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-sm">{t('quality.duplicateAddresses')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.duplicateCount} {t('quality.duplicateGroupsIdentified')}
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.pendingVerification > 0 && (
                      <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">{t('quality.pendingVerification')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.pendingVerification} {t('quality.requestsAwaitingVerification')}
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.lowQualityAddresses === 0 && 
                     realTimeQualityMetrics.duplicateCount === 0 && 
                     realTimeQualityMetrics.pendingVerification === 0 && (
                      <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">{t('quality.noQualityIssuesFound')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('quality.allAddressesMeetStandards')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="car" className="space-y-4">
          {/* Quality Score Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quality.overallSystemQuality')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const verificationRate = carMetrics.totalCitizenAddresses > 0 
                      ? (carMetrics.confirmedAddresses / carMetrics.totalCitizenAddresses) * 100 
                      : 0;
                    const rejectionRate = carMetrics.totalCitizenAddresses > 0 
                      ? (carMetrics.rejectedAddresses / carMetrics.totalCitizenAddresses) * 100 
                      : 0;
                    const duplicateScore = Math.max(0, 100 - (carMetrics.duplicatePersonRecords * 5));
                    return Math.round((verificationRate * 0.4) + ((100 - rejectionRate) * 0.3) + (duplicateScore * 0.3));
                  })()}%
                </div>
                <Progress 
                  value={(() => {
                    const verificationRate = carMetrics.totalCitizenAddresses > 0 
                      ? (carMetrics.confirmedAddresses / carMetrics.totalCitizenAddresses) * 100 
                      : 0;
                    const rejectionRate = carMetrics.totalCitizenAddresses > 0 
                      ? (carMetrics.rejectedAddresses / carMetrics.totalCitizenAddresses) * 100 
                      : 0;
                    const duplicateScore = Math.max(0, 100 - (carMetrics.duplicatePersonRecords * 5));
                    return Math.round((verificationRate * 0.4) + ((100 - rejectionRate) * 0.3) + (duplicateScore * 0.3));
                  })()} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t('quality.basedOnVerificationRates')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quality.dataCompleteness')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const totalProcessed = carMetrics.confirmedAddresses + carMetrics.rejectedAddresses;
                    const completeness = carMetrics.totalCitizenAddresses > 0
                      ? Math.round((totalProcessed / carMetrics.totalCitizenAddresses) * 100)
                      : 0;
                    return `${completeness}%`;
                  })()}
                </div>
                <Progress 
                  value={(() => {
                    const totalProcessed = carMetrics.confirmedAddresses + carMetrics.rejectedAddresses;
                    return carMetrics.totalCitizenAddresses > 0
                      ? (totalProcessed / carMetrics.totalCitizenAddresses) * 100
                      : 0;
                  })()} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t('quality.recordsProcessed')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quality.dataIntegrity')}</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const duplicateImpact = carMetrics.totalCitizenAddresses > 0
                      ? (carMetrics.duplicatePersonRecords / carMetrics.totalCitizenAddresses) * 100
                      : 0;
                    const integrity = Math.round(100 - duplicateImpact);
                    return (
                      <span className={integrity >= 95 ? 'text-green-600' : integrity >= 85 ? 'text-yellow-600' : 'text-red-600'}>
                        {integrity}%
                      </span>
                    );
                  })()}
                </div>
                <Progress 
                  value={(() => {
                    const duplicateImpact = carMetrics.totalCitizenAddresses > 0
                      ? (carMetrics.duplicatePersonRecords / carMetrics.totalCitizenAddresses) * 100
                      : 0;
                    return 100 - duplicateImpact;
                  })()} 
                  className="mt-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t('quality.duplicatesFound', { count: carMetrics.duplicatePersonRecords })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution and Quality Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* CAR Status Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quality.carStatusDistribution')}</CardTitle>
                <CardDescription>{t('quality.citizenAddressRecords')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('quality.confirmed'), value: carMetrics.confirmedAddresses, color: COLORS[0] },
                        { name: t('quality.pending'), value: carMetrics.pendingVerificationAddresses, color: COLORS[1] },
                        { name: t('quality.rejected'), value: carMetrics.rejectedAddresses, color: COLORS[3] }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: t('quality.confirmed'), value: carMetrics.confirmedAddresses, color: COLORS[0] },
                        { name: t('quality.pending'), value: carMetrics.pendingVerificationAddresses, color: COLORS[1] },
                        { name: t('quality.rejected'), value: carMetrics.rejectedAddresses, color: COLORS[3] }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('quality.totalRecordsLabel')}:</span>
                    <span className="font-medium">{carMetrics.totalCitizenAddresses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('quality.verificationRate')}:</span>
                    <span className="font-medium text-green-600">
                      {carMetrics.totalCitizenAddresses > 0 
                        ? Math.round((carMetrics.confirmedAddresses / carMetrics.totalCitizenAddresses) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quality.qualityScoreComponentsTitle')}</CardTitle>
                <CardDescription>{t('quality.qualityScoreComponentsDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('quality.verificationSuccess')}</span>
                    <span className="font-medium">
                      {carMetrics.totalCitizenAddresses > 0 
                        ? Math.round((carMetrics.confirmedAddresses / carMetrics.totalCitizenAddresses) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={carMetrics.totalCitizenAddresses > 0 
                      ? (carMetrics.confirmedAddresses / carMetrics.totalCitizenAddresses) * 100
                      : 0} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('quality.weightLabel', { percent: 40 })}</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('quality.rejectionControl')}</span>
                    <span className="font-medium">
                      {carMetrics.totalCitizenAddresses > 0 
                        ? Math.round((1 - (carMetrics.rejectedAddresses / carMetrics.totalCitizenAddresses)) * 100)
                        : 100}%
                    </span>
                  </div>
                  <Progress 
                    value={carMetrics.totalCitizenAddresses > 0 
                      ? (1 - (carMetrics.rejectedAddresses / carMetrics.totalCitizenAddresses)) * 100
                      : 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('quality.weightLabel', { percent: 30 })}</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('quality.duplicateFree')}</span>
                    <span className="font-medium">
                      {Math.max(0, 100 - (carMetrics.duplicatePersonRecords * 5))}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (carMetrics.duplicatePersonRecords * 5))} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('quality.weightLabel', { percent: 30 })}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quality.avgProcessingTime')}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {carMetrics.averageVerificationTimeHours.toFixed(1)}h
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('quality.averageVerificationTime')}
                </p>
                {carMetrics.averageVerificationTimeHours > 48 && (
                  <Badge variant="destructive" className="mt-2">{t('quality.slowProcessing')}</Badge>
                )}
                {carMetrics.averageVerificationTimeHours <= 24 && (
                  <Badge variant="default" className="mt-2">{t('quality.excellentSpeed')}</Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quality.processingBacklog')}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {carMetrics.pendingVerificationAddresses}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('quality.awaitingVerification')}
                </p>
                {carMetrics.pendingVerificationAddresses > 100 && (
                  <Badge variant="destructive" className="mt-2">{t('quality.highBacklog')}</Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quality.throughputRate')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const processed = carMetrics.confirmedAddresses + carMetrics.rejectedAddresses;
                    const rate = carMetrics.averageVerificationTimeHours > 0
                      ? Math.round((processed / carMetrics.averageVerificationTimeHours) * 24)
                      : 0;
                    return rate;
                  })()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('quality.recordsPerDay')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Quality Issues */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quality.dataQualityIssuesCar')}</CardTitle>
                <CardDescription>{t('quality.carSpecificQualityConcerns')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{t('quality.duplicatePersonRecords')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.duplicatePersonsDescription')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {carMetrics.duplicatePersonRecords}
                    </div>
                    <Badge variant={carMetrics.duplicatePersonRecords > 0 ? "destructive" : "default"}>
                      {carMetrics.duplicatePersonRecords > 0 ? t('quality.actionRequired') : t('quality.clean')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">{t('quality.pendingVerification')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.recordsAwaitingReview')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">
                      {carMetrics.pendingVerificationAddresses}
                    </div>
                    <Badge variant={carMetrics.pendingVerificationAddresses > 50 ? "destructive" : "secondary"}>
                      {carMetrics.pendingVerificationAddresses > 50 ? t('quality.highBacklog') : t('quality.manageable')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">{t('quality.rejectedAddresses')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.addressesFailedVerification')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {carMetrics.rejectedAddresses}
                    </div>
                    <Badge variant={carMetrics.rejectedAddresses > carMetrics.confirmedAddresses * 0.2 ? "destructive" : "secondary"}>
                      {carMetrics.rejectedAddresses > carMetrics.confirmedAddresses * 0.2 
                        ? t('quality.highRejectionRate')
                        : t('quality.normal')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* CAR Processing Trends */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quality.processingTrendsTitle')}</CardTitle>
                <CardDescription>{t('quality.processingTrendsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { name: t('quality.weekLabel', { week: 1 }), confirmed: Math.round(carMetrics.confirmedAddresses * 0.7), pending: Math.round(carMetrics.pendingVerificationAddresses * 1.2) },
                    { name: t('quality.weekLabel', { week: 2 }), confirmed: Math.round(carMetrics.confirmedAddresses * 0.8), pending: Math.round(carMetrics.pendingVerificationAddresses * 1.1) },
                    { name: t('quality.weekLabel', { week: 3 }), confirmed: Math.round(carMetrics.confirmedAddresses * 0.9), pending: Math.round(carMetrics.pendingVerificationAddresses * 1.05) },
                    { name: t('quality.currentLabel'), confirmed: carMetrics.confirmedAddresses, pending: carMetrics.pendingVerificationAddresses },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="confirmed" stroke="hsl(var(--primary))" name={t('quality.confirmed')} />
                    <Line type="monotone" dataKey="pending" stroke="hsl(var(--secondary))" name={t('quality.pending')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('quality.cityPerformanceTitle')}</CardTitle>
              <CardDescription>{t('quality.cityPerformanceDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('quality.city')}</th>
                      <th className="text-left p-2">{t('quality.region')}</th>
                      <th className="text-right p-2">{t('quality.addresses')}</th>
                      <th className="text-right p-2">{t('quality.verified')}</th>
                      <th className="text-right p-2">{t('quality.published')}</th>
                      <th className="text-right p-2">{t('quality.qualityScore')}</th>
                      <th className="text-right p-2">{t('quality.lastUpdated')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityBreakdown.slice(0, 20).map((city, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{city.city}</td>
                        <td className="p-2 text-muted-foreground">{city.region}</td>
                        <td className="text-right p-2">{city.addressesRegistered}</td>
                        <td className="text-right p-2">
                          <Badge variant={city.verificationRate > 80 ? "default" : "secondary"}>
                            {city.verificationRate}%
                          </Badge>
                        </td>
                        <td className="text-right p-2">
                          <Badge variant={city.publicationRate > 60 ? "default" : "secondary"}>
                            {city.publicationRate}%
                          </Badge>
                        </td>
                        <td className="text-right p-2">
                          <Badge variant={city.averageCompleteness > 80 ? "default" : "destructive"}>
                            {city.averageCompleteness.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right p-2 text-xs text-muted-foreground">
                          {new Date(city.lastUpdated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}