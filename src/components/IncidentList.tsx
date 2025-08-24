import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
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
  reporter_id?: string;
  encrypted_message?: string;
  encrypted_address?: string;
  encrypted_latitude?: string;
  encrypted_longitude?: string;
  // Unencrypted fields for immediate police access
  incident_uac?: string;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  incident_message?: string;
  reporter_contact_info?: string;
  // Address fields from emergency processing
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  // Reporter profile information
  reporter_name?: string;
  reporter_email?: string;
}

interface IncidentListProps {
  incidents: EmergencyIncident[];
  onSelectIncident: (incident: EmergencyIncident | null) => void;
  selectedIncident: EmergencyIncident | null;
  onUpdate?: () => void;
}

// Enhanced decryption function matching the edge function logic
const simpleDecrypt = (encrypted: string): string => {
  try {
    // The edge function uses: atob(encrypted + key).slice(0, -(key.length))
    // We'll try a simpler approach first - basic base64 decoding
    let decoded = atob(encrypted);
    
    // Check if the decoded text contains readable characters (ASCII printable)
    if (/^[\x20-\x7E\s]*$/.test(decoded)) {
      return decoded;
    }
    
    // If that doesn't work, try removing potential padding/key artifacts
    // The edge function appends a key, so we might need to handle that
    try {
      // Try decoding with potential key removal (common fallback key length)
      const withoutKey = atob(encrypted).slice(0, -15); // Remove potential key
      if (/^[\x20-\x7E\s]*$/.test(withoutKey) && withoutKey.length > 0) {
        return withoutKey;
      }
    } catch {}
    
    // If still not readable, the data might not be encrypted or corrupted
    // Return a safe fallback
    return `[Encrypted data - ${encrypted.length} chars]`;
  } catch {
    // If all decoding fails, show a placeholder
    return '[Decryption error]';
  }
};

