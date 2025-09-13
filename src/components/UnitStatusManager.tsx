import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, AlertCircle, CheckCircle, Radio, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UnitInfo {
  id: string;
  unit_code: string;
  unit_name: string;
  status: string;
  location_latitude?: number;
  location_longitude?: number;
  current_location?: string;
  radio_frequency?: string;
  vehicle_id?: string;
}

interface UnitStatusManagerProps {
  unit: UnitInfo;
  onUpdate: () => void;
}

interface IncidentAssignment {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  dispatched_at?: string;
}

interface UnitStatus {
  id: string;
  unit_code: string;
  unit_name: string;
  status: string;
  current_location?: string;
  location_latitude?: number;
  location_longitude?: number;
  updated_at: string;
}

const getStatusOptions = (t: any) => [
  { value: 'available', label: t('unitStatusManager.statuses.available'), icon: CheckCircle, color: 'bg-green-500' },
  { value: 'dispatched', label: t('unitStatusManager.statuses.dispatched'), icon: Radio, color: 'bg-blue-500' },
  { value: 'en_route', label: t('unitStatusManager.statuses.enRoute'), icon: Navigation, color: 'bg-orange-500' },
  { value: 'on_scene', label: t('unitStatusManager.statuses.onScene'), icon: MapPin, color: 'bg-red-500' },
  { value: 'busy', label: t('unitStatusManager.statuses.busy'), icon: Clock, color: 'bg-yellow-500' },
  { value: 'unavailable', label: t('unitStatusManager.statuses.unavailable'), icon: AlertCircle, color: 'bg-gray-500' }
];

export const UnitStatusManager: React.FC<UnitStatusManagerProps> = ({ unit, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('emergency');
  const [unitStatus, setUnitStatus] = useState<UnitStatus | null>(null);
  const [assignments, setAssignments] = useState<IncidentAssignment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [locationNotes, setLocationNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [watchingLocation, setWatchingLocation] = useState(false);

  useEffect(() => {
    if (unit) {
      setUnitStatus(unit as UnitStatus);
      setSelectedStatus(unit.status);
      fetchActiveAssignments();
    }
  }, [unit, user]);

  const fetchUserUnit = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('emergency_unit_members')
        .select(`
          unit_id,
          emergency_units(
            id,
            unit_code,
            unit_name,
            status,
            current_location,
            location_latitude,
            location_longitude,
            updated_at
          )
        `)
        .eq('officer_id', user.id)
        .single();

      if (error) throw error;
      if (data?.emergency_units) {
        setUnitStatus(data.emergency_units as UnitStatus);
        setSelectedStatus(data.emergency_units.status);
        fetchActiveAssignments();
      }
    } catch (error) {
      console.error('Error fetching user unit:', error);
    }
  };

  // Remove this function as it's not needed anymore

  const fetchActiveAssignments = async () => {
    if (!unit?.id) return;

    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select(`
          id,
          incident_number,
          emergency_type,
          priority_level,
          status,
          location_address,
          location_latitude,
          location_longitude,
          dispatched_at
        `)
        .contains('assigned_units', [unit.id])
        .in('status', ['dispatched', 'responded']);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const updateUnitStatus = async () => {
    if (!unitStatus || !selectedStatus) return;

    setIsUpdating(true);
    try {
      const updateData: any = {
        status: selectedStatus,
        updated_at: new Date().toISOString()
      };

      if (locationNotes.trim()) {
        updateData.current_location = locationNotes.trim();
      }

      // Get current location if watching
      if (watchingLocation && 'geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000
          });
        });

        updateData.location_latitude = position.coords.latitude;
        updateData.location_longitude = position.coords.longitude;
      }

      const { error } = await supabase
        .from('emergency_units')
        .update(updateData)
        .eq('id', unitStatus.id);

      if (error) throw error;

      // Synchronize operator status with unit status
      // Update all operators assigned to this unit to match the unit status
      const operatorStatusMap: { [key: string]: string } = {
        'available': 'active',
        'dispatched': 'active', 
        'en_route': 'active',
        'on_scene': 'active',
        'busy': 'active',
        'unavailable': 'offline'
      };

      const operatorStatus = operatorStatusMap[selectedStatus] || 'active';

      // Get all unit members and update their operator sessions
      const { data: unitMembers } = await supabase
        .from('emergency_unit_members')
        .select('officer_id')
        .eq('unit_id', unitStatus.id);

      if (unitMembers && unitMembers.length > 0) {
        const officerIds = unitMembers.map(member => member.officer_id);
        
        // Update active operator sessions for unit members
        await supabase
          .from('emergency_operator_sessions')
          .update({ status: operatorStatus })
          .in('operator_id', officerIds)
          .is('session_end', null);
      }

      // Log status change for all active incidents
      for (const assignment of assignments) {
        await supabase
          .from('emergency_incident_logs')
          .insert({
            incident_id: assignment.id,
            user_id: user?.id || 'system',
            action: 'unit_status_updated',
            details: {
              unit_code: unitStatus.unit_code,
              unit_name: unitStatus.unit_name,
              old_status: unitStatus.status,
              new_status: selectedStatus,
              location: locationNotes || null,
              coordinates: watchingLocation && updateData.location_latitude ? {
                lat: updateData.location_latitude,
                lng: updateData.location_longitude
              } : null,
              timestamp: new Date().toISOString()
            }
          });
      }

      setUnitStatus({ ...unitStatus, ...updateData });
      setLocationNotes('');
      toast({
        title: t('unitStatusManager.statusUpdated'),
        description: t('unitStatusManager.statusUpdatedTo', { status: getStatusOptions(t).find(s => s.value === selectedStatus)?.label })
      });
    } catch (error) {
      console.error('Error updating unit status:', error);
      toast({
        title: t('common:messages.loadingError'),
        description: t('unitStatusManager.failedToUpdateStatus'),
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const respondToIncident = async (incidentId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_incidents')
        .update({
          status: 'responded',
          responded_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (error) throw error;

      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user?.id || 'system',
          action: 'unit_responded',
          details: {
            unit_code: unitStatus?.unit_code,
            unit_name: unitStatus?.unit_name,
            response_time: calculateResponseTime(assignments.find(a => a.id === incidentId)?.dispatched_at),
            timestamp: new Date().toISOString()
          }
        });

      fetchActiveAssignments();
      toast({
        title: t('unitStatusManager.responseRecorded'),
        description: t('unitStatusManager.markedAsResponded')
      });
    } catch (error) {
      console.error('Error responding to incident:', error);
      toast({
        title: t('common:messages.loadingError'),
        description: t('unitStatusManager.failedToUpdateIncident'),
        variant: "destructive"
      });
    }
  };

  const calculateResponseTime = (dispatchedAt?: string): string | null => {
    if (!dispatchedAt) return null;
    
    const dispatched = new Date(dispatchedAt);
    const responded = new Date();
    const diffMinutes = Math.round((responded.getTime() - dispatched.getTime()) / 60000);
    
    return `${diffMinutes} minutes`;
  };

  const getCurrentStatusInfo = () => {
    return getStatusOptions(t).find(s => s.value === (unitStatus?.status || selectedStatus));
  };

  if (!unitStatus) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{t('unitStatusManager.noUnitAssignment')}</p>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = getCurrentStatusInfo();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5" />
            {t('unitStatusManager.title', { unitCode: unitStatus.unit_code })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {currentStatus && (
              <>
                <div className={`w-3 h-3 rounded-full ${currentStatus.color}`} />
                <span className="font-medium">{currentStatus.label}</span>
                <Badge variant="outline" className="ml-auto">
                  {unitStatus.unit_name}
                </Badge>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t('unitStatusManager.updateStatus')} />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions(t).map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder={t('unitStatusManager.locationPlaceholder')}
              value={locationNotes}
              onChange={(e) => setLocationNotes(e.target.value)}
              rows={2}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="location-tracking"
                checked={watchingLocation}
                onChange={(e) => setWatchingLocation(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="location-tracking" className="text-sm">
                {t('unitStatusManager.includeGPS')}
              </label>
            </div>

            <Button 
              onClick={updateUnitStatus} 
              disabled={isUpdating || selectedStatus === unitStatus.status}
              className="w-full"
            >
              {isUpdating ? t('common:buttons.updating') : t('common:buttons.updateStatus')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t('unitStatusManager.activeAssignments', { count: assignments.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{assignment.incident_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.emergency_type.replace(/_/g, ' ').toUpperCase()} - {t('unitStatusManager.priorityLevel', { level: assignment.priority_level })}
                      </p>
                      {assignment.location_address && (
                        <p className="text-sm text-muted-foreground">
                          📍 {assignment.location_address}
                        </p>
                      )}
                    </div>
                    <Badge variant={assignment.status === 'dispatched' ? 'default' : 'secondary'}>
                      {assignment.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {assignment.status === 'dispatched' && (
                    <Button 
                      size="sm" 
                      onClick={() => respondToIncident(assignment.id)}
                      className="w-full"
                    >
                      {t('unitStatusManager.markAsResponded')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};