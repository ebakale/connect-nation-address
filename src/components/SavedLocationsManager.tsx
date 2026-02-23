import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MapPin, Edit, Trash2, Plus, Star, Tag, ExternalLink, User, Phone as PhoneIcon } from 'lucide-react';
import { useSavedLocations, SavedLocation } from '@/hooks/useSavedLocations';
import { useTranslation } from 'react-i18next';
import { EnhancedAddressDetailModal } from '@/components/EnhancedAddressDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressDetail, setShowAddressDetail] = useState(false);

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
    if (window.confirm(`${t('dashboard:confirmDelete')} "${location.name}"?`)) {
      await deleteSavedLocation(location.id);
    }
  };

  const handleViewAddress = async (location: SavedLocation) => {
    if (!location.uac) {
      toast({
        title: t('common:error'),
        description: t('dashboard:noUacError'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('uac', location.uac)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: t('dashboard:addressNotFound'),
          description: t('dashboard:addressNotFoundDesc'),
          variant: "destructive",
        });
        return;
      }

      setSelectedAddress(data);
      setShowAddressDetail(true);
    } catch (error: any) {
      console.error('Error fetching address:', error);
      toast({
        title: t('common:error'),
        description: t('dashboard:errorLoadingAddress'),
        variant: "destructive",
      });
    }
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
            {t('dashboard:savedAddresses')}
          </h2>
          <p className="text-muted-foreground">{t('dashboard:savedAddressesDesc')}</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('dashboard:addAddress')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard:addNewSavedAddress')}</DialogTitle>
              <DialogDescription>
                {t('dashboard:createBookmarkDesc')}
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
          placeholder={t('dashboard:searchSavedAddresses')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <Separator />

      {/* Locations list */}
      {filteredLocations.length === 0 ? (
        <EmptyState
          icon={Star}
          title={t('dashboard:noSavedAddresses')}
          description={searchTerm ? t('dashboard:noAddressesMatch') : t('dashboard:startByAdding')}
          variant={searchTerm ? 'search' : 'default'}
          action={!searchTerm ? {
            label: t('dashboard:addAddress'),
            onClick: () => setShowAddDialog(true),
          } : undefined}
        />
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2">
          {filteredLocations.map((location) => (
            <AccordionItem 
              key={location.id} 
              value={location.id}
              className="border rounded-lg px-4 hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <User className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">
                      {location.contact_name || location.name}
                    </div>
                    {location.contact_name && location.name !== location.contact_name && (
                      <div className="text-sm text-muted-foreground truncate">
                        {location.name}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-4">
                  {/* Description */}
                  {location.description && (
                    <div className="text-sm text-muted-foreground">
                      {location.description}
                    </div>
                  )}

                  <Separator />

                  {/* UAC */}
                  {location.uac && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('dashboard:uac')}:</span>
                      <Badge variant="secondary">{location.uac}</Badge>
                    </div>
                  )}

                  {/* Contact Phone */}
                  {location.contact_phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('dashboard:contactPhone')}:</span>
                      <span className="text-sm">{location.contact_phone}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {location.tags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex flex-wrap gap-2">
                        {location.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleViewAddress(location)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('dashboard:viewDetails')}
                    </Button>
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Edit Dialog */}
      {editingLocation && (
        <Dialog open={true} onOpenChange={() => setEditingLocation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard:editSavedAddress')}</DialogTitle>
              <DialogDescription>
                {t('dashboard:updateAddressDesc')}
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

      {/* Address Detail Dialog */}
      {selectedAddress && (
        <EnhancedAddressDetailModal
          address={{
            uac: selectedAddress.uac,
            street: selectedAddress.street,
            city: selectedAddress.city,
            region: selectedAddress.region,
            country: selectedAddress.country,
            building: selectedAddress.building,
            latitude: selectedAddress.latitude,
            longitude: selectedAddress.longitude,
            addressType: selectedAddress.address_type,
            verified: selectedAddress.verified,
            completenessScore: selectedAddress.completeness_score || 0
          }}
          open={showAddressDetail}
          onOpenChange={(open) => {
            setShowAddressDetail(open);
            if (!open) setSelectedAddress(null);
          }}
        />
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
  const { t } = useTranslation(['dashboard', 'common']);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    uac: '',
    contact_name: '',
    contact_phone: '',
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
      contact_name: formData.contact_name || undefined,
      contact_phone: formData.contact_phone || undefined,
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
        <label className="text-sm font-medium">{t('dashboard:addressName')} *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t('dashboard:namePlaceholder')}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:addressDescription')}</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('dashboard:descriptionPlaceholder')}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{t('dashboard:latitude')} *</label>
          <Input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
            placeholder={t('dashboard:latitudePlaceholder')}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('dashboard:longitude')} *</label>
          <Input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
            placeholder={t('dashboard:longitudePlaceholder')}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:uac')}</label>
        <Input
          value={formData.uac}
          onChange={(e) => setFormData(prev => ({ ...prev, uac: e.target.value }))}
          placeholder={t('dashboard:uacPlaceholder')}
        />
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:contactName')}</label>
        <Input
          value={formData.contact_name}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
          placeholder={t('dashboard:contactNamePlaceholder')}
        />
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:contactPhone')}</label>
        <Input
          type="tel"
          value={formData.contact_phone}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
          placeholder={t('dashboard:contactPhonePlaceholder')}
        />
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:tags')}</label>
        <Input
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder={t('dashboard:tagsPlaceholder')}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">{t('dashboard:saveAddress')}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>{t('common:cancel')}</Button>
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
  const { t } = useTranslation(['dashboard', 'common']);
  const [formData, setFormData] = useState({
    name: location.name,
    description: location.description || '',
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    uac: location.uac || '',
    contact_name: location.contact_name || '',
    contact_phone: location.contact_phone || '',
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
      contact_name: formData.contact_name || undefined,
      contact_phone: formData.contact_phone || undefined,
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
        <label className="text-sm font-medium">{t('dashboard:addressName')} *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t('dashboard:namePlaceholder')}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:addressDescription')}</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('dashboard:descriptionPlaceholder')}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{t('dashboard:latitude')} *</label>
          <Input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
            placeholder={t('dashboard:latitudePlaceholder')}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('dashboard:longitude')} *</label>
          <Input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
            placeholder={t('dashboard:longitudePlaceholder')}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:uac')}</label>
        <Input
          value={formData.uac}
          onChange={(e) => setFormData(prev => ({ ...prev, uac: e.target.value }))}
          placeholder={t('dashboard:uacPlaceholder')}
        />
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:contactName')}</label>
        <Input
          value={formData.contact_name}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
          placeholder={t('dashboard:contactNamePlaceholder')}
        />
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:contactPhone')}</label>
        <Input
          type="tel"
          value={formData.contact_phone}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
          placeholder={t('dashboard:contactPhonePlaceholder')}
        />
      </div>

      <div>
        <label className="text-sm font-medium">{t('dashboard:tags')}</label>
        <Input
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder={t('dashboard:tagsPlaceholder')}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">{t('dashboard:updateAddress')}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>{t('common:cancel')}</Button>
      </div>
    </form>
  );
};