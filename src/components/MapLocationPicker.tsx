import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lat: number, lng: number) => void | Promise<void>;
  initialCenter?: [number, number]; // [lng, lat]
}

export default function MapLocationPicker({ open, onOpenChange, onConfirm, initialCenter }: MapLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [loadingToken, setLoadingToken] = useState(true);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchMapboxToken = async () => {
      setLoadingToken(true);
      try {
        const { data, error } = await supabase.functions.invoke("get-mapbox-token");
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
          setShowTokenInput(false);
        } else {
          setShowTokenInput(true);
        }
      } catch (e) {
        console.error("Error fetching Mapbox token:", e);
        setShowTokenInput(true);
      } finally {
        setLoadingToken(false);
      }
    };

    fetchMapboxToken();
  }, [open]);

  // Initialize/cleanup map
  useEffect(() => {
    if (!open || !mapboxToken || !mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;

    const center = initialCenter || [9.7339, 1.7875]; // Default to Bata approx

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const handleClick = (e: any) => {
      const { lng, lat } = e.lngLat;
      setSelected({ lat, lng });
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: "#16a34a", draggable: true })
          .setLngLat([lng, lat])
          .addTo(map);
        markerRef.current.on("dragend", () => {
          const p = markerRef.current!.getLngLat();
          setSelected({ lat: p.lat, lng: p.lng });
        });
      }
    };

    map.on("click", handleClick);
    mapRef.current = map;

    return () => {
      map.off("click", handleClick);
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [open, mapboxToken, initialCenter]);

  const handleTokenSubmit = () => {
    if (!tokenInput.trim()) return;
    setMapboxToken(tokenInput.trim());
    setShowTokenInput(false);
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
          {loadingToken ? (
            <div className="flex-1 grid place-items-center bg-muted rounded-lg">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          ) : showTokenInput ? (
            <div className="flex-1 grid place-items-center bg-muted rounded-lg">
              <div className="text-center space-y-4 p-6 max-w-md">
                <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto" />
                <div>
                  <h3 className="font-medium mb-2">Mapbox Token Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your Mapbox public token (find it under Tokens in your Mapbox dashboard).
                  </p>
                </div>
                <div className="space-y-3 w-full text-left">
                  <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
                  <Input
                    id="mapbox-token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
                    className="mt-1"
                  />
                  <Button onClick={handleTokenSubmit} disabled={!tokenInput.trim()}>Load Map</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex-1">
              <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
              {selected && (
                <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur px-3 py-2 rounded shadow">
                  <div className="text-xs text-muted-foreground">Selected</div>
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
