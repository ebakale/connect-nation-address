import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Package, Clock, Users, Download, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalOrders: number;
    deliveredCount: number;
    failedCount: number;
    pendingCount: number;
    successRate: number;
    avgDeliveryTimeHours: number;
  };
  statusDistribution: Array<{ status: string; count: number }>;
  packageTypeDistribution: Array<{ type: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  dailyTrends: Array<{ date: string; created: number; delivered: number; failed: number }>;
  agentPerformance: Array<{ agentId: string; agentName?: string; assigned: number; delivered: number; failed: number; successRate: number }>;
  timeRange: string;
  generatedAt: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)', 'hsl(262 83% 58%)'];

export const PostalReports = () => {
  const { t } = useTranslation('postal');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('postal-analytics-api', {
        body: null,
        method: 'GET',
      });

      // Use query params approach
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://calegudnfdbeznyiebbh.supabase.co'}/functions/v1/postal-analytics-api?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbGVndWRuZmRiZXpueWllYmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDg5MTUsImV4cCI6MjA3MDYyNDkxNX0.tR4hLkiukz0F94lK1A9kmYLR8ibQf9CHhYrXgvEGRBM',
          },
        }
      );

      if (!res.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(t('reports.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const exportToCSV = () => {
    if (!data) return;
    
    const rows = [
      ['Metric', 'Value'],
      ['Total Orders', data.summary.totalOrders],
      ['Delivered', data.summary.deliveredCount],
      ['Failed', data.summary.failedCount],
      ['Pending', data.summary.pendingCount],
      ['Success Rate', `${data.summary.successRate}%`],
      ['Avg Delivery Time (hours)', data.summary.avgDeliveryTimeHours],
      [''],
      ['Daily Trends'],
      ['Date', 'Created', 'Delivered', 'Failed'],
      ...data.dailyTrends.map(d => [d.date, d.created, d.delivered, d.failed]),
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postal-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('reports.exported'));
  };

  const translateStatus = (status: string) => {
    // Use snake_case keys to match postal.json status keys
    return t(`status.${status}`, { defaultValue: status });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">{t('reports.title')}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('reports.last7Days')}</SelectItem>
              <SelectItem value="30d">{t('reports.last30Days')}</SelectItem>
              <SelectItem value="90d">{t('reports.last90Days')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            {t('reports.export')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              <span className="text-sm">{t('reports.totalOrders')}</span>
            </div>
            <p className="text-2xl font-bold">{data?.summary.totalOrders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{t('reports.successRate')}</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{data?.summary.successRate || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{t('reports.avgDeliveryTime')}</span>
            </div>
            <p className="text-2xl font-bold">{data?.summary.avgDeliveryTimeHours || 0}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">{t('reports.pending')}</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{data?.summary.pendingCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Daily Trends */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{t('reports.dailyTrends')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="h-[250px] min-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.dailyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="hsl(var(--primary))" 
                    name={t('reports.created')}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="hsl(142 76% 36%)" 
                    name={t('reports.delivered')}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="failed" 
                    stroke="hsl(0 84% 60%)" 
                    name={t('reports.failed')}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{t('reports.statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="h-[250px] min-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.statusDistribution?.filter(s => s.count > 0) || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${translateStatus(status)}: ${count}`}
                    labelLine={false}
                  >
                    {data?.statusDistribution?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, translateStatus(name as string)]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Package Types */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{t('reports.packageTypes')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="h-[250px] min-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.packageTypeDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{t('reports.priorityDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="h-[250px] min-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.priorityDistribution || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="priority" type="category" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      {data?.agentPerformance && data.agentPerformance.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{t('reports.agentPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t('reports.agent')}</th>
                    <th className="text-center p-2">{t('reports.assigned')}</th>
                    <th className="text-center p-2">{t('reports.delivered')}</th>
                    <th className="text-center p-2">{t('reports.failed')}</th>
                    <th className="text-center p-2">{t('reports.successRate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.agentPerformance.map((agent, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="p-2">{agent.agentName || agent.agentId.slice(0, 8)}</td>
                      <td className="text-center p-2">{agent.assigned}</td>
                      <td className="text-center p-2 text-green-600">{agent.delivered}</td>
                      <td className="text-center p-2 text-red-600">{agent.failed}</td>
                      <td className="text-center p-2">
                        <span className={agent.successRate >= 80 ? 'text-green-600' : agent.successRate >= 50 ? 'text-amber-600' : 'text-red-600'}>
                          {agent.successRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
