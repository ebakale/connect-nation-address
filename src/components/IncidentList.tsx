import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { 
  AlertTriangle, Clock, MapPin, User, Phone, MessageSquare,
  CheckCircle, XCircle, Eye, ArrowRight, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import IncidentDetailDialog from "./IncidentDetailDialog";

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
}

interface IncidentListProps {
  incidents: EmergencyIncident[];
  onSelectIncident: (incident: EmergencyIncident | null) => void;
  selectedIncident: EmergencyIncident | null;
  onUpdate?: () => void;
}

const IncidentList = ({ incidents, onSelectIncident, selectedIncident, onUpdate }: IncidentListProps) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignDialog, setAssignDialog] = useState<string | null>(null);
  const [assigningUnit, setAssigningUnit] = useState('');

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return '🚑';
      case 'fire': return '🚒';
      case 'police': return '🚓';
      default: return '⚠️';
    }
  };

  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'dispatched' && !incidents.find(i => i.id === incidentId)?.dispatched_at) {
        updates.dispatched_at = new Date().toISOString();
      } else if (newStatus === 'responding' && !incidents.find(i => i.id === incidentId)?.responded_at) {
        updates.responded_at = new Date().toISOString();
      } else if (newStatus === 'resolved' && !incidents.find(i => i.id === incidentId)?.resolved_at) {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('emergency_incidents')
        .update(updates)
        .eq('id', incidentId);

      if (error) throw error;

      // Log the status change
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user?.id || '',
          action: 'status_updated',
          details: { old_status: incidents.find(i => i.id === incidentId)?.status, new_status: newStatus }
        });

      toast.success('Incident status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update incident status');
    }
  };

  const handleAssignIncident = async (incidentId: string) => {
    if (!assigningUnit.trim()) {
      toast.error('Please enter a unit to assign');
      return;
    }

    try {
      const incident = incidents.find(i => i.id === incidentId);
      const currentUnits = incident?.assigned_units || [];
      const newUnits = [...currentUnits, assigningUnit.trim()];

      const { error } = await supabase
        .from('emergency_incidents')
        .update({
          assigned_operator_id: user?.id,
          assigned_units: newUnits
        })
        .eq('id', incidentId);

      if (error) throw error;

      // Log the assignment
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user?.id || '',
          action: 'incident_assigned',
          details: { assigned_unit: assigningUnit, assigned_by: user?.id }
        });

      toast.success(`Incident assigned to unit ${assigningUnit}`);
      setAssignDialog(null);
      setAssigningUnit('');
    } catch (error) {
      console.error('Error assigning incident:', error);
      toast.error('Failed to assign incident');
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (statusFilter !== 'all' && incident.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && incident.priority_level.toString() !== priorityFilter) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Active Incidents</CardTitle>
            <CardDescription>
              {filteredIncidents.length} of {incidents.length} incidents
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="responding">Responding</SelectItem>
                <SelectItem value="on_scene">On Scene</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="1">Critical</SelectItem>
                <SelectItem value="2">High</SelectItem>
                <SelectItem value="3">Medium</SelectItem>
                <SelectItem value="4">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredIncidents.map((incident) => (
            <div 
              key={incident.id}
              className={`border-b p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedIncident?.id === incident.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}
              onClick={() => onSelectIncident(incident)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(incident.emergency_type)}</span>
                  <div>
                    <div className="font-semibold text-lg">
                      {incident.incident_number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(incident.reported_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(incident.priority_level)}>
                    Priority {incident.priority_level}
                  </Badge>
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {incident.emergency_type.toUpperCase()}
                  </span>
                  
                  {incident.assigned_units && incident.assigned_units.length > 0 && (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {incident.assigned_units.join(', ')}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <IncidentDetailDialog incident={incident} onUpdate={onUpdate} />
                  
                  <Dialog open={assignDialog === incident.id} onOpenChange={(open) => setAssignDialog(open ? incident.id : null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Incident {incident.incident_number}</DialogTitle>
                        <DialogDescription>
                          Assign this incident to a police unit or officer
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Unit/Officer ID</label>
                          <Textarea
                            placeholder="Enter unit ID or officer badge number..."
                            value={assigningUnit}
                            onChange={(e) => setAssigningUnit(e.target.value)}
                            rows={2}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleAssignIncident(incident.id)}
                            className="flex-1"
                          >
                            Assign Unit
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setAssignDialog(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Select onValueChange={(value) => handleStatusUpdate(incident.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Update" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dispatched">Mark Dispatched</SelectItem>
                      <SelectItem value="responding">Mark Responding</SelectItem>
                      <SelectItem value="on_scene">Mark On Scene</SelectItem>
                      <SelectItem value="resolved">Mark Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          
          {filteredIncidents.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No incidents match the current filters</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentList;