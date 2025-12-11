import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Shield, Clock, Truck, AlertTriangle, ArrowUpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTranslation } from 'react-i18next';

interface BackupApprovalActionsProps {
  notificationId: string;
  incidentId: string;
  requestingUnit?: string;
  currentStatus?: string;
  priorityLevel: number;
  onStatusChange?: () => void;
}

export const BackupApprovalActions: React.FC<BackupApprovalActionsProps> = ({
  notificationId,
  incidentId,
  requestingUnit,
  currentStatus = 'pending',
  priorityLevel,
  onStatusChange
}) => {
  const { user } = useAuth();
  const { isPoliceSupervisor, isPoliceAdmin, isAdmin, isPoliceDispatcher } = useUserRole();
  const { t } = useTranslation('emergency');
  const [loading, setLoading] = useState(false);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [newPriority, setNewPriority] = useState(priorityLevel.toString());
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [escalateNotes, setEscalateNotes] = useState('');

  // Role-based permissions
  const canApprove = isPoliceSupervisor || isPoliceAdmin || isAdmin;
  const canAcknowledge = isPoliceSupervisor || isPoliceAdmin || isAdmin || isPoliceDispatcher;
  const canEscalate = isPoliceDispatcher && !canApprove;

  const handleAcknowledge = async (type: 'receipt' | 'en_route' | 'on_scene') => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Create acknowledgment record
      const { error: ackError } = await supabase
        .from('backup_acknowledgments')
        .insert({
          incident_id: incidentId,
          notification_id: notificationId,
          acknowledged_by: user.id,
          acknowledgment_type: type,
          metadata: {
            requesting_unit: requestingUnit,
            timestamp: new Date().toISOString()
          }
        });

      if (ackError) throw ackError;

      // Update incident status if acknowledging
      if (type === 'receipt') {
        await supabase
          .from('emergency_incidents')
          .update({ 
            backup_request_status: 'acknowledged',
            updated_at: new Date().toISOString()
          })
          .eq('id', incidentId);
      }

      // Log the action
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user.id,
          action: `backup_${type}`,
          details: {
            notification_id: notificationId,
            requesting_unit: requestingUnit,
            timestamp: new Date().toISOString()
          }
        });

      toast.success(t('backupApproval.acknowledgmentSent', { type: t(`backupApproval.types.${type}`) }));
      onStatusChange?.();
    } catch (error) {
      console.error('Error acknowledging backup:', error);
      toast.error(t('backupApproval.failedToAcknowledge'));
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get incident details for context
      const { data: incident } = await supabase
        .from('emergency_incidents')
        .select('incident_number, city, region')
        .eq('id', incidentId)
        .single();

      // Find supervisors in the same geographic scope
      const { data: supervisors } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'police_supervisor');

      if (supervisors && supervisors.length > 0) {
        // Create escalation notifications for all supervisors
        const notifications = supervisors.map(sup => ({
          user_id: sup.user_id,
          incident_id: incidentId,
          title: t('backupApproval.escalatedTitle'),
          message: t('backupApproval.escalatedMessage', { 
            incident: incident?.incident_number,
            notes: escalateNotes || t('backupApproval.noNotesProvided')
          }),
          type: 'backup_escalated',
          priority_level: Math.max(0, priorityLevel - 1), // Increase priority
          metadata: {
            escalated_by: user.id,
            escalated_at: new Date().toISOString(),
            original_priority: priorityLevel,
            escalation_notes: escalateNotes,
            requesting_unit: requestingUnit
          }
        }));

        await supabase.from('emergency_notifications').insert(notifications);
      }

      // Update incident to mark as escalated
      await supabase
        .from('emergency_incidents')
        .update({ 
          backup_request_status: 'escalated',
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      // Log the escalation
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user.id,
          action: 'backup_escalated_to_supervisor',
          details: {
            notification_id: notificationId,
            requesting_unit: requestingUnit,
            escalation_notes: escalateNotes,
            supervisors_notified: supervisors?.length || 0,
            timestamp: new Date().toISOString()
          }
        });

      toast.success(t('backupApproval.escalationSent'));
      setEscalateDialogOpen(false);
      setEscalateNotes('');
      onStatusChange?.();
    } catch (error) {
      console.error('Error escalating backup:', error);
      toast.error(t('backupApproval.failedToEscalate'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!user || !canApprove) return;
    setLoading(true);

    try {
      // Update incident with approval
      const { error: updateError } = await supabase
        .from('emergency_incidents')
        .update({
          backup_request_status: 'approved',
          backup_approved_by: user.id,
          backup_approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (updateError) throw updateError;

      // Create notification for requesting unit
      const { data: requestingUsers } = await supabase
        .from('emergency_unit_members')
        .select('officer_id')
        .eq('unit_id', requestingUnit)
        .eq('is_lead', true);

      if (requestingUsers && requestingUsers.length > 0) {
        await supabase
          .from('emergency_notifications')
          .insert({
            user_id: requestingUsers[0].officer_id,
            incident_id: incidentId,
            title: t('backupApproval.requestApproved'),
            message: t('backupApproval.backupApprovedMessage'),
            type: 'backup_approved',
            priority_level: priorityLevel,
            metadata: {
              approved_by: user.id,
              approved_at: new Date().toISOString()
            }
          });
      }

      // Log the action
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user.id,
          action: 'backup_approved',
          details: {
            notification_id: notificationId,
            requesting_unit: requestingUnit,
            timestamp: new Date().toISOString()
          }
        });

      toast.success(t('backupApproval.requestApprovedSuccess'));
      onStatusChange?.();
    } catch (error) {
      console.error('Error approving backup:', error);
      toast.error(t('backupApproval.failedToApprove'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!user || !canApprove || !denyReason.trim()) {
      toast.error(t('backupApproval.provideReason'));
      return;
    }
    setLoading(true);

    try {
      // Update incident with denial
      const { error: updateError } = await supabase
        .from('emergency_incidents')
        .update({
          backup_request_status: 'denied',
          backup_denied_reason: denyReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (updateError) throw updateError;

      // Create notification for requesting unit
      const { data: requestingUsers } = await supabase
        .from('emergency_unit_members')
        .select('officer_id')
        .eq('unit_id', requestingUnit)
        .eq('is_lead', true);

      if (requestingUsers && requestingUsers.length > 0) {
        await supabase
          .from('emergency_notifications')
          .insert({
            user_id: requestingUsers[0].officer_id,
            incident_id: incidentId,
            title: t('backupApproval.requestDenied'),
            message: t('backupApproval.backupDeniedMessage', { reason: denyReason }),
            type: 'backup_denied',
            priority_level: priorityLevel,
            metadata: {
              denied_by: user.id,
              denied_at: new Date().toISOString(),
              reason: denyReason
            }
          });
      }

      // Log the action
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user.id,
          action: 'backup_denied',
          details: {
            notification_id: notificationId,
            requesting_unit: requestingUnit,
            reason: denyReason,
            timestamp: new Date().toISOString()
          }
        });

      toast.success(t('backupApproval.requestDeniedSuccess'));
      setDenyDialogOpen(false);
      setDenyReason('');
      onStatusChange?.();
    } catch (error) {
      console.error('Error denying backup:', error);
      toast.error(t('backupApproval.failedToDeny'));
    } finally {
      setLoading(false);
    }
  };

  const handleModifyPriority = async () => {
    if (!user || !canApprove) return;
    setLoading(true);

    try {
      const newPriorityNum = parseInt(newPriority);
      
      // Update incident priority
      const { error: updateError } = await supabase
        .from('emergency_incidents')
        .update({
          backup_urgency_level: newPriorityNum,
          priority_level: newPriorityNum,
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (updateError) throw updateError;

      // Log the action
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user.id,
          action: 'backup_priority_modified',
          details: {
            notification_id: notificationId,
            old_priority: priorityLevel,
            new_priority: newPriorityNum,
            timestamp: new Date().toISOString()
          }
        });

      toast.success(t('backupApproval.priorityModified'));
      setModifyDialogOpen(false);
      onStatusChange?.();
    } catch (error) {
      console.error('Error modifying priority:', error);
      toast.error(t('backupApproval.failedToModify'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{t('backupApproval.approved')}</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />{t('backupApproval.denied')}</Badge>;
      case 'acknowledged':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />{t('backupApproval.acknowledged')}</Badge>;
      case 'escalated':
        return <Badge className="bg-amber-100 text-amber-800"><ArrowUpCircle className="h-3 w-3 mr-1" />{t('backupApproval.escalated')}</Badge>;
      case 'fulfilled':
        return <Badge className="bg-green-100 text-green-800"><Shield className="h-3 w-3 mr-1" />{t('backupApproval.fulfilled')}</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{t('backupApproval.pending')}</Badge>;
    }
  };

  const isActionable = currentStatus === 'pending' || currentStatus === 'acknowledged' || currentStatus === 'escalated';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{t('backupApproval.status')}:</span>
        {getStatusBadge()}
      </div>

      {isActionable && canAcknowledge && (
        <div className="space-y-3">
          {/* Acknowledgment Actions - Available to Dispatchers and Supervisors */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAcknowledge('receipt')}
              disabled={loading}
            >
              <Clock className="h-4 w-4 mr-1" />
              {t('backupApproval.acknowledgeReceipt')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAcknowledge('en_route')}
              disabled={loading}
            >
              <Truck className="h-4 w-4 mr-1" />
              {t('backupApproval.enRoute')}
            </Button>
          </div>

          {/* Escalation Action - Dispatchers Only (when they can't approve) */}
          {canEscalate && currentStatus !== 'escalated' && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                {t('backupApproval.dispatcherActionsOnly')}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEscalateDialogOpen(true)}
                disabled={loading}
              >
                <ArrowUpCircle className="h-4 w-4 mr-1" />
                {t('backupApproval.escalateToSupervisor')}
              </Button>
            </div>
          )}

          {/* Approval/Denial Actions - Supervisors and Admins Only */}
          {canApprove && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {t('backupApproval.approve')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModifyDialogOpen(true)}
                disabled={loading}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                {t('backupApproval.modifyPriority')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDenyDialogOpen(true)}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                {t('backupApproval.deny')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Escalate Dialog */}
      <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('backupApproval.escalateTitle')}</DialogTitle>
            <DialogDescription>
              {t('backupApproval.escalateDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="escalate-notes">{t('backupApproval.escalateNotes')}</Label>
              <Textarea
                id="escalate-notes"
                value={escalateNotes}
                onChange={(e) => setEscalateNotes(e.target.value)}
                placeholder={t('backupApproval.escalateNotesPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleEscalate} disabled={loading}>
              <ArrowUpCircle className="h-4 w-4 mr-1" />
              {t('backupApproval.confirmEscalate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('backupApproval.denyBackupRequest')}</DialogTitle>
            <DialogDescription>
              {t('backupApproval.denyDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deny-reason">{t('backupApproval.reasonForDenial')}</Label>
              <Textarea
                id="deny-reason"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder={t('backupApproval.denyReasonPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeny}
              disabled={loading || !denyReason.trim()}
            >
              {t('backupApproval.confirmDeny')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Priority Dialog */}
      <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('backupApproval.modifyPriorityTitle')}</DialogTitle>
            <DialogDescription>
              {t('backupApproval.modifyPriorityDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-priority">{t('backupApproval.newPriority')}</Label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    <span className="text-red-600 font-bold">{t('backupApproval.priorities.emergency')}</span>
                  </SelectItem>
                  <SelectItem value="1">
                    <span className="text-red-500">{t('backupApproval.priorities.critical')}</span>
                  </SelectItem>
                  <SelectItem value="2">
                    <span className="text-orange-500">{t('backupApproval.priorities.high')}</span>
                  </SelectItem>
                  <SelectItem value="3">
                    <span className="text-yellow-600">{t('backupApproval.priorities.medium')}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModifyDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleModifyPriority} disabled={loading}>
              {t('backupApproval.updatePriority')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
