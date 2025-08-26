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
  reporter_id?: string;
  // Unencrypted fields for immediate police access
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  incident_uac?: string;
  incident_message?: string;
  reporter_contact_info?: string;
  // Reporter profile information
  reporter_name?: string;
  reporter_email?: string;
  // Address fields from emergency_incidents table
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  building?: string;
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
    assigned_units: [] as string[],
    assigned_operator_id: ''
  });
  const [newUnit, setNewUnit] = useState('');
  const [availableUnits, setAvailableUnits] = useState<{ unit_code: string; unit_name: string; status: string; coverage_city?: string }[]>([]);
  const [unitNames, setUnitNames] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [reporterInfo, setReporterInfo] = useState<{ name?: string; email?: string; contact?: string }>({});
  const [userUnits, setUserUnits] = useState<string[]>([]);
  const [dispatchingUnit, setDispatchingUnit] = useState('');
  const [availableOfficers, setAvailableOfficers] = useState<{id: string, label: string, coverage_city?: string}[]>([]);
  const [availableOperators, setAvailableOperators] = useState<{id: string, name: string, role: string}[]>([]);

  // Fetch available emergency units for dispatch
  const fetchAvailableOfficers = async () => {
    try {
      // Get available emergency units, filtered by incident city when available
      let query = supabase
        .from('emergency_units')
        .select(`
          id,
          unit_code,
          unit_name,
          unit_type,
          status,
          coverage_city,
          emergency_unit_members(officer_id)
        `)
        .eq('status', 'available');

      if (incident.city) {
        query = query.eq('coverage_city', incident.city);
      }

      const { data: units, error: unitsError } = await query;
      if (unitsError) throw unitsError;

      const unitOptions = (units || []).map((unit: any) => {
        const memberCount = unit.emergency_unit_members?.length || 0;
        return {
          id: unit.id,
          label: `${unit.unit_code} - ${unit.unit_name} (${String(unit.unit_type).toUpperCase()}) - ${memberCount} officers`,
          coverage_city: unit.coverage_city || undefined,
        };
      });

      setAvailableOfficers(unitOptions);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  // Fetch available operators for assignment (only dispatchers)
  const fetchAvailableOperators = async () => {
    try {
      const { data: operators, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          user_roles!inner(role)
        `)
        .eq('user_roles.role', 'police_dispatcher'); // Only fetch dispatchers

      if (error) throw error;

      const operatorOptions = (operators || []).map((operator: any) => ({
        id: operator.user_id,
        name: operator.full_name || operator.user_id,
        role: 'police_dispatcher'
      }));

      setAvailableOperators(operatorOptions);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  };

  // Load user's units for assignment restrictions (only for operators)
  const loadUserUnits = async () => {
    if (!user?.id || !isPoliceOperator) return;
    
    try {
      const { data: unitMemberships, error } = await supabase
        .from('emergency_unit_members')
        .select(`
          unit_id,
          is_lead,
          role,
          emergency_units(unit_code, unit_name)
        `)
        .eq('officer_id', user.id);

      if (error) throw error;

      const userUnitCodes = unitMemberships?.map(m => m.emergency_units?.unit_code).filter(Boolean) || [];
      setUserUnits(userUnitCodes);
    } catch (error) {
      console.error('Error loading user units:', error);
    }
  };

  // Load unit names for display
  const loadUnitNames = async () => {
    try {
      const { data: units, error } = await supabase
        .from('emergency_units')
        .select('id, unit_code, unit_name, status, coverage_city');
      
      if (error) throw error;
      
      const unitNameMap: Record<string, string> = {};
      let unitsData: { unit_code: string; unit_name: string; status: string; coverage_city?: string }[] = [];
      
      units?.forEach((unit: any) => {
        // Map both unit_code and ID to unit_name for compatibility
        unitNameMap[unit.unit_code] = unit.unit_name;
        unitNameMap[unit.id] = unit.unit_name;
        unitsData.push({
          unit_code: unit.unit_code,
          unit_name: unit.unit_name,
          status: unit.status,
          coverage_city: unit.coverage_city || undefined,
        });
      });

      // Filter by incident city if available
      if (incident.city) {
        unitsData = unitsData.filter(u => u.coverage_city === incident.city);
      }

      // Filter available units based on user role and permissions
      // Supervisors and dispatchers can assign to any unit (no filtering needed)
      // Only operators are restricted to their assigned units for updates, but not for viewing
      if (isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher) {
        // Regular operators can only see their assigned units for certain operations
        unitsData = unitsData.filter(unit => userUnits.includes(unit.unit_code));
      }
      
      setUnitNames(unitNameMap);
      setAvailableUnits(unitsData);
    } catch (error) {
      console.error('Error loading unit names:', error);
    }
  };

  const isUUID = (s: string) => /^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(s);

  const loadUserNamesFromLogs = async (logsData: any[]) => {
    try {
      const ids = new Set<string>();
      logsData?.forEach((log) => {
        if (log.user_id && typeof log.user_id === 'string' && isUUID(log.user_id)) ids.add(log.user_id);
        const ab = log.details?.assigned_by;
        const ub = log.details?.updated_by;
        if (ab && typeof ab === 'string' && isUUID(ab)) ids.add(ab);
        if (ub && typeof ub === 'string' && isUUID(ub)) ids.add(ub);
      });
      // Also include the reporter id so we can resolve the creator's name
      if (incident.reporter_id && typeof incident.reporter_id === 'string' && isUUID(incident.reporter_id)) {
        ids.add(incident.reporter_id);
      }
      if (ids.size === 0) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', Array.from(ids));
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((p) => {
        map[p.user_id] = p.full_name || p.email || p.user_id;
      });
      setUserNames(map);
    } catch (err) {
      console.error('Error loading user names from logs:', err);
    }
  };

  const getActorDisplay = (log: any) => {
    const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
    const reporterDisplay =
      incident.reporter_name || incident.reporter_email || incident.reporter_contact_info ||
      reporterInfo.name || reporterInfo.email || reporterInfo.contact;

    // Prefer reporter identity for creation events
    if (log?.action === 'incident_created') {
      if (reporterDisplay) return reporterDisplay;
      if (typeof log.user_id === 'string' && userNames[log.user_id]) return userNames[log.user_id];
      if (typeof log.user_id === 'string' && isUUID(log.user_id)) return `User ${log.user_id.slice(0,8)}`;
      return 'Reporter';
    }

    // If logs used a system/zero UUID, fall back to reporter info when available
    if (typeof log?.user_id === 'string' && log.user_id === ZERO_UUID) {
      if (reporterDisplay) return reporterDisplay;
      return 'Reporter';
    }

    const actor = log?.details?.updated_by || log?.details?.assigned_by || log?.user_id || 'System';
    if (typeof actor === 'string' && userNames[actor]) return userNames[actor];
    if (typeof actor === 'string' && actor.includes('@')) return actor;
    if (typeof actor === 'string' && isUUID(actor)) return `User ${actor.slice(0,8)}`;
    return actor || 'System';
  };

  const loadIncidentLogs = async () => {
    try {
      const { data: logsData, error } = await supabase
        .from('emergency_incident_logs')
        .select('*')
        .eq('incident_id', incident.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      await loadUserNamesFromLogs(logsData || []);
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error loading incident logs:', error);
    }
  };

  useEffect(() => {
    loadIncidentLogs();
    fetchAvailableOfficers();
    fetchAvailableOperators();
    loadUserUnits();
  }, [incident.id, user?.id]);

  useEffect(() => {
    if (incident.assigned_operator_id) {
      loadUserNamesFromLogs([...logs, { user_id: incident.assigned_operator_id }]);
    }
  }, [logs, incident.assigned_operator_id]);

  useEffect(() => {
    if (userUnits.length > 0 || isPoliceDispatcher || isPoliceSupervisor) {
      loadUnitNames();
    }
  }, [userUnits, isPoliceSupervisor, isPoliceDispatcher]);

  // Ensure reporter info is available even if the log has a system user_id
  useEffect(() => {
    const loadReporter = async () => {
      try {
        if (incident.reporter_id && !incident.reporter_name && !incident.reporter_email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, email')
            .eq('user_id', incident.reporter_id)
            .maybeSingle();
          if (profile) {
            setReporterInfo({ name: profile.full_name || undefined, email: profile.email || undefined, contact: incident.reporter_contact_info });
            return;
          }
        }
        // Fallback to any info already on the incident
        setReporterInfo({ name: incident.reporter_name, email: incident.reporter_email, contact: incident.reporter_contact_info });
      } catch (e) {
        setReporterInfo({ name: incident.reporter_name, email: incident.reporter_email, contact: incident.reporter_contact_info });
      }
    };
    loadReporter();
  }, [incident.reporter_id, incident.reporter_name, incident.reporter_email, incident.reporter_contact_info]);

  const handleEdit = () => {
    setEditData({
      status: incident.status,
      priority_level: incident.priority_level,
      dispatcher_notes: incident.dispatcher_notes || '',
      assigned_units: incident.assigned_units || [],
      assigned_operator_id: incident.assigned_operator_id || ''
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

      // Update operator assignment if changed
      if (editData.assigned_operator_id !== incident.assigned_operator_id) {
        await supabase.functions.invoke('police-incident-actions', {
          body: {
            action: 'assignOperator',
            incidentId: incident.id,
            data: {
              operatorId: editData.assigned_operator_id || null
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

  const handleDispatchIncident = async () => {
    if (!dispatchingUnit.trim()) {
      toast.error('Please select a unit to dispatch');
      return;
    }

    try {
      // Get unit information
      const { data: unitData, error: unitError } = await supabase
        .from('emergency_units')
        .select('unit_code, unit_name')
        .eq('id', dispatchingUnit)
        .single();

      if (unitError) throw unitError;

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
          incidentId: incident.id,
          data: {
            units: newUnits,
            unitName: unitData.unit_name,
            unitCode: unitCode
          }
        }
      });

      if (error) throw error;

      // Send notification to assigned unit
      await supabase.functions.invoke('notify-unit-assignment', {
        body: {
          incidentId: incident.id,
          unitCode: unitCode,
          unitName: unitData.unit_name,
          incidentNumber: incident?.incident_number,
          emergencyType: incident?.emergency_type,
          priority: incident?.priority_level,
          location: incident?.location_address || `${incident?.location_latitude}, ${incident?.location_longitude}`
        }
      });

      // Also update operator assignment and status if needed
      await supabase
        .from('emergency_incidents')
        .update({
          assigned_operator_id: user?.id,
          status: incident?.status === 'reported' ? 'dispatched' : incident?.status,
          dispatched_at: incident?.status === 'reported' ? new Date().toISOString() : incident?.dispatched_at
        })
        .eq('id', incident.id);

      toast.success(`Unit ${unitData.unit_name} (${unitCode}) dispatched to incident`);
      setDispatchingUnit('');
      
      // Trigger refresh of incident data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error assigning incident:', error);
      toast.error('Failed to assign incident');
    }
  };

  const canEdit = isPoliceSupervisor || isPoliceDispatcher;
  const canComplete = isPoliceOperator || isPoliceSupervisor;
  const canAssignUnits = isPoliceDispatcher; // Only dispatchers can assign/reassign units

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
                    <SelectContent className="bg-background z-50">
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
                    <SelectContent className="bg-background z-50">
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
            
            {/* Reporter Information */}
            {(incident.reporter_name || incident.reporter_email || incident.reporter_contact_info || reporterInfo.name || reporterInfo.email || reporterInfo.contact) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Reporter Information
                </label>
                <div className="mt-1 space-y-1">
                  {(incident.reporter_name || reporterInfo.name) && (
                    <p className="flex items-center gap-2">
                      <span className="text-sm font-medium">Name:</span>
                      <span>{incident.reporter_name || reporterInfo.name}</span>
                    </p>
                  )}
                  {(incident.reporter_email || reporterInfo.email) && (
                    <p className="flex items-center gap-2">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="font-mono">{incident.reporter_email || reporterInfo.email}</span>
                    </p>
                  )}
                  {(incident.reporter_contact_info || reporterInfo.contact) && (
                    <p className="flex items-center gap-2">
                      <span className="text-sm font-medium">Contact:</span>
                      <span className="font-mono">{incident.reporter_contact_info || reporterInfo.contact}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {incident.location_latitude && incident.location_longitude && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Emergency Location
                </label>
                <div className="mt-1 space-y-3">
                  {/* Primary: UAC */}
                  {incident.incident_uac && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-xs font-medium text-blue-600 mb-1">Unified Address Code (UAC)</p>
                      <p className="font-mono text-lg font-semibold text-blue-800">{incident.incident_uac}</p>
                    </div>
                  )}
                  
                  {/* Secondary: Structured Address (if available) */}
                  {(incident.street || incident.city || incident.region || incident.country) && (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-2">Address Information</p>
                      <div className="space-y-1 text-sm">
                        {incident.building && (
                          <p><span className="font-medium">Building:</span> {incident.building}</p>
                        )}
                        {incident.street && (
                          <p><span className="font-medium">Street:</span> {incident.street}</p>
                        )}
                        {incident.city && (
                          <p><span className="font-medium">City:</span> {incident.city}</p>
                        )}
                        {incident.region && (
                          <p><span className="font-medium">Region:</span> {incident.region}</p>
                        )}
                        {incident.country && (
                          <p><span className="font-medium">Country:</span> {incident.country}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Coordinates */}
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">GPS Coordinates</p>
                    <p className="font-mono text-sm">
                      {incident.location_latitude.toFixed(6)}, {incident.location_longitude.toFixed(6)}
                    </p>
                  </div>
                  
                  {/* Generated Address (fallback) */}
                  {incident.location_address && !incident.street && (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Generated Address</p>
                      <p className="text-sm text-muted-foreground">{incident.location_address}</p>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${incident.location_latitude},${incident.location_longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Open in Google Maps
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Assignment & Notes
              <div className="flex gap-2">
                {!isEditing && canEdit && (
                  <Button onClick={handleEdit} size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {isEditing && (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Operator Assignment */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned Dispatcher
              </label>
              {isEditing && isPoliceSupervisor ? (
                <div className="mt-2">
                  <Select value={editData.assigned_operator_id} onValueChange={(value) => setEditData({...editData, assigned_operator_id: value})}>
                    <SelectTrigger className="w-full bg-background border border-input">
                      <SelectValue placeholder="Assign to operator..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-input z-50">
                      <SelectItem value="">Unassigned</SelectItem>
                      {availableOperators.map((operator) => (
                        <SelectItem key={operator.id} value={operator.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{operator.name}</span>
                            <span className="text-muted-foreground">(dispatcher)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : isEditing && !isPoliceSupervisor ? (
                <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Only supervisors can assign incidents to dispatchers.
                  </p>
                </div>
              ) : (
                <div className="mt-1">
                  {incident.assigned_operator_id ? (
                    <Badge variant="secondary">
                      {userNames[incident.assigned_operator_id] || `Dispatcher ${incident.assigned_operator_id.slice(0,8)}`}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">No dispatcher assigned</span>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Dispatched Units
              </label>
               {isEditing && canAssignUnits ? (
                 <div className="mt-2 space-y-3">
                   <div className="flex gap-2">
                     <Select value={newUnit} onValueChange={setNewUnit}>
                       <SelectTrigger className="flex-1 bg-background border border-input">
                         <SelectValue placeholder="Select a unit to assign" />
                       </SelectTrigger>
                        <SelectContent className="bg-background border border-input z-50">
                          {availableUnits
                            .filter(unit => !editData.assigned_units.includes(unit.unit_code))
                            .map((unit) => (
                              <SelectItem key={unit.unit_code} value={unit.unit_code}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{unit.unit_code}</span>
                                  <span className="text-muted-foreground">- {unit.unit_name}</span>
                                  <Badge variant={unit.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                                    {unit.status}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                     <Button onClick={addUnit} size="sm" disabled={!newUnit}>Add</Button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {editData.assigned_units.map((unit, index) => (
                       <Badge key={index} variant="outline" className="cursor-pointer"
                              onClick={() => removeUnit(unit)}>
                         {unitNames[unit] || unit} ×
                       </Badge>
                     ))}
                   </div>
                 </div>
                ) : isEditing && !canAssignUnits ? (
                  <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      Only dispatchers can dispatch or reassign units to incidents.
                    </p>
                  </div>
              ) : (
                <div className="mt-1 flex flex-wrap gap-2">
                  {(incident.assigned_units?.length ? incident.assigned_units : []).map((unit, index) => (
                    <Badge key={index} variant="secondary">
                      {unitNames[unit] || unit}
                    </Badge>
                  ))}
                   {(!incident.assigned_units || incident.assigned_units.length === 0) && (
                     <span className="text-muted-foreground">No units dispatched</span>
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
                        by {getActorDisplay(log)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                     <div className="text-sm">
                       {log.action === 'status_updated' && (
                         <p>Status changed from <strong>{log.details?.old_status}</strong> to <strong>{log.details?.new_status}</strong></p>
                       )}
                       {log.action === 'unit_assigned' && (
                         <p>Unit <strong>{unitNames[log.details?.assigned_unit] || log.details?.unit_name || log.details?.assigned_unit}</strong> assigned to incident</p>
                       )}
                       {log.action === 'priority_updated' && (
                         <p>Priority changed from <strong>{log.details?.old_priority}</strong> to <strong>{log.details?.new_priority}</strong></p>
                       )}
                       {log.action === 'notes_added' && (
                         <p>Notes updated: <em>{log.details?.notes}</em></p>
                       )}
                       {log.action === 'incident_completed' && (
                         <p>Incident marked as complete</p>
                       )}
                       {log.action === 'addNote' && (
                         <p>Notes added: <em>{log.details?.notes}</em></p>
                       )}
                       {log.action === 'updateStatus' && (
                         <p>Status changed from <strong>{log.details?.oldStatus}</strong> to <strong>{log.details?.status}</strong></p>
                       )}
                       {log.action === 'updatePriority' && (
                         <p>Priority changed from <strong>{log.details?.oldPriority}</strong> to <strong>{log.details?.priority}</strong></p>
                       )}
                       {log.action === 'assignUnits' && log.details?.units && (
                         <p>Units assigned: <strong>{Array.isArray(log.details.units) ? log.details.units.join(', ') : log.details.units}</strong></p>
                       )}
                       {log.action === 'markComplete' && (
                         <p>Incident marked as complete - {log.details?.notes || 'No additional notes'}</p>
                       )}
                        {!['status_updated', 'unit_assigned', 'priority_updated', 'notes_added', 'incident_completed', 'addNote', 'updateStatus', 'updatePriority', 'assignUnits', 'markComplete'].includes(log.action) && (
                          <div className="text-muted-foreground">
                            {log.details && typeof log.details === 'object' ? (
                              <div className="space-y-1">
                                 {Object.entries(log.details).filter(([key]) => key !== 'user_id').map(([key, value]) => {
                                   // Convert database field names to human-readable labels
                                   const formatFieldName = (fieldName: string): string => {
                                     const fieldMap: Record<string, string> = {
                                       'timestamp': 'Time Stamp',
                                       'incident_id': 'Incident ID',
                                       'old_status': 'Previous Status',
                                       'new_status': 'New Status',
                                       'old_priority': 'Previous Priority',
                                       'new_priority': 'New Priority',
                                       'oldStatus': 'Previous Status',
                                       'oldPriority': 'Previous Priority',
                                       'assigned_unit': 'Assigned Unit',
                                       'unit_name': 'Unit Name',
                                       'created_at': 'Created At',
                                       'updated_at': 'Updated At',
                                       'location_latitude': 'Latitude',
                                       'location_longitude': 'Longitude',
                                       'reporter_contact_info': 'Reporter Contact',
                                       'priority_level': 'Priority Level',
                                       'emergency_type': 'Emergency Type'
                                     };
                                     
                                     return fieldMap[fieldName] || fieldName
                                       .replace(/_/g, ' ')
                                       .replace(/\b\w/g, l => l.toUpperCase());
                                   };
                                   
                                   return (
                                     <div key={key} className="text-xs">
                                       <strong>{formatFieldName(key)}:</strong> {typeof value === 'string' ? value : JSON.stringify(value)}
                                     </div>
                                   );
                                 })}
                              </div>
                            ) : (
                              <span>{log.details || 'No additional details'}</span>
                            )}
                          </div>
                        )}
                     </div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {canComplete && incident.status !== 'resolved' && incident.status !== 'closed' && (
                <Button onClick={handleMarkComplete} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>

            {/* Quick Action Section */}
            {isPoliceSupervisor && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select onValueChange={(value) => setEditData({...editData, assigned_operator_id: value})} value={editData.assigned_operator_id}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Assign dispatcher..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="">Unassigned</SelectItem>
                    {availableOperators.map((operator) => (
                      <SelectItem key={operator.id} value={operator.id}>
                        {operator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={async () => {
                    try {
                      await supabase.functions.invoke('police-incident-actions', {
                        body: {
                          action: 'assignOperator',
                          incidentId: incident.id,
                          data: {
                            operatorId: editData.assigned_operator_id || null
                          }
                        }
                      });
                      toast.success('Dispatcher assigned successfully');
                      onUpdate?.();
                    } catch (error) {
                      console.error('Error assigning dispatcher:', error);
                      toast.error('Failed to assign dispatcher');
                    }
                  }}
                  disabled={!editData.assigned_operator_id}
                  className="w-full sm:w-auto"
                >
                  Assign Dispatcher
                </Button>
              </div>
            )}
            {isPoliceDispatcher && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select onValueChange={setDispatchingUnit} value={dispatchingUnit}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Dispatch unit..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {availableOfficers.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleDispatchIncident}
                  disabled={!dispatchingUnit}
                  className="w-full sm:w-auto"
                >
                  Dispatch Unit
                </Button>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default IncidentDetailDialog;