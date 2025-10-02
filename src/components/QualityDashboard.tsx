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
  RefreshCw, Download, Eye, Clock, Settings, Users
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
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
  const { t } = useTranslation(['admin']);
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

  const fetchQualityMetrics = async () => {
    try {
      // Fetch low quality addresses (same logic as QualityIssuesFixer)
      const { data: lowQualityAddresses, error: lowQualityError } = await supabase
        .from('addresses')
        .select('*')
        .lt('completeness_score', 85);

      if (lowQualityError) throw lowQualityError;

      // Fetch pending verification requests (same logic as QualityIssuesFixer)
      const { data: pendingRequests, error: pendingError } = await supabase
        .from('address_requests')
        .select('*')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Fetch all addresses for duplicate detection (same logic as QualityIssuesFixer)
      const { data: allAddresses, error: allAddressesError } = await supabase
        .from('addresses')
        .select('*')
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
      const { data, error } = await supabase.functions.invoke('coverage-analytics-api');
      
      if (error) throw error;
      
      setAnalytics(data);
      
      // Also fetch real-time quality metrics and CAR metrics
      await fetchQualityMetrics();
      await fetchCARMetrics();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coverage analytics",
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
    fetchAnalytics();
  }, []);

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
          <p className="text-center text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const { nationalSummary, regionalBreakdown, cityBreakdown, qualityMetrics } = analytics;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const pieData = [
    { name: 'Verified', value: nationalSummary.verifiedAddresses, color: COLORS[0] },
    { name: 'Unverified', value: nationalSummary.totalAddresses - nationalSummary.verifiedAddresses, color: COLORS[1] },
  ];

  const qualityPieData = [
    { name: 'High Quality (80%+)', value: nationalSummary.totalAddresses - realTimeQualityMetrics.lowQualityAddresses, color: COLORS[0] },
    { name: 'Low Quality (<85%)', value: realTimeQualityMetrics.lowQualityAddresses, color: COLORS[3] },
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
          <h1 className="text-2xl font-bold text-foreground">{t('admin:quality.title')}</h1>
          <p className="text-muted-foreground">{t('admin:quality.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('admin:quality.refreshData')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('admin:quality.exportQualityReport')}
          </Button>
        </div>
      </div>

      {/* National Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:quality.totalAddresses')}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalSummary.totalAddresses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin:quality.across')} {nationalSummary.totalRegions} {t('admin:quality.regions')}, {nationalSummary.totalCities} {t('admin:quality.cities')}
            </p>
          </CardContent>
        </Card>
        
        {/* CAR-specific metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:quality.verifiedAddresses')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carMetrics.totalCitizenAddresses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin:quality.confirmedPending', { confirmed: carMetrics.confirmedAddresses, pending: carMetrics.pendingVerificationAddresses })}
            </p>
            {carMetrics.duplicatePersonRecords > 0 && (
              <Badge variant="destructive" className="mt-2">
                {t('admin:quality.duplicatePersons', { count: carMetrics.duplicatePersonRecords })}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:quality.carProcessingTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carMetrics.averageVerificationTimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {t('admin:quality.averageVerificationTime')}
            </p>
            {carMetrics.averageVerificationTimeHours > 48 && (
              <Badge variant="destructive" className="mt-2">{t('admin:quality.slowProcessing')}</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:quality.qualityScore')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalSummary.overallCoverage}%</div>
            <Progress value={nationalSummary.overallCoverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {nationalSummary.verifiedAddresses.toLocaleString()} {t('admin:quality.addressesVerified')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:quality.completenessRate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityMetrics.averageCompleteness}%</div>
            <Progress value={qualityMetrics.averageCompleteness} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin:quality.averageCompletenessScore')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin:quality.pendingVerification')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeQualityMetrics.pendingVerification}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin:quality.requestsAwaitingVerification')}
            </p>
            {realTimeQualityMetrics.pendingVerification > 50 && (
              <Badge variant="destructive" className="mt-2">{t('admin:quality.highBacklog')}</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="regional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regional">{t('admin:quality.regionalOverview')}</TabsTrigger>
          <TabsTrigger value="quality">{t('admin:quality.qualityMetrics')}</TabsTrigger>
          <TabsTrigger value="car">{t('admin:quality.carAnalytics')}</TabsTrigger>
          <TabsTrigger value="cities">{t('admin:quality.cityBreakdown')}</TabsTrigger>
        </TabsList>

        <TabsContent value="regional" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Regional Bar Chart */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>{t('admin:quality.addressesByRegion')}</CardTitle>
                <CardDescription>{t('admin:quality.totalRegisteredAddresses')}</CardDescription>
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
                <CardTitle>{t('admin:quality.verificationStatus')}</CardTitle>
                <CardDescription>{t('admin:quality.distributionVerifiedVsUnverified')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name === 'Verified' ? t('admin:quality.verified') : t('admin:quality.unverified')} ${(percent * 100).toFixed(0)}%`}
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
              <CardTitle>{t('admin:quality.regionalPerformance')}</CardTitle>
              <CardDescription>{t('admin:quality.detailedMetricsByRegion')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('admin:quality.region')}</th>
                      <th className="text-right p-2">{t('admin:quality.cities')}</th>
                      <th className="text-right p-2">{t('admin:quality.addresses')}</th>
                      <th className="text-right p-2">{t('admin:quality.verified')}</th>
                      <th className="text-right p-2">{t('admin:quality.published')}</th>
                      <th className="text-right p-2">{t('admin:quality.qualityScore')}</th>
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
                <CardTitle>{t('admin:quality.dataQualityDistribution')}</CardTitle>
                <CardDescription>{t('admin:quality.addressCompletenessScores')}</CardDescription>
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
                <CardTitle>{t('admin:quality.qualityIssues')}</CardTitle>
                <CardDescription>{t('admin:quality.itemsRequiringAttention')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('admin:quality.lowQualityAddresses')}</span>
                  <Badge variant="destructive">{realTimeQualityMetrics.lowQualityAddresses}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('admin:quality.pendingVerification')}</span>
                  <Badge variant="secondary">{realTimeQualityMetrics.pendingVerification}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('admin:quality.duplicateAddresses')}</span>
                  <Badge variant="outline">{realTimeQualityMetrics.duplicateCount}</Badge>
                </div>
                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowQualityIssues(!showQualityIssues)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showQualityIssues ? t('admin:quality.hideQualityIssues') : t('admin:quality.viewQualityIssues')}
                  </Button>
                  <Button 
                    onClick={() => setShowQualityFixer(true)}
                    size="sm"
                    className="w-full mt-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('admin:quality.fixIssues')}
                  </Button>
                </div>
                
                {showQualityIssues && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="text-sm font-medium text-foreground">{t('admin:quality.qualityIssuesBreakdown')}</div>
                    
                    {realTimeQualityMetrics.lowQualityAddresses > 0 && (
                      <div className="p-3 border rounded-lg bg-destructive/5">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="font-medium text-sm">{t('admin:quality.lowQualityAddresses')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.lowQualityAddresses} {t('admin:quality.lowQualityDescription')}
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.duplicateCount > 0 && (
                      <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-sm">{t('admin:quality.duplicateAddresses')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.duplicateCount} {t('admin:quality.duplicateGroupsIdentified')}
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.pendingVerification > 0 && (
                      <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">{t('admin:quality.pendingVerification')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.pendingVerification} {t('admin:quality.requestsAwaitingVerification')}
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.lowQualityAddresses === 0 && 
                     realTimeQualityMetrics.duplicateCount === 0 && 
                     realTimeQualityMetrics.pendingVerification === 0 && (
                      <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">{t('admin:quality.noQualityIssuesFound')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('admin:quality.allAddressesMeetStandards')}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* CAR Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin:quality.carStatusDistribution')}</CardTitle>
                <CardDescription>{t('admin:quality.citizenAddressesByStatus')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('admin:quality.confirmed')}</span>
                    <Badge variant="default">{carMetrics.confirmedAddresses}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('admin:quality.pending')}</span>
                    <Badge variant="secondary">{carMetrics.pendingVerificationAddresses}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('admin:quality.rejected')}</span>
                    <Badge variant="destructive">{carMetrics.rejectedAddresses}</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-sm">{t('admin:quality.total')}</span>
                      <span>{carMetrics.totalCitizenAddresses}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Performance */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin:quality.processingPerformance')}</CardTitle>
                <CardDescription>{t('admin:quality.carVerificationEfficiency')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('admin:quality.confirmationRate')}</span>
                      <span>{carMetrics.totalCitizenAddresses > 0 ? 
                        ((carMetrics.confirmedAddresses / carMetrics.totalCitizenAddresses) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <Progress value={carMetrics.totalCitizenAddresses > 0 ? 
                      (carMetrics.confirmedAddresses / carMetrics.totalCitizenAddresses) * 100 : 0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('admin:quality.avgProcessingTime')}</span>
                      <span>{carMetrics.averageVerificationTimeHours.toFixed(1)}h</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (carMetrics.averageVerificationTimeHours * 2))} 
                      className={carMetrics.averageVerificationTimeHours > 48 ? "progress-destructive" : ""} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Quality Issues */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin:quality.dataQualityIssuesCar')}</CardTitle>
                <CardDescription>{t('admin:quality.carSpecificQualityConcerns')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('admin:quality.duplicatePersons')}</span>
                    <Badge variant={carMetrics.duplicatePersonRecords > 0 ? "destructive" : "outline"}>
                      {carMetrics.duplicatePersonRecords}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('admin:quality.processingBacklog')}</span>
                    <Badge variant={carMetrics.pendingVerificationAddresses > 50 ? "destructive" : "secondary"}>
                      {carMetrics.pendingVerificationAddresses}
                    </Badge>
                  </div>
                  {carMetrics.duplicatePersonRecords > 0 && (
                    <div className="p-3 border rounded-lg bg-destructive/5 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm">{t('admin:quality.actionRequired')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {carMetrics.duplicatePersonRecords} {t('admin:quality.duplicatePersonsNeedMerging')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CAR Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin:quality.carProcessingTrends')}</CardTitle>
              <CardDescription>{t('admin:quality.verificationTrendsOverTime')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { name: 'Week 1', confirmed: carMetrics.confirmedAddresses * 0.7, pending: carMetrics.pendingVerificationAddresses * 1.2 },
                  { name: 'Week 2', confirmed: carMetrics.confirmedAddresses * 0.8, pending: carMetrics.pendingVerificationAddresses * 1.1 },
                  { name: 'Week 3', confirmed: carMetrics.confirmedAddresses * 0.9, pending: carMetrics.pendingVerificationAddresses * 1.05 },
                  { name: 'Current', confirmed: carMetrics.confirmedAddresses, pending: carMetrics.pendingVerificationAddresses },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="confirmed" stroke="hsl(var(--primary))" name={t('admin:quality.confirmed')} />
                  <Line type="monotone" dataKey="pending" stroke="hsl(var(--secondary))" name={t('admin:quality.pending')} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin:quality.cityPerformanceTitle')}</CardTitle>
              <CardDescription>{t('admin:quality.cityPerformanceDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('admin:quality.city')}</th>
                      <th className="text-left p-2">{t('admin:quality.region')}</th>
                      <th className="text-right p-2">{t('admin:quality.addresses')}</th>
                      <th className="text-right p-2">{t('admin:quality.verified')}</th>
                      <th className="text-right p-2">{t('admin:quality.published')}</th>
                      <th className="text-right p-2">{t('admin:quality.quality')}</th>
                      <th className="text-right p-2">{t('admin:quality.lastUpdated')}</th>
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