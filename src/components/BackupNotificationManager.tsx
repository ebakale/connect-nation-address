import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, Users, MapPin, Clock, AlertTriangle, 
  Check, X, ExternalLink, UserPlus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackupNotification {
  id: string;
  title: string;
  message: string;
  priority_level: number;
  incident_id: string;
  created_at: string;
  read: boolean;
  metadata: {
    requesting_unit?: string;
    requesting_unit_name?: string;
    incident_number?: string;
    location?: string;
    reason?: string;
    request_timestamp?: string;
  } | null;
}

interface BackupNotificationManagerProps {
  className?: string;
}

export const BackupNotificationManager: React.FC<BackupNotificationManagerProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('emergency');
  const [notifications, setNotifications] = useState<BackupNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<BackupNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchBackupNotifications();
  }, [user]);

  useEffect(() => {
    // Set up real-time subscription for new backup requests
    const channel = supabase
      .channel('backup-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_notifications',
          filter: `type=eq.backup_request`
        },
        () => {
          fetchBackupNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBackupNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('emergency_notifications')
        .select('*')
        .eq('type', 'backup_request')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications((data || []) as BackupNotification[]);
    } catch (error) {
      console.error('Error fetching backup notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const respondToBackupRequest = async (notification: BackupNotification, response: 'acknowledge' | 'assign_units') => {
    try {
      // Mark notification as read
      await markAsRead(notification.id);

      // Log the response
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: notification.incident_id,
          user_id: user.id,
          action: `backup_request_${response}`,
          details: {
            notification_id: notification.id,
            responding_supervisor: user.id,
            response_type: response,
            original_request: notification.metadata,
            timestamp: new Date().toISOString()
          }
        });

      if (response === 'acknowledge') {
        toast({
          title: t('backupRequests.ackToastTitle'),
          description: t('backupRequests.ackToastDescription', { incident: notification.metadata?.incident_number || t('unknown') })
        });
      } else {
        toast({
          title: t('backupRequests.assignToastTitle'),
          description: t('backupRequests.assignToastDescription', { incident: notification.metadata?.incident_number || t('unknown') })
        });
      }

      setSelectedNotification(null);
    } catch (error) {
      console.error('Error responding to backup request:', error);
      toast({
        title: t('error'),
        description: t('backupRequests.failedToRespond'),
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">{t('loadingNotifications')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Backup Requests
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No backup requests</p>
            </div>
          ) : (
            <>
              {notifications
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      setSelectedNotification(notification);
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority_level)}`} />
                        <span className="font-medium text-sm">
                          {notification.metadata?.incident_number || 'Unknown Incident'}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Unit {notification.metadata?.requesting_unit || 'Unknown'} requesting backup
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {notification.metadata?.location || 'Location unavailable'}
                    </div>
                  </div>
                ))}
              
              {Math.ceil(notifications.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2 py-1">
                    Page {currentPage} of {Math.ceil(notifications.length / ITEMS_PER_PAGE)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(notifications.length / ITEMS_PER_PAGE), prev + 1))}
                    disabled={currentPage === Math.ceil(notifications.length / ITEMS_PER_PAGE)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Backup Request Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Incident Number</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedNotification.metadata?.incident_number || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority Level</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedNotification.priority_level)}`} />
                    <span className="text-sm">{selectedNotification.priority_level}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Requesting Unit</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedNotification.metadata?.requesting_unit || 'Unknown'} - {selectedNotification.metadata?.requesting_unit_name || 'Unknown Unit'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Request Time</label>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {selectedNotification.metadata?.request_timestamp ? 
                      new Date(selectedNotification.metadata.request_timestamp).toLocaleString() : 
                      'Unknown time'
                    }
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {selectedNotification.metadata?.location || 'Location unavailable'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Reason for Backup</label>
                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                  {selectedNotification.metadata?.reason || 'No reason provided'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => respondToBackupRequest(selectedNotification, 'acknowledge')}
                  variant="outline"
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Acknowledge
                </Button>
                <Button
                  onClick={() => respondToBackupRequest(selectedNotification, 'assign_units')}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Units
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};