import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReturnOrders } from '@/hooks/useReturnOrders';
import { ReturnReason } from '@/types/postalEnhanced';
import { RotateCcw, Package, AlertTriangle } from 'lucide-react';

interface InitiateReturnFormProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
}

export const InitiateReturnForm = ({ open, onClose, orderId, orderNumber }: InitiateReturnFormProps) => {
  const { t } = useTranslation('postal');
  const { createReturn } = useReturnOrders();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    return_reason: '' as ReturnReason | '',
    return_reason_details: '',
    pickup_requested: false,
    notes: '',
  });

  const returnReasons: ReturnReason[] = [
    'wrong_item',
    'damaged',
    'refused',
    'undeliverable',
    'customer_return',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.return_reason) return;

    setLoading(true);
    const result = await createReturn({
      original_order_id: orderId,
      return_reason: formData.return_reason as ReturnReason,
      return_reason_details: formData.return_reason_details || undefined,
      pickup_requested: formData.pickup_requested,
      notes: formData.notes || undefined,
    });
    setLoading(false);

    if (result) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {t('returns.initiateReturn')}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('returns.forOrder')}: {orderNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Return Reason */}
          <div className="space-y-2">
            <Label>{t('returns.reason')} *</Label>
            <Select
              value={formData.return_reason}
              onValueChange={(v) => setFormData({ ...formData, return_reason: v as ReturnReason })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('returns.selectReason')} />
              </SelectTrigger>
              <SelectContent>
                {returnReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {t(`returns.reasons.${reason}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Details */}
          <div className="space-y-2">
            <Label>{t('returns.details')}</Label>
            <Textarea
              value={formData.return_reason_details}
              onChange={(e) => setFormData({ ...formData, return_reason_details: e.target.value })}
              placeholder={t('returns.detailsPlaceholder')}
              rows={3}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label>{t('returns.schedulePickup')}</Label>
              <Switch
                checked={formData.pickup_requested}
                onCheckedChange={(v) => setFormData({ ...formData, pickup_requested: v })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t('returns.notes')}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('returns.notesPlaceholder')}
              rows={2}
            />
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('returns.labelNotice')}
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('common:buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.return_reason}
              className="w-full sm:w-auto"
            >
              {loading ? t('common:buttons.loading') : t('returns.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
