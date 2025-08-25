import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Clock, MapPin, CheckCircle, User, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface BackupRequest {
  id: string;
  incident_id: string;
  title: string;
  message: string;
  type: string;
  priority_level: number;
  created_at: string;
  read: boolean;
  metadata: {
    requesting_unit?: string;
    requesting_unit_name?: string;
    incident_number?: string;
    location?: string;
    reason?: string;
    request_timestamp?: string;
  };
}

interface BackupRequestsPanelProps {
  className?: string;
}

export function BackupRequestsPanel({ className }: BackupRequestsPanelProps) {
  const [sentRequests, setSentRequests] = useState<BackupRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<BackupRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BackupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isPoliceSupervisor, isPoliceDispatcher, isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBackupRequests();
    }
  }, [user]);

  // Realtime updates for new notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`backup-requests-panel-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newRow: any = payload.new;
          if (newRow?.type === 'backup_request') {
            fetchBackupRequests();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergency_incidents' },
        (payload) => {
          const updatedRow: any = payload.new;
          if (updatedRow?.backup_requested) {
            fetchBackupRequests();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Realtime: listen for SENT logs created by this user
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`backup-requests-sent-logs-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_incident_logs', filter: `user_id=eq.${user.id}` },
        () => fetchBackupRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Local event bus to refresh immediately after sending from the UI
  useEffect(() => {
    const onLocalSent = () => fetchBackupRequests();
    window.addEventListener('backup-request:sent', onLocalSent as EventListener);
    return () => window.removeEventListener('backup-request:sent', onLocalSent as EventListener);
  }, []);

  const fetchBackupRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For SENT requests: Find incident logs where this user sent backup requests
      const { data: incidentLogs, error: logsError } = await supabase
        .from('emergency_incident_logs')
        .select('incident_id, details, timestamp')
        .eq('user_id', user.id)
        .eq('action', 'backup_requested')
        .order('timestamp', { ascending: false });

      if (logsError) throw logsError;

      // Get incident details for sent requests
      const sentIncidentIds = (incidentLogs || []).map((log: any) => log.incident_id);
      let sentRequestsData: BackupRequest[] = [];
      
      if (sentIncidentIds.length > 0) {
        const { data: sentIncidents, error: sentError } = await supabase
          .from('emergency_incidents')
          .select('id, incident_number, incident_uac, backup_requested_at, backup_requesting_unit')
          .in('id', sentIncidentIds);

        if (sentError) throw sentError;

        sentRequestsData = (sentIncidents || []).map((incident: any) => {
          const logEntry = incidentLogs?.find((log: any) => log.incident_id === incident.id);
          return {
            id: `sent-${incident.id}`,
            incident_id: incident.id,
            title: `🚨 BACKUP REQUESTED - ${incident.incident_number}`,
            message: `You requested backup for incident ${incident.incident_number}`,
            type: 'backup_request',
            priority_level: (logEntry?.details as any)?.priority_level || 2,
            created_at: incident.backup_requested_at || logEntry?.timestamp,
            read: true,
            metadata: {
              requesting_unit: incident.backup_requesting_unit,
              requesting_unit_name: incident.backup_requesting_unit,
              incident_number: incident.incident_number,
              location: incident.incident_uac,
              reason: (logEntry?.details as any)?.reason || 'Backup request sent',
              request_timestamp: incident.backup_requested_at || logEntry?.timestamp
            }
          };
        });
      }

      setSentRequests(sentRequestsData);

      // For RECEIVED requests: Get notifications sent to this user
      const { data: notifications, error: notificationError } = await supabase
        .from('emergency_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'backup_request')
        .order('created_at', { ascending: false });

      if (notificationError) throw notificationError;
      const received = (notifications || []).map(n => ({
        ...n,
        metadata: (n as any).metadata as any || {}
      })) as unknown as BackupRequest[];

      // Determine user's city from role metadata for fallback
      const { data: roleData, error: roleErr } = await supabase
        .from('user_roles')
        .select(`
          role,
          user_role_metadata!fk_user_role_metadata_user_role(scope_type, scope_value)
        `)
        .eq('user_id', user.id);
      if (roleErr) throw roleErr;
      const city = roleData?.flatMap((r: any) => r.user_role_metadata || [])
        .find((m: any) => m.scope_type === 'city')?.scope_value as string | undefined;

      // Fallback: show active incidents in user's city with backup requested even if no notification row exists
      let cityFallback: BackupRequest[] = [];
      if (city) {
        const { data: cityIncidents, error: cityIncErr } = await supabase
          .from('emergency_incidents')
          .select('id, incident_number, incident_uac, backup_requested, backup_requested_at, backup_requesting_unit, city')
          .eq('city', city)
          .eq('backup_requested', true)
          .order('backup_requested_at', { ascending: false });
        if (!cityIncErr) {
          cityFallback = (cityIncidents || []).map((inc: any) => ({
            id: `incident-${inc.id}`,
            incident_id: inc.id,
            title: `🚨 BACKUP REQUESTED - ${inc.incident_number}`,
            message: `Backup requested for incident ${inc.incident_number}`,
            type: 'backup_request',
            priority_level: 2,
            created_at: inc.backup_requested_at || new Date().toISOString(),
            read: true,
            metadata: {
              requesting_unit: inc.backup_requesting_unit,
              requesting_unit_name: inc.backup_requesting_unit,
              incident_number: inc.incident_number,
              location: inc.incident_uac,
              reason: 'Backup request active',
              request_timestamp: inc.backup_requested_at
            }
          }));
        }
      }

      // Merge notifications and fallback incidents (dedupe by incident_id)
      const combinedMap = new Map<string, BackupRequest>();
      [...received, ...cityFallback].forEach(item => {
        const key = item.incident_id;
        if (!combinedMap.has(key)) combinedMap.set(key, item);
      });
      setReceivedRequests(Array.from(combinedMap.values()));

    } catch (error) {
      console.error('Error fetching backup requests:', error);
      toast({
        title: "Error",
        description: "Failed to load backup requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setReceivedRequests(prev => 
        prev.map(req => 
          req.id === notificationId ? { ...req, read: true } : req
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "destructive";
      case 2: return "default";
      case 3: return "secondary";
      case 4: return "outline";
      default: return "secondary";
    }
  };

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 1: return "🔴";
      case 2: return "🟡";
      case 3: return "🟢";
      case 4: return "⚪";
      default: return "🟡";
    }
  };

  const RequestListItem = ({ request, onClick }: { request: BackupRequest; onClick: () => void }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
        !request.read ? 'bg-muted/50 border-primary' : 'bg-background'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Badge variant={getPriorityColor(request.priority_level)} className="shrink-0">
            {getPriorityIcon(request.priority_level)} P{request.priority_level}
          </Badge>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">
                {request.metadata?.incident_number || 'Unknown Incident'}
              </span>
              {!request.read && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  NEW
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {request.metadata?.location || 'Location unavailable'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {format(new Date(request.created_at), 'HH:mm')}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Backup Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Backup Requests
          </CardTitle>
          <CardDescription>
            Monitor sent and received backup requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sent">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sent">
                Sent ({sentRequests.length})
              </TabsTrigger>
              <TabsTrigger value="received">
                Received ({receivedRequests.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sent" className="space-y-3 mt-4">
              {sentRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No backup requests sent</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <RequestListItem
                    key={request.id}
                    request={request}
                    onClick={() => setSelectedRequest(request)}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="received" className="space-y-3 mt-4">
              {receivedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No backup requests received</p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <RequestListItem
                    key={request.id}
                    request={request}
                    onClick={() => {
                      setSelectedRequest(request);
                      if (!request.read && request.id.startsWith('notification-')) {
                        markAsRead(request.id);
                      }
                    }}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Backup Request Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Incident Number</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.metadata?.incident_number || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority Level</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(selectedRequest.priority_level)}>
                      {getPriorityIcon(selectedRequest.priority_level)} P{selectedRequest.priority_level}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Requesting Unit</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.metadata?.requesting_unit || 'Unknown'} - {selectedRequest.metadata?.requesting_unit_name || 'Unknown Unit'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Request Time</label>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {selectedRequest.metadata?.request_timestamp ? 
                      format(new Date(selectedRequest.metadata.request_timestamp), 'MMM dd, HH:mm') : 
                      'Unknown time'
                    }
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Location (UAC)</label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {selectedRequest.metadata?.location || 'Location unavailable'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Reason for Backup</label>
                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                  {selectedRequest.metadata?.reason || 'No reason provided'}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedRequest(null)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}