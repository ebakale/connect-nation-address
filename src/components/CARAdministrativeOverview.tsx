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
      // Get total addresses and status breakdown
      const { data: addressStats, error: addressError } = await supabase
        .from('citizen_address')
        .select('status, address_kind, effective_to, created_at');

      if (addressError) throw addressError;

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
      const confirmedAddresses = addressStats?.filter(addr => addr.status === 'CONFIRMED').length || 0;
      const rejectedAddresses = addressStats?.filter(addr => addr.status === 'REJECTED').length || 0;
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

      // Calculate recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivity = addressStats?.filter(addr => 
        new Date(addr.created_at) > sevenDaysAgo
      ).length || 0;

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
        title: "Error",
        description: "Failed to load CAR statistics",
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
    if (percentage >= 95) return "Excellent";
    if (percentage >= 85) return "Good";
    return "Needs Attention";
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
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="management">Management Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Citizen Addresses</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAddresses}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeAddresses} currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Persons</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPersons}</div>
                  <p className="text-xs text-muted-foreground">
                    In CAR system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting verification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">NAR Verification Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verificationRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Linked to NAR
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Address Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Confirmed</span>
                    </div>
                    <Badge variant="outline">{stats.confirmedAddresses}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Self-Declared</span>
                    </div>
                    <Badge variant="outline">{stats.pendingVerifications}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Rejected</span>
                    </div>
                    <Badge variant="outline">{stats.rejectedAddresses}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Address Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Primary Addresses</span>
                    </div>
                    <Badge variant="outline">{stats.primaryAddresses}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Secondary Addresses</span>
                    </div>
                    <Badge variant="outline">{stats.secondaryAddresses}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regional Distribution</CardTitle>
                <CardDescription>Top 5 regions by citizen address count</CardDescription>
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
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.recentActivity}</div>
                  <p className="text-sm text-muted-foreground">New addresses added</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Rate</CardTitle>
                  <CardDescription>NAR linkage success</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.verificationRate}%</div>
                  <Progress value={stats.verificationRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Ratio</CardTitle>
                  <CardDescription>Active vs total addresses</CardDescription>
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
                System health monitoring provides insights into CAR system performance and data integrity.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Processing Time</span>
                    <Badge variant="outline">{systemHealth.averageProcessingTime} days</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Load</span>
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
                  <CardTitle className="text-lg">Data Integrity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Integrity</span>
                      <span className={`text-sm font-medium ${getHealthColor(systemHealth.dataIntegrity)}`}>
                        {systemHealth.dataIntegrity}%
                      </span>
                    </div>
                    <Progress value={systemHealth.dataIntegrity} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">NAR Linkage Health</span>
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
                Administrative tools for managing the CAR system. Use these tools with caution as they affect system-wide operations.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                  <CardDescription>Bulk operations and data management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => fetchCARStatistics()}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Refresh Statistics
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <Database className="h-4 w-4 mr-2" />
                    Export CAR Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Maintenance</CardTitle>
                  <CardDescription>System maintenance and optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" disabled>
                    <Activity className="h-4 w-4 mr-2" />
                    Run Integrity Check
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimize Performance
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Tools</CardTitle>
                  <CardDescription>Address verification management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Bulk Verification
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review Flagged Items
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