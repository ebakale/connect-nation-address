import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, Clock, MapPin, Navigation, CheckCircle, 
  Radio, Users, MessageSquare, Phone, Car, Shield,
  ArrowRight, PlayCircle, StopCircle, Flag, AlertCircle,
  Map, Camera, FileText, Send
} from 'lucide-react';

interface IncidentAssignment {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  incident_message?: string;
  dispatched_at?: string;
  responded_at?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  incident_uac?: string;
  dispatcher_notes?: string;
}

interface UnitInfo {
  id: string;
  unit_code: string;
  unit_name: string;
  unit_type: string;
  status: string;
  current_location?: string;
  location_latitude?: number;
  location_longitude?: number;
  radio_frequency?: string;
  vehicle_id?: string;
}

interface FieldAction {
  action: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  newStatus?: string;
  requiresNotes?: boolean;
}

const fieldActions: FieldAction[] = [
  {
    action: 'accept_assignment',
    label: 'Accept Assignment',
    icon: CheckCircle,
    color: 'bg-green-500',
    newStatus: 'dispatched'
  },
  {
    action: 'en_route',
    label: 'En Route',
    icon: Navigation,
    color: 'bg-blue-500',
    newStatus: 'en_route'
  },
  {
    action: 'on_scene',
    label: 'On Scene',
    icon: MapPin,
    color: 'bg-orange-500',
    newStatus: 'on_scene'
  },
  {
    action: 'request_backup',
    label: 'Request Backup',
    icon: Users,
    color: 'bg-red-500',
    requiresNotes: true
  },
  {
    action: 'update_status',
    label: 'Update Status',
    icon: MessageSquare,
    color: 'bg-purple-500',
    requiresNotes: true
  },
  {
    action: 'complete_incident',
    label: 'Complete Incident',
    icon: Flag,
    color: 'bg-gray-500',
    newStatus: 'resolved',
    requiresNotes: true
  }
];

