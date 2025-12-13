import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryProofCaptureProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProofData) => Promise<{ success: boolean }>;
  orderNumber: string;
  recipientName: string;
}

export interface ProofData {
  proof_type: string;
  photo_url?: string;
  received_by_name?: string;
  relationship_to_recipient?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export const DeliveryProofCapture = ({
  open,
  onClose,
  onSubmit,
  orderNumber,
  recipientName
}: DeliveryProofCaptureProps) => {
  const { t } = useTranslation('postal');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState<ProofData>({
    proof_type: 'delivered',
    received_by_name: recipientName,
    relationship_to_recipient: 'recipient',
    notes: ''
  });

  // Get current location on open
  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('Location access denied:', err)
      );
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await onSubmit({
        ...formData,
        latitude: location?.lat,
        longitude: location?.lng
      });

      if (result.success) {
        toast.success(t('proof.captureSuccess'));
        onClose();
      } else {
        toast.error(t('proof.captureError'));
      }
    } catch {
      toast.error(t('proof.captureError'));
    } finally {
      setLoading(false);
    }
  };

  const relationships = [
    { value: 'recipient', label: t('proof.recipientSelf') },
    { value: 'family', label: t('proof.family') },
    { value: 'neighbor', label: t('proof.neighbor') },
    { value: 'security', label: t('proof.security') },
    { value: 'other', label: t('proof.other') }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('proof.captureTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium">{orderNumber}</p>
            <p className="text-muted-foreground">{recipientName}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('proof.receivedBy')}</Label>
            <Input
              value={formData.received_by_name || ''}
              onChange={(e) => setFormData({ ...formData, received_by_name: e.target.value })}
              placeholder={t('proof.enterName')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('proof.relationship')}</Label>
            <Select
              value={formData.relationship_to_recipient}
              onValueChange={(v) => setFormData({ ...formData, relationship_to_recipient: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relationships.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('proof.notes')}</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('proof.notesPlaceholder')}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {location ? (
              <span className="text-green-600">{t('proof.locationCaptured')}</span>
            ) : (
              <span>{t('proof.gettingLocation')}</span>
            )}
          </div>

          {/* Photo capture placeholder - would integrate with device camera */}
          <Button variant="outline" className="w-full" disabled>
            <Camera className="h-4 w-4 mr-2" />
            {t('proof.takePhoto')}
          </Button>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('common:buttons.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.received_by_name}
            className="w-full sm:w-auto"
          >
            {loading ? t('common:buttons.loading') : t('proof.confirmDelivery')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
