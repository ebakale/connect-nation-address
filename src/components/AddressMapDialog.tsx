import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface AddressMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  address: {
    id: string;
    latitude: number;
    longitude: number;
    street: string;
    city: string;
    region: string;
    country: string;
    building?: string;
  };
}

export function AddressMapDialog({ isOpen, onClose, address }: AddressMapDialogProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [loadingToken, setLoadingToken] = useState(true);

  // Fetch Mapbox token from Supabase secrets
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setShowTokenInput(true);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setShowTokenInput(true);
      } finally {
        setLoadingToken(false);
      }
    };

    if (isOpen) {
      fetchMapboxToken();
    }
  }, [isOpen]);

  // Initialize map when token is available
  useEffect(() => {
    if (!isOpen || !mapboxToken || !mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [address.longitude, address.latitude],
      zoom: 16,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add marker for the address
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([address.longitude, address.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${address.building ? `${address.building}, ` : ''}${address.street}</h3>
              <p class="text-sm text-gray-600">${address.city}, ${address.region}, ${address.country}</p>
              <p class="text-xs text-gray-500">Lat: ${address.latitude}, Lng: ${address.longitude}</p>
            </div>
          `)
      )
      .addTo(map.current);

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isOpen, mapboxToken, address]);

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput.trim());
      setShowTokenInput(false);
    }
  };

  const handleClose = () => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[85vh] max-h-[85vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            Address Location Map
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Address Info */}
          <div className="mb-3 p-2 sm:p-3 bg-muted rounded-lg">
            <h3 className="font-medium text-sm sm:text-base break-words">
              {address.building && `${address.building}, `}
              {address.street}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground break-words">
              {address.city}, {address.region}, {address.country}
            </p>
            <p className="text-xs text-muted-foreground break-all">
              Coordinates: {address.latitude}, {address.longitude}
            </p>
          </div>

          {/* Map or Token Input */}
          <div className="flex-1 relative min-h-0">
            {loadingToken ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            ) : showTokenInput ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg overflow-y-auto">
                <div className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6 max-w-sm w-full mx-2">
                  <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-600 mx-auto" />
                  <div>
                    <h3 className="font-medium mb-2 text-sm sm:text-base">Mapbox Token Required</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      To view the map, please enter your Mapbox public token. 
                      You can get one from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
                    </p>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <Label htmlFor="mapbox-token" className="text-xs sm:text-sm">Mapbox Public Token</Label>
                      <Input
                        id="mapbox-token"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
                        className="mt-1 text-xs sm:text-sm"
                      />
                    </div>
                    <Button onClick={handleTokenSubmit} disabled={!tokenInput.trim()} className="w-full text-xs sm:text-sm">
                      Load Map
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}