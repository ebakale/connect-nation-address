import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { PackageType, CreateDeliveryOrderInput } from '@/types/postal';
import { UACAddressPicker, SelectedAddress } from '@/components/UACAddressPicker';

interface DeliveryOrderFormProps {
  open: boolean;
  onClose: () => void;
}

export const DeliveryOrderForm = ({ open, onClose }: DeliveryOrderFormProps) => {
  const { t } = useTranslation('postal');
  const { createOrder } = useDeliveryOrders();
  const [loading, setLoading] = useState(false);
  const [validatedAddress, setValidatedAddress] = useState<SelectedAddress | null>(null);
  const [formData, setFormData] = useState<CreateDeliveryOrderInput>({
    sender_name: '',
    recipient_name: '',
    recipient_address_uac: '',
    package_type: 'letter',
    requires_signature: true,
    requires_id_verification: false,
    priority_level: 3,
  });

  const packageTypes: PackageType[] = [
    'letter', 'small_parcel', 'medium_parcel', 'large_parcel',
    'document', 'registered_mail', 'express', 'government_document'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await createOrder(formData);
    
    setLoading(false);
    if (result) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('order.newOrder')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">{t('sender.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('sender.name')} *</Label>
                <Input
                  value={formData.sender_name}
                  onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('sender.phone')}</Label>
                <Input
                  value={formData.sender_phone || ''}
                  onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Recipient Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">{t('recipient.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('recipient.name')} *</Label>
                <Input
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('recipient.address')} (UAC) *</Label>
                <UACAddressPicker
                  onAddressSelect={(address) => {
                    setValidatedAddress(address);
                    setFormData({ ...formData, recipient_address_uac: address.uac });
                  }}
                  onClear={() => {
                    setValidatedAddress(null);
                    setFormData({ ...formData, recipient_address_uac: '' });
                  }}
                  placeholder={t('recipient.searchAddress')}
                  showDescription={true}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('recipient.phone')}</Label>
                <Input
                  value={formData.recipient_phone || ''}
                  onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('recipient.email')}</Label>
                <Input
                  type="email"
                  value={formData.recipient_email || ''}
                  onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Package Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">{t('package.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('package.type')} *</Label>
                <Select
                  value={formData.package_type}
                  onValueChange={(v) => setFormData({ ...formData, package_type: v as PackageType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packageTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`package.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('priority.title')}</Label>
                <Select
                  value={String(formData.priority_level)}
                  onValueChange={(v) => setFormData({ ...formData, priority_level: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={String(level)}>
                        {t(`priority.level${level}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md">
                <Label>{t('package.requiresSignature')}</Label>
                <Switch
                  checked={formData.requires_signature}
                  onCheckedChange={(v) => setFormData({ ...formData, requires_signature: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md">
                <Label>{t('package.requiresIdVerification')}</Label>
                <Switch
                  checked={formData.requires_id_verification}
                  onCheckedChange={(v) => setFormData({ ...formData, requires_id_verification: v })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('package.notes')}</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('common:buttons.cancel')}
            </Button>
            <Button type="submit" disabled={loading || !validatedAddress} className="w-full sm:w-auto">
              {loading ? t('common:buttons.loading') : t('order.createOrder')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
