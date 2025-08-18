import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Navigation, Layers, Target, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface FieldAddress {
  id: string;
  latitude: number;
  longitude: number;
  street: string;
  building?: string;
  city: string;
  region: string;
  verified: boolean;
  public: boolean;
  address_type: string;
  created_at: string;
}

interface FieldMapProps {
  onClose?: () => void;
}

const FieldMap = ({ onClose }: FieldMapProps) => {
  const { user } = useAuth();
  const { getGeographicScope } = useUserRole();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [addresses, setAddresses] = useState<FieldAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrafts, setShowDrafts] = useState(true);
  const [showVerified, setShowVerified] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");

  const geographicScope = getGeographicScope();

  const fetchMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      setMapboxToken(data.token);
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      toast.error('Failed to load map');
    }
  };

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by geographic scope if field agent has limited scope
      if (geographicScope.length > 0) {
        query = query.in('region', geographicScope);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 2000
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Default to Malabo, Equatorial Guinea if no user location
    const defaultCenter: [number, number] = [8.7832, 3.7518];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation || defaultCenter,
      zoom: userLocation ? 14 : 10,
    });

    map.current.on('load', () => {
      addMarkersToMap();
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );
  };

  const addMarkersToMap = () => {
    if (!map.current) return;

    // Filter addresses based on toggle settings
    const filteredAddresses = addresses.filter(address => {
      if (address.verified && address.public) return showVerified;
      if (!address.verified || !address.public) return showDrafts;
      return true;
    });

    filteredAddresses.forEach((address) => {
      const isDraft = !address.verified || !address.public;
      
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: ${isDraft ? '#f59e0b' : '#10b981'};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${address.street}${address.building ? `, ${address.building}` : ''}</h3>
          <p class="text-xs text-gray-600">${address.city}, ${address.region}</p>
          <div class="flex gap-1 mt-1">
            <span class="inline-block px-2 py-1 text-xs rounded ${isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
              ${isDraft ? 'Draft' : 'Verified'}
            </span>
            <span class="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
              ${address.address_type}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Created: ${new Date(address.created_at).toLocaleDateString()}
          </p>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat([address.longitude, address.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  const refreshMap = () => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.querySelectorAll('.custom-marker');
    markers.forEach(marker => marker.remove());

    // Re-add markers with current filter settings
    addMarkersToMap();
  };

  useEffect(() => {
    fetchMapboxToken();
    fetchAddresses();
  }, [user]);

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }
  }, [mapboxToken, userLocation]);

  useEffect(() => {
    refreshMap();
  }, [addresses, showDrafts, showVerified]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading field map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Field Map</h2>
          <p className="text-muted-foreground">
            View addresses in your assigned area
          </p>
        </div>
        <div className="flex gap-2">
          {geographicScope.map((scope) => (
            <Badge key={scope} variant="secondary">
              {scope}
            </Badge>
          ))}
        </div>
      </div>

      {!mapboxToken && (
        <Alert>
          <AlertTitle>Map not configured</AlertTitle>
          <AlertDescription>
            Please add MAPBOX_PUBLIC_TOKEN in Supabase Edge Function Secrets to enable the map.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Map Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-drafts"
                checked={showDrafts}
                onCheckedChange={setShowDrafts}
              />
              <Label htmlFor="show-drafts" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                Show Drafts
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-verified"
                checked={showVerified}
                onCheckedChange={setShowVerified}
              />
              <Label htmlFor="show-verified" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Show Verified
              </Label>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={getCurrentLocation}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              My Location
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAddresses}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapContainer} 
            className="w-full h-96 md:h-[500px] rounded-lg"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {addresses.filter(a => !a.verified || !a.public).length}
              </div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {addresses.filter(a => a.verified && a.public).length}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {addresses.length}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {geographicScope.length}
              </div>
              <div className="text-sm text-muted-foreground">Regions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldMap;