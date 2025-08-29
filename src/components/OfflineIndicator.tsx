import { useOffline } from '@/hooks/useOffline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';

export const OfflineIndicator = () => {
  const { isOnline, isOffline, syncInProgress, forceSyncData, checkNetworkSpeed } = useOffline();

  const handleSync = async () => {
    const success = await forceSyncData();
    if (!success) {
      toast.error('Sync failed. Check your connection.');
    }
  };

  const handleNetworkTest = async () => {
    const speed = await checkNetworkSpeed();
    const messages = {
      fast: 'Network speed: Fast ⚡',
      slow: 'Network speed: Slow 🐌',
      offline: 'No network connection 📡'
    };
    toast.info(messages[speed]);
  };

  if (isOnline && !syncInProgress) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Wifi className="w-3 h-3 mr-1" />
          Online
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNetworkTest}
          className="p-1"
        >
          <Download className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isOffline}
          className="p-1"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  if (syncInProgress) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Syncing
        </Badge>
      </div>
    );
  }

  return null;
};