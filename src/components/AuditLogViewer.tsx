import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  Search, Download, Filter, Clock, User, FileText, 
  RefreshCw, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  incident_id: string;
  user_id: string;
  action: string;
  details: any;
  timestamp: string;
  user_name?: string;
  incident_number?: string;
}

const AuditLogViewer = () => {
  const { t, i18n } = useTranslation('emergency');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7d');

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, dateFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      switch (dateFilter) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '180d':
          startDate.setDate(now.getDate() - 180);
          break;
        case '360d':
          startDate.setDate(now.getDate() - 360);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      let query = supabase
        .from('emergency_incident_logs')
        .select(`
          id,
          incident_id,
          user_id,
          action,
          details,
          timestamp
        `)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(500);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data: logsData, error: logsError } = await query;
      if (logsError) throw logsError;

      // Fetch user names and incident numbers
      const userIds = [...new Set(logsData?.map(l => l.user_id).filter(Boolean))];
      const incidentIds = [...new Set(logsData?.map(l => l.incident_id).filter(Boolean))];

      const [profilesRes, incidentsRes] = await Promise.all([
        userIds.length > 0 
          ? supabase.from('profiles').select('user_id, full_name, email').in('user_id', userIds)
          : { data: [] },
        incidentIds.length > 0
          ? supabase.from('emergency_incidents').select('id, incident_number').in('id', incidentIds)
          : { data: [] }
      ]);

      const userMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.full_name || p.email]));
      const incidentMap = new Map((incidentsRes.data || []).map(i => [i.id, i.incident_number]));

      const enrichedLogs = (logsData || []).map(log => ({
        ...log,
        user_name: userMap.get(log.user_id) || t('auditLog.unknownUser'),
        incident_number: incidentMap.get(log.incident_id) || log.incident_id?.slice(0, 8)
      }));

      setLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error(t('auditLog.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Incident #', 'Details'];
    const rows = filteredLogs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.user_name,
      log.action,
      log.incident_number,
      JSON.stringify(log.details)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success(t('auditLog.exportSuccess'));
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create') || action.includes('dispatch')) return 'default';
    if (action.includes('update') || action.includes('assign')) return 'secondary';
    if (action.includes('resolve') || action.includes('complete')) return 'outline';
    if (action.includes('emergency') || action.includes('backup')) return 'destructive';
    return 'secondary';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <CheckCircle className="h-3 w-3" />;
    if (action.includes('update')) return <RefreshCw className="h-3 w-3" />;
    if (action.includes('emergency')) return <AlertTriangle className="h-3 w-3" />;
    return <FileText className="h-3 w-3" />;
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.user_name?.toLowerCase().includes(query) ||
      log.incident_number?.toLowerCase().includes(query) ||
      JSON.stringify(log.details).toLowerCase().includes(query)
    );
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="space-y-4" key={i18n.resolvedLanguage}>
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            {t('auditLog.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('auditLog.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('auditLog.filterByAction')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('auditLog.allActions')}</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('auditLog.dateRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('auditLog.last24Hours')}</SelectItem>
                <SelectItem value="7d">{t('auditLog.last7Days')}</SelectItem>
                <SelectItem value="30d">{t('auditLog.last30Days')}</SelectItem>
                <SelectItem value="90d">{t('auditLog.last90Days')}</SelectItem>
                <SelectItem value="180d">{t('auditLog.last180Days')}</SelectItem>
                <SelectItem value="360d">{t('auditLog.last360Days')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchAuditLogs}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('auditLog.refresh')}
              </Button>
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                disabled={filteredLogs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('auditLog.export')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('auditLog.title')}</CardTitle>
              <CardDescription>
                {t('auditLog.showingLogs', { count: filteredLogs.length })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>{t('auditLog.noLogsFound')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t('auditLog.timestamp')}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('auditLog.user')}
                      </div>
                    </TableHead>
                    <TableHead>{t('auditLog.action')}</TableHead>
                    <TableHead>{t('auditLog.incidentNumber')}</TableHead>
                    <TableHead className="min-w-[200px]">{t('auditLog.details')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-medium">{log.user_name}</TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)} className="gap-1">
                          {getActionIcon(log.action)}
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.incident_number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {log.details ? (
                          <span title={JSON.stringify(log.details, null, 2)}>
                            {Object.entries(log.details).slice(0, 2).map(([k, v]) => (
                              <span key={k} className="mr-2">
                                <span className="text-foreground">{k}:</span> {String(v).slice(0, 20)}
                              </span>
                            ))}
                          </span>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogViewer;
