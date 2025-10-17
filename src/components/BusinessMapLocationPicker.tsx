import { useState } from "react";
import MapLocationPicker from "./MapLocationPicker";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BusinessMapLocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: any) => void;
}

export const BusinessMapLocationPicker = ({ onLocationSelect }: BusinessMapLocationPickerProps) => {
  const { t } = useTranslation(['business', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleConfirm = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    // For now, pass minimal address data - we'll enhance reverse geocoding later
    onLocationSelect(lat, lng, {
      street: "",
      city: "",
      region: "",
      country: "Equatorial Guinea"
    });
  };

  return (
    <div className="space-y-4">
      <Button 
        type="button"
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <MapPin className="h-4 w-4 mr-2" />
        {selectedLocation 
          ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
          : t('business:registration.selectLocation')}
      </Button>
      
      <MapLocationPicker
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