export const UnitFieldDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
  const [assignments, setAssignments] = useState<IncidentAssignment[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentAssignment | null>(null);
  const [actionDialog, setActionDialog] = useState<{ action: FieldAction; incident: IncidentAssignment } | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  useEffect(() => {
    fetchUnitInfo();
  }, [user]);

  // Separate useEffect for assignments that depends on unitInfo
  useEffect(() => {
    if (unitInfo) {
      fetchAssignments();
    }
  }, [unitInfo]);

  useEffect(() => {
    // Set up real-time subscription for new assignments
    const channel = supabase
      .channel('unit-assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_incidents'
        },
        () => {
          if (unitInfo) {
            fetchAssignments();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unitInfo]);

  const fetchUnitInfo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('emergency_unit_members')
        .select(`
          unit_id,
          role,
          is_lead,
          emergency_units(
            id,
            unit_code,
            unit_name,
            unit_type,
            status,
            current_location,
            location_latitude,
            location_longitude,
            radio_frequency,
            vehicle_id
          )
        `)
        .eq('officer_id', user.id)
        .single();

      if (error) throw error;
      if (data?.emergency_units) {
        setUnitInfo(data.emergency_units as UnitInfo);
      }
    } catch (error) {
      console.error('Error fetching unit info:', error);
    }
  };

  const fetchAssignments = async () => {
    if (!unitInfo) {
      console.log('UnitFieldDashboard: No unit info available yet, skipping assignment fetch');
      return;
    }

    console.log('UnitFieldDashboard: Fetching assignments for unit:', unitInfo.unit_code);

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
          incident_message,
          dispatched_at,
          responded_at,
          street,
          city,
          region,
          country,
          incident_uac,
          dispatcher_notes
        `)
        .contains('assigned_units', [unitInfo.unit_code])
        .in('status', ['dispatched', 'responded', 'en_route', 'on_scene'])
        .order('priority_level', { ascending: false })
        .order('dispatched_at', { ascending: true });

      if (error) throw error;
      
      console.log('UnitFieldDashboard: Found assignments:', data);
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const executeFieldAction = async () => {
    if (!actionDialog || !user || !unitInfo) return;

    const { action, incident } = actionDialog;

    try {
      const actionData: any = {
        user_id: user.id,
        unit_code: unitInfo.unit_code,
        unit_name: unitInfo.unit_name,
        notes: actionNotes.trim() || null,
        timestamp: new Date().toISOString()
      };

      // Update incident status if applicable
      if (action.newStatus) {
        const updateData: any = {
          status: action.newStatus,
          updated_at: new Date().toISOString()
        };

        if (action.newStatus === 'en_route' && !incident.responded_at) {
          updateData.responded_at = new Date().toISOString();
        }
        if (action.newStatus === 'resolved') {
          updateData.resolved_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('emergency_incidents')
          .update(updateData)
          .eq('id', incident.id);

        if (updateError) throw updateError;
      }

      // Update unit status if needed
      if (action.newStatus && ['en_route', 'on_scene'].includes(action.newStatus)) {
        await supabase
          .from('emergency_units')
          .update({ 
            status: action.newStatus === 'en_route' ? 'dispatched' : 'busy',
            updated_at: new Date().toISOString()
          })
          .eq('id', unitInfo.id);
      }

      // Log the action
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incident.id,
          user_id: user.id,
          action: action.action,
          details: actionData
        });

      // Handle special actions
      if (action.action === 'request_backup') {
        // Process backup request through edge function
        const { data: backupResult, error: backupError } = await supabase.functions.invoke('process-backup-request', {
          body: {
            incident_id: incident.id,
            requesting_unit_code: unitInfo.unit_code,
            requesting_unit_name: unitInfo.unit_name,
            reason: actionNotes || 'No reason provided',
            priority_level: incident.priority_level,
            location: formatLocation(incident),
            incident_number: incident.incident_number
          }
        });

        if (backupError) {
          console.error('Backup request failed:', backupError);
          throw new Error('Failed to send backup request');
        }

        console.log('Backup request result:', backupResult);
        
        // Show success message with details
        toast({
          title: "Backup Requested",
          description: `${backupResult?.message || 'Backup request sent successfully'}`
        });
      }

      await fetchAssignments();
      await fetchUnitInfo();
      
      setActionDialog(null);
      setActionNotes('');

      toast({
        title: "Action Completed",
        description: `${action.label} executed successfully for ${incident.incident_number}`
      });
    } catch (error) {
      console.error('Error executing field action:', error);
      toast({
        title: "Error",
        description: "Failed to execute action",
        variant: "destructive"
      });
    }
  };

  const updateUnitLocation = async () => {
    if (!unitInfo || !currentLocation.trim()) return;

    setIsUpdatingLocation(true);
    try {
      // Get GPS coordinates if available
      let coordinates = null;
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000
            });
          });
          coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        } catch (gpsError) {
          console.log('GPS not available, using manual location only');
        }
      }

      const updateData: any = {
        current_location: currentLocation.trim(),
        updated_at: new Date().toISOString()
      };

      if (coordinates) {
        updateData.location_latitude = coordinates.lat;
        updateData.location_longitude = coordinates.lng;
      }

      const { error } = await supabase
        .from('emergency_units')
        .update(updateData)
        .eq('id', unitInfo.id);

      if (error) throw error;

      await fetchUnitInfo();
      setCurrentLocation('');

      toast({
        title: "Location Updated",
        description: "Unit location has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched': return 'bg-blue-500';
      case 'en_route': return 'bg-orange-500';
      case 'on_scene': return 'bg-red-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatLocation = (incident: IncidentAssignment) => {
    if (incident.incident_uac) {
      return incident.incident_uac;
    }
    
    const addressParts = [
      incident.street,
      incident.city,
      incident.region,
      incident.country
    ].filter(Boolean);
    
    if (addressParts.length > 0) {
      return addressParts.join(', ');
    }
    
    if (incident.location_address) {
      return incident.location_address;
    }
    
    if (incident.location_latitude && incident.location_longitude) {
      return `${incident.location_latitude.toFixed(4)}, ${incident.location_longitude.toFixed(4)}`;
    }
    
    return 'Location unavailable';
  };

  if (!unitInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Unit Assignment</h2>
            <p className="text-muted-foreground">
              You are not currently assigned to any emergency unit. Please contact your supervisor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Unit Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{unitInfo.unit_code} - Field Operations</h1>
          <p className="text-muted-foreground">{unitInfo.unit_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getIncidentStatusColor(unitInfo.status)}`} />
            {unitInfo.status.toUpperCase()}
          </Badge>
          {unitInfo.radio_frequency && (
            <Badge variant="outline">
              <Radio className="h-3 w-3 mr-1" />
              {unitInfo.radio_frequency}
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Location Update */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Update Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Current location (e.g., Main St & 5th Ave)"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button 
              onClick={updateUnitLocation}
              disabled={!currentLocation.trim() || isUpdatingLocation}
            >
              {isUpdatingLocation ? 'Updating...' : 'Update'}
            </Button>
          </div>
          {unitInfo.current_location && (
            <p className="text-sm text-muted-foreground mt-2">
              Last location: {unitInfo.current_location}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
          <Card className="lg:col-span-2 xl:col-span-3">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Assignments</h3>
              <p className="text-muted-foreground">
                Your unit currently has no active incident assignments.
              </p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{incident.incident_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {incident.emergency_type.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(incident.priority_level)}`} 
                         title={`Priority ${incident.priority_level}`} />
                    <Badge variant="outline" className={getIncidentStatusColor(incident.status)}>
                      {incident.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                  </div>
                  <p className="text-sm bg-muted/30 rounded p-2">
                    {formatLocation(incident)}
                  </p>
                </div>

                {/* Incident Details */}
                {incident.incident_message && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Details:</p>
                    <p className="text-sm bg-muted/30 rounded p-2">
                      {incident.incident_message}
                    </p>
                  </div>
                )}

                {/* Dispatcher Notes */}
                {incident.dispatcher_notes && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Dispatcher Notes:</p>
                    <p className="text-sm bg-blue-50 border border-blue-200 rounded p-2">
                      {incident.dispatcher_notes}
                    </p>
                  </div>
                )}

                {/* Time Information */}
                <div className="text-xs text-muted-foreground">
                  {incident.dispatched_at && (
                    <p>Dispatched: {new Date(incident.dispatched_at).toLocaleString()}</p>
                  )}
                  {incident.responded_at && (
                    <p>Responded: {new Date(incident.responded_at).toLocaleString()}</p>
                  )}
                </div>

                <Separator />

                {/* Field Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {fieldActions.map((action) => {
                    const isApplicable = 
                      (action.action === 'accept_assignment' && incident.status === 'dispatched') ||
                      (action.action === 'en_route' && ['dispatched'].includes(incident.status)) ||
                      (action.action === 'on_scene' && ['dispatched', 'en_route', 'responded'].includes(incident.status)) ||
                      (action.action === 'request_backup') ||
                      (action.action === 'update_status') ||
                      (action.action === 'complete_incident' && ['on_scene', 'responded'].includes(incident.status));

                    if (!isApplicable) return null;

                    return (
                      <Dialog
                        key={action.action}
                        open={actionDialog?.action.action === action.action && actionDialog?.incident.id === incident.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setActionDialog({ action, incident });
                          } else {
                            setActionDialog(null);
                            setActionNotes('');
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <action.icon className="h-3 w-3 mr-1" />
                            {action.label}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {action.label} - {incident.incident_number}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-muted/30 rounded">
                              <p className="font-medium">{incident.emergency_type.toUpperCase()}</p>
                              <p className="text-sm text-muted-foreground">
                                Priority {incident.priority_level} • {formatLocation(incident)}
                              </p>
                            </div>
                            
                            {action.requiresNotes && (
                              <div>
                                <label className="text-sm font-medium">
                                  {action.action === 'request_backup' ? 'Reason for backup request:' : 'Notes:'}
                                </label>
                                <Textarea
                                  value={actionNotes}
                                  onChange={(e) => setActionNotes(e.target.value)}
                                  placeholder={action.action === 'request_backup' 
                                    ? "Describe the situation requiring backup..." 
                                    : "Add any relevant notes..."
                                  }
                                  rows={3}
                                />
                              </div>
                            )}
                            
                            <Button 
                              onClick={executeFieldAction} 
                              className="w-full"
                              disabled={action.requiresNotes && !actionNotes.trim()}
                            >
                              {action.label}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </div>

                {/* Quick Navigation */}
                {(incident.location_latitude && incident.location_longitude) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.location_latitude},${incident.location_longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate to Incident
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};