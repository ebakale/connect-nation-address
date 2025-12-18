import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePickupRequests } from '@/hooks/usePickupRequests';
import { UACAddressPicker, SelectedAddress } from '@/components/UACAddressPicker';
import { TimeWindow } from '@/types/postalEnhanced';
import { CalendarIcon, Package, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PickupRequestFormProps {
  open: boolean;
  onClose: () => void;
}

export const PickupRequestForm = ({ open, onClose }: PickupRequestFormProps) => {
  const { t } = useTranslation('postal');
  const { createRequest } = usePickupRequests();
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(undefined);

  const [formData, setFormData] = useState({
    pickup_address_uac: '',
    package_description: '',
    package_count: 1,
    estimated_weight_grams: undefined as number | undefined,
    preferred_time_window: 'any' as TimeWindow,
    contact_name: '',
    contact_phone: '',
    pickup_notes: '',
  });

  const timeWindows: TimeWindow[] = ['any', 'morning', 'afternoon', 'evening'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress || !preferredDate || !formData.contact_name) return;

    setLoading(true);
    const success = await createRequest({
      pickup_address_uac: selectedAddress.uac,
      package_description: formData.package_description || undefined,
      package_count: formData.package_count,
      estimated_weight_grams: formData.estimated_weight_grams,
      preferred_date: format(preferredDate, 'yyyy-MM-dd'),
      preferred_time_window: formData.preferred_time_window,
      contact_name: formData.contact_name,
      contact_phone: formData.contact_phone || undefined,
      pickup_notes: formData.pickup_notes || undefined,
    });
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('pickup.requestTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Address */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('pickup.pickupLocation')}
            </h3>
            <div className="space-y-2">
              <Label>{t('pickup.address')} *</Label>
              <UACAddressPicker
                onAddressSelect={(address) => {
                  setSelectedAddress(address);
                  setFormData({ ...formData, pickup_address_uac: address.uac });
                }}
                onClear={() => {
                  setSelectedAddress(null);
                  setFormData({ ...formData, pickup_address_uac: '' });
                }}
                placeholder={t('pickup.searchAddress')}
                showDescription={true}
                allowPrivateAddresses={true}
              />
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('pickup.packageDetails')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('pickup.packageDescription')}</Label>
                <Textarea
                  value={formData.package_description}
                  onChange={(e) => setFormData({ ...formData, package_description: e.target.value })}
                  placeholder={t('pickup.descriptionPlaceholder')}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pickup.packageCount')} *</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.package_count}
                  onChange={(e) => setFormData({ ...formData, package_count: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pickup.estimatedWeight')}</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.estimated_weight_grams || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_weight_grams: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder={t('pickup.weightPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('pickup.schedule')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('pickup.preferredDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !preferredDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {preferredDate ? format(preferredDate, "PPP") : t('pickup.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={preferredDate}
                      onSelect={setPreferredDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('pickup.preferredTime')}</Label>
                <Select
                  value={formData.preferred_time_window}
                  onValueChange={(v) => setFormData({ ...formData, preferred_time_window: v as TimeWindow })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeWindows.map((tw) => (
                      <SelectItem key={tw} value={tw}>
                        {t(`preferences.${tw}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('pickup.contactInfo')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('pickup.contactName')} *</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pickup.contactPhone')}</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t('pickup.notes')}</Label>
            <Textarea
              value={formData.pickup_notes}
              onChange={(e) => setFormData({ ...formData, pickup_notes: e.target.value })}
              placeholder={t('pickup.notesPlaceholder')}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('common:buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedAddress || !preferredDate || !formData.contact_name}
              className="w-full sm:w-auto"
            >
              {loading ? t('common:buttons.loading') : t('pickup.submitRequest')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
