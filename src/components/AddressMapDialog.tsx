/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from '@googlemaps/js-api-loader';
import { useTranslation } from 'react-i18next';

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
  } | null;
}

export function AddressMapDialog({ isOpen, onClose, address }: AddressMapDialogProps) {
  const { t } = useTranslation(['address', 'common']);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [loadingApiKey, setLoadingApiKey] = useState(true);

  // Fetch Google Maps API key from Supabase secrets
  useEffect(() => {
    const fetchGoogleMapsApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-token');
        if (error) throw error;
        if (data?.apiKey) {
          setGoogleMapsApiKey(data.apiKey);
        } else {
          setShowApiKeyInput(true);
        }
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        setShowApiKeyInput(true);
      } finally {
        setLoadingApiKey(false);
      }
    };

    if (isOpen) {
      fetchGoogleMapsApiKey();
    }
  }, [isOpen]);

  // Initialize map when API key is available
  useEffect(() => {
    if (!isOpen || !googleMapsApiKey || !mapContainer.current || !address) return;

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        // Initialize map
        map.current = new google.maps.Map(mapContainer.current!, {
          center: { lat: address.latitude, lng: address.longitude },
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        });

        // Add marker for the address
        const marker = new google.maps.Marker({
          position: { lat: address.latitude, lng: address.longitude },
          map: map.current,
          title: 'Address Location',
          icon: {
            url: `data:image/svg+xml,${encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
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
              <h3 style="font-weight: 600; margin-bottom: 4px;">
                ${address.building ? `${address.building}, ` : ''}${address.street}
              </h3>
              <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
                ${address.city}, ${address.region}, ${address.country}
              </p>
              <p style="font-size: 12px; color: #999;">
                Coordinates: ${address.latitude}, ${address.longitude}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map.current, marker);
        });

        // Show info window immediately
        infoWindow.open(map.current, marker);

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      map.current = null;
    };
  }, [isOpen, googleMapsApiKey, address]);

  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim()) {
      setGoogleMapsApiKey(apiKeyInput.trim());
      setShowApiKeyInput(false);
    }
  };

  const handleClose = () => {
    map.current = null;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[85vh] max-h-[85vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('address:googleMaps.locationOnMaps')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Address Info */}
          {address && (
            <div className="mb-3 p-2 sm:p-3 bg-muted rounded-lg">
              <h3 className="font-medium text-sm sm:text-base break-words">
                {address.building && `${address.building}, `}
                {address.street}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground break-words">
                {address.city}, {address.region}, {address.country}
              </p>
              <p className="text-xs text-muted-foreground break-all">
                {t('address:googleMaps.coordinates')}: {address.latitude}, {address.longitude}
              </p>
            </div>
          )}
          
          {!address && (
            <div className="mb-3 p-2 sm:p-3 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('address:googleMaps.noAddressData')}
              </p>
            </div>
          )}

          {/* Map or API Key Input */}
          <div className="flex-1 relative min-h-0">
            {loadingApiKey ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('address:googleMaps.loadingMaps')}</p>
                </div>
              </div>
            ) : showApiKeyInput ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg overflow-y-auto">
                <div className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6 max-w-sm w-full mx-2">
                  <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-600 mx-auto" />
                  <div>
                    <h3 className="font-medium mb-2 text-sm sm:text-base">{t('address:googleMaps.apiKeyRequired')}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      {t('address:googleMaps.apiKeyDescription')} <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a>
                    </p>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <Label htmlFor="google-maps-key" className="text-xs sm:text-sm">{t('address:googleMaps.apiKeyLabel')}</Label>
                      <Input
                        id="google-maps-key"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="mt-1 text-xs sm:text-sm"
                      />
                    </div>
                    <Button onClick={handleApiKeySubmit} disabled={!apiKeyInput.trim()} className="w-full text-xs sm:text-sm">
                      {t('address:googleMaps.loadMap')}
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