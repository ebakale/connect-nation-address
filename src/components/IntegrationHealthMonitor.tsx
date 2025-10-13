import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthMetric {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  avgResponseTime: number;
  lastCheck: string;
  requestsLast24h: number;
}

export const IntegrationHealthMonitor = () => {
  const { t } = useTranslation(['dashboard', 'common']);

  // Mock data - replace with actual monitoring data
  const [healthMetrics] = useState<HealthMetric[]>([
    {
      endpoint: '/address-search-api',
      status: 'healthy',
      uptime: 99.9,
      avgResponseTime: 45,
      lastCheck: '2025-01-15 16:30',
      requestsLast24h: 12453
    },
    {
      endpoint: '/government-integration-api',
      status: 'healthy',
      uptime: 99.7,
      avgResponseTime: 120,
      lastCheck: '2025-01-15 16:29',
      requestsLast24h: 3421
    },
    {
      endpoint: '/webhook-events',
      status: 'degraded',
      uptime: 98.2,
      avgResponseTime: 230,
      lastCheck: '2025-01-15 16:28',
      requestsLast24h: 876
    }
  ]);

  // Mock performance data
  const performanceData = [
    { time: '00:00', requests: 120, responseTime: 45 },
    { time: '04:00', requests: 80, responseTime: 42 },
    { time: '08:00', requests: 350, responseTime: 48 },
    { time: '12:00', requests: 520, responseTime: 52 },
    { time: '16:00', requests: 480, responseTime: 47 },
    { time: '20:00', requests: 200, responseTime: 44 },
  ];

  const getStatusBadge = (status: HealthMetric['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {t('dashboard:healthy')}
          </Badge>
        );
      case 'degraded':
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t('dashboard:degraded')}
          </Badge>
        );
      case 'down':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t('dashboard:down')}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:overallHealth')}</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.6%</div>
            <p className="text-xs text-muted-foreground">{t('dashboard:averageUptime')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:avgResponseTime')}</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">132ms</div>
            <p className="text-xs text-muted-foreground">{t('dashboard:last24Hours')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard:totalRequests')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16,750</div>
            <p className="text-xs text-muted-foreground">{t('dashboard:last24Hours')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard:performanceMetrics')}</CardTitle>
          <CardDescription>{t('dashboard:requestsAndResponseTime24h')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="requests"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name={t('dashboard:requests')}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="responseTime"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name={t('dashboard:responseTimeMs')}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Endpoint Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('dashboard:endpointHealth')}</CardTitle>
              <CardDescription>{t('dashboard:realTimeMonitoring')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('common:buttons.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard:endpoint')}</TableHead>
                <TableHead>{t('dashboard:status')}</TableHead>
                <TableHead>{t('dashboard:uptime')}</TableHead>
                <TableHead>{t('dashboard:avgResponse')}</TableHead>
                <TableHead>{t('dashboard:requests24h')}</TableHead>
                <TableHead>{t('dashboard:lastCheck')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthMetrics.map((metric) => (
                <TableRow key={metric.endpoint}>
                  <TableCell className="font-mono text-sm">{metric.endpoint}</TableCell>
                  <TableCell>{getStatusBadge(metric.status)}</TableCell>
                  <TableCell>
                    <span className={metric.uptime > 99 ? 'text-green-600' : 'text-orange-600'}>
                      {metric.uptime}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={metric.avgResponseTime < 100 ? 'text-green-600' : 'text-orange-600'}>
                      {metric.avgResponseTime}ms
                    </span>
                  </TableCell>
                  <TableCell>{metric.requestsLast24h.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {metric.lastCheck}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};