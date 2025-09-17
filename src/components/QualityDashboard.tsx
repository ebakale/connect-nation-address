import { useState, useEffect } from 'react';
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
  RefreshCw, Download, Eye, Clock, Settings
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
}

export function QualityDashboard() {
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

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('coverage-analytics-api');
      
      if (error) throw error;
      
      setAnalytics(data);
      
      // Also fetch real-time quality metrics
      await fetchQualityMetrics();
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
          <h1 className="text-3xl font-bold text-foreground">Quality Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring of address data quality and coverage</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* National Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalSummary.totalAddresses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {nationalSummary.totalRegions} regions, {nationalSummary.totalCities} cities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nationalSummary.overallCoverage}%</div>
            <Progress value={nationalSummary.overallCoverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {nationalSummary.verifiedAddresses.toLocaleString()} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityMetrics.averageCompleteness}%</div>
            <Progress value={qualityMetrics.averageCompleteness} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Average completeness score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeQualityMetrics.pendingVerification}</div>
            <p className="text-xs text-muted-foreground">
              Requests awaiting verification
            </p>
            {realTimeQualityMetrics.pendingVerification > 50 && (
              <Badge variant="destructive" className="mt-2">High Backlog</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="regional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regional">Regional Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="cities">City Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="regional" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Regional Bar Chart */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Addresses by Region</CardTitle>
                <CardDescription>Total registered addresses per region</CardDescription>
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
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>Distribution of verified vs unverified addresses</CardDescription>
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
              <CardTitle>Regional Performance</CardTitle>
              <CardDescription>Detailed metrics by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Region</th>
                      <th className="text-right p-2">Cities</th>
                      <th className="text-right p-2">Addresses</th>
                      <th className="text-right p-2">Verified</th>
                      <th className="text-right p-2">Published</th>
                      <th className="text-right p-2">Quality</th>
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
                <CardTitle>Data Quality Distribution</CardTitle>
                <CardDescription>Address completeness scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qualityPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
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
                <CardTitle>Quality Issues</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low Quality Addresses</span>
                  <Badge variant="destructive">{realTimeQualityMetrics.lowQualityAddresses}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Verification</span>
                  <Badge variant="secondary">{realTimeQualityMetrics.pendingVerification}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Duplicate Addresses</span>
                  <Badge variant="outline">{realTimeQualityMetrics.duplicateCount}</Badge>
                </div>
                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowQualityIssues(!showQualityIssues)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showQualityIssues ? 'Hide' : 'View'} Quality Issues
                  </Button>
                  <Button 
                    onClick={() => setShowQualityFixer(true)}
                    size="sm"
                    className="w-full mt-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Fix Issues
                  </Button>
                </div>
                
                {showQualityIssues && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="text-sm font-medium text-foreground">Quality Issues Breakdown:</div>
                    
                    {realTimeQualityMetrics.lowQualityAddresses > 0 && (
                      <div className="p-3 border rounded-lg bg-destructive/5">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="font-medium text-sm">Low Quality Addresses</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.lowQualityAddresses} addresses with completeness score below 85%
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.duplicateCount > 0 && (
                      <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-sm">Duplicate Addresses</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.duplicateCount} duplicate groups identified
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.pendingVerification > 0 && (
                      <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">Pending Verification</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {realTimeQualityMetrics.pendingVerification} address requests awaiting verification
                        </p>
                      </div>
                    )}
                    
                    {realTimeQualityMetrics.lowQualityAddresses === 0 && 
                     realTimeQualityMetrics.duplicateCount === 0 && 
                     realTimeQualityMetrics.pendingVerification === 0 && (
                      <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">No Quality Issues Found</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          All addresses meet quality standards
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>City Performance</CardTitle>
              <CardDescription>Detailed metrics by city</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">City</th>
                      <th className="text-left p-2">Region</th>
                      <th className="text-right p-2">Addresses</th>
                      <th className="text-right p-2">Verified</th>
                      <th className="text-right p-2">Published</th>
                      <th className="text-right p-2">Quality</th>
                      <th className="text-right p-2">Last Updated</th>
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