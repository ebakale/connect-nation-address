import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Layers, AlertTriangle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface EmergencyIncident {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  reported_at: string;
  language_code?: string;
  location_latitude?: number;
  location_longitude?: number;
  incident_uac?: string;
  location_address?: string;
}

interface IncidentMapProps {
  incidents: EmergencyIncident[];
  selectedIncident: EmergencyIncident | null;
  onSelectIncident: (incident: EmergencyIncident) => void;
}

// Default center: Malabo, Equatorial Guinea
const DEFAULT_CENTER: [number, number] = [8.7833, 3.7500];

const IncidentMap = ({ incidents, selectedIncident, onSelectIncident }: IncidentMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [tokenError, setTokenError] = useState<string>('');
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Fetch Mapbox token from Supabase edge function
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
          setIsTokenSet(true);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setTokenError('Failed to fetch Mapbox token from server');
        // Fallback: try localStorage
        const storedToken = localStorage.getItem('mapbox_token');
        if (storedToken && storedToken.startsWith('pk.')) {
          setMapboxToken(storedToken);
          setIsTokenSet(true);
        }
      }
    };
    
    fetchMapboxToken();
  }, []);

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return '#ef4444'; // red
      case 2: return '#f97316'; // orange
      case 3: return '#eab308'; // yellow
      case 4: return '#3b82f6'; // blue
      case 5: return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'reported': return '#ef4444'; // red
      case 'dispatched': return '#f97316'; // orange
      case 'responding': return '#3b82f6'; // blue
      case 'on_scene': return '#8b5cf6'; // purple
      case 'resolved': return '#22c55e'; // green
      case 'closed': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  const addIncidentMarkers = () => {
    if (!map.current) return;

    clearMarkers();

    incidents.forEach((incident) => {
      if (!incident.location_latitude || !incident.location_longitude) return;

      // Create custom marker element (fixed-size, bottom-anchored)
      const markerElement = document.createElement('div');
      markerElement.className = 'incident-marker';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${getPriorityColor(incident.priority_level)};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        box-sizing: border-box;
        position: relative;
      `;

      // Tooltip (pure HTML, no map autopan)
      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position: absolute;
        left: 50%;
        bottom: 26px;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.85);
        color: #fff;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 12px;
        line-height: 1.2;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: none;
      `;
      tooltip.innerHTML = `
        <div style="font-weight:600; margin-bottom:2px;">${incident.incident_number}</div>
        <div style="opacity:.9;">
          ${incident.emergency_type} • P${incident.priority_level} • ${incident.status.replace('_', ' ')}
        </div>
      `;
      markerElement.appendChild(tooltip);

      // Add pulse animation for high priority incidents (visual only)
      if (incident.priority_level <= 2) {
        markerElement.style.animation = 'pulse 2s infinite';
      }

      // Hover: show tooltip only (no size/transform changes)
      markerElement.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
      });
      markerElement.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      const marker = new mapboxgl.Marker({ element: markerElement, anchor: 'bottom' })
        .setLngLat([incident.location_longitude, incident.location_latitude])
        .addTo(map.current);

      // Handle marker click
      markerElement.addEventListener('click', () => {
        onSelectIncident(incident);
      });

      markers.current.push(marker);
    });

    // Fit map to show all incidents if there are any
    if (incidents.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      incidents.forEach(incident => {
        if (incident.location_latitude && incident.location_longitude) {
          bounds.extend([incident.location_longitude, incident.location_latitude]);
        }
      });
      
      // Only fit bounds if we have valid coordinates
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: 12,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
    `;
    document.head.appendChild(style);

    // Add incident markers when map loads
    map.current.on('load', addIncidentMarkers);
  };

  // Global function for popup buttons
  useEffect(() => {
    (window as any).selectIncident = (incidentId: string) => {
      const incident = incidents.find(i => i.id === incidentId);
      if (incident) {
        onSelectIncident(incident);
      }
    };

    return () => {
      delete (window as any).selectIncident;
    };
  }, [incidents, onSelectIncident]);

  useEffect(() => {
    if (isTokenSet) {
      initializeMap();
    }

    return () => {
      clearMarkers();
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken]);

  // Update markers when incidents change
  useEffect(() => {
    if (map.current && isTokenSet) {
      addIncidentMarkers();
    }
  }, [incidents, isTokenSet]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      // Validate token format (basic check)
      if (mapboxToken.startsWith('pk.')) {
        localStorage.setItem('mapbox_token', mapboxToken);
        setIsTokenSet(true);
        setTokenError('');
      } else {
        setTokenError('Please enter a valid Mapbox public token (starts with "pk.")');
      }
    } else {
      setTokenError('Please enter a Mapbox token');
    }
  };

  const centerOnIncident = () => {
    if (!map.current || !selectedIncident?.location_latitude || !selectedIncident?.location_longitude) return;
    
    map.current.flyTo({
      center: [selectedIncident.location_longitude, selectedIncident.location_latitude],
      zoom: 16,
      duration: 1000
    });
  };

  if (!isTokenSet) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <CardContent className="text-center space-y-4 w-full max-w-md">
          {tokenError ? (
            <>
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
              <div className="text-sm text-destructive">{tokenError}</div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please enter your Mapbox public token to display the live incident map:
                </p>
                <Input
                  type="password"
                  placeholder="Enter Mapbox public token (pk.xxx)"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
                />
                <Button onClick={handleTokenSubmit} className="w-full">
                  Load Live Map
                </Button>
                <p className="text-xs text-muted-foreground">
                  Get your token at{' '}
                  <a 
                    href="https://account.mapbox.com/access-tokens/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading incident map...</p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Map */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
      
      {/* Map Controls */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <Layers className="h-4 w-4 mr-1" />
          Layers
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={centerOnIncident}
          disabled={!selectedIncident?.location_latitude}
        >
          <Navigation className="h-4 w-4 mr-1" />
          Center on Selected
        </Button>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Live Incident Map Legend</CardTitle>
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
          <div className="mt-2 text-xs text-muted-foreground">
            • Pulsing markers indicate high priority incidents
            • Click markers for details or use "View Details" button
          </div>
        </CardContent>
      </Card>

      {/* Incident Summary */}
      <div className="grid grid-cols-3 gap-2 text-sm">
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
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-green-600 font-semibold">
            {incidents.filter(i => i.location_latitude && i.location_longitude).length}
          </div>
          <div className="text-green-500 text-xs">Mapped</div>
        </div>
      </div>
    </div>
  );
};

export default IncidentMap;