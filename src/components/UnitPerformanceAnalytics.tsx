import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, TrendingUp, Clock, Target, Award, Users,
  CalendarIcon, Download, FileText, PieChart, Activity,
  CheckCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface PerformanceData {
  unit_code: string;
  unit_name: string;
  total_incidents: number;
  resolved_incidents: number;
  average_response_time: number;
  completion_rate: number;
  member_count: number;
  period_start: string;
  period_end: string;
}

interface IncidentTrend {
  date: string;
  incidents: number;
  resolved: number;
}

interface ResponseTimeMetrics {
  average: number;
  median: number;
  fastest: number;
  slowest: number;
  by_priority: {
    priority_1: number;
    priority_2: number;
    priority_3: number;
    priority_4: number;
  };
}

export const UnitPerformanceAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('emergency');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [incidentTrends, setIncidentTrends] = useState<IncidentTrend[]>([]);
  const [responseTimeMetrics, setResponseTimeMetrics] = useState<ResponseTimeMetrics | null>(null);
  const [managedUnits, setManagedUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');

  useEffect(() => {
    if (user) {
      fetchManagedUnits();
    }
  }, [user]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchPerformanceData();
      fetchIncidentTrends();
      fetchResponseTimeMetrics();
    }
  }, [selectedUnit, dateRange]);

  const fetchManagedUnits = async () => {
    try {
      // Get units where user is assigned as a lead or if they're a supervisor
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id);

      const isSupervisor = userRoles?.some(r => ['police_supervisor', 'police_admin', 'admin'].includes(r.role));

      let query = supabase.from('emergency_units').select('*');

      if (!isSupervisor) {
        // For non-supervisors, only show units they lead
        const { data: leadUnits } = await supabase
          .from('emergency_unit_members')
          .select('unit_id')
          .eq('officer_id', user?.id)
          .eq('is_lead', true);

        const unitIds = leadUnits?.map(u => u.unit_id) || [];
        if (unitIds.length === 0) {
          setManagedUnits([]);
          return;
        }
        query = query.in('id', unitIds);
      }

      const { data, error } = await query.order('unit_code');

      if (error) throw error;
      setManagedUnits(data || []);
    } catch (error) {
      console.error('Error fetching managed units:', error);
      toast({ title: t('error'), description: t('failedToFetchUnits'), variant: 'destructive' });
    }
  };

  const fetchPerformanceData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('emergency_incidents')
        .select(`
          *,
          assigned_units
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      const { data: incidents, error } = await query;

      if (error) throw error;

      // Process data by unit
      const unitPerformance = new Map<string, any>();

      // Initialize with all managed units
      managedUnits.forEach(unit => {
        unitPerformance.set(unit.unit_code, {
          unit_code: unit.unit_code,
          unit_name: unit.unit_name,
          total_incidents: 0,
          resolved_incidents: 0,
          response_times: [],
          member_count: 0
        });
      });

      // Process incidents
      incidents?.forEach(incident => {
        if (incident.assigned_units) {
          incident.assigned_units.forEach((unitCode: string) => {
            if (selectedUnit === 'all' || selectedUnit === unitCode) {
              const unitData = unitPerformance.get(unitCode);
              if (unitData) {
                unitData.total_incidents++;
                
                if (incident.status === 'resolved') {
                  unitData.resolved_incidents++;
                }

                // Calculate response time
                if (incident.dispatched_at && incident.responded_at) {
                  const dispatched = new Date(incident.dispatched_at);
                  const responded = new Date(incident.responded_at);
                  const responseTime = (responded.getTime() - dispatched.getTime()) / (1000 * 60); // minutes
                  unitData.response_times.push(responseTime);
                }
              }
            }
          });
        }
      });

      // Get member counts
      for (const [unitCode, unitData] of unitPerformance) {
        const unit = managedUnits.find(u => u.unit_code === unitCode);
        if (unit) {
          const { data: members } = await supabase
            .from('emergency_unit_members')
            .select('id')
            .eq('unit_id', unit.id);
          
          unitData.member_count = members?.length || 0;
        }
      }

      // Convert to final format
      const performanceArray = Array.from(unitPerformance.values()).map(unit => ({
        unit_code: unit.unit_code,
        unit_name: unit.unit_name,
        total_incidents: unit.total_incidents,
        resolved_incidents: unit.resolved_incidents,
        average_response_time: unit.response_times.length > 0 
          ? unit.response_times.reduce((sum: number, time: number) => sum + time, 0) / unit.response_times.length 
          : 0,
        completion_rate: unit.total_incidents > 0 
          ? (unit.resolved_incidents / unit.total_incidents) * 100 
          : 0,
        member_count: unit.member_count,
        period_start: dateRange.from!.toISOString(),
        period_end: dateRange.to!.toISOString()
      }));

      setPerformanceData(performanceArray);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({ title: t('error'), description: t('failedToFetchPerformanceData'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIncidentTrends = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      let query = supabase
        .from('emergency_incidents')
        .select('created_at, status, assigned_units')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      const { data: incidents, error } = await query;

      if (error) throw error;

      // Group by date
      const trendMap = new Map<string, { incidents: number; resolved: number }>();
      
      incidents?.forEach(incident => {
        if (incident.assigned_units) {
          const shouldInclude = selectedUnit === 'all' || incident.assigned_units.includes(selectedUnit);
          
          if (shouldInclude) {
            const date = new Date(incident.created_at).toISOString().split('T')[0];
            const current = trendMap.get(date) || { incidents: 0, resolved: 0 };
            
            current.incidents++;
            if (incident.status === 'resolved') {
              current.resolved++;
            }
            
            trendMap.set(date, current);
          }
        }
      });

      const trends = Array.from(trendMap.entries()).map(([date, data]) => ({
        date,
        incidents: data.incidents,
        resolved: data.resolved
      })).sort((a, b) => a.date.localeCompare(b.date));

      setIncidentTrends(trends);
    } catch (error) {
      console.error('Error fetching incident trends:', error);
    }
  };

  const fetchResponseTimeMetrics = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      let query = supabase
        .from('emergency_incidents')
        .select('dispatched_at, responded_at, priority_level, assigned_units')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .not('dispatched_at', 'is', null)
        .not('responded_at', 'is', null);

      const { data: incidents, error } = await query;

      if (error) throw error;

      const responseTimes: number[] = [];
      const priorityTimes: { [key: number]: number[] } = { 1: [], 2: [], 3: [], 4: [] };

      incidents?.forEach(incident => {
        if (incident.assigned_units) {
          const shouldInclude = selectedUnit === 'all' || incident.assigned_units.includes(selectedUnit);
          
          if (shouldInclude && incident.dispatched_at && incident.responded_at) {
            const dispatched = new Date(incident.dispatched_at);
            const responded = new Date(incident.responded_at);
            const responseTime = (responded.getTime() - dispatched.getTime()) / (1000 * 60); // minutes
            
            responseTimes.push(responseTime);
            priorityTimes[incident.priority_level]?.push(responseTime);
          }
        }
      });

      if (responseTimes.length > 0) {
        const sortedTimes = [...responseTimes].sort((a, b) => a - b);
        const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        const median = sortedTimes[Math.floor(sortedTimes.length / 2)];

        setResponseTimeMetrics({
          average,
          median,
          fastest: sortedTimes[0],
          slowest: sortedTimes[sortedTimes.length - 1],
          by_priority: {
            priority_1: priorityTimes[1].length > 0 
              ? priorityTimes[1].reduce((sum, time) => sum + time, 0) / priorityTimes[1].length 
              : 0,
            priority_2: priorityTimes[2].length > 0 
              ? priorityTimes[2].reduce((sum, time) => sum + time, 0) / priorityTimes[2].length 
              : 0,
            priority_3: priorityTimes[3].length > 0 
              ? priorityTimes[3].reduce((sum, time) => sum + time, 0) / priorityTimes[3].length 
              : 0,
            priority_4: priorityTimes[4].length > 0 
              ? priorityTimes[4].reduce((sum, time) => sum + time, 0) / priorityTimes[4].length 
              : 0,
          }
        });
      }
    } catch (error) {
      console.error('Error fetching response time metrics:', error);
    }
  };

  const exportReport = async () => {
    try {
      const reportData = {
        units: performanceData,
        trends: incidentTrends,
        responseMetrics: responseTimeMetrics,
        dateRange,
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unit-performance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: t('success'), description: t('performanceReportExportedSuccessfully') });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({ title: t('error'), description: t('failedToExportReport'), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{t('unitPerformanceAnalytics')}</h1>
        <p className="text-muted-foreground">{t('analyzeUnitPerformanceOperationalMetrics')}</p>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={exportReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t('exportReport')}
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium">{t('unit')}</label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allUnits')}</SelectItem>
                  {managedUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.unit_code}>
                      {unit.unit_code} - {unit.unit_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t('dateRange')}</label>
              <div className="text-sm text-muted-foreground">
                {dateRange?.from?.toLocaleDateString()} - {dateRange?.to?.toLocaleDateString()}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('reportType')}</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">{t('summary')}</SelectItem>
                  <SelectItem value="detailed">{t('detailed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalIncidents')}</p>
                <p className="text-2xl font-bold">
                  {performanceData.reduce((sum, unit) => sum + unit.total_incidents, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('avgResponseTime')}</p>
                <p className="text-2xl font-bold">
                  {Math.round(responseTimeMetrics?.average || 0)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('completionRate')}</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    performanceData.reduce((sum, unit) => sum + unit.completion_rate, 0) / 
                    (performanceData.length || 1)
                  )}%
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('activeUnits')}</p>
                <p className="text-2xl font-bold">{performanceData.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('unitPerformanceBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:hidden">
            {/* Mobile Card Layout */}
            {performanceData.map(unit => (
              <div key={unit.unit_code} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{unit.unit_code}</p>
                    <p className="text-sm text-muted-foreground">{unit.unit_name}</p>
                  </div>
                  <Badge variant={
                    unit.completion_rate >= 90 ? 'default' :
                    unit.completion_rate >= 70 ? 'secondary' : 'destructive'
                  }>
                    {unit.completion_rate >= 90 ? t('excellent') :
                     unit.completion_rate >= 70 ? t('good') : t('needsImprovement')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('members')}:</span>
                    <span className="ml-1 font-medium">{unit.member_count}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('response')}:</span>
                    <span className="ml-1 font-medium">{Math.round(unit.average_response_time)}m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('incidents')}:</span>
                    <span className="ml-1 font-medium">{unit.total_incidents}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('resolved')}:</span>
                    <span className="ml-1 font-medium">{unit.resolved_incidents}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{t('completionRate')}</span>
                    <span className="font-medium">{Math.round(unit.completion_rate)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${unit.completion_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 min-w-[80px]">{t('unit')}</th>
                  <th className="text-left p-2 min-w-[70px]">{t('members')}</th>
                  <th className="text-left p-2 min-w-[80px]">{t('incidents')}</th>
                  <th className="text-left p-2 min-w-[70px]">{t('resolved')}</th>
                  <th className="text-left p-2 min-w-[100px]">{t('ratePercent')}</th>
                  <th className="text-left p-2 min-w-[80px]">{t('response')}</th>
                  <th className="text-left p-2 min-w-[90px]">{t('score')}</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map(unit => (
                  <tr key={unit.unit_code} className="border-b">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{unit.unit_code}</p>
                        <p className="text-sm text-muted-foreground">{unit.unit_name}</p>
                      </div>
                    </td>
                    <td className="p-2">{unit.member_count}</td>
                    <td className="p-2">{unit.total_incidents}</td>
                    <td className="p-2">{unit.resolved_incidents}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span>{Math.round(unit.completion_rate)}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${unit.completion_rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-2">{Math.round(unit.average_response_time)}m</td>
                    <td className="p-2">
                      <Badge variant={
                        unit.completion_rate >= 90 ? 'default' :
                        unit.completion_rate >= 70 ? 'secondary' : 'destructive'
                      }>
                        {unit.completion_rate >= 90 ? t('excellent') :
                         unit.completion_rate >= 70 ? t('good') : t('needsImprovement')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Response Time Analysis */}
      {responseTimeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>{t('responseTimeAnalysis')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">{t('overallMetrics')}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t('average')}:</span>
                    <span className="font-medium">{Math.round(responseTimeMetrics.average)} {t('minutes')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('median')}:</span>
                    <span className="font-medium">{Math.round(responseTimeMetrics.median)} {t('minutes')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('fastest')}:</span>
                    <span className="font-medium text-green-600">{Math.round(responseTimeMetrics.fastest)} {t('minutes')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('slowest')}:</span>
                    <span className="font-medium text-red-600">{Math.round(responseTimeMetrics.slowest)} {t('minutes')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">{t('byPriorityLevel')}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Badge className="bg-red-500">P1</Badge>
                      {t('critical')}
                    </span>
                    <span className="font-medium">{Math.round(responseTimeMetrics.by_priority.priority_1)}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Badge className="bg-orange-500">P2</Badge>
                      {t('high')}
                    </span>
                    <span className="font-medium">{Math.round(responseTimeMetrics.by_priority.priority_2)}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Badge className="bg-yellow-500">P3</Badge>
                      {t('medium')}
                    </span>
                    <span className="font-medium">{Math.round(responseTimeMetrics.by_priority.priority_3)}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Badge className="bg-blue-500">P4</Badge>
                      {t('low')}
                    </span>
                    <span className="font-medium">{Math.round(responseTimeMetrics.by_priority.priority_4)}m</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incident Trends */}
      <Card>
        <CardHeader>
          <CardTitle>{t('incidentTrends')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidentTrends.slice(-14).map(trend => (
              <div key={trend.date} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded gap-2">
                <div>
                  <p className="font-medium">{new Date(trend.date).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">{trend.incidents} {t('incidents')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{trend.resolved} {t('resolved')}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {trend.incidents > 0 ? Math.round((trend.resolved / trend.incidents) * 100) : 0}% {t('resolved')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>{t('loadingPerformanceData')}</span>
        </div>
      )}
    </div>
  );
};