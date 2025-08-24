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

interface UnitStatusManagerProps {
  unitId?: string;
  className?: string;
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

const statusOptions = [
  { value: 'available', label: 'Available', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'dispatched', label: 'Dispatched', icon: Radio, color: 'bg-blue-500' },
  { value: 'en_route', label: 'En Route', icon: Navigation, color: 'bg-orange-500' },
  { value: 'on_scene', label: 'On Scene', icon: MapPin, color: 'bg-red-500' },
  { value: 'busy', label: 'Busy', icon: Clock, color: 'bg-yellow-500' },
  { value: 'unavailable', label: 'Unavailable', icon: AlertCircle, color: 'bg-gray-500' }
];

export const UnitStatusManager: React.FC<UnitStatusManagerProps> = ({ unitId, className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unitStatus, setUnitStatus] = useState<UnitStatus | null>(null);
  const [assignments, setAssignments] = useState<IncidentAssignment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [locationNotes, setLocationNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [watchingLocation, setWatchingLocation] = useState(false);

  useEffect(() => {
    if (unitId) {
      fetchUnitStatus();
      fetchActiveAssignments();
    } else {
      fetchUserUnit();
    }
  }, [unitId, user]);

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
        fetchActiveAssignments(data.unit_id);
      }
    } catch (error) {
      console.error('Error fetching user unit:', error);
    }
  };

  const fetchUnitStatus = async () => {
    if (!unitId) return;

    try {
      const { data, error } = await supabase
        .from('emergency_units')
        .select('*')
        .eq('id', unitId)
        .single();

      if (error) throw error;
      setUnitStatus(data);
      setSelectedStatus(data.status);
    } catch (error) {
      console.error('Error fetching unit status:', error);
    }
  };

  const fetchActiveAssignments = async (currentUnitId?: string) => {
    const targetUnitId = currentUnitId || unitId;
    if (!targetUnitId || !unitStatus) return;

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
        .contains('assigned_units', [unitStatus.unit_code])
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
        title: "Status Updated",
        description: `Unit status updated to ${statusOptions.find(s => s.value === selectedStatus)?.label}`
      });
    } catch (error) {
      console.error('Error updating unit status:', error);
      toast({
        title: "Error",
        description: "Failed to update unit status",
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
        title: "Response Recorded",
        description: "Marked as responded to incident"
      });
    } catch (error) {
      console.error('Error responding to incident:', error);
      toast({
        title: "Error",
        description: "Failed to update incident status",
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
    return statusOptions.find(s => s.value === (unitStatus?.status || selectedStatus));
  };

  if (!unitStatus) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No unit assignment found</p>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = getCurrentStatusInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Unit Status - {unitStatus.unit_code}
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
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
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
              placeholder="Current location or notes (optional)"
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
                Include GPS location
              </label>
            </div>

            <Button 
              onClick={updateUnitStatus} 
              disabled={isUpdating || selectedStatus === unitStatus.status}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Active Assignments ({assignments.length})
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
                        {assignment.emergency_type.toUpperCase()} - Priority {assignment.priority_level}
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
                      Mark as Responded
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