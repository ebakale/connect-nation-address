import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CloudOff, RefreshCw, Check, AlertCircle, Upload, Clock } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { offlineStorage } from '@/lib/offlineStorage';
import { cn } from '@/lib/utils';

interface QueueItem {
  id: string;
  type: 'address' | 'incident';
  label: string;
  createdAt: string;
  status: 'queued' | 'syncing' | 'synced' | 'failed';
}

export const OfflineSyncQueue = () => {
  const { isOnline, syncInProgress, forceSyncData } = useOffline();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      const [addresses, incidents] = await Promise.all([
        offlineStorage.getUnsyncedAddresses(),
        offlineStorage.getUnsyncedIncidents(),
      ]);

      const items: QueueItem[] = [
        ...addresses.map((a) => ({
          id: a.id,
          type: 'address' as const,
          label: `${a.street}, ${a.city}`,
          createdAt: a.created_at,
          status: syncInProgress ? 'syncing' as const : 'queued' as const,
        })),
        ...incidents.map((i) => ({
          id: i.id,
          type: 'incident' as const,
          label: i.description.substring(0, 40),
          createdAt: i.created_at,
          status: syncInProgress ? 'syncing' as const : 'queued' as const,
        })),
      ];

      setQueueItems(items);
    } catch {
      // IndexedDB not available
    }
  }, [syncInProgress]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const pendingCount = queueItems.filter((i) => i.status !== 'synced').length;

  if (pendingCount === 0) return null;

  const statusConfig = {
    queued: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Queued' },
    syncing: { icon: RefreshCw, color: 'text-primary', bg: 'bg-primary/10', label: 'Syncing' },
    synced: { icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Synced' },
    failed: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Failed' },
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-1.5 px-2">
          <CloudOff className="h-4 w-4 text-amber-600" />
          <Badge variant="secondary" className="h-5 min-w-[20px] px-1 text-xs">
            {pendingCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">Offline Queue</h4>
            <p className="text-xs text-muted-foreground">
              {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending sync
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!isOnline || syncInProgress}
            onClick={async () => {
              await forceSyncData();
              fetchQueue();
            }}
            className="gap-1 text-xs"
          >
            <Upload className="h-3 w-3" />
            Sync
          </Button>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {queueItems.map((item) => {
            const config = statusConfig[item.status];
            const StatusIcon = config.icon;

            return (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 border-b last:border-0">
                <div className={cn('p-1.5 rounded-md', config.bg)}>
                  <StatusIcon className={cn('h-3.5 w-3.5', config.color, item.status === 'syncing' && 'animate-spin')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>

        {!isOnline && (
          <div className="p-2 bg-amber-50 border-t text-xs text-amber-700 text-center">
            Items will sync when you're back online
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
