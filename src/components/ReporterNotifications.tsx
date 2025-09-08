import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Bell, CheckCircle, Clock, MapPin, AlertTriangle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority_level: number;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export const ReporterNotifications = () => {
  const { user } = useAuth();
  const { t } = useTranslation('emergency');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  console.log('ReporterNotifications: User:', user?.id);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel('reporter-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'emergency_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) {
      console.log('ReporterNotifications: No user found');
      setLoading(false);
      return;
    }

    console.log('ReporterNotifications: Fetching notifications for user:', user.id);
    const { data, error } = await supabase
      .from('emergency_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('ReporterNotifications: Query result:', { data, error });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      toast.error(t('notificationErrors.failedToLoad'));
    } else {
      setNotifications((data || []) as Notification[]);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('emergency_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      toast.error(t('notificationErrors.failedToMarkAsRead'));
    } else {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('emergency_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', unreadIds);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error(t('notificationErrors.failedToMarkAsRead'));
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success(t('notificationSuccess.allMarkedAsRead'));
    }
  };

  const toggleExpanded = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'destructive';
      case 2: return 'destructive';
      case 3: return 'default';
      case 4: return 'secondary';
      case 5: return 'secondary';
      default: return 'default';
    }
  };

  const getNotificationIcon = (metadata?: Record<string, any>) => {
    const type = metadata?.notification_type;
    switch (type) {
      case 'acknowledgment':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'status_update':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolution':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  console.log('ReporterNotifications: Rendering with:', { loading, user: user?.id, notificationsCount: notifications.length });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('incidentNotifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{t('loadingNotifications')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('incidentNotifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {t('pleaseLogInToView')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('incidentNotifications')}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              {t('markAllAsRead')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('noNotificationsYet')}</p>
            <p className="text-sm">{t('willReceiveUpdates')}</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const isExpanded = expandedNotifications.has(notification.id);
            
            return (
              <Collapsible key={notification.id} open={isExpanded} onOpenChange={() => toggleExpanded(notification.id)}>
                <div className={`border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.metadata)}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant={getPriorityColor(notification.priority_level)} className="whitespace-nowrap">
                                {t('priorityLevel', { level: notification.priority_level })}
                              </Badge>
                              {!notification.read && (
                                <Badge variant="secondary">{t('new')}</Badge>
                              )}
                            </div>
                            
                            {notification.metadata?.incident_number && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {t('incidentNumber', { number: notification.metadata.incident_number })}
                                {notification.metadata.emergency_type && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{notification.metadata.emergency_type}</span>
                                  </>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <time className="text-xs text-muted-foreground">
                                {new Date(notification.created_at).toLocaleString()}
                              </time>
                              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium mb-2">{t('messageDetails')}</h5>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {notification.message}
                          </p>
                        </div>
                        
                        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">{t('additionalInformation')}</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(notification.metadata).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                  <span className="text-muted-foreground capitalize">
                                    {t(`metadataFields.${key}`, { defaultValue: key.replace(/_/g, ' ') })}
                                  </span>
                                  <span className="font-medium">
                                    {key === 'notification_type' ? t(`notificationTypes.${value}`, { defaultValue: String(value) }) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                         <div className="flex items-center justify-between pt-2">
                           <Badge variant="outline" className="text-xs">
                             {t(`notificationTypes.${notification.type}`, { defaultValue: notification.type })}
                           </Badge>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              {t('markAsRead')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};