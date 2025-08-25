import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Clock, Users, AlertTriangle,
  CheckCircle, MapPin, Calendar, Download, RefreshCw,
  BarChart3, Activity, Target, Zap
} from 'lucide-react';

interface AnalyticsData {
  incidents: {
    total: number;
    resolved: number;
    pending: number;
    responseTime: number;
    byType: Array<{ name: string; value: number; color: string }>;
    byPriority: Array<{ name: string; value: number; color: string }>;
    timeline: Array<{ date: string; incidents: number; resolved: number }>;
  };
  units: {
    total: number;
    available: number;
    busy: number;
    performance: Array<{ unit: string; efficiency: number; incidents: number }>;
  };
  officers: {
    total: number;
    active: number;
    performance: Array<{ name: string; incidents: number; responseTime: number }>;
  };
  geographic: {
    byRegion: Array<{ region: string; incidents: number; responseTime: number }>;
    byCity: Array<{ city: string; incidents: number; resolved: number }>;
  };
}

const PoliceAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const incidentTypeColors = [
    '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6b7280'
  ];

  const priorityColors = [
    '#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669'
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch incidents data
      const { data: incidents, error: incidentsError } = await supabase
        .from('emergency_incidents')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (incidentsError) throw incidentsError;

      // Fetch units data
      const { data: units, error: unitsError } = await supabase
        .from('emergency_units')
        .select('*');

      if (unitsError) throw unitsError;

      // Fetch officers data
      const { data: officers, error: officersError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles (
            full_name,
            email
          )
        `)
        .in('role', ['police_operator', 'police_supervisor', 'police_dispatcher']);

      if (officersError) throw officersError;

      // Process analytics data
      const processedAnalytics = processAnalyticsData(incidents || [], units || [], officers || []);
      setAnalytics(processedAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (incidents: any[], units: any[], officers: any[]): AnalyticsData => {
    const resolvedIncidents = incidents.filter(i => ['resolved', 'closed'].includes(i.status));
    const pendingIncidents = incidents.filter(i => !['resolved', 'closed'].includes(i.status));

    // Calculate average response time
    const respondedIncidents = incidents.filter(i => i.responded_at && i.reported_at);
    const avgResponseTime = respondedIncidents.length > 0 
      ? respondedIncidents.reduce((sum, incident) => {
          const reportedTime = new Date(incident.reported_at).getTime();
          const respondedTime = new Date(incident.responded_at).getTime();
          return sum + (respondedTime - reportedTime);
        }, 0) / respondedIncidents.length / (1000 * 60) // Convert to minutes
      : 0;

    // Group incidents by type
    const incidentsByType = incidents.reduce((acc, incident) => {
      const type = incident.emergency_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const byType = Object.entries(incidentsByType).map(([name, value], index) => ({
      name,
      value: value as number,
      color: incidentTypeColors[index % incidentTypeColors.length]
    }));

    // Group incidents by priority
    const incidentsByPriority = incidents.reduce((acc, incident) => {
      const priority = `Priority ${incident.priority_level}`;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    const byPriority = Object.entries(incidentsByPriority).map(([name, value], index) => ({
      name,
      value: value as number,
      color: priorityColors[index % priorityColors.length]
    }));

    // Create timeline data
    const timeline = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayIncidents = incidents.filter(incident => {
        const incidentDate = new Date(incident.created_at);
        return incidentDate >= dayStart && incidentDate <= dayEnd;
      });

      const dayResolved = resolvedIncidents.filter(incident => {
        const resolvedDate = new Date(incident.resolved_at || incident.closed_at);
        return resolvedDate >= dayStart && resolvedDate <= dayEnd;
      });

      timeline.push({
        date: dayStart.toISOString().split('T')[0],
        incidents: dayIncidents.length,
        resolved: dayResolved.length
      });
    }

    // Unit performance analysis
    const unitPerformance = units.map(unit => {
      const unitIncidents = incidents.filter(incident => 
        incident.assigned_units?.includes(unit.unit_code)
      );
      const efficiency = unitIncidents.length > 0 
        ? (unitIncidents.filter(i => ['resolved', 'closed'].includes(i.status)).length / unitIncidents.length) * 100
        : 0;

      return {
        unit: unit.unit_code,
        efficiency: Math.round(efficiency),
        incidents: unitIncidents.length
      };
    });

    // Geographic analysis
    const regionStats = incidents.reduce((acc, incident) => {
      const region = incident.region || 'Unknown';
      if (!acc[region]) {
        acc[region] = { incidents: 0, totalResponseTime: 0, respondedCount: 0 };
      }
      acc[region].incidents++;
      
      if (incident.responded_at && incident.reported_at) {
        const responseTime = (new Date(incident.responded_at).getTime() - new Date(incident.reported_at).getTime()) / (1000 * 60);
        acc[region].totalResponseTime += responseTime;
        acc[region].respondedCount++;
      }
      return acc;
    }, {});

    const byRegion = Object.entries(regionStats).map(([region, stats]: [string, any]) => ({
      region,
      incidents: stats.incidents,
      responseTime: stats.respondedCount > 0 ? Math.round(stats.totalResponseTime / stats.respondedCount) : 0
    }));

    const cityStats = incidents.reduce((acc, incident) => {
      const city = incident.city || 'Unknown';
      if (!acc[city]) {
        acc[city] = { incidents: 0, resolved: 0 };
      }
      acc[city].incidents++;
      if (['resolved', 'closed'].includes(incident.status)) {
        acc[city].resolved++;
      }
      return acc;
    }, {});

    const byCity = Object.entries(cityStats).map(([city, stats]: [string, any]) => ({
      city,
      incidents: stats.incidents,
      resolved: stats.resolved
    }));

    return {
      incidents: {
        total: incidents.length,
        resolved: resolvedIncidents.length,
        pending: pendingIncidents.length,
        responseTime: Math.round(avgResponseTime),
        byType,
        byPriority,
        timeline
      },
      units: {
        total: units.length,
        available: units.filter(u => u.status === 'available').length,
        busy: units.filter(u => u.status === 'busy').length,
        performance: unitPerformance
      },
      officers: {
        total: officers.length,
        active: officers.length, // Simplified for demo
        performance: [] // Would need more complex analysis
      },
      geographic: {
        byRegion,
        byCity
      }
    };
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `police-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Police Analytics Dashboard</h2>
          <p className="text-muted-foreground">Performance metrics and operational insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshAnalytics} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.incidents.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.incidents.resolved} resolved • {analytics.incidents.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.incidents.responseTime}m</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.incidents.responseTime <= 10 ? (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              )}
              Target: 5-10 minutes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Units</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.units.available}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.units.busy} busy • {analytics.units.total} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.incidents.total > 0 
                ? Math.round((analytics.incidents.resolved / analytics.incidents.total) * 100)
                : 0}%
            </div>
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              {analytics.incidents.resolved} resolved
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Incident Timeline</CardTitle>
                <CardDescription>Daily incident reports and resolutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.incidents.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="incidents" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      name="Reported"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resolved" 
                      stackId="2" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Resolved"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incidents by Type</CardTitle>
                <CardDescription>Distribution of emergency types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.incidents.byType}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.incidents.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Incidents by Priority</CardTitle>
                <CardDescription>Priority level distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.incidents.byPriority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incident Status Overview</CardTitle>
                <CardDescription>Current status breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Incidents</span>
                  <Badge variant="outline">{analytics.incidents.total}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resolved</span>
                  <Badge className="bg-green-500">{analytics.incidents.resolved}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending</span>
                  <Badge variant="destructive">{analytics.incidents.pending}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <Badge variant="outline">
                    {analytics.incidents.total > 0 
                      ? Math.round((analytics.incidents.resolved / analytics.incidents.total) * 100)
                      : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Performance</CardTitle>
              <CardDescription>Efficiency and incident handling by unit</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.units.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="unit" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                  <Bar yAxisId="right" dataKey="incidents" fill="#10b981" name="Incidents Handled" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Incidents by Region</CardTitle>
                <CardDescription>Regional incident distribution and response times</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.geographic.byRegion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="incidents" fill="#3b82f6" name="Incidents" />
                    <Bar yAxisId="right" dataKey="responseTime" fill="#f59e0b" name="Avg Response Time (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>City Performance</CardTitle>
                <CardDescription>Incidents vs resolution by city</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.geographic.byCity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="incidents" fill="#3b82f6" name="Total Incidents" />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Critical metrics for operational excellence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.incidents.total > 0 
                        ? Math.round((analytics.incidents.resolved / analytics.incidents.total) * 100)
                        : 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.incidents.responseTime}m
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((analytics.units.available / analytics.units.total) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Unit Availability</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PoliceAnalytics;