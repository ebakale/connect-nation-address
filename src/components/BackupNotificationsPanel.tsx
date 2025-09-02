import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, User, Calendar, ChevronRight, Shield, ShieldCheck, ShieldX, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface BackupNotification {
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
    requesting_user_id?: string;
  };
}

interface BackupNotificationsPanelProps {
  className?: string;
}

export function BackupNotificationsPanel({ className }: BackupNotificationsPanelProps) {
  const [receivedNotifications, setReceivedNotifications] = useState<BackupNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<BackupNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isPoliceSupervisor, isPoliceDispatcher, isAdmin } = useUserRole();
  const { toast } = useToast();

  const pageSize = 5;
  const [receivedPage, setReceivedPage] = useState(1);

  useEffect(() => {
    if (user && (isPoliceSupervisor || isPoliceDispatcher || isAdmin)) {
      fetchBackupNotifications();
    }
  }, [user, isPoliceSupervisor, isPoliceDispatcher, isAdmin]);

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('backup-notifications-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_notifications' },
        () => {
          fetchBackupNotifications();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergency_incidents' },
        () => {
          // Refresh when incidents change (e.g., units assigned), to update fulfillment status
          fetchBackupNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchBackupNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Fetch RECEIVED backup notifications (where user is the receiver)
      const { data: receivedData, error: receivedError } = await supabase
        .from('emergency_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'backup_request')
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      const receivedMap = new Map();
      const receivedItems = (receivedData || []) as BackupNotification[];
      receivedItems.forEach((item) => {
        const key = `${item.incident_id}-${item.metadata?.requesting_unit || 'unknown'}`;
        // For received requests, exclude if user is the sender
        const sentSet = new Set();
        receivedItems.forEach((sentItem) => {
          if (sentItem.metadata?.requesting_user_id === user.id) {
            const sentKey = `${sentItem.incident_id}-${sentItem.metadata?.requesting_unit || 'unknown'}`;
            sentSet.add(sentKey);
          }
        });
        if (sentSet.has(key)) return; // exclude if user is sender
        if (!receivedMap.has(key)) receivedMap.set(key, item);
      });
      const receivedArr = Array.from(receivedMap.values());

      // Enrich RECEIVED items with live incident data to compute backup status
      if (receivedArr.length > 0) {
        const receivedIds = receivedArr.map((i) => i.incident_id);
        const { data: recIncidents, error: recErr } = await supabase
          .from('emergency_incidents')
          .select('id, assigned_units, backup_requesting_unit, incident_number, incident_uac')
          .in('id', receivedIds);
        if (!recErr && recIncidents) {
          const recMap = new Map(recIncidents.map((inc: any) => [inc.id, inc]));
          const enriched = receivedArr.map((item) => {
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
            } as BackupNotification;
          });
          setReceivedNotifications(enriched);
        } else {
          setReceivedNotifications(receivedArr);
        }
      } else {
        setReceivedNotifications(receivedArr);
      }

    } catch (error) {
      console.error('Error fetching backup notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load backup notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      // Update local state
      setReceivedNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (level: number) => {
    switch (level) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      default: return 'Unknown';
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

  const NotificationListItem = ({ notification, onClick }: { notification: BackupNotification; onClick: () => void }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
        !notification.read ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getPriorityColor(notification.priority_level)}>
              {getPriorityLabel(notification.priority_level)}
            </Badge>
            {getBackupStatusBadge(notification.backup_status)}
            {!notification.read && (
              <Badge variant="outline" className="text-xs">New</Badge>
            )}
          </div>
          
          <h4 className="font-medium text-sm truncate">{notification.title}</h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {notification.metadata?.incident_number && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{notification.metadata.incident_number}</span>
              </div>
            )}
            {notification.metadata?.requesting_unit_name && (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span className="truncate">{notification.metadata.requesting_unit_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(notification.created_at), 'MMM d, HH:mm')}</span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );

  const displayedReceivedNotifications = receivedNotifications.slice(0, receivedPage * pageSize);
  const hasMoreReceived = receivedNotifications.length > receivedPage * pageSize;
  const unreadCount = receivedNotifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8 text-muted-foreground">
          Loading backup notifications...
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with unread count */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-blue-600">
            {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Received Notifications */}
      <div className="space-y-3">
        {displayedReceivedNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No backup notifications received</p>
          </div>
        ) : (
          <>
            {displayedReceivedNotifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onClick={() => {
                  setSelectedNotification(notification);
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              />
            ))}
            
            {hasMoreReceived && (
              <Button
                variant="outline"
                onClick={() => setReceivedPage(prev => prev + 1)}
                className="w-full"
              >
                Load More ({receivedNotifications.length - displayedReceivedNotifications.length} remaining)
              </Button>
            )}
          </>
        )}
      </div>

      {/* Notification Details Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-orange-600" />
              Backup Request from {selectedNotification?.metadata?.requesting_unit_name || 'Unit'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getPriorityColor(selectedNotification.priority_level)}>
                  {getPriorityLabel(selectedNotification.priority_level)} Priority
                </Badge>
                {getBackupStatusBadge(selectedNotification.backup_status)}
                {selectedNotification.read && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Read
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">{selectedNotification.title}</h3>
                <p className="text-muted-foreground">{selectedNotification.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedNotification.metadata?.incident_number && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Incident:</span>
                    <span>{selectedNotification.metadata.incident_number}</span>
                  </div>
                )}
                
                {selectedNotification.metadata?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>{selectedNotification.metadata.location}</span>
                  </div>
                )}
                
                {selectedNotification.metadata?.requesting_unit_name && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Requesting Unit:</span>
                    <span>{selectedNotification.metadata.requesting_unit_name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Received:</span>
                  <span>{format(new Date(selectedNotification.created_at), 'MMM d, yyyy HH:mm')}</span>
                </div>

                {selectedNotification.metadata?.reason && (
                  <div className="col-span-full">
                    <span className="font-medium">Reason:</span>
                    <p className="text-muted-foreground mt-1">{selectedNotification.metadata.reason}</p>
                  </div>
                )}

                {selectedNotification.backup_status !== 'pending' && selectedNotification.units_added_after_request && selectedNotification.units_added_after_request.length > 0 && (
                  <div className="col-span-full">
                    <span className="font-medium">Additional Units Assigned:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNotification.units_added_after_request.map((unit, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {unit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}