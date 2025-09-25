import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, StarOff } from 'lucide-react';
import { useSavedLocations } from '@/hooks/useSavedLocations';

interface SaveLocationButtonProps {
  latitude: number;
  longitude: number;
  uac?: string;
  addressComponents?: any;
  defaultName?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const SaveLocationButton: React.FC<SaveLocationButtonProps> = ({
  latitude,
  longitude,
  uac,
  addressComponents,
  defaultName,
  variant = "outline",
  size = "sm",
  className
}) => {
  const { savedLocations, addSavedLocation, deleteSavedLocation, isLocationSaved } = useSavedLocations();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: defaultName || '',
    description: '',
    tags: ''
  });

  const isSaved = isLocationSaved(latitude, longitude);
  const existingLocation = savedLocations.find(loc => 
    Math.abs(loc.latitude - latitude) < 0.0001 &&
    Math.abs(loc.longitude - longitude) < 0.0001
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    const locationData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      latitude,
      longitude,
      uac,
      address_components: addressComponents || {},
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };

    const result = await addSavedLocation(locationData);
    if (result) {
      setShowDialog(false);
      setFormData({ name: '', description: '', tags: '' });
    }
  };

  const handleUnsave = async () => {
    if (existingLocation) {
      await deleteSavedLocation(existingLocation.id);
    }
  };

  if (isSaved) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleUnsave}
        title="Remove from saved locations"
      >
        <Star className="h-4 w-4 fill-current" />
        {size !== "icon" && " Saved"}
      </Button>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          title="Save location"
        >
          <StarOff className="h-4 w-4" />
          {size !== "icon" && " Save"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Location</DialogTitle>
          <DialogDescription>
            Add this location to your saved locations for quick access
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Client Office, Survey Point A"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional notes about this location"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., client, survey, important (comma-separated)"
            />
          </div>

          {/* Location info */}
          <div className="bg-muted p-3 rounded text-sm">
            <div><strong>Coordinates:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}</div>
            {uac && <div><strong>UAC:</strong> {uac}</div>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Save Location</Button>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};