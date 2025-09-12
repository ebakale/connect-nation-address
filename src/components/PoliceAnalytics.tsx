import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, TrendingDown, Clock, Users, AlertTriangle,
  CheckCircle, MapPin, Calendar, Download, RefreshCw,
  BarChart3, Activity, Target, Zap
} from 'lucide-react';

interface AnalyticsData {
  incidents: {
    total: number;
    pending: number;
    resolved: number;
    critical: number;
    timeline: Array<{
      date: string;
      incidents: number;
      resolved: number;
    }>;
    byType: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    byPriority: Array<{
      name: string;
      value: number;
    }>;
  };
  units: {
    active: number;
    available: number;
    busy: number;
    performance: Array<{
      unit: string;
      efficiency: number;
      incidents: number;
    }>;
  };
  geographic: {
    byRegion: Array<{
      region: string;
      incidents: number;
      responseTime: number;
    }>;
    byCity: Array<{
      city: string;
      incidents: number;
      resolved: number;
    }>;
  };
  performance: {
    avgResponseTime: number;
    resolutionRate: number;
    unitUtilization: number;
  };
}

const PoliceAnalytics: React.FC = () => {
  const { t } = useTranslation('emergency');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    incidents: {
      total: 0,
      pending: 0,
      resolved: 0,
      critical: 0,
      timeline: [],
      byType: [],
      byPriority: []
    },
    units: {
      active: 0,
      available: 0,
      busy: 0,
      performance: []
    },
    geographic: {
      byRegion: [],
      byCity: []
    },
    performance: {
      avgResponseTime: 0,
      resolutionRate: 0,
      unitUtilization: 0
    }
  });

  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual Supabase queries
      const mockData: AnalyticsData = {
        incidents: {
          total: 145,
          pending: 23,
          resolved: 122,
          critical: 8,
          timeline: [
            { date: '2024-01-01', incidents: 12, resolved: 10 },
            { date: '2024-01-02', incidents: 15, resolved: 13 },
            { date: '2024-01-03', incidents: 8, resolved: 8 },
            { date: '2024-01-04', incidents: 20, resolved: 18 },
            { date: '2024-01-05', incidents: 11, resolved: 9 },
            { date: '2024-01-06', incidents: 17, resolved: 15 },
            { date: '2024-01-07', incidents: 14, resolved: 12 }
          ],
          byType: [
            { name: t('policeAnalytics.incidentTypes.traffic'), value: 45, color: '#3b82f6' },
            { name: t('policeAnalytics.incidentTypes.theft'), value: 32, color: '#ef4444' },
            { name: t('policeAnalytics.incidentTypes.domestic'), value: 28, color: '#f59e0b' },
            { name: t('policeAnalytics.incidentTypes.publicOrder'), value: 25, color: '#10b981' },
            { name: t('policeAnalytics.incidentTypes.other'), value: 15, color: '#8b5cf6' }
          ],
          byPriority: [
            { name: t('policeAnalytics.priorities.low'), value: 45 },
            { name: t('policeAnalytics.priorities.medium'), value: 67 },
            { name: t('policeAnalytics.priorities.high'), value: 25 },
            { name: t('policeAnalytics.priorities.critical'), value: 8 }
          ]
        },
        units: {
          active: 12,
          available: 8,
          busy: 4,
          performance: [
            { unit: 'Unit A', efficiency: 85, incidents: 23 },
            { unit: 'Unit B', efficiency: 92, incidents: 18 },
            { unit: 'Unit C', efficiency: 78, incidents: 19 },
            { unit: 'Unit D', efficiency: 88, incidents: 21 }
          ]
        },
        geographic: {
          byRegion: [
            { region: 'North', incidents: 35, responseTime: 8.5 },
            { region: 'South', incidents: 42, responseTime: 7.2 },
            { region: 'East', incidents: 38, responseTime: 9.1 },
            { region: 'West', incidents: 30, responseTime: 6.8 }
          ],
          byCity: [
            { city: 'Malabo', incidents: 85, resolved: 78 },
            { city: 'Bata', incidents: 35, resolved: 32 },
            { city: 'Ebebiyin', incidents: 15, resolved: 12 },
            { city: 'Aconibe', incidents: 10, resolved: 8 }
          ]
        },
        performance: {
          avgResponseTime: 7.9,
          resolutionRate: 84.1,
          unitUtilization: 67.5
        }
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(t('policeAnalytics.failedToLoadAnalytics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>{t('policeAnalytics.loadingAnalytics')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('policeAnalytics.title')}</h1>
          <p className="text-muted-foreground">
            {t('policeAnalytics.description')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('policeAnalytics.last7Days')}</SelectItem>
              <SelectItem value="30d">{t('policeAnalytics.last30Days')}</SelectItem>
              <SelectItem value="90d">{t('policeAnalytics.last90Days')}</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAnalytics}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('policeAnalytics.refresh')}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('policeAnalytics.totalIncidents')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.incidents.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+{analytics.incidents.pending}</span> {t('policeAnalytics.pending')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('policeAnalytics.resolutionRate')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> {t('policeAnalytics.fromLastPeriod')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('policeAnalytics.avgResponseTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.avgResponseTime} min</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.8 min</span> {t('policeAnalytics.improvement')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('policeAnalytics.activeUnits')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.units.active}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.units.available} {t('policeAnalytics.available')}, {analytics.units.busy} {t('policeAnalytics.busy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">{t('policeAnalytics.incidents')}</TabsTrigger>
          <TabsTrigger value="units">{t('policeAnalytics.units')}</TabsTrigger>
          <TabsTrigger value="geographic">{t('policeAnalytics.geographic')}</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('policeAnalytics.incidentTimeline')}</CardTitle>
                <CardDescription>{t('policeAnalytics.dailyIncidentReports')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t('policeAnalytics.chartTemporarilyDisabled')}</p>
                  <p className="text-sm">{t('policeAnalytics.analyticsDataAvailable')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('policeAnalytics.incidentsByType')}</CardTitle>
                <CardDescription>{t('policeAnalytics.distributionEmergencyTypes')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.incidents.byType.map((type) => (
                    <div key={type.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-sm">{type.name}</span>
                      </div>
                      <span className="font-medium">{type.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('policeAnalytics.priorityDistribution')}</CardTitle>
              <CardDescription>{t('policeAnalytics.priorityLevelDistribution')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics.incidents.byPriority.map((priority) => (
                  <div key={priority.name} className="text-center">
                    <div className="text-2xl font-bold">{priority.value}</div>
                    <div className="text-sm text-muted-foreground">{priority.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('policeAnalytics.unitPerformance')}</CardTitle>
              <CardDescription>{t('policeAnalytics.efficiencyIncidentHandling')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.units.performance.map((unit) => (
                  <div key={unit.unit} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{unit.unit}</div>
                      <div className="text-sm text-muted-foreground">
                        {unit.incidents} {t('policeAnalytics.incidentsHandled')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{unit.efficiency}%</div>
                      <div className="text-sm text-muted-foreground">{t('policeAnalytics.efficiency')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('policeAnalytics.regionalAnalysis')}</CardTitle>
                <CardDescription>{t('policeAnalytics.regionalIncidentDistribution')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geographic.byRegion.map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{region.region}</div>
                        <div className="text-sm text-muted-foreground">
                          {region.incidents} {t('policeAnalytics.incidents')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{region.responseTime} min</div>
                        <div className="text-sm text-muted-foreground">{t('policeAnalytics.avgResponse')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('policeAnalytics.cityAnalysis')}</CardTitle>
                <CardDescription>{t('policeAnalytics.incidentsVsResolution')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geographic.byCity.map((city) => (
                    <div key={city.city} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{city.city}</div>
                        <div className="text-sm text-muted-foreground">
                          {city.resolved}/{city.incidents} {t('policeAnalytics.resolved')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {Math.round((city.resolved / city.incidents) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">{t('policeAnalytics.resolutionRate')}</div>
                      </div>
                    </div>
                  ))}
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