import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, WifiOff, Battery, Smartphone, Download, 
  MapPin, RotateCcw, Settings, Signal, HardDrive
} from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { useEnhancedGeolocation } from '@/hooks/useEnhancedGeolocation';
import { useOfflineCache } from '@/hooks/useOfflineData';
import { offlineStorage } from '@/lib/offlineStorage';
import { toast } from 'sonner';

export const MobileUXEnhancements: React.FC = () => {
  const { isOnline, isOffline, syncInProgress, checkNetworkSpeed } = useOffline();
  const { location, getCurrentPosition, startTracking, stopTracking, tracking } = useEnhancedGeolocation({
    enableHighAccuracy: true,
    enableCaching: true,
    enableTracking: false
  });
  
  const [storageUsage, setStorageUsage] = useState<{ used: number; total: number } | null>(null);
  const [networkQuality, setNetworkQuality] = useState<'fast' | 'slow' | 'offline'>('offline');
  const [cacheStatus, setCacheStatus] = useState<{ addressCache: number; mapCache: number }>({ addressCache: 0, mapCache: 0 });

  useEffect(() => {
    checkStorageUsage();
    checkCacheStatus();
    testNetworkQuality();
  }, []);

  const checkStorageUsage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setStorageUsage({
          used: estimate.usage || 0,
          total: estimate.quota || 0
        });
      }
    } catch (error) {
      console.error('Failed to check storage usage:', error);
    }
  };

  const checkCacheStatus = async () => {
    try {
      const addresses = await offlineStorage.getAddresses();
      const mapTiles = await offlineStorage.get('map_tiles') || [];
      setCacheStatus({
        addressCache: addresses.length,
        mapCache: Array.isArray(mapTiles) ? mapTiles.length : 0
      });
    } catch (error) {
      console.error('Failed to check cache status:', error);
    }
  };

  const testNetworkQuality = async () => {
    const quality = await checkNetworkSpeed();
    setNetworkQuality(quality);
  };

  const handleLocationOptimization = async () => {
    try {
      if (tracking) {
        await stopTracking();
        toast.success('Location tracking disabled to save battery');
      } else {
        await startTracking();
        toast.success('High-accuracy location tracking enabled');
      }
    } catch (error) {
      toast.error('Failed to toggle location tracking');
    }
  };

  const handleCacheOptimization = async () => {
    try {
      await offlineStorage.clearExpiredCache();
      await checkCacheStatus();
      await checkStorageUsage();
      toast.success('Cache optimized successfully');
    } catch (error) {
      toast.error('Failed to optimize cache');
    }
  };

  const downloadOfflineData = async () => {
    try {
      toast.info('Preparing data for offline use...');
      
      // Cache essential data for offline use
      const essentialData = {
        emergencyContacts: [
          { name: 'Emergency Services', number: '911' },
          { name: 'Police', number: '101' },
          { name: 'Fire Service', number: '102' },
          { name: 'Medical Emergency', number: '103' }
        ],
        quickActions: [
          'Report Emergency',
          'Find Address',
          'Get Directions',
          'Share Location'
        ],
        timestamp: Date.now()
      };

      await offlineStorage.setCachedData('offline_essentials', essentialData, 86400000); // 24 hours
      await checkCacheStatus();
      toast.success('Essential data cached for offline use');
    } catch (error) {
      toast.error('Failed to prepare offline data');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!storageUsage) return 0;
    return (storageUsage.used / storageUsage.total) * 100;
  };

  const getNetworkIcon = () => {
    switch (networkQuality) {
      case 'fast': return <Signal className="w-4 h-4 text-green-600" />;
      case 'slow': return <Signal className="w-4 h-4 text-yellow-600" />;
      default: return <WifiOff className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5" />
            Mobile Performance
          </CardTitle>
          <CardDescription>
            Optimize your mobile experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {getNetworkIcon()}
              <Badge variant={networkQuality === 'fast' ? 'default' : networkQuality === 'slow' ? 'secondary' : 'destructive'}>
                {networkQuality === 'fast' ? 'Fast' : networkQuality === 'slow' ? 'Slow' : 'Offline'}
              </Badge>
            </div>
          </div>

          {/* Location Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <div className="flex items-center gap-2">
              {location && (
                <Badge variant="secondary" className="text-xs">
                  {location.cached ? 'Cached' : 'Live'}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLocationOptimization}
                className="text-xs px-2 py-1"
              >
                {tracking ? 'Stop' : 'Track'}
              </Button>
            </div>
          </div>

          {/* Storage Usage */}
          {storageUsage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.total)}
                </span>
              </div>
              <Progress value={getStoragePercentage()} className="h-2" />
            </div>
          )}

          {/* Cache Status */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{cacheStatus.addressCache}</div>
              <div className="text-xs text-muted-foreground">Addresses</div>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{cacheStatus.mapCache}</div>
              <div className="text-xs text-muted-foreground">Map Tiles</div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadOfflineData}
              disabled={isOffline}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Cache Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCacheOptimization}
              className="text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Optimize
            </Button>
          </div>

          {/* Sync Status */}
          {syncInProgress && (
            <Alert>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <AlertDescription>
                Syncing data in background...
              </AlertDescription>
            </Alert>
          )}

          {/* Offline Notice */}
          {isOffline && (
            <Alert variant="destructive">
              <WifiOff className="w-4 h-4" />
              <AlertDescription>
                You're offline. Some features may be limited.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};