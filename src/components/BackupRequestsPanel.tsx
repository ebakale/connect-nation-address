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
import { AlertTriangle, Clock, MapPin, CheckCircle, User, Calendar, ChevronRight, Shield, ShieldCheck, ShieldX } from "lucide-react";
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
  backup_status?: 'pending' | 'fulfilled' | 'partially_fulfilled';
  assigned_units?: string[];
  units_added_after_request?: string[];
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
  const [sentPage, setSentPage] = useState(1);
  const [receivedPage, setReceivedPage] = useState(1);
  const { user } = useAuth();
  const { isPoliceSupervisor, isPoliceDispatcher, isAdmin } = useUserRole();
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 5;

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
        () => {
          // Refresh when incidents change (e.g., units assigned), to update fulfillment status
          fetchBackupRequests();
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
          .select('id, incident_number, incident_uac, backup_requested_at, backup_requesting_unit, assigned_units')
          .in('id', sentIncidentIds);

        if (sentError) throw sentError;

        sentRequestsData = (sentIncidents || []).map((incident: any) => {
          const logEntry = incidentLogs?.find((log: any) => log.incident_id === incident.id);
          const currentUnits = incident.assigned_units || [];
          const originalUnits = (logEntry?.details as any)?.original_units;
          
          // Determine backup status
          let backupStatus: 'pending' | 'fulfilled' | 'partially_fulfilled' = 'pending';
          let unitsAddedAfterRequest: string[] = [];
          
          if (originalUnits) {
            // New logic: use stored original units
            unitsAddedAfterRequest = currentUnits.filter((unit: string) => !originalUnits.includes(unit));
          } else {
            // Fallback logic for legacy requests: if more than just the requesting unit is assigned, consider it fulfilled
            const requestingUnit = incident.backup_requesting_unit;
            if (currentUnits.length > 1 && currentUnits.includes(requestingUnit)) {
              unitsAddedAfterRequest = currentUnits.filter((unit: string) => unit !== requestingUnit);
            }
          }
          
          if (unitsAddedAfterRequest.length > 0) {
            backupStatus = unitsAddedAfterRequest.length >= 2 ? 'fulfilled' : 'partially_fulfilled';
          }

          return {
            id: `sent-${incident.id}`,
            incident_id: incident.id,
            title: `🚨 BACKUP REQUESTED - ${incident.incident_number}`,
            message: `You requested backup for incident ${incident.incident_number}`,
            type: 'backup_request',
            priority_level: (logEntry?.details as any)?.priority_level || 2,
            created_at: incident.backup_requested_at || logEntry?.timestamp,
            read: true,
            backup_status: backupStatus,
            assigned_units: currentUnits,
            units_added_after_request: unitsAddedAfterRequest,
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
      const received = (notifications || [])
        .filter((n: any) => (n?.metadata?.requested_by_user_id ?? null) !== user.id)
        .map(n => ({
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

      // Merge notifications and fallback incidents (dedupe by incident_id) and exclude items the user sent (already in SENT)
      const sentSet = new Set(sentIncidentIds);
      const combinedMap = new Map<string, BackupRequest>();
      [...received, ...cityFallback].forEach(item => {
        const key = item.incident_id;
        if (sentSet.has(key)) return; // exclude if user is sender
        if (!combinedMap.has(key)) combinedMap.set(key, item);
      });
      const combinedArr = Array.from(combinedMap.values());

      // Enrich RECEIVED items with live incident data to compute backup status
      if (combinedArr.length > 0) {
        const receivedIds = combinedArr.map((i) => i.incident_id);
        const { data: recIncidents, error: recErr } = await supabase
          .from('emergency_incidents')
          .select('id, assigned_units, backup_requesting_unit, incident_number, incident_uac')
          .in('id', receivedIds);
        if (!recErr && recIncidents) {
          const recMap = new Map(recIncidents.map((inc: any) => [inc.id, inc]));
          const enriched = combinedArr.map((item) => {
            const inc = recMap.get(item.incident_id);
            if (!inc) return item;
            const currentUnits: string[] = inc.assigned_units || [];
            const requestingUnit: string | undefined = item.metadata?.requesting_unit || inc.backup_requesting_unit;

            let unitsAddedAfterRequest: string[] = [];
            if (requestingUnit && currentUnits.length > 1 && currentUnits.includes(requestingUnit)) {
              unitsAddedAfterRequest = currentUnits.filter((u: string) => u !== requestingUnit);
            }

            let backupStatus: 'pending' | 'fulfilled' | 'partially_fulfilled' = 'pending';
            if (unitsAddedAfterRequest.length > 0) {
              backupStatus = unitsAddedAfterRequest.length >= 2 ? 'fulfilled' : 'partially_fulfilled';
            }

            return {
              ...item,
              assigned_units: currentUnits,
              units_added_after_request: unitsAddedAfterRequest,
              backup_status: backupStatus,
              metadata: {
                ...item.metadata,
                incident_number: inc.incident_number || item.metadata?.incident_number,
                location: inc.incident_uac || item.metadata?.location,
              }
            } as BackupRequest;
          });
          setReceivedRequests(enriched);
        } else {
          setReceivedRequests(combinedArr);
        }
      } else {
        setReceivedRequests(combinedArr);
      }

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

  const getBackupStatusBadge = (status?: string) => {
    switch (status) {
      case 'fulfilled':
        return <Badge variant="secondary"><ShieldCheck className="h-3 w-3 mr-1" />Fulfilled</Badge>;
      case 'partially_fulfilled':
        return <Badge variant="default"><Shield className="h-3 w-3 mr-1" />Partial</Badge>;
      case 'pending':
        return <Badge variant="outline"><ShieldX className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return null;
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
              {request.backup_status && getBackupStatusBadge(request.backup_status)}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {request.metadata?.location || 'Location unavailable'}
            </p>
            {request.units_added_after_request && request.units_added_after_request.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                +{request.units_added_after_request.length} units added
              </p>
            )}
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
                <>
                  {sentRequests
                    .slice((sentPage - 1) * ITEMS_PER_PAGE, sentPage * ITEMS_PER_PAGE)
                    .map((request) => (
                      <RequestListItem
                        key={request.id}
                        request={request}
                        onClick={() => setSelectedRequest(request)}
                      />
                    ))}
                  
                  {Math.ceil(sentRequests.length / ITEMS_PER_PAGE) > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSentPage(prev => Math.max(1, prev - 1))}
                        disabled={sentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-2 py-1">
                        Page {sentPage} of {Math.ceil(sentRequests.length / ITEMS_PER_PAGE)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSentPage(prev => Math.min(Math.ceil(sentRequests.length / ITEMS_PER_PAGE), prev + 1))}
                        disabled={sentPage === Math.ceil(sentRequests.length / ITEMS_PER_PAGE)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="received" className="space-y-3 mt-4">
              {receivedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No backup requests received</p>
                </div>
              ) : (
                <>
                  {receivedRequests
                    .slice((receivedPage - 1) * ITEMS_PER_PAGE, receivedPage * ITEMS_PER_PAGE)
                    .map((request) => (
                      <RequestListItem
                        key={request.id}
                        request={request}
                        onClick={() => {
                          setSelectedRequest(request);
                          // Mark as read if it's an unread notification (not a fallback incident)
                          if (!request.read && !request.id.startsWith('incident-')) {
                            markAsRead(request.id);
                          }
                        }}
                      />
                    ))}
                  
                  {Math.ceil(receivedRequests.length / ITEMS_PER_PAGE) > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReceivedPage(prev => Math.max(1, prev - 1))}
                        disabled={receivedPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-2 py-1">
                        Page {receivedPage} of {Math.ceil(receivedRequests.length / ITEMS_PER_PAGE)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReceivedPage(prev => Math.min(Math.ceil(receivedRequests.length / ITEMS_PER_PAGE), prev + 1))}
                        disabled={receivedPage === Math.ceil(receivedRequests.length / ITEMS_PER_PAGE)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
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

              {selectedRequest.backup_status && (
                <div>
                  <label className="text-sm font-medium">Backup Status</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      {getBackupStatusBadge(selectedRequest.backup_status)}
                    </div>
                    
                    {selectedRequest.assigned_units && selectedRequest.assigned_units.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Currently Assigned Units: </span>
                        {selectedRequest.assigned_units.join(', ')}
                      </div>
                    )}
                    
                    {selectedRequest.units_added_after_request && selectedRequest.units_added_after_request.length > 0 && (
                      <div className="text-sm text-green-600">
                        <span className="font-medium">Additional Units Added: </span>
                        {selectedRequest.units_added_after_request.join(', ')}
                      </div>
                    )}
                    
                    {selectedRequest.backup_status === 'pending' && (
                      <p className="text-sm text-orange-600">
                        No additional units have been assigned yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

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