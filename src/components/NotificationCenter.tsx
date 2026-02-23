import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck, Package, MapPin, Shield, AlertTriangle, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  priority_level: number;
  metadata?: any;
}

type NotificationCategory = 'all' | 'address' | 'verification' | 'delivery' | 'emergency';

const categoryConfig: Record<string, { icon: React.ComponentType<any>; label: string; types: string[] }> = {
  address: { icon: MapPin, label: 'Address Updates', types: ['address_update', 'address_approved', 'address_rejected', 'request_status'] },
  verification: { icon: Shield, label: 'Verification', types: ['verification_update', 'verification_approved', 'verification_rejected', 'residency_update'] },
  delivery: { icon: Package, label: 'Deliveries', types: ['delivery_update', 'delivery_status', 'pickup_ready'] },
  emergency: { icon: AlertTriangle, label: 'Emergency', types: ['emergency', 'backup_request', 'backup_response', 'incident_update'] },
};

function getCategoryForType(type: string): string {
  for (const [cat, config] of Object.entries(categoryConfig)) {
    if (config.types.includes(type)) return cat;
  }
  return 'address'; // default
}

function getNotificationIcon(type: string) {
  const cat = getCategoryForType(type);
  const config = categoryConfig[cat];
  return config?.icon || FileText;
}

export function NotificationCenter() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('emergency_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from('emergency_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => categoryConfig[activeCategory]?.types.includes(n.type));

  const categories: { key: NotificationCategory; label: string }[] = [
    { key: 'all', label: t('allNotifications', 'All') },
    { key: 'address', label: t('addressUpdates', 'Addresses') },
    { key: 'verification', label: t('verification', 'Verification') },
    { key: 'delivery', label: t('deliveries', 'Deliveries') },
    { key: 'emergency', label: t('emergency', 'Emergency') },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label={t('notifications', 'Notifications')}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">{t('notifications', 'Notifications')}</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                <CheckCheck className="h-3 w-3 mr-1" />
                {t('markAllRead', 'Mark all read')}
              </Button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto">
          {categories.map(cat => (
            <Button
              key={cat.key}
              variant={activeCategory === cat.key ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
              {cat.key !== 'all' && (
                (() => {
                  const count = notifications.filter(n => !n.read && categoryConfig[cat.key]?.types.includes(n.type)).length;
                  return count > 0 ? <Badge variant="destructive" className="ml-1 h-4 min-w-[16px] text-[10px] px-1">{count}</Badge> : null;
                })()
              )}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[360px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Bell className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">{t('noNotifications', 'No notifications')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('noNotificationsDesc', "You're all caught up!")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map(notification => {
                const Icon = getNotificationIcon(notification.type);
                const isHighPriority = notification.priority_level >= 4;

                return (
                  <button
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3",
                      !notification.read && "bg-primary/5",
                      isHighPriority && !notification.read && "bg-destructive/5"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-full shrink-0 mt-0.5",
                      !notification.read ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn("h-3.5 w-3.5", !notification.read ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm leading-tight", !notification.read ? "font-medium" : "text-muted-foreground")}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