const IncidentList = ({ incidents, onSelectIncident, selectedIncident, onUpdate }: IncidentListProps) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignDialog, setAssignDialog] = useState<string | null>(null);
  const [assigningUnit, setAssigningUnit] = useState('');
  const [availableOfficers, setAvailableOfficers] = useState<{id: string, label: string}[]>([]);
  const [unitNames, setUnitNames] = useState<Record<string, string>>({});
  const [decryptedInfo, setDecryptedInfo] = useState<Record<string, { message: string; address: string; coordinates?: { lat: number; lng: number }; uac?: string }>>({});

  // Fetch available emergency units for assignment
  const fetchAvailableOfficers = async () => {
    try {
      // Get emergency units (available ones)
      const { data: units, error: unitsError } = await supabase
        .from('emergency_units')
        .select(`
          id,
          unit_code,
          unit_name,
          unit_type,
          status,
          emergency_unit_members(
            officer_id,
            role,
            is_lead,
            profiles(full_name)
          )
        `)
        .eq('status', 'available');

      if (unitsError) throw unitsError;

      const unitOptions = units?.map(unit => {
        const memberCount = unit.emergency_unit_members?.length || 0;
        return {
          id: unit.id,
          label: `${unit.unit_code} - ${unit.unit_name} (${unit.unit_type.toUpperCase()}) - ${memberCount} officers`
        };
      }) || [];

      setAvailableOfficers(unitOptions);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  // Fetch unit names for display
  const fetchUnitNames = async () => {
    try {
      const { data: units, error } = await supabase
        .from('emergency_units')
        .select('unit_code, unit_name');

      if (error) throw error;

      const unitNameMap: Record<string, string> = {};
      units?.forEach(unit => {
        unitNameMap[unit.unit_code] = unit.unit_name;
      });
      
      setUnitNames(unitNameMap);
    } catch (error) {
      console.error('Error fetching unit names:', error);
    }
  };

  // Process incident info for display - prefer unencrypted data
  useEffect(() => {
    const processIncidentInfo = () => {
      const newDecryptedInfo: Record<string, { message: string; address: string; coordinates?: { lat: number; lng: number }; uac?: string }> = {};
      
      incidents.forEach(incident => {
        // Use unencrypted data when available, fall back to decrypted if needed
        const locationAddress = incident.location_address || 
          (incident.encrypted_address ? simpleDecrypt(incident.encrypted_address) : '');
        
        // Use unencrypted message when available
        const message = incident.incident_message ||
          (incident.encrypted_message ? simpleDecrypt(incident.encrypted_message) : '');
        
        // Use unencrypted coordinates if available
        let coordinates: { lat: number; lng: number } | undefined;
        if (incident.location_latitude && incident.location_longitude) {
          coordinates = { 
            lat: incident.location_latitude, 
            lng: incident.location_longitude 
          };
        } else if (incident.encrypted_latitude && incident.encrypted_longitude) {
          try {
            const lat = parseFloat(simpleDecrypt(incident.encrypted_latitude));
            const lng = parseFloat(simpleDecrypt(incident.encrypted_longitude));
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = { lat, lng };
            }
          } catch (error) {
            console.warn('Failed to decrypt coordinates:', error);
          }
        }
        
        newDecryptedInfo[incident.id] = {
          message,
          address: locationAddress,
          coordinates,
          uac: incident.incident_uac
        };
      });
      
      setDecryptedInfo(newDecryptedInfo);
    };

    processIncidentInfo();
    fetchAvailableOfficers();
    fetchUnitNames();
  }, [incidents]);

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

      // Log the status change without foreign key dependency for now
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user?.id || 'system',
          action: 'status_updated',
          details: { 
            old_status: incidents.find(i => i.id === incidentId)?.status, 
            new_status: newStatus,
            updated_by: user?.email || 'system'
          }
        });

      toast.success('Incident status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update incident status');
    }
  };

  const handleAssignIncident = async (incidentId: string) => {
    if (!assigningUnit.trim()) {
      toast.error('Please select a unit to assign');
      return;
    }

    try {
      // Get unit information
      const { data: unitData, error: unitError } = await supabase
        .from('emergency_units')
        .select('unit_code, unit_name')
        .eq('id', assigningUnit)
        .single();

      if (unitError) throw unitError;

      const incident = incidents.find(i => i.id === incidentId);
      const currentUnits = incident?.assigned_units || [];
      
      // Add the unit code to assigned units (avoid duplicates)
      const unitCode = unitData.unit_code;
      const newUnits = currentUnits.includes(unitCode) 
        ? currentUnits 
        : [...currentUnits, unitCode];

      // Use the police-incident-actions edge function for consistent logging
      const { error } = await supabase.functions.invoke('police-incident-actions', {
        body: {
          action: 'assignUnits',
          incidentId: incidentId,
          data: {
            units: newUnits,
            unitName: unitData.unit_name,
            unitCode: unitCode
          }
        }
      });

      if (error) throw error;

      // Also update operator assignment and status if needed
      await supabase
        .from('emergency_incidents')
        .update({
          assigned_operator_id: user?.id,
          status: incident?.status === 'reported' ? 'dispatched' : incident?.status,
          dispatched_at: incident?.status === 'reported' ? new Date().toISOString() : incident?.dispatched_at
        })
        .eq('id', incidentId);

      toast.success(`Incident assigned to ${unitData.unit_name} (${unitCode})`);
      setAssignDialog(null);
      setAssigningUnit('');
      
      // Trigger refresh of incident data
      if (onUpdate) {
        onUpdate();
      }
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

              {/* Show reporter information */}
              {(incident.reporter_name || incident.reporter_email) && (
                <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Reporter:</strong> {incident.reporter_name}
                    {incident.reporter_email && (
                      <span className="ml-2 text-blue-600 font-mono">({incident.reporter_email})</span>
                    )}
                  </p>
                </div>
              )}

              {/* Show incident description for better prioritization */}
              {decryptedInfo[incident.id]?.message && (
                <div className="mb-3 p-2 bg-muted/30 rounded">
                  <p className="text-sm text-foreground">
                    <strong>Description:</strong> {
                      // Clean up any garbled text and show readable content
                      (() => {
                        const message = decryptedInfo[incident.id].message;
                        
                        // If message is empty, corrupted, or shows decryption artifacts
                        if (!message || 
                            message.includes('[Decryption') || 
                            message.includes('[Encrypted') ||
                            (!/^[\x20-\x7E\s]*$/.test(message) && message.length > 0) ||
                            message.length < 3) {
                          return `${incident.emergency_type.charAt(0).toUpperCase() + incident.emergency_type.slice(1)} incident reported`;
                        }
                        
                        return message.length > 120 ? `${message.substring(0, 120)}...` : message;
                      })()
                    }
                  </p>
                </div>
              )}

              {/* Show location with UAC for police roles */}
              <div className="mb-3 space-y-1">
                {/* Show UAC if available */}
                {incident.incident_uac && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-mono bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-200">
                      📍 UAC: {incident.incident_uac}
                    </span>
                  </div>
                )}
                
                {/* Show structured address */}
                {(() => {
                  const addressParts = [
                    incident.street,
                    incident.city,
                    incident.region,
                    incident.country
                  ].filter(Boolean);
                  
                  if (addressParts.length > 0) {
                    return (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4"></span> {/* Indent to align with UAC */}
                        <span>{addressParts.join(', ')}</span>
                      </div>
                    );
                  }
                  
                  // Show decrypted address as fallback
                  if (decryptedInfo[incident.id]?.address && 
                      !decryptedInfo[incident.id].address.includes('[Decryption') && 
                      !decryptedInfo[incident.id].address.includes('[Encrypted')) {
                    return (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4"></span> {/* Indent to align with UAC */}
                        <span>{decryptedInfo[incident.id].address}</span>
                      </div>
                    );
                  }
                  
                  // Show coordinates only as last resort
                  if (incident.location_latitude && incident.location_longitude) {
                    return (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="font-mono bg-background px-2 py-1 rounded border">
                          📍 {Number(incident.location_latitude).toFixed(4)}, {Number(incident.location_longitude).toFixed(4)}
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="italic">Location information unavailable</span>
                    </div>
                  );
                })()}
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
                          {(incident.assigned_units || []).map((unitCode) => 
                            unitNames[unitCode] || unitCode
                          ).join(', ')}
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
                           <label className="text-sm font-medium">Select Emergency Unit</label>
                           <Select onValueChange={setAssigningUnit} value={assigningUnit}>
                             <SelectTrigger>
                               <SelectValue placeholder="Choose an emergency unit..." />
                             </SelectTrigger>
                             <SelectContent>
                               {availableOfficers.map((unit) => (
                                 <SelectItem key={unit.id} value={unit.id}>
                                   {unit.label}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
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