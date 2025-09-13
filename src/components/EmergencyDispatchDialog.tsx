import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MapPin, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface EmergencyDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmergencyDispatchDialog = ({ open, onOpenChange }: EmergencyDispatchDialogProps) => {
  const { t } = useTranslation('emergency');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emergencyType: "",
    priority: "high",
    location: "",
    description: "",
    callerName: "",
    callerPhone: ""
  });

  const emergencyTypes = [
    "medical",
    "fire",
    "robbery",
    "assault", 
    "domestic_violence",
    "traffic_accident",
    "suspicious_activity",
    "other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create emergency incident
      const { data: incident, error: incidentError } = await supabase
        .from('emergency_incidents')
        .insert({
          emergency_type: formData.emergencyType,
          priority_level: formData.priority === 'low' ? 1 : formData.priority === 'medium' ? 2 : formData.priority === 'high' ? 3 : 4,
          location_address: formData.location,
          incident_message: formData.description,
          reporter_contact_info: `${formData.callerName} - ${formData.callerPhone}`,
          status: 'reported',
          encrypted_message: formData.description, // Required field
          incident_number: `INC-${Date.now()}` // Generate incident number
        })
        .select()
        .single();

      if (incidentError) throw incidentError;

      // Notify emergency operators
      const { error: notifyError } = await supabase.functions.invoke('notify-emergency-operators', {
        body: {
          incidentId: incident.id,
          priority: formData.priority,
          emergencyType: formData.emergencyType,
          incidentNumber: incident.incident_number
        }
      });

      if (notifyError) {
        console.error('Error notifying operators:', notifyError);
        // Don't fail the whole operation if notification fails
      }

      toast({
        title: t('dialogs.emergencyDispatch.successTitle'),
        description: t('dialogs.emergencyDispatch.successDescription', { incidentNumber: incident.incident_number }),
      });

      // Reset form and close dialog
      setFormData({
        emergencyType: "",
        priority: "high",
        location: "",
        description: "",
        callerName: "",
        callerPhone: ""
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating emergency dispatch:', error);
      toast({
        title: t('errorTitle', { defaultValue: 'Error' }),
        description: t('dialogs.emergencyDispatch.errorDescription'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t('emergencyDispatch')}
          </DialogTitle>
          <DialogDescription>
            {t('dialogs.emergencyDispatch.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyType">{t('emergencyType')}</Label>
              <Select 
                value={formData.emergencyType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, emergencyType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectEmergencyType')} />
                </SelectTrigger>
                <SelectContent>
                  {emergencyTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">{t('priority')}</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('low')}</SelectItem>
                  <SelectItem value="medium">{t('medium')}</SelectItem>
                  <SelectItem value="high">{t('high')}</SelectItem>
                  <SelectItem value="critical">{t('critical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('location')}
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder={t('dialogs.emergencyDispatch.locationPlaceholder')}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('dialogs.emergencyDispatch.descriptionPlaceholder')}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="callerName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('dialogs.emergencyDispatch.callerName')}
              </Label>
              <Input
                id="callerName"
                value={formData.callerName}
                onChange={(e) => setFormData(prev => ({ ...prev, callerName: e.target.value }))}
                placeholder={t('dialogs.emergencyDispatch.callerName')}
              />
            </div>

            <div>
              <Label htmlFor="callerPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t('dialogs.emergencyDispatch.phoneNumber')}
              </Label>
              <Input
                id="callerPhone"
                value={formData.callerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, callerPhone: e.target.value }))}
                placeholder={t('dialogs.emergencyDispatch.phoneNumber')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.emergencyType || !formData.location || !formData.description}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? t('dialogs.emergencyDispatch.submitting') : t('dialogs.emergencyDispatch.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyDispatchDialog;