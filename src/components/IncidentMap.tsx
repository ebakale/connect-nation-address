/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Layers, AlertTriangle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { 
  createMapLoader, 
  initializeGoogleMaps, 
  createStandardMap, 
  createMapTypeToggle,
  MAP_CONFIG
} from '@/lib/mapConfig';

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

// Default center using unified configuration
const DEFAULT_CENTER = MAP_CONFIG.defaultCenter;

const IncidentMap = ({ incidents, selectedIncident, onSelectIncident }: IncidentMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [isApiReady, setIsApiReady] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const markers = useRef<google.maps.Marker[]>([]);

  // Fetch Google Maps API key using unified configuration
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const apiKey = await createMapLoader();
        setGoogleMapsApiKey(apiKey);
        setIsApiReady(true);
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        setApiError('Failed to fetch Google Maps API key from server');
      }
    };
    
    fetchGoogleMapsApiKey();
  }, []);

  const getPriorityColor = (priority: number): string => {
    return MAP_CONFIG.markers.priorityColors[priority as keyof typeof MAP_CONFIG.markers.priorityColors] || MAP_CONFIG.markers.priorityColors[5];
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
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
  };

  const addIncidentMarkers = () => {
    if (!map.current) return;

    clearMarkers();

    incidents.forEach((incident) => {
      if (!incident.location_latitude || !incident.location_longitude) return;

      const marker = new google.maps.Marker({
        position: {
          lat: incident.location_latitude,
          lng: incident.location_longitude
        },
        map: map.current,
        title: `${incident.incident_number} - ${incident.emergency_type}`,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="${getPriorityColor(incident.priority_level)}" stroke="white" stroke-width="3"/>
              ${incident.priority_level <= 2 ? `
                <circle cx="10" cy="10" r="12" fill="none" stroke="${getPriorityColor(incident.priority_level)}" stroke-width="1" opacity="0.3">
                  <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
              ` : ''}
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(20, 20),
          anchor: new google.maps.Point(10, 10)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <div style="font-weight: 600; margin-bottom: 4px; color: ${getPriorityColor(incident.priority_level)};">
              ${incident.incident_number}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Type:</strong> ${incident.emergency_type}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Priority:</strong> P${incident.priority_level}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Status:</strong> <span style="color: ${getStatusColor(incident.status)};">${incident.status.replace('_', ' ')}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Reported:</strong> ${new Date(incident.reported_at).toLocaleString()}
            </div>
            ${incident.location_address ? `<div style="margin-bottom: 8px;"><strong>Address:</strong> ${incident.location_address}</div>` : ''}
            <button 
              onclick="selectIncident('${incident.id}')"
              style="
                background: ${getPriorityColor(incident.priority_level)};
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
              "
            >
              View Details
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
        onSelectIncident(incident);
      });

      // Add hover effects
      marker.addListener('mouseover', () => {
        marker.setIcon({
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="${getPriorityColor(incident.priority_level)}" stroke="white" stroke-width="3"/>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        });
      });

      marker.addListener('mouseout', () => {
        marker.setIcon({
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="${getPriorityColor(incident.priority_level)}" stroke="white" stroke-width="3"/>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(20, 20),
          anchor: new google.maps.Point(10, 10)
        });
      });

      markers.current.push(marker);
    });

    // Fit map to show all incidents if there are any
    if (incidents.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      incidents.forEach(incident => {
        if (incident.location_latitude && incident.location_longitude) {
          bounds.extend(new google.maps.LatLng(incident.location_latitude, incident.location_longitude));
        }
      });
      
      // Only fit bounds if we have valid coordinates
      if (!bounds.isEmpty()) {
        map.current!.fitBounds(bounds);
        // Set max zoom to prevent too much zoom on single incident
        if (incidents.length === 1) {
          google.maps.event.addListenerOnce(map.current!, 'bounds_changed', () => {
            if (map.current!.getZoom()! > 15) {
              map.current!.setZoom(15);
            }
          });
        }
      }
    }
  };

  const initializeMap = async () => {
    if (!mapContainer.current || !googleMapsApiKey) return;

    try {
      await initializeGoogleMaps(googleMapsApiKey);

      map.current = createStandardMap(mapContainer.current, {
        center: DEFAULT_CENTER,
        zoom: MAP_CONFIG.defaultZoom,
      });

      console.log('Google Maps loaded successfully for incident map');
      
      // Add incident markers when map loads
      addIncidentMarkers();

    } catch (error) {
      console.error('Error initializing Google Maps for incidents:', error);
      setApiError('Failed to initialize incident map. Please refresh the page.');
    }
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
    if (isApiReady) {
      initializeMap();
    }

    return () => {
      clearMarkers();
    };
  }, [isApiReady, googleMapsApiKey]);

  // Update markers when incidents change
  useEffect(() => {
    if (map.current && isApiReady) {
      addIncidentMarkers();
    }
  }, [incidents, isApiReady]);

  const centerOnIncident = () => {
    if (!map.current || !selectedIncident?.location_latitude || !selectedIncident?.location_longitude) return;
    
    map.current.panTo({
      lat: selectedIncident.location_latitude,
      lng: selectedIncident.location_longitude
    });
    map.current.setZoom(16);
  };

  if (!isApiReady) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <CardContent className="text-center space-y-4 w-full max-w-md">
          {apiError ? (
            <>
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
              <div className="text-sm text-destructive">{apiError}</div>
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading Google Maps incident viewer...</p>
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
        <Button 
          size="sm" 
          variant="outline" 
          onClick={centerOnIncident}
          disabled={!selectedIncident?.location_latitude}
        >
          <Navigation className="h-4 w-4 mr-1" />
          Center on Selected
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => {
            if (map.current) {
              const toggle = createMapTypeToggle(map.current);
              toggle();
            }
          }}
        >
          <Layers className="h-4 w-4 mr-1" />
          Toggle Satellite
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
            • Animated markers indicate high priority incidents
            • Click markers for details • Hover for larger view
            • Use satellite toggle for better visibility
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