/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from '@googlemaps/js-api-loader';

interface MapLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lat: number, lng: number) => void | Promise<void>;
  initialCenter?: [number, number]; // [lng, lat]
}

export default function MapLocationPicker({ open, onOpenChange, onConfirm, initialCenter }: MapLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [loadingApiKey, setLoadingApiKey] = useState(true);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchGoogleMapsApiKey = async () => {
      setLoadingApiKey(true);
      try {
        const { data, error } = await supabase.functions.invoke("get-google-maps-token");
        if (error) throw error;
        if (data?.apiKey) {
          setGoogleMapsApiKey(data.apiKey);
          setShowApiKeyInput(false);
        } else {
          setShowApiKeyInput(true);
        }
      } catch (e) {
        console.error("Error fetching Google Maps API key:", e);
        setShowApiKeyInput(true);
      } finally {
        setLoadingApiKey(false);
      }
    };

    fetchGoogleMapsApiKey();
  }, [open]);

  // Initialize/cleanup map
  useEffect(() => {
    if (!open || !googleMapsApiKey || !mapContainer.current) return;

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        const center = initialCenter 
          ? { lat: initialCenter[1], lng: initialCenter[0] }
          : { lat: 1.7875, lng: 9.7339 }; // Default to Bata approx

        const map = new google.maps.Map(mapContainer.current!, {
          center,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        });

        const handleClick = (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            setSelected({ lat, lng });
            
            if (markerRef.current) {
              markerRef.current.setPosition({ lat, lng });
            } else {
              markerRef.current = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                draggable: true,
                icon: {
                  url: `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="15" cy="15" r="12" fill="#16a34a" stroke="white" stroke-width="3"/>
                      <circle cx="15" cy="15" r="6" fill="white"/>
                    </svg>
                  `)}`,
                  scaledSize: new google.maps.Size(30, 30),
                  anchor: new google.maps.Point(15, 15)
                }
              });
              
              markerRef.current.addListener('dragend', () => {
                const position = markerRef.current!.getPosition();
                if (position) {
                  setSelected({ lat: position.lat(), lng: position.lng() });
                }
              });
            }
          }
        };

        map.addListener('click', handleClick);
        mapRef.current = map;

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    initializeMap();

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapRef.current = null;
    };
  }, [open, googleMapsApiKey, initialCenter]);

  const handleApiKeySubmit = () => {
    if (!apiKeyInput.trim()) return;
    setGoogleMapsApiKey(apiKeyInput.trim());
    setShowApiKeyInput(false);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      setConfirming(true);
      await Promise.resolve(onConfirm(selected.lat, selected.lng));
      onOpenChange(false);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pick Location on Map
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-3">
          {loadingApiKey ? (
            <div className="flex-1 grid place-items-center bg-muted rounded-lg">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
              </div>
            </div>
          ) : showApiKeyInput ? (
            <div className="flex-1 grid place-items-center bg-muted rounded-lg">
              <div className="text-center space-y-4 p-6 max-w-md">
                <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto" />
                <div>
                  <h3 className="font-medium mb-2">Google Maps API Key Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your Google Maps API key (find it in Google Cloud Console).
                  </p>
                </div>
                <div className="space-y-3 w-full text-left">
                  <Label htmlFor="google-maps-key">Google Maps API Key</Label>
                  <Input
                    id="google-maps-key"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="mt-1"
                  />
                  <Button onClick={handleApiKeySubmit} disabled={!apiKeyInput.trim()}>Load Map</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex-1">
              <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
              {selected && (
                <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur px-3 py-2 rounded shadow">
                  <div className="text-xs text-muted-foreground">Selected Location</div>
                  <div className="font-mono text-sm">{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={!selected || confirming}>
              <Check className="h-4 w-4 mr-1" />
              {confirming ? "Saving..." : "Confirm Location"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}