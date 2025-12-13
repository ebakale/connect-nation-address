import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Download, Calendar, User, Activity, 
  Shield, Database, Clock, Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AuditEvent {
  id: string;
  citizen_address_id?: string;
  person_id: string;
  event_type: string;
  actor_id?: string;
  payload: any;
  at: string;
  // Related data
  uac?: string;
  actor_name?: string;
}

interface VerificationAudit {
  id: string;
  verification_id: string;
  performed_by: string;
  action: string;
  verification_details: any;
  timestamp: string;
  document_hash: string;
  verification_method?: string;
  notes?: string;
  // Related data
  performer_name?: string;
}

interface AuditStats {
  total_events: number;
  verification_events: number;
  status_changes: number;
  auto_verifications: number;
  manual_reviews: number;
}

export function CARAuditDocumentation() {
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'address']);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [verificationAudits, setVerificationAudits] = useState<VerificationAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [stats, setStats] = useState<AuditStats>({
    total_events: 0,
    verification_events: 0,
    status_changes: 0,
    auto_verifications: 0,
    manual_reviews: 0
  });

  useEffect(() => {
    fetchAuditEvents();
    fetchVerificationAudits();
    fetchStats();
  }, [dateFrom, dateTo, eventTypeFilter, actorFilter]);

  const fetchAuditEvents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('citizen_address_event')
        .select('*')
        .order('at', { ascending: false })
        .limit(100);

      if (dateFrom) {
        query = query.gte('at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('at', dateTo);
      }
      if (eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Use data as-is since we're not joining for now
      const flattenedData = data.map(event => ({
        ...event,
        uac: 'N/A', // Will be populated when joins are available
        actor_name: event.actor_id ? 'User' : 'System'
      }));

      setAuditEvents(flattenedData || []);
    } catch (error) {
      console.error('Error fetching audit events:', error);
      toast({
        title: t('dashboard:error'),
        description: 'Failed to load audit events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationAudits = async () => {
    try {
      let query = supabase
        .from('document_verification_audit')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (dateFrom) {
        query = query.gte('timestamp', dateFrom);
      }
      if (dateTo) {
        query = query.lte('timestamp', dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Use data as-is since we're not joining for now
      const flattenedData = data.map(audit => ({
        ...audit,
        performer_name: 'User' // Will be populated when joins are available
      }));

      setVerificationAudits(flattenedData || []);
    } catch (error) {
      console.error('Error fetching verification audits:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get citizen address events
      const { data: events, error: eventsError } = await supabase
        .from('citizen_address_event')
        .select('event_type');

      if (eventsError) throw eventsError;

      // Get verification audits
      const { data: audits, error: auditsError } = await supabase
        .from('document_verification_audit')
        .select('action');

      if (auditsError) throw auditsError;

      const newStats = {
        total_events: events.length,
        verification_events: audits.length,
        status_changes: events.filter(e => e.event_type === 'status_change' || e.event_type === 'VERIFY' || e.event_type === 'REJECT').length,
        auto_verifications: events.filter(e => e.event_type === 'AUTO_VERIFY').length,
        manual_reviews: events.filter(e => e.event_type === 'VERIFY' || e.event_type === 'REJECT').length
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const exportAuditReport = async () => {
    try {
      toast({
        title: 'Generating Report',
        description: 'Creating audit report for download...',
      });

      // Build CSV content from audit events
      const csvHeaders = ['Event ID', 'Event Type', 'Person ID', 'Actor', 'Timestamp', 'UAC', 'Payload'];
      const csvRows = auditEvents.map(event => [
        event.id,
        event.event_type,
        event.person_id,
        event.actor_name || 'System',
        new Date(event.at).toISOString(),
        event.uac || 'N/A',
        JSON.stringify(event.payload || {})
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `car-audit-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report Generated',
        description: 'Audit report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate audit report',
        variant: 'destructive',
      });
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'ADD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'VERIFY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'REJECT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'AUTO_VERIFY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'status_change': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'ADD': return <Database className="h-4 w-4" />;
      case 'VERIFY': return <Shield className="h-4 w-4" />;
      case 'REJECT': return <Shield className="h-4 w-4" />;
      case 'AUTO_VERIFY': return <Activity className="h-4 w-4" />;
      case 'status_change': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const StatCard = ({ title, value, color, icon: Icon }: { 
    title: string; 
    value: number; 
    color: string; 
    icon: React.ComponentType<any>;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Events" value={stats.total_events} color="text-blue-600" icon={FileText} />
        <StatCard title="Verification Events" value={stats.verification_events} color="text-green-600" icon={Shield} />
        <StatCard title="Status Changes" value={stats.status_changes} color="text-yellow-600" icon={Activity} />
        <StatCard title="Auto Verifications" value={stats.auto_verifications} color="text-purple-600" icon={Activity} />
        <StatCard title="Manual Reviews" value={stats.manual_reviews} color="text-orange-600" icon={User} />
      </div>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Audit Trail Filters</CardTitle>
              <CardDescription>Filter and export audit documentation</CardDescription>
            </div>
            <Button onClick={exportAuditReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="ADD">Address Added</SelectItem>
                  <SelectItem value="VERIFY">Manual Verification</SelectItem>
                  <SelectItem value="REJECT">Rejection</SelectItem>
                  <SelectItem value="AUTO_VERIFY">Auto Verification</SelectItem>
                  <SelectItem value="status_change">Status Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="actor">Actor</Label>
              <Select value={actorFilter} onValueChange={setActorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actors</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="address-events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="address-events">Address Events</TabsTrigger>
          <TabsTrigger value="verification-audits">Verification Audits</TabsTrigger>
          <TabsTrigger value="compliance-reports">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="address-events" className="space-y-4">
          <div className="space-y-4">
            {auditEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={getEventTypeColor(event.event_type)}>
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(event.event_type)}
                            {event.event_type.replace('_', ' ')}
                          </div>
                        </Badge>
                        {event.uac && (
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {event.uac}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Actor:</span> 
                          <br />{event.actor_name || 'System'}
                        </div>
                        <div>
                          <span className="font-medium">Timestamp:</span> 
                          <br />{new Date(event.at).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Person ID:</span> 
                          <br />{event.person_id}
                        </div>
                        <div>
                          <span className="font-medium">Event ID:</span> 
                          <br />{event.id.slice(0, 8)}...
                        </div>
                      </div>

                      {event.payload && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Event Details:</span>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {auditEvents.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No audit events found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="verification-audits" className="space-y-4">
          <div className="space-y-4">
            {verificationAudits.map((audit) => (
              <Card key={audit.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          <Shield className="h-3 w-3 mr-1" />
                          {audit.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {audit.verification_method || 'Standard'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Performed By:</span> 
                          <br />{audit.performer_name}
                        </div>
                        <div>
                          <span className="font-medium">Timestamp:</span> 
                          <br />{new Date(audit.timestamp).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Verification ID:</span> 
                          <br />{audit.verification_id?.slice(0, 8)}...
                        </div>
                        <div>
                          <span className="font-medium">Document Hash:</span> 
                          <br />{audit.document_hash?.slice(0, 8)}...
                        </div>
                      </div>

                      {audit.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Notes:</span> {audit.notes}
                        </div>
                      )}

                      {audit.verification_details && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Verification Details:</span>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(audit.verification_details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {verificationAudits.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No verification audits found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="compliance-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>
                Generate comprehensive compliance and audit reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Monthly Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Quarterly Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Database className="h-6 w-6 mb-2" />
                  Annual Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}