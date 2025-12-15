import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeliveryPreferences } from '@/hooks/useDeliveryPreferences';
import { TimeWindow, DeliveryPreferences } from '@/types/postalEnhanced';
import { Clock, User, MapPin, Bell, Save, Trash2 } from 'lucide-react';

interface DeliveryPreferencesFormProps {
  open: boolean;
  onClose: () => void;
  addressUac: string;
}

export const DeliveryPreferencesForm = ({ open, onClose, addressUac }: DeliveryPreferencesFormProps) => {
  const { t } = useTranslation('postal');
  const { getPreferencesByUAC, savePreferences, deletePreferences } = useDeliveryPreferences();
  const [saving, setSaving] = useState(false);
  const [existingPrefs, setExistingPrefs] = useState<DeliveryPreferences | null>(null);
  
  const [formData, setFormData] = useState({
    preferred_time_window: 'any' as TimeWindow,
    safe_drop_authorized: false,
    safe_drop_location: '',
    alternate_recipient_authorized: false,
    alternate_recipient_name: '',
    alternate_recipient_phone: '',
    hold_at_post_office: false,
    allow_neighbor_delivery: false,
    notification_email: true,
    notification_sms: true,
    notification_push: false,
    special_instructions: '',
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (open && addressUac) {
        const prefs = await getPreferencesByUAC(addressUac);
        if (prefs) {
          setExistingPrefs(prefs);
          setFormData({
            preferred_time_window: prefs.preferred_time_window || 'any',
            safe_drop_authorized: prefs.safe_drop_authorized || false,
            safe_drop_location: prefs.safe_drop_location || '',
            alternate_recipient_authorized: prefs.alternate_recipient_authorized || false,
            alternate_recipient_name: prefs.alternate_recipient_name || '',
            alternate_recipient_phone: prefs.alternate_recipient_phone || '',
            hold_at_post_office: prefs.hold_at_post_office || false,
            allow_neighbor_delivery: prefs.allow_neighbor_delivery || false,
            notification_email: prefs.notification_email ?? true,
            notification_sms: prefs.notification_sms ?? true,
            notification_push: prefs.notification_push || false,
            special_instructions: prefs.special_instructions || '',
          });
        }
      }
    };
    loadPreferences();
  }, [open, addressUac, getPreferencesByUAC]);

  const timeWindows: TimeWindow[] = ['any', 'morning', 'afternoon', 'evening'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await savePreferences({
      address_uac: addressUac,
      ...formData,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (existingPrefs && confirm(t('preferences.confirmDelete'))) {
      await deletePreferences(existingPrefs.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('preferences.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time Window Preferences */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('preferences.deliveryTiming')}
            </h3>
            <div className="space-y-2">
              <Label>{t('preferences.timeWindow')}</Label>
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

          {/* Safe Drop Options */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('preferences.safeDropOptions')}</h3>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label>{t('preferences.authorizeSafeDrop')}</Label>
              <Switch
                checked={formData.safe_drop_authorized}
                onCheckedChange={(v) => setFormData({ ...formData, safe_drop_authorized: v })}
              />
            </div>
            {formData.safe_drop_authorized && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label>{t('preferences.safeDropLocation')}</Label>
                <Textarea
                  value={formData.safe_drop_location}
                  onChange={(e) => setFormData({ ...formData, safe_drop_location: e.target.value })}
                  placeholder={t('preferences.safeDropPlaceholder')}
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Alternate Recipient */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('preferences.alternateRecipient')}
            </h3>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label>{t('preferences.authorizeAlternate')}</Label>
              <Switch
                checked={formData.alternate_recipient_authorized}
                onCheckedChange={(v) => setFormData({ ...formData, alternate_recipient_authorized: v })}
              />
            </div>
            {formData.alternate_recipient_authorized && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label>{t('preferences.alternateName')}</Label>
                  <Input
                    value={formData.alternate_recipient_name}
                    onChange={(e) => setFormData({ ...formData, alternate_recipient_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('preferences.alternatePhone')}</Label>
                  <Input
                    value={formData.alternate_recipient_phone}
                    onChange={(e) => setFormData({ ...formData, alternate_recipient_phone: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Other Options */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('preferences.otherOptions')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <Label>{t('preferences.holdAtPostOffice')}</Label>
                <Switch
                  checked={formData.hold_at_post_office}
                  onCheckedChange={(v) => setFormData({ ...formData, hold_at_post_office: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md">
                <Label>{t('preferences.allowNeighborDelivery')}</Label>
                <Switch
                  checked={formData.allow_neighbor_delivery}
                  onCheckedChange={(v) => setFormData({ ...formData, allow_neighbor_delivery: v })}
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t('preferences.notifications')}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <Label className="text-sm">{t('preferences.email')}</Label>
                <Switch
                  checked={formData.notification_email}
                  onCheckedChange={(v) => setFormData({ ...formData, notification_email: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md">
                <Label className="text-sm">{t('preferences.sms')}</Label>
                <Switch
                  checked={formData.notification_sms}
                  onCheckedChange={(v) => setFormData({ ...formData, notification_sms: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md">
                <Label className="text-sm">{t('preferences.push')}</Label>
                <Switch
                  checked={formData.notification_push}
                  onCheckedChange={(v) => setFormData({ ...formData, notification_push: v })}
                />
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label>{t('preferences.specialInstructions')}</Label>
            <Textarea
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder={t('preferences.instructionsPlaceholder')}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            {existingPrefs && (
              <Button type="button" variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('preferences.delete')}
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('common:buttons.cancel')}
            </Button>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {saving ? t('common:buttons.loading') : t('preferences.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
