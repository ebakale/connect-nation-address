import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Radio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface EmergencyBackupButtonProps {
  unitId?: string;
  unitCode?: string;
  incidentId?: string;
  className?: string;
}

export const EmergencyBackupButton: React.FC<EmergencyBackupButtonProps> = ({
  unitId,
  unitCode,
  incidentId,
  className
}) => {
  const { user } = useAuth();
  const { t } = useTranslation('emergency');
  const [open, setOpen] = useState(false);
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOfficerDown = async () => {
    setLoading(true);
    try {
      // Get current location
      let locationData = { latitude: null as number | null, longitude: null as number | null, address: '' };
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          locationData.latitude = position.coords.latitude;
          locationData.longitude = position.coords.longitude;
        } catch (e) {
          console.log('Could not get location:', e);
        }
      }

      // Send emergency backup request with maximum priority
      const emergencyMessage = `🚨 OFFICER DOWN / EMERGENCY BACKUP 🚨
Unit: ${unitCode || 'Unknown'}
Situation: ${situation || 'Officer requires immediate assistance'}
Location: ${locationData.latitude ? `${locationData.latitude}, ${locationData.longitude}` : 'Unknown'}

ALL AVAILABLE UNITS RESPOND IMMEDIATELY`;

      // Call the unit-communications function for emergency broadcast
      const { error: commError } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          message_content: emergencyMessage,
          message_type: 'officer_down',
          priority_level: 0, // Maximum priority
          unit_id: unitId,
          metadata: {
            unit_code: unitCode,
            backup_type: 'officer_down',
            is_emergency: true,
            location_latitude: locationData.latitude,
            location_longitude: locationData.longitude,
            situation: situation,
            sent_from: 'emergency_button'
          }
        }
      });

      if (commError) throw commError;

      // Also process as backup request with is_officer_down flag
      await supabase.functions.invoke('process-backup-request', {
        body: {
          requesting_unit: unitCode,
          unit_id: unitId,
          incident_id: incidentId,
          backup_type: 'officer_down',
          urgency_level: 0,
          reason: situation || 'Officer requires immediate assistance',
          location: locationData.latitude ? `${locationData.latitude}, ${locationData.longitude}` : 'Current position',
          additional_units: 999, // All available
          is_officer_down: true,
          requested_by_supervisor: false
        }
      });

      toast.success(t('emergencyBackup.alertSent'), {
        description: t('emergencyBackup.allUnitsNotified')
      });

      setSituation('');
      setOpen(false);
    } catch (error) {
      console.error('Error sending emergency backup:', error);
      toast.error(t('emergencyBackup.failedToSend'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="lg"
          className={`bg-red-600 hover:bg-red-700 text-white font-bold animate-pulse hover:animate-none ${className}`}
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          {t('emergencyBackup.officerDown')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-red-500 border-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-xl">
            <AlertTriangle className="h-6 w-6" />
            {t('emergencyBackup.emergencyBackupTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {t('emergencyBackup.emergencyDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
              <Radio className="h-4 w-4" />
              {t('emergencyBackup.broadcastWarning')}
            </div>
            <p className="text-sm text-red-600 dark:text-red-300">
              {t('emergencyBackup.broadcastDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="situation">{t('emergencyBackup.situationOptional')}</Label>
            <Textarea
              id="situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder={t('emergencyBackup.situationPlaceholder')}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>{t('emergencyBackup.unitInfo', { unitCode: unitCode || 'Unknown' })}</span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleOfficerDown}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <Radio className="h-4 w-4 mr-2 animate-spin" />
                {t('emergencyBackup.sending')}
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t('emergencyBackup.sendEmergencyAlert')}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
