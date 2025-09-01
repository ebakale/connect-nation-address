import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ChevronDown,
  Database,
  Zap
} from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { useOfflineAddresses, useOfflineIncidents } from '@/hooks/useOfflineData';
import { toast } from 'sonner';

export const EnhancedSyncStatus = () => {
  const { isOnline, isOffline, syncInProgress, forceSyncData, checkNetworkSpeed } = useOffline();
  const { 
    syncAddresses, 
    syncProgress: addressSyncProgress, 
    syncErrors: addressSyncErrors,
    getUnsyncedCount: getUnsyncedAddressCount 
  } = useOfflineAddresses();
  const { 
    syncIncidents, 
    syncProgress: incidentSyncProgress, 
    syncErrors: incidentSyncErrors,
    getUnsyncedCount: getUnsyncedIncidentCount 
  } = useOfflineIncidents();

  const [unsyncedCounts, setUnsyncedCounts] = useState({ addresses: 0, incidents: 0 });
  const [networkSpeed, setNetworkSpeed] = useState<'fast' | 'slow' | 'offline'>('offline');
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    updateUnsyncedCounts();
    if (isOnline) {
      checkSpeed();
    }
  }, [isOnline]);

  useEffect(() => {
    const interval = setInterval(updateUnsyncedCounts, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const updateUnsyncedCounts = async () => {
    try {
      const [addresses, incidents] = await Promise.all([
        getUnsyncedAddressCount(),
        getUnsyncedIncidentCount()
      ]);
      setUnsyncedCounts({ addresses, incidents });
    } catch (error) {
      console.error('Failed to update unsynced counts:', error);
    }
  };

  const checkSpeed = async () => {
    const speed = await checkNetworkSpeed();
    setNetworkSpeed(speed);
  };

  const handleFullSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      setLastSyncTime(new Date());
      await Promise.all([syncAddresses(), syncIncidents()]);
      await updateUnsyncedCounts();
      toast.success('Full sync completed');
    } catch (error) {
      console.error('Full sync failed:', error);
      toast.error('Full sync failed');
    }
  };

  const getStatusIcon = () => {
    if (isOffline) return <WifiOff className="h-4 w-4" />;
    if (addressSyncProgress.syncing || incidentSyncProgress.syncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (networkSpeed === 'slow') return <Wifi className="h-4 w-4 text-yellow-500" />;
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isOffline) return 'Offline';
    if (addressSyncProgress.syncing || incidentSyncProgress.syncing) return 'Syncing...';
    return networkSpeed === 'slow' ? 'Online (Slow)' : 'Online';
  };

  const getStatusVariant = () => {
    if (isOffline) return 'destructive';
    if (addressSyncProgress.syncing || incidentSyncProgress.syncing) return 'default';
    return 'default';
  };

  const totalUnsynced = unsyncedCounts.addresses + unsyncedCounts.incidents;
  const hasErrors = addressSyncErrors.length > 0 || incidentSyncErrors.length > 0;

  return (
    <Card className="w-full max-w-md min-w-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusText()}
          </div>
          <div className="flex items-center gap-2">
            {totalUnsynced > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalUnsynced} pending
              </Badge>
            )}
            {hasErrors && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Errors
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sync Progress */}
        {(addressSyncProgress.syncing || incidentSyncProgress.syncing) && (
          <div className="space-y-2">
            {addressSyncProgress.syncing && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Syncing Addresses</span>
                  <span>{addressSyncProgress.current}/{addressSyncProgress.total}</span>
                </div>
                <Progress 
                  value={(addressSyncProgress.current / addressSyncProgress.total) * 100} 
                  className="h-2"
                />
              </div>
            )}
            {incidentSyncProgress.syncing && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Syncing Incidents</span>
                  <span>{incidentSyncProgress.current}/{incidentSyncProgress.total}</span>
                </div>
                <Progress 
                  value={(incidentSyncProgress.current / incidentSyncProgress.total) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Database className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{unsyncedCounts.addresses} addresses</span>
          </div>
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Zap className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{unsyncedCounts.incidents} incidents</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleFullSync}
            disabled={isOffline || addressSyncProgress.syncing || incidentSyncProgress.syncing}
            size="sm"
            className="flex-1 min-w-0"
          >
            <RefreshCw className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Sync All</span>
          </Button>
          <Button 
            onClick={checkSpeed}
            disabled={isOffline}
            variant="outline"
            size="sm"
            className="sm:w-auto w-full"
          >
            <span className="truncate">Test Speed</span>
          </Button>
        </div>

        {/* Last Sync Time */}
        {lastSyncTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last sync: {lastSyncTime.toLocaleTimeString()}
          </div>
        )}

        {/* Expandable Details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
              <span>Details</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {/* Network Info */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Network:</span>
                <span className={networkSpeed === 'fast' ? 'text-green-500' : networkSpeed === 'slow' ? 'text-yellow-500' : 'text-red-500'}>
                  {networkSpeed === 'fast' ? 'Fast' : networkSpeed === 'slow' ? 'Slow' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Error Messages */}
            {hasErrors && (
              <div className="space-y-1">
                {addressSyncErrors.map((error, index) => (
                  <Alert key={`addr-${index}`} className="py-1">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                ))}
                {incidentSyncErrors.map((error, index) => (
                  <Alert key={`inc-${index}`} className="py-1">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Success State */}
            {!hasErrors && totalUnsynced === 0 && isOnline && (
              <Alert className="py-1">
                <CheckCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">All data synchronized</AlertDescription>
              </Alert>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};