import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bookmark, Plus } from 'lucide-react';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface SaveLocationButtonProps {
  address: {
    uac: string;
    street: string;
    city: string;
    region: string;
    country: string;
    building?: string;
    latitude: number;
    longitude: number;
    addressType?: string;
  };
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const SaveLocationButton: React.FC<SaveLocationButtonProps> = ({ 
  address, 
  variant = 'outline',
  size = 'sm',
  className 
}) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    contact_phone: '',
    description: '',
    tags: ''
  });
  
  const { addSavedLocation, isLocationSaved } = useSavedLocations();
  const { toast } = useToast();

  const isAlreadySaved = isLocationSaved(address.latitude, address.longitude);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: t('dashboard:nameRequired'),
        description: t('dashboard:pleaseEnterName'),
        variant: "destructive"
      });
      return;
    }

    const addressComponents = {
      street: address.street,
      city: address.city,
      region: address.region,
      country: address.country,
      building: address.building
    };

    const locationData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      latitude: address.latitude,
      longitude: address.longitude,
      uac: address.uac,
      contact_name: formData.contact_name.trim() || undefined,
      contact_phone: formData.contact_phone.trim() || undefined,
      address_components: addressComponents,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };

    const result = await addSavedLocation(locationData);
    if (result) {
      setShowDialog(false);
      setFormData({
        name: '',
        contact_name: '',
        contact_phone: '',
        description: '',
        tags: ''
      });
    }
  };

  const handleOpenDialog = () => {
    // Pre-fill the name with the address
    const defaultName = `${address.street}${address.building ? ', ' + address.building : ''}, ${address.city}`;
    setFormData(prev => ({
      ...prev,
      name: defaultName
    }));
    setShowDialog(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenDialog}
        disabled={isAlreadySaved}
        className={className}
      >
        <Bookmark className="h-4 w-4 mr-2" />
        {isAlreadySaved ? t('dashboard:saved') : t('dashboard:saveToAddressBook')}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('dashboard:saveToAddressBook')}</DialogTitle>
            <DialogDescription>
              {t('dashboard:saveAddressToBook')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('dashboard:locationName')} *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('dashboard:locationNamePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('dashboard:contactName')}</label>
              <Input
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                placeholder={t('dashboard:contactNamePlaceholder')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard:associateWithContact')}
              </p>
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
              <label className="text-sm font-medium">{t('dashboard:notes')}</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('dashboard:notesPlaceholder')}
                rows={2}
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

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">{t('dashboard:addressDetails')}:</p>
              <p className="text-muted-foreground text-xs">
                {t('dashboard:uac')}: {address.uac}<br />
                {address.street}{address.building ? ', ' + address.building : ''}<br />
                {address.city}, {address.region}, {address.country}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard:saveToAddressBook')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                {t('common:cancel')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
