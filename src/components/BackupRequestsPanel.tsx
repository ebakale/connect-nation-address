import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Clock, MapPin, CheckCircle, User, Calendar } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isPoliceSupervisor, isPoliceDispatcher, isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBackupRequests();
    }
  }, [user]);

  const fetchBackupRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch received backup request notifications
      const { data: notifications, error: notificationError } = await supabase
        .from('emergency_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'backup_request')
        .order('created_at', { ascending: false });

      if (notificationError) throw notificationError;
      setReceivedRequests((notifications || []).map(n => ({
        ...n,
        metadata: n.metadata as any || {}
      })));

      // For sent requests, we need to find incidents where backup was requested
      // and check if the user's unit was the requesting unit
      const { data: incidents, error: incidentError } = await supabase
        .from('emergency_incidents')
        .select('id, incident_number, backup_requested, backup_requested_at, backup_requesting_unit, incident_uac, status')
        .eq('backup_requested', true)
        .not('backup_requested_at', 'is', null)
        .order('backup_requested_at', { ascending: false });

      if (incidentError) throw incidentError;

      // Get user's units to match with requesting units
      const { data: userUnits, error: unitsError } = await supabase
        .from('emergency_unit_members')
        .select(`
          emergency_units (unit_code, unit_name)
        `)
        .eq('officer_id', user.id);

      if (unitsError) throw unitsError;

      const userUnitCodes = (userUnits || [])
        .map((m: any) => m.emergency_units?.unit_code)
        .filter(Boolean);

      // Filter incidents where user's unit requested backup
      const sentBackupRequests = (incidents || [])
        .filter(incident => userUnitCodes.includes(incident.backup_requesting_unit))
        .map(incident => ({
          id: incident.id,
          incident_id: incident.id,
          title: `🚨 BACKUP REQUESTED - ${incident.incident_number}`,
          message: `Your unit requested backup for incident ${incident.incident_number}`,
          type: 'backup_request',
          priority_level: 2,
          created_at: incident.backup_requested_at,
          read: true,
          metadata: {
            requesting_unit: incident.backup_requesting_unit,
            requesting_unit_name: incident.backup_requesting_unit,
            incident_number: incident.incident_number,
            location: incident.incident_uac || 'Location not specified',
            reason: 'Backup request sent',
            request_timestamp: incident.backup_requested_at
          }
        }));

      setSentRequests(sentBackupRequests);
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
        <Tabs defaultValue="received">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No backup requests received</p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-lg ${!request.read ? 'bg-muted/50 border-primary' : 'bg-background'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(request.priority_level)}>
                        {getPriorityIcon(request.priority_level)} P{request.priority_level}
                      </Badge>
                      {!request.read && (
                        <Badge variant="destructive" className="text-xs">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(request.created_at), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mb-2">{request.title}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Unit: {request.metadata?.requesting_unit} ({request.metadata?.requesting_unit_name})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Location: {request.metadata?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Reason: {request.metadata?.reason}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">{request.message}</p>
                    {!request.read && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => markAsRead(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No backup requests sent</p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg bg-background"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={getPriorityColor(request.priority_level)}>
                      {getPriorityIcon(request.priority_level)} P{request.priority_level}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(request.created_at), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mb-2">{request.title}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Requesting Unit: {request.metadata?.requesting_unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Location: {request.metadata?.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Backup request sent successfully
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}