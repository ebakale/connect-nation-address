import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Flag, MapPin, Clock, AlertCircle } from 'lucide-react';

interface IncidentStatusUpdateDialogProps {
  incident: {
    id: string;
    incident_number: string;
    emergency_type: string;
    priority_level: number;
    status: string;
    location_address?: string;
    incident_message?: string;
  };
  onUpdate?: () => void;
  children: React.ReactNode;
  hideResolvedOption?: boolean;
}

const statusOptions = [
  { value: 'reported', label: 'Reported', description: 'Incident has been reported' },
  { value: 'dispatched', label: 'Dispatched', description: 'Units have been assigned' },
  { value: 'en_route', label: 'En Route', description: 'Units are traveling to scene' },
  { value: 'on_scene', label: 'On Scene', description: 'Units have arrived at location' },
  { value: 'investigating', label: 'Investigating', description: 'Active investigation in progress' },
  { value: 'resolved', label: 'Resolved', description: 'Incident has been resolved' },
  { value: 'closed', label: 'Closed', description: 'Incident is closed' }
];

export const IncidentStatusUpdateDialog: React.FC<IncidentStatusUpdateDialogProps> = ({
  incident,
  onUpdate,
  children,
  hideResolvedOption = false,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(incident.status);
  const [message, setMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleStatusUpdate = async () => {
    // Prevent status changes on resolved incidents
    if (incident.status === 'resolved' || incident.status === 'closed') {
      toast({
        title: 'Cannot Update Status',
        description: 'This incident is resolved and cannot be modified. Contact a supervisor to reopen if needed.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedStatus || selectedStatus === incident.status) {
      toast({
        title: 'No Change',
        description: 'Please select a different status to update.',
        variant: 'destructive'
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please provide a message describing the status change.',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Use the police-incident-actions edge function for consistent status updates
      const { error } = await supabase.functions.invoke('police-incident-actions', {
        body: {
          action: 'updateStatus',
          incidentId: incident.id,
          data: {
            newStatus: selectedStatus,
            message: message.trim(),
            updatedBy: user?.email || 'field_operator'
          }
        }
      });

      if (error) throw error;

      // Log the status change with accompanying message
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incident.id,
          user_id: user?.id,
          action: 'status_updated_field',
          details: {
            old_status: incident.status,
            new_status: selectedStatus,
            message: message.trim(),
            updated_by: user?.email || 'field_operator',
            timestamp: new Date().toISOString()
          }
        });

      toast({
        title: 'Status Updated',
        description: `Incident status changed to ${statusOptions.find(s => s.value === selectedStatus)?.label}`,
      });

      setOpen(false);
      setMessage('');
      setSelectedStatus(incident.status);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating incident status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update incident status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-red-100 text-red-800';
      case 'dispatched': return 'bg-orange-100 text-orange-800';
      case 'en_route': return 'bg-blue-100 text-blue-800';
      case 'on_scene': return 'bg-purple-100 text-purple-800';
      case 'investigating': return 'bg-indigo-100 text-indigo-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="incident-status-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            {incident.status === 'resolved' || incident.status === 'closed' ? 'Incident Status (Resolved)' : 'Update Incident Status'}
          </DialogTitle>
          <DialogDescription id="incident-status-desc">
            Change and log the incident status. Add a brief message for the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Incident Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">#{incident.incident_number}</span>
              <div className="flex items-center gap-2">
                <Badge 
                  className={`${getPriorityColor(incident.priority_level)} text-white text-xs`}
                >
                  P{incident.priority_level}
                </Badge>
                <Badge variant="outline" className={getStatusColor(incident.status)}>
                  {statusOptions.find(s => s.value === incident.status)?.label || incident.status}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="capitalize">{incident.emergency_type.replace('_', ' ')}</span>
            </div>
            
            {incident.location_address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{incident.location_address}</span>
              </div>
            )}
          </div>

          {/* Status Selection */}
          {!(incident.status === 'resolved' || incident.status === 'closed') ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {(hideResolvedOption ? statusOptions.filter((s) => s.value !== 'resolved') : statusOptions).map((status) => (
                    <SelectItem 
                      key={status.value} 
                      value={status.value}
                      disabled={status.value === incident.status}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{status.label}</span>
                        <span className="text-xs text-muted-foreground">{status.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground mb-2">This incident is resolved and cannot be modified.</p>
              <p className="text-xs text-muted-foreground">Contact a supervisor if this incident needs to be reopened.</p>
            </div>
          )}

          {/* Message - Only show for non-resolved incidents */}
          {!(incident.status === 'resolved' || incident.status === 'closed') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Update Message</label>
              <Textarea
                placeholder="Describe the status change, any relevant details, or actions taken..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This message will be logged and visible to dispatch and supervisors.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              {incident.status === 'resolved' || incident.status === 'closed' ? 'Close' : 'Cancel'}
            </Button>
            {!(incident.status === 'resolved' || incident.status === 'closed') && (
              <Button 
                onClick={handleStatusUpdate} 
                disabled={isUpdating || selectedStatus === incident.status}
                className="flex-1"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};