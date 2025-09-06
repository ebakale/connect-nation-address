/// <reference types="google.maps" />
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Navigation, Layers, Target, Info, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader } from '@googlemaps/js-api-loader';

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
  const map = useRef<google.maps.Map | null>(null);
  const [addresses, setAddresses] = useState<FieldAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrafts, setShowDrafts] = useState(true);
  const [showVerified, setShowVerified] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
  const [isApiReady, setIsApiReady] = useState(false);
  const markers = useRef<google.maps.Marker[]>([]);

  const geographicScope = getGeographicScope();

  const fetchGoogleMapsApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-google-maps-token');
      if (error) throw error;
      setGoogleMapsApiKey(data.apiKey);
      setIsApiReady(true);
    } catch (error) {
      console.error('Error fetching Google Maps API key:', error);
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
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);
          
          if (map.current) {
            map.current.panTo(location);
            map.current.setZoom(14);
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

  const initializeMap = async () => {
    if (!mapContainer.current || !googleMapsApiKey || map.current) return;

    try {
      const loader = new Loader({
        apiKey: googleMapsApiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      // Default to Malabo, Equatorial Guinea if no user location
      const defaultCenter = { lat: 3.7518, lng: 8.7832 };
      
      map.current = new google.maps.Map(mapContainer.current, {
        center: userLocation || defaultCenter,
        zoom: userLocation ? 14 : 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });

      console.log('Google Maps initialized for field map');
      addMarkersToMap();

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      toast.error('Failed to initialize map');
    }
  };

  const addMarkersToMap = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Filter addresses based on toggle settings
    const filteredAddresses = addresses.filter(address => {
      if (address.verified && address.public) return showVerified;
      if (!address.verified || !address.public) return showDrafts;
      return true;
    });

    filteredAddresses.forEach((address) => {
      const isDraft = !address.verified || !address.public;
      
      const marker = new google.maps.Marker({
        position: { lat: address.latitude, lng: address.longitude },
        map: map.current,
        title: `${address.street}${address.building ? `, ${address.building}` : ''}`,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="12" fill="${isDraft ? '#f59e0b' : '#10b981'}" stroke="white" stroke-width="3"/>
              <circle cx="15" cy="15" r="6" fill="white"/>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
              ${address.street}${address.building ? `, ${address.building}` : ''}
            </h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">
              ${address.city}, ${address.region}
            </p>
            <div style="display: flex; gap: 4px; margin-bottom: 4px;">
              <span style="
                display: inline-block; 
                padding: 2px 6px; 
                font-size: 10px; 
                border-radius: 4px;
                background: ${isDraft ? '#fef3c7' : '#d1fae5'};
                color: ${isDraft ? '#92400e' : '#065f46'};
              ">
                ${isDraft ? 'Draft' : 'Verified'}
              </span>
              <span style="
                display: inline-block; 
                padding: 2px 6px; 
                font-size: 10px; 
                border-radius: 4px;
                background: #dbeafe;
                color: #1e40af;
              ">
                ${address.address_type}
              </span>
            </div>
            <p style="font-size: 10px; color: #999; margin: 0;">
              Created: ${new Date(address.created_at).toLocaleDateString()}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });

      markers.current.push(marker);
    });
  };

  const refreshMap = () => {
    addMarkersToMap();
  };

  useEffect(() => {
    fetchGoogleMapsApiKey();
    fetchAddresses();
  }, [user]);

  useEffect(() => {
    if (isApiReady) {
      initializeMap();
    }
  }, [isApiReady, userLocation]);

  useEffect(() => {
    refreshMap();
  }, [addresses, showDrafts, showVerified]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading Google Maps field view...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Field Map</h2>
          <p className="text-muted-foreground">
            View addresses in your assigned area on Google Maps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {geographicScope.map((scope) => (
              <Badge key={scope} variant="secondary">
                {scope}
              </Badge>
            ))}
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      {!isApiReady && (
        <Alert>
          <AlertTitle>Map not configured</AlertTitle>
          <AlertDescription>
            Please add GOOGLE_MAPS_API_KEY in Supabase Edge Function Secrets to enable the map.
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