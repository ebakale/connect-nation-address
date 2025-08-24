import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { 
  Eye, MapPin, Clock, User, Phone, MessageSquare, 
  AlertTriangle, Calendar, Shield, Navigation, CheckCircle,
  Edit, Save, X, Users, Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

interface EmergencyIncident {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  reported_at: string;
  dispatched_at?: string;
  responded_at?: string;
  resolved_at?: string;
  assigned_operator_id?: string;
  assigned_units?: string[];
  dispatcher_notes?: string;
  language_code?: string;
  // Unencrypted fields for immediate police access
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  incident_uac?: string;
  incident_message?: string;
  reporter_contact_info?: string;
}

interface DecryptedIncident {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  reported_at: string;
  dispatched_at?: string;
  responded_at?: string;
  resolved_at?: string;
  assigned_operator_id?: string;
  assigned_units?: string[];
  dispatcher_notes?: string;
  language_code?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  contact_info?: string;
  address?: string;
  location_accuracy?: number;
}

interface IncidentDetailDialogProps {
  incident: EmergencyIncident;
  onUpdate?: () => void;
}

const IncidentDetailDialog = ({ incident, onUpdate }: IncidentDetailDialogProps) => {
  const { user } = useAuth();
  const { isPoliceSupervisor, isPoliceDispatcher, isPoliceOperator } = useUserRole();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    priority_level: 1,
    dispatcher_notes: '',
    assigned_units: [] as string[]
  });
  const [newUnit, setNewUnit] = useState('');

  const loadIncidentLogs = async () => {
    try {
      const { data: logsData, error } = await supabase
        .from('emergency_incident_logs')
        .select(`
          *,
          profiles!emergency_incident_logs_user_id_fkey (
            full_name
          )
        `)
        .eq('incident_id', incident.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error loading incident logs:', error);
    }
  };

  useEffect(() => {
    loadIncidentLogs();
  }, [incident.id]);

  const handleEdit = () => {
    setEditData({
      status: incident.status,
      priority_level: incident.priority_level,
      dispatcher_notes: incident.dispatcher_notes || '',
      assigned_units: incident.assigned_units || []
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Update status if changed
      if (editData.status !== incident.status) {
        const { error } = await supabase.functions.invoke('police-incident-actions', {
          body: {
            action: 'updateStatus',
            incidentId: incident.id,
            data: {
              status: editData.status,
              oldStatus: incident.status
            }
          }
        });
        if (error) throw error;
      }

      // Update priority if changed
      if (editData.priority_level !== incident.priority_level) {
        await supabase.functions.invoke('police-incident-actions', {
          body: {
            action: 'updatePriority',
            incidentId: incident.id,
            data: {
              priority: editData.priority_level,
              oldPriority: incident.priority_level
            }
          }
        });
      }

      // Update notes if changed
      if (editData.dispatcher_notes !== incident.dispatcher_notes) {
        await supabase.functions.invoke('police-incident-actions', {
          body: {
            action: 'addNote',
            incidentId: incident.id,
            data: {
              notes: editData.dispatcher_notes
            }
          }
        });
      }

      // Update units if changed
      if (JSON.stringify(editData.assigned_units) !== JSON.stringify(incident.assigned_units)) {
        await supabase.functions.invoke('police-incident-actions', {
          body: {
            action: 'assignUnits',
            incidentId: incident.id,
            data: {
              units: editData.assigned_units
            }
          }
        });
      }

      toast.success('Incident updated successfully');
      setIsEditing(false);
      onUpdate?.();
      loadIncidentLogs();
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident');
    }
  };

  const handleMarkComplete = async () => {
    try {
      const { error } = await supabase.functions.invoke('police-incident-actions', {
        body: {
          action: 'markComplete',
          incidentId: incident.id,
          data: {
            notes: 'Incident marked as complete by operator'
          }
        }
      });

      if (error) throw error;

      toast.success('Incident marked as complete');
      onUpdate?.();
      loadIncidentLogs();
    } catch (error) {
      console.error('Error marking incident complete:', error);
      toast.error('Failed to mark incident as complete');
    }
  };

  const addUnit = () => {
    if (newUnit.trim() && !editData.assigned_units.includes(newUnit.trim())) {
      setEditData({
        ...editData,
        assigned_units: [...editData.assigned_units, newUnit.trim()]
      });
      setNewUnit('');
    }
  };

  const removeUnit = (unit: string) => {
    setEditData({
      ...editData,
      assigned_units: editData.assigned_units.filter(u => u !== unit)
    });
  };

  const canEdit = isPoliceSupervisor || isPoliceDispatcher;
  const canComplete = isPoliceOperator || isPoliceSupervisor;

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 5: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-red-100 text-red-800';
      case 'dispatched': return 'bg-orange-100 text-orange-800';
      case 'responding': return 'bg-blue-100 text-blue-800';
      case 'on_scene': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Incident Details: {incident.incident_number}
            </span>
            {!isEditing && canEdit && (
              <Button onClick={handleEdit} size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            Confidential emergency incident information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Incident Number</label>
                    <p className="font-mono text-lg">{incident.incident_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Emergency Type</label>
                    <p className="text-lg capitalize">{incident.emergency_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority Level</label>
                    {isEditing ? (
                      <Select 
                        value={editData.priority_level.toString()} 
                        onValueChange={(value) => setEditData({...editData, priority_level: parseInt(value)})}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Critical</SelectItem>
                          <SelectItem value="2">2 - High</SelectItem>
                          <SelectItem value="3">3 - Medium</SelectItem>
                          <SelectItem value="4">4 - Low</SelectItem>
                          <SelectItem value="5">5 - Info</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getPriorityColor(incident.priority_level)}>
                        Priority {incident.priority_level}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                    {isEditing ? (
                      <Select 
                        value={editData.status} 
                        onValueChange={(value) => setEditData({...editData, status: value})}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reported">Reported</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                          <SelectItem value="responding">Responding</SelectItem>
                          <SelectItem value="on_scene">On Scene</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reported At</label>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(incident.reported_at).toLocaleString()}
                    </p>
                  </div>
                  {incident.dispatched_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dispatched At</label>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(incident.dispatched_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Information - Now Immediately Accessible */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">
                  Emergency Information
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Incident details for immediate police response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {incident.incident_message && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Emergency Message
                    </label>
                    <p className="mt-1 p-3 bg-white rounded border">{incident.incident_message}</p>
                  </div>
                )}
                
                {incident.reporter_contact_info && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </label>
                    <p className="mt-1 font-mono">{incident.reporter_contact_info}</p>
                  </div>
                )}
                
                {incident.location_latitude && incident.location_longitude && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location Details
                    </label>
                    <div className="mt-1 space-y-2">
                      {incident.incident_uac && (
                        <p className="font-mono text-sm bg-white p-2 rounded border">
                          UAC: {incident.incident_uac}
                        </p>
                      )}
                      <p className="font-mono">
                        {incident.location_latitude.toFixed(6)}, {incident.location_longitude.toFixed(6)}
                      </p>
                      {incident.location_address && (
                        <p className="text-sm text-muted-foreground">
                          {incident.location_address}
                        </p>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${incident.location_latitude},${incident.location_longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Open in Maps
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assignment & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assigned Units
                  </label>
                  {isEditing ? (
                    <div className="mt-2 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add unit (e.g., POLICE-01)"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addUnit()}
                        />
                        <Button onClick={addUnit} size="sm">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editData.assigned_units.map((unit, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer"
                                 onClick={() => removeUnit(unit)}>
                            {unit} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(incident.assigned_units?.length ? incident.assigned_units : []).map((unit, index) => (
                        <Badge key={index} variant="secondary">{unit}</Badge>
                      ))}
                      {(!incident.assigned_units || incident.assigned_units.length === 0) && (
                        <span className="text-muted-foreground">No units assigned</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dispatcher Notes</label>
                  {isEditing ? (
                    <Textarea
                      className="mt-1"
                      value={editData.dispatcher_notes}
                      onChange={(e) => setEditData({...editData, dispatcher_notes: e.target.value})}
                      placeholder="Add notes about this incident..."
                      rows={4}
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-muted rounded">
                      {incident.dispatcher_notes || 'No notes available'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.map((log, index) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-muted rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.action.replace('_', ' ').toUpperCase()}</span>
                          <span className="text-sm text-muted-foreground">
                            by {log.profiles?.full_name || 'System'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && (
                          <pre className="text-xs mt-2 text-muted-foreground">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {logs.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No activity logs available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!isEditing && (
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  {canComplete && incident.status !== 'resolved' && incident.status !== 'closed' && (
                    <Button onClick={handleMarkComplete} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailDialog;