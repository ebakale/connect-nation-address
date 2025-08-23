import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Layers } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface EmergencyIncident {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  reported_at: string;
  language_code?: string;
}

interface IncidentMapProps {
  incidents: EmergencyIncident[];
  selectedIncident: EmergencyIncident | null;
  onSelectIncident: (incident: EmergencyIncident) => void;
}

const IncidentMap = ({ incidents, selectedIncident, onSelectIncident }: IncidentMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Error getting Mapbox token:', error);
      }
    };

    getMapboxToken();
  }, []);

  // For now, we'll show a placeholder map
  // In a real implementation, you would integrate with Mapbox or similar mapping service
  const MockMap = () => (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded border overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-600" />
          <p className="text-lg font-semibold text-blue-800">Live Incident Map</p>
          <p className="text-sm text-blue-600">
            {incidents.length} active incidents plotted
          </p>
        </div>
      </div>
      
      {/* Mock incident markers */}
      <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      <div className="absolute top-12 right-8 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-8 left-12 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      
      {/* Mock roads */}
      <div className="absolute top-0 left-1/3 w-1 h-full bg-gray-300 opacity-30"></div>
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 opacity-30"></div>
    </div>
  );

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <MockMap />
      
      {/* Map Controls */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <Layers className="h-4 w-4 mr-1" />
          Layers
        </Button>
        <Button size="sm" variant="outline">
          <Navigation className="h-4 w-4 mr-1" />
          Center
        </Button>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Low Priority</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incident Summary */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-red-600 font-semibold">
            {incidents.filter(i => i.priority_level <= 2).length}
          </div>
          <div className="text-red-500 text-xs">High Priority</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-blue-600 font-semibold">
            {incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length}
          </div>
          <div className="text-blue-500 text-xs">Active</div>
        </div>
      </div>
    </div>
  );
};

export default IncidentMap;