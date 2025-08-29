import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Map, Navigation } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { offlineStorage } from '@/lib/offlineStorage';
import { toast } from 'sonner';

interface OfflineMapViewProps {
  incidents?: Array<{
    id: string;
    location: { latitude: number; longitude: number; address?: string };
    type: string;
    priority: string;
    status: string;
  }>;
  showControls?: boolean;
}

export const OfflineMapView = ({ incidents = [], showControls = true }: OfflineMapViewProps) => {
  const { latitude, longitude, getCurrentPosition, loading: geoLoading } = useGeolocation();
  const [mapTiles, setMapTiles] = useState<{ [key: string]: string }>({});
  const [downloading, setDownloading] = useState(false);

  const downloadMapTiles = async () => {
    if (!latitude || !longitude) {
      toast.error('Current location required for map download');
      return;
    }

    setDownloading(true);
    try {
      // Simulate downloading map tiles for offline use
      // In a real implementation, this would download actual map tiles
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const tileKey = `${Math.floor(latitude * 1000)}_${Math.floor(longitude * 1000)}`;
      await offlineStorage.init();
      
      // Save placeholder tile data
      const placeholderTile = new Blob(['placeholder-map-tile'], { type: 'image/png' });
      await offlineStorage.saveMapTile(tileKey, placeholderTile);
      
      setMapTiles(prev => ({ ...prev, [tileKey]: 'cached' }));
      toast.success('Map tiles downloaded for offline use');
    } catch (error) {
      console.error('Failed to download map tiles:', error);
      toast.error('Failed to download map tiles');
    } finally {
      setDownloading(false);
    }
  };

  const getIncidentColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Offline Map View
          </CardTitle>
          {showControls && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentPosition}
                disabled={geoLoading}
                className="flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                {geoLoading ? 'Locating...' : 'Get Location'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadMapTiles}
                disabled={downloading || !latitude || !longitude}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Downloading...' : 'Cache Map'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          {/* Simplified map representation */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-green-100 to-blue-100">
            {/* Grid lines to simulate map */}
            <svg className="w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Current location marker */}
          {latitude && longitude && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ 
                left: '50%', 
                top: '50%'
              }}
            >
              <div className="bg-blue-500 rounded-full w-4 h-4 border-2 border-white shadow-lg animate-pulse"></div>
              <Badge className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                You
              </Badge>
            </div>
          )}

          {/* Incident markers */}
          {incidents.map((incident, index) => (
            <div 
              key={incident.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ 
                left: `${30 + (index % 3) * 20}%`, 
                top: `${25 + (index % 4) * 20}%`
              }}
            >
              <div 
                className="rounded-full w-3 h-3 border-2 border-white shadow-lg"
                style={{ backgroundColor: getIncidentColor(incident.priority) }}
              ></div>
              <Badge 
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs"
                style={{ backgroundColor: getIncidentColor(incident.priority) }}
              >
                {incident.type.slice(0, 8)}
              </Badge>
            </div>
          ))}

          {/* Offline indicator */}
          <div className="absolute top-4 left-4">
            <Badge variant="outline" className="bg-white/80 text-gray-700 border-gray-300">
              <MapPin className="w-3 h-3 mr-1" />
              Offline Map
            </Badge>
          </div>

          {/* Coordinates display */}
          {latitude && longitude && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="outline" className="bg-white/80 text-gray-700 border-gray-300">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Badge>
            </div>
          )}

          {/* Scale indicator */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-white/80 px-2 py-1 rounded text-xs">
              <div className="border-b border-black w-12 mb-1"></div>
              1 km
            </div>
          </div>
        </div>

        {/* Legend */}
        {incidents.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Incident Priority Legend:</h4>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        )}

        {!latitude && !longitude && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-white text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p>Get your location to use the map</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};