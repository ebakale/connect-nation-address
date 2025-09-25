import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { MapPin, Edit, Trash2, Plus, Navigation, Star, Tag } from 'lucide-react';
import { useSavedLocations, SavedLocation } from '@/hooks/useSavedLocations';
import { useTranslation } from 'react-i18next';

interface SavedLocationsManagerProps {
  onNavigate?: (location: SavedLocation) => void;
  onClose?: () => void;
}

export const SavedLocationsManager: React.FC<SavedLocationsManagerProps> = ({ 
  onNavigate, 
  onClose 
}) => {
  const { savedLocations, loading, addSavedLocation, updateSavedLocation, deleteSavedLocation } = useSavedLocations();
  const { t } = useTranslation(['dashboard', 'common']);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter locations based on search term
  const filteredLocations = savedLocations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (location: SavedLocation) => {
    setEditingLocation(location);
  };

  const handleDelete = async (location: SavedLocation) => {
    if (window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      await deleteSavedLocation(location.id);
    }
  };

  const handleNavigateToLocation = (location: SavedLocation) => {
    if (onNavigate) {
      onNavigate(location);
    } else {
      // Default navigation behavior - open in maps
      const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            {t('dashboard:savedLocations')}
          </h2>
          <p className="text-muted-foreground">{t('dashboard:savedLocationsDesc')}</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Saved Location</DialogTitle>
              <DialogDescription>
                Create a bookmark for a frequently accessed location
              </DialogDescription>
            </DialogHeader>
            <AddLocationForm 
              onSuccess={() => setShowAddDialog(false)} 
              onCancel={() => setShowAddDialog(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search saved locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <Separator />

      {/* Locations list */}
      {filteredLocations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved locations</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No locations match your search.' : 'Start by adding your first saved location.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {location.name}
                    </CardTitle>
                    {location.description && (
                      <CardDescription className="mt-1">
                        {location.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(location)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(location)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Coordinates */}
                  <div className="text-sm text-muted-foreground">
                    <strong>Coordinates:</strong> {formatCoordinates(location.latitude, location.longitude)}
                  </div>

                  {/* UAC if available */}
                  {location.uac && (
                    <div className="text-sm">
                      <strong>UAC:</strong> <Badge variant="secondary">{location.uac}</Badge>
                    </div>
                  )}

                  {/* Tags */}
                  {location.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {location.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleNavigateToLocation(location)}
                      className="flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Navigate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingLocation && (
        <Dialog open={true} onOpenChange={() => setEditingLocation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Saved Location</DialogTitle>
              <DialogDescription>
                Update the details of your saved location
              </DialogDescription>
            </DialogHeader>
            <EditLocationForm 
              location={editingLocation}
              onSuccess={() => setEditingLocation(null)} 
              onCancel={() => setEditingLocation(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Add Location Form Component
const AddLocationForm: React.FC<{
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
  const { addSavedLocation } = useSavedLocations();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    uac: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.latitude || !formData.longitude) {
      return;
    }

    const locationData = {
      name: formData.name,
      description: formData.description || undefined,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      uac: formData.uac || undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };

    const result = await addSavedLocation(locationData);
    if (result) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Main Office"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Latitude *</label>
          <Input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
            placeholder="e.g., 3.7504"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Longitude *</label>
          <Input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
            placeholder="e.g., 8.7821"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">UAC</label>
        <Input
          value={formData.uac}
          onChange={(e) => setFormData(prev => ({ ...prev, uac: e.target.value }))}
          placeholder="e.g., GQ-BN-MAL-A1B2C3"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tags</label>
        <Input
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="e.g., office, important, frequent (comma-separated)"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Save Location</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

// Edit Location Form Component
const EditLocationForm: React.FC<{
  location: SavedLocation;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ location, onSuccess, onCancel }) => {
  const { updateSavedLocation } = useSavedLocations();
  const [formData, setFormData] = useState({
    name: location.name,
    description: location.description || '',
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    uac: location.uac || '',
    tags: location.tags.join(', ')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.latitude || !formData.longitude) {
      return;
    }

    const updates = {
      name: formData.name,
      description: formData.description || undefined,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      uac: formData.uac || undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };

    const result = await updateSavedLocation(location.id, updates);
    if (result) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Main Office"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Latitude *</label>
          <Input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
            placeholder="e.g., 3.7504"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Longitude *</label>
          <Input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
            placeholder="e.g., 8.7821"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">UAC</label>
        <Input
          value={formData.uac}
          onChange={(e) => setFormData(prev => ({ ...prev, uac: e.target.value }))}
          placeholder="e.g., GQ-BN-MAL-A1B2C3"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tags</label>
        <Input
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="e.g., office, important, frequent (comma-separated)"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Update Location</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};