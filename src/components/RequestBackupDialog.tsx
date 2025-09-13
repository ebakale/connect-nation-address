import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Navigation, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface RequestBackupDialogProps {
  unitId?: string;
  unitCode?: string;
  children: React.ReactNode;
  isSupervisor?: boolean;
}

export const RequestBackupDialog: React.FC<RequestBackupDialogProps> = ({ 
  unitId, 
  unitCode, 
  children,
  isSupervisor = false
}) => {
  const { user } = useAuth();
  const { t } = useTranslation('emergency');
  const [open, setOpen] = useState(false);
  const [backupType, setBackupType] = useState('general');
  const [urgency, setUrgency] = useState('2');
  const [reason, setReason] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [additionalUnits, setAdditionalUnits] = useState('1');
  const [medicalNeeded, setMedicalNeeded] = useState(false);
  const [supervisorNeeded, setSupervisorNeeded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  // Fetch available units for supervisors
  const fetchAvailableUnits = async () => {
    if (!isSupervisor || !open) return;

    try {
      const { data: units, error } = await supabase
        .from('emergency_units')
        .select('id, unit_name, unit_code, unit_type, status')
        .order('unit_code');

      if (error) throw error;
      setAvailableUnits(units || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleRequestBackup = async () => {
    if (!reason.trim()) {
      toast.error(t('requestBackupDialog.provideReason'));
      return;
    }

    // For supervisors, ensure a unit is selected
    if (isSupervisor && !selectedUnit) {
      toast.error(t('requestBackupDialog.selectUnit'));
      return;
    }

    const currentUnitId = isSupervisor ? selectedUnit : unitId;
    const currentUnitCode = isSupervisor 
      ? availableUnits.find(u => u.id === selectedUnit)?.unit_code 
      : unitCode;

    setLoading(true);
    try {
      // First, send the backup request message
      const backupMessage = `BACKUP REQUEST - ${backupType.toUpperCase()}
Unit: ${currentUnitCode}
Location: ${currentLocation || 'Current position'}
Urgency: ${urgency === '1' ? 'URGENT' : urgency === '2' ? 'HIGH' : 'STANDARD'}
Additional Units Needed: ${additionalUnits}
Medical Support: ${medicalNeeded ? 'YES' : 'NO'}
Supervisor Requested: ${supervisorNeeded ? 'YES' : 'NO'}
Reason: ${reason}
${isSupervisor ? 'Requested by: Supervisor' : ''}`;

      const { data, error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          message_content: backupMessage,
          message_type: 'backup_request',
          priority_level: parseInt(urgency),
          unit_id: currentUnitId,
          metadata: {
            unit_code: currentUnitCode,
            backup_type: backupType,
            additional_units_requested: parseInt(additionalUnits),
            medical_needed: medicalNeeded,
            supervisor_needed: supervisorNeeded,
            location: currentLocation,
            sent_from: isSupervisor ? 'supervisor_dashboard' : 'unit_lead_dashboard',
            requested_by_supervisor: isSupervisor
          }
        }
      });

      if (error) throw error;

      // Also call the process-backup-request function if it exists
      try {
        await supabase.functions.invoke('process-backup-request', {
          body: {
            requesting_unit: currentUnitCode,
            unit_id: currentUnitId,
            backup_type: backupType,
            urgency_level: parseInt(urgency),
            reason: reason,
            location: currentLocation,
            additional_units: parseInt(additionalUnits),
            medical_support: medicalNeeded,
            supervisor_requested: supervisorNeeded,
            requested_by_supervisor: isSupervisor
          }
        });
      } catch (backupError) {
        console.log('Backup processing function not available, message sent to dispatch');
      }

      toast.success(t('requestBackupDialog.requestSentSuccessfully'));
      
      // Reset form
      setReason('');
      setCurrentLocation('');
      setBackupType('general');
      setUrgency('2');
      setAdditionalUnits('1');
      setMedicalNeeded(false);
      setSupervisorNeeded(false);
      setSelectedUnit('');
      setOpen(false);
    } catch (error) {
      console.error('Error requesting backup:', error);
      toast.error(t('requestBackupDialog.failedToSendRequest'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch units when dialog opens for supervisors
  React.useEffect(() => {
    if (open && isSupervisor) {
      fetchAvailableUnits();
    }
  }, [open, isSupervisor]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            {t('requestBackupDialog.requestBackup')}
          </DialogTitle>
          <DialogDescription>
            {isSupervisor 
              ? t('requestBackupDialog.requestBackupSupervisor')
              : t('requestBackupDialog.requestAdditionalUnits', { unitCode })
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {isSupervisor && (
            <div className="space-y-2">
              <Label htmlFor="unit-select">{t('requestBackupDialog.selectUnitLabel')}</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder={t('requestBackupDialog.chooseUnitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unit_code} - {unit.unit_name} ({unit.unit_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backup-type">{t('requestBackupDialog.backupType')}</Label>
              <Select value={backupType} onValueChange={setBackupType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('requestBackupDialog.selectBackupType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('requestBackupDialog.backupTypes.general')}</SelectItem>
                  <SelectItem value="high_risk">{t('requestBackupDialog.backupTypes.highRisk')}</SelectItem>
                  <SelectItem value="pursuit">{t('requestBackupDialog.backupTypes.pursuit')}</SelectItem>
                  <SelectItem value="crowd_control">{t('requestBackupDialog.backupTypes.crowdControl')}</SelectItem>
                  <SelectItem value="search">{t('requestBackupDialog.backupTypes.search')}</SelectItem>
                  <SelectItem value="domestic">{t('requestBackupDialog.backupTypes.domestic')}</SelectItem>
                  <SelectItem value="weapons">{t('requestBackupDialog.backupTypes.weapons')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">{t('requestBackupDialog.urgencyLevel')}</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder={t('requestBackupDialog.selectUrgency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      {t('requestBackupDialog.urgentImmediate')}
                    </div>
                  </SelectItem>
                  <SelectItem value="2">{t('requestBackupDialog.highPriority')}</SelectItem>
                  <SelectItem value="3">{t('requestBackupDialog.standardPriority')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-units">{t('requestBackupDialog.additionalUnitsNeeded')}</Label>
            <Select value={additionalUnits} onValueChange={setAdditionalUnits}>
              <SelectTrigger>
                <SelectValue placeholder={t('requestBackupDialog.selectNumberUnits')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('requestBackupDialog.oneUnit')}</SelectItem>
                <SelectItem value="2">{t('requestBackupDialog.twoUnits')}</SelectItem>
                <SelectItem value="3">{t('requestBackupDialog.threeUnits')}</SelectItem>
                <SelectItem value="4">{t('requestBackupDialog.fourPlusUnits')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('requestBackupDialog.currentLocationOptional')}</Label>
            <Textarea
              id="location"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder={t('requestBackupDialog.locationPlaceholder')}
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="medical" 
                checked={medicalNeeded} 
                onCheckedChange={(checked) => setMedicalNeeded(checked === true)} 
              />
              <Label htmlFor="medical">{t('requestBackupDialog.medicalSupportNeeded')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="supervisor" 
                checked={supervisorNeeded} 
                onCheckedChange={(checked) => setSupervisorNeeded(checked === true)} 
              />
              <Label htmlFor="supervisor">{t('requestBackupDialog.supervisorResponseRequested')}</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t('requestBackupDialog.reasonForBackupRequest')}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('requestBackupDialog.reasonPlaceholder')}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('requestBackupDialog.cancel')}
            </Button>
            <Button 
              onClick={handleRequestBackup} 
              disabled={loading || !reason.trim() || (isSupervisor && !selectedUnit)}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Navigation className="h-4 w-4" />
              {loading ? t('requestBackupDialog.requesting') : t('requestBackupDialog.requestBackup')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};