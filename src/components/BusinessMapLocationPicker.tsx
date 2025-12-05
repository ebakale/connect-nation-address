import { useState } from "react";
import { UniversalLocationPicker } from "./UniversalLocationPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, MapPinned, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEnhancedGeolocation } from "@/hooks/useEnhancedGeolocation";
import { toast } from "sonner";

interface BusinessMapLocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: any) => void;
}

export const BusinessMapLocationPicker = ({ onLocationSelect }: BusinessMapLocationPickerProps) => {
  const { t } = useTranslation(['business', 'common']);
  const [showOptions, setShowOptions] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  
  const { getCurrentPosition, loading: geoLoading } = useEnhancedGeolocation();

  const handleLocationConfirm = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    onLocationSelect(lat, lng, {
      street: "",
      city: "",
      region: "",
      country: "Equatorial Guinea"
    });
  };

  const handleMapConfirm = async (lat: number, lng: number) => {
    setShowMapPicker(false);
    setShowOptions(false);
    handleLocationConfirm(lat, lng);
  };

  const handleCurrentLocation = async () => {
    try {
      const position = await getCurrentPosition(false);
      if (position) {
        setShowOptions(false);
        handleLocationConfirm(position.latitude, position.longitude);
        toast.success(t('common:locationObtained'));
      }
    } catch (error) {
      toast.error(t('common:locationError'));
    }
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error(t('common:invalidCoordinates'));
      return;
    }
    
    setShowManualEntry(false);
    setShowOptions(false);
    handleLocationConfirm(lat, lng);
  };

  return (
    <div className="space-y-4">
      <Button 
        type="button"
        variant="outline" 
        onClick={() => setShowOptions(true)}
        className="w-full"
      >
        <MapPin className="h-4 w-4 mr-2" />
        {selectedLocation 
          ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
          : t('business:registration.selectLocation')}
      </Button>
      
      {/* Options Dialog */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('business:registration.selectLocation')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={handleCurrentLocation}
              disabled={geoLoading}
            >
              <Navigation className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">{t('common:useCurrentLocation')}</div>
                <div className="text-xs text-muted-foreground">{t('common:useDeviceGPS')}</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => {
                setShowOptions(false);
                setShowManualEntry(true);
              }}
            >
              <Pencil className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">{t('common:enterCoordinates')}</div>
                <div className="text-xs text-muted-foreground">{t('common:manualEntry')}</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => {
                setShowOptions(false);
                setShowMapPicker(true);
              }}
            >
              <MapPinned className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">{t('common:pickOnMap')}</div>
                <div className="text-xs text-muted-foreground">{t('common:selectFromMap')}</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              {t('common:enterCoordinates')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">{t('common:latitude')}</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="1.234567"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">{t('common:longitude')}</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="9.876543"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowManualEntry(false)} className="flex-1">
                {t('common:cancel')}
              </Button>
              <Button onClick={handleManualSubmit} className="flex-1">
                {t('common:confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Picker */}
      <UniversalLocationPicker
        open={showMapPicker}
        onOpenChange={setShowMapPicker}
        onConfirm={handleMapConfirm}
      />
    </div>
  );
};
