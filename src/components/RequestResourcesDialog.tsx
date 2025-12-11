import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Car, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface RequestResourcesDialogProps {
  unitId?: string;
  unitCode?: string;
  children: React.ReactNode;
}

export const RequestResourcesDialog: React.FC<RequestResourcesDialogProps> = ({ 
  unitId, 
  unitCode, 
  children 
}) => {
  const { user } = useAuth();
  const { t } = useTranslation('emergency');
  const [open, setOpen] = useState(false);
  const [resourceType, setResourceType] = useState('equipment');
  const [urgency, setUrgency] = useState('3');
  const [quantity, setQuantity] = useState('1');
  const [specificItems, setSpecificItems] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestResources = async () => {
    if (!specificItems.trim()) {
      toast.error(t('requestResourcesDialog.specifyItems'));
      return;
    }

    setLoading(true);
    try {
      const resourceMessage = `RESOURCE REQUEST
Unit: ${unitCode}
Type: ${resourceType.toUpperCase()}
Urgency: ${urgency === '1' ? 'CRITICAL' : urgency === '2' ? 'HIGH' : 'STANDARD'}
Quantity: ${quantity}
Items Requested: ${specificItems}
Delivery Location: ${deliveryLocation || 'Current position'}
Notes: ${additionalNotes || 'None'}`;

      const { error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          message_content: resourceMessage,
          message_type: 'resource_request',
          priority_level: parseInt(urgency),
          unit_id: unitId,
          metadata: {
            unit_code: unitCode,
            resource_type: resourceType,
            quantity: parseInt(quantity),
            specific_items: specificItems,
            delivery_location: deliveryLocation,
            additional_notes: additionalNotes
          }
        }
      });

      if (error) throw error;

      // Also log to emergency_incident_logs for audit trail
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: '00000000-0000-0000-0000-000000000000',
          user_id: user?.id,
          action: 'resource_request',
          details: { 
            unit_code: unitCode,
            resource_type: resourceType,
            quantity: parseInt(quantity),
            specific_items: specificItems,
            delivery_location: deliveryLocation,
            urgency_level: parseInt(urgency),
            timestamp: new Date().toISOString()
          }
        });

      toast.success(t('requestResourcesDialog.requestSent'));
      
      // Reset form
      setResourceType('equipment');
      setUrgency('3');
      setQuantity('1');
      setSpecificItems('');
      setDeliveryLocation('');
      setAdditionalNotes('');
      setOpen(false);
    } catch (error) {
      console.error('Error requesting resources:', error);
      toast.error(t('requestResourcesDialog.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('requestResourcesDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('requestResourcesDialog.description', { unitCode })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource-type">{t('requestResourcesDialog.resourceType')}</Label>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('requestResourcesDialog.selectResourceType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vehicle">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {t('requestResourcesDialog.resourceTypes.vehicle')}
                    </div>
                  </SelectItem>
                  <SelectItem value="equipment">{t('requestResourcesDialog.resourceTypes.equipment')}</SelectItem>
                  <SelectItem value="personnel">{t('requestResourcesDialog.resourceTypes.personnel')}</SelectItem>
                  <SelectItem value="medical">{t('requestResourcesDialog.resourceTypes.medical')}</SelectItem>
                  <SelectItem value="tactical">{t('requestResourcesDialog.resourceTypes.tactical')}</SelectItem>
                  <SelectItem value="other">{t('requestResourcesDialog.resourceTypes.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">{t('requestResourcesDialog.urgencyLevel')}</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder={t('requestResourcesDialog.selectUrgency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      {t('requestResourcesDialog.urgencyOptions.critical')}
                    </div>
                  </SelectItem>
                  <SelectItem value="2">{t('requestResourcesDialog.urgencyOptions.high')}</SelectItem>
                  <SelectItem value="3">{t('requestResourcesDialog.urgencyOptions.standard')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t('requestResourcesDialog.quantity')}</Label>
            <Select value={quantity} onValueChange={setQuantity}>
              <SelectTrigger>
                <SelectValue placeholder={t('requestResourcesDialog.selectQuantity')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specific-items">{t('requestResourcesDialog.specificItems')} *</Label>
            <Textarea
              id="specific-items"
              value={specificItems}
              onChange={(e) => setSpecificItems(e.target.value)}
              placeholder={t('requestResourcesDialog.specificItemsPlaceholder')}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-location">{t('requestResourcesDialog.deliveryLocation')}</Label>
            <Input
              id="delivery-location"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder={t('requestResourcesDialog.deliveryLocationPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-notes">{t('requestResourcesDialog.additionalNotes')}</Label>
            <Textarea
              id="additional-notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={t('requestResourcesDialog.additionalNotesPlaceholder')}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('requestResourcesDialog.cancel')}
            </Button>
            <Button 
              onClick={handleRequestResources} 
              disabled={loading || !specificItems.trim()}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              {loading ? t('requestResourcesDialog.sending') : t('requestResourcesDialog.sendRequest')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
