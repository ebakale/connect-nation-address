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
  BarChart3, Activity, Target, Zap, Database
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
  lastUpdated?: string;
}

const PoliceAnalytics: React.FC = () => {
  const { t, i18n } = useTranslation('emergency');
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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      console.log('Fetching police analytics for time range:', timeRange);
      
      const { data, error } = await supabase.functions.invoke('police-analytics-api', {
        body: { timeRange }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      if (data) {
        // Translate incident types
        const translatedByType = data.incidents.byType.map((type: any) => ({
          ...type,
          name: t(`policeAnalytics.incidentTypes.${type.name}`, { defaultValue: type.name })
        }));

        // Translate priorities
        const translatedByPriority = data.incidents.byPriority.map((priority: any) => ({
          ...priority,
          name: t(`policeAnalytics.priorities.${priority.name}`, { defaultValue: priority.name })
        }));

        setAnalytics({
          ...data,
          incidents: {
            ...data.incidents,
            byType: translatedByType,
            byPriority: translatedByPriority
          }
        });
        
        setLastUpdated(data.lastUpdated || new Date().toISOString());
        toast.success(t('policeAnalytics.dataLoaded'));
      }
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

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const date = new Date(lastUpdated);
    return date.toLocaleString(i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>{t('policeAnalytics.loadingAnalytics')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" key={i18n.resolvedLanguage || i18n.language}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('policeAnalytics.title')}</h1>
          <p className="text-muted-foreground">
            {t('policeAnalytics.description')}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Database className="h-3 w-3" />
              {t('policeAnalytics.lastUpdated')}: {formatLastUpdated()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
            {t('policeAnalytics.liveData')}
          </Badge>
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
              <span className="text-amber-600">{analytics.incidents.pending}</span> {t('policeAnalytics.pending')}
              {analytics.incidents.critical > 0 && (
                <span className="text-destructive ml-2">• {analytics.incidents.critical} {t('policeAnalytics.criticalCount')}</span>
              )}
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
              {analytics.incidents.resolved} {t('policeAnalytics.resolvedOf')} {analytics.incidents.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('policeAnalytics.avgResponseTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.performance.avgResponseTime > 0 
                ? `${analytics.performance.avgResponseTime} min` 
                : t('policeAnalytics.noData')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('policeAnalytics.fromReportToResponse')}
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
        <TabsList className="flex-wrap h-auto">
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
                {analytics.incidents.timeline.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.incidents.timeline.slice(-7).map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-2 border rounded-lg">
                        <span className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex gap-4">
                          <span className="text-sm text-muted-foreground">
                            {day.incidents} {t('policeAnalytics.reported')}
                          </span>
                          <span className="text-sm text-green-600">
                            {day.resolved} {t('policeAnalytics.resolved')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('policeAnalytics.noTimelineData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('policeAnalytics.incidentsByType')}</CardTitle>
                <CardDescription>{t('policeAnalytics.distributionEmergencyTypes')}</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.incidents.byType.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.incidents.byType.map((type) => (
                      <div key={type.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="text-sm capitalize">{type.name}</span>
                        </div>
                        <span className="font-medium">{type.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">{t('policeAnalytics.noTypeData')}</p>
                )}
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
                  <div key={priority.name} className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{priority.value}</div>
                    <div className="text-sm text-muted-foreground capitalize">{priority.name}</div>
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
              {analytics.units.performance.length > 0 ? (
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
              ) : (
                <p className="text-center py-8 text-muted-foreground">{t('policeAnalytics.noUnitData')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('policeAnalytics.unitUtilization')}</CardTitle>
              <CardDescription>{t('policeAnalytics.unitUtilizationDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">{analytics.performance.unitUtilization}%</div>
                  <div className="text-muted-foreground mt-2">{t('policeAnalytics.unitsCurrentlyDeployed')}</div>
                </div>
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
                {analytics.geographic.byRegion.length > 0 ? (
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
                          <div className="text-lg font-bold">
                            {region.responseTime > 0 ? `${region.responseTime} min` : '-'}
                          </div>
                          <div className="text-sm text-muted-foreground">{t('policeAnalytics.avgResponse')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">{t('policeAnalytics.noRegionalData')}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('policeAnalytics.cityAnalysis')}</CardTitle>
                <CardDescription>{t('policeAnalytics.incidentsVsResolution')}</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.geographic.byCity.length > 0 ? (
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
                            {city.incidents > 0 ? Math.round((city.resolved / city.incidents) * 100) : 0}%
                          </div>
                          <div className="text-sm text-muted-foreground">{t('policeAnalytics.resolutionRate')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">{t('policeAnalytics.noCityData')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PoliceAnalytics;
