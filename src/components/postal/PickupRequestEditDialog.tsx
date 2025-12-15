import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Package, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { PickupRequest, TimeWindow, CreatePickupRequestInput } from '@/types/postalEnhanced';

interface PickupRequestEditDialogProps {
  request: PickupRequest;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<CreatePickupRequestInput>) => Promise<boolean>;
  restrictedMode?: boolean; // When true, only contact info and notes can be edited
}

export const PickupRequestEditDialog = ({
  request,
  open,
  onClose,
  onUpdate,
  restrictedMode = false,
}: PickupRequestEditDialogProps) => {
  const { t } = useTranslation('postal');
  const [loading, setLoading] = useState(false);
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    package_description: '',
    package_count: 1,
    estimated_weight_grams: undefined as number | undefined,
    preferred_time_window: 'any' as TimeWindow,
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    pickup_notes: '',
  });

  const timeWindows: TimeWindow[] = ['any', 'morning', 'afternoon', 'evening'];

  // Initialize form data when request changes
  useEffect(() => {
    if (request && open) {
      setPreferredDate(parseISO(request.preferred_date));
      setFormData({
        package_description: request.package_description || '',
        package_count: request.package_count,
        estimated_weight_grams: request.estimated_weight_grams || undefined,
        preferred_time_window: request.preferred_time_window,
        contact_name: request.contact_name,
        contact_phone: request.contact_phone || '',
        contact_email: request.contact_email || '',
        pickup_notes: request.pickup_notes || '',
      });
    }
  }, [request, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_name) return;

    setLoading(true);
    
    // In restricted mode, only send contact fields and notes
    const updates: Partial<CreatePickupRequestInput> = restrictedMode
      ? {
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone || undefined,
          contact_email: formData.contact_email || undefined,
          pickup_notes: formData.pickup_notes || undefined,
        }
      : {
          package_description: formData.package_description || undefined,
          package_count: formData.package_count,
          estimated_weight_grams: formData.estimated_weight_grams,
          preferred_date: preferredDate ? format(preferredDate, 'yyyy-MM-dd') : undefined,
          preferred_time_window: formData.preferred_time_window,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone || undefined,
          pickup_notes: formData.pickup_notes || undefined,
        };

    const success = await onUpdate(request.id, updates);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {restrictedMode ? t('pickup.editContactTitle') : t('pickup.editRequestTitle')}
          </DialogTitle>
        </DialogHeader>

        {/* Restricted mode notice */}
        {restrictedMode && (
          <Alert className="bg-info/10 border-info/20">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-sm">
              {t('pickup.restrictedEditNotice')}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Package Details - disabled in restricted mode */}
          {!restrictedMode && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">{t('pickup.packageDetails')}</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{t('pickup.packageDescription')}</Label>
                  <Textarea
                    value={formData.package_description}
                    onChange={(e) => setFormData({ ...formData, package_description: e.target.value })}
                    placeholder={t('pickup.descriptionPlaceholder')}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        estimated_weight_grams: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="g"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule - disabled in restricted mode */}
          {!restrictedMode && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">{t('pickup.schedule')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          )}

          {/* Contact Info - always editable */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">{t('pickup.contactInfo')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('pickup.contactEmail')}</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Notes - always editable */}
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
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('common:buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.contact_name || (!restrictedMode && !preferredDate)}
              className="w-full sm:w-auto"
            >
              {loading ? t('common:loading') : t('pickup.saveChanges')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
