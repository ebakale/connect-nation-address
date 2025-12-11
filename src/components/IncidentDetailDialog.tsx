import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { 
  Eye, MapPin, Clock, User, Phone, MessageSquare, 
  AlertTriangle, Calendar, Shield, Navigation, CheckCircle,
  Edit, Save, X, Users, Play, Radio, FileText, Camera, ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RequestBackupDialog } from "@/components/RequestBackupDialog";
import { IncidentStatusUpdateDialog } from "@/components/IncidentStatusUpdateDialog";
import { EvidenceCaptureDialog } from "@/components/EvidenceCaptureDialog";
import { IncidentEvidenceViewer } from "@/components/IncidentEvidenceViewer";
import { openNavigation, calculateDistance, formatDistance, estimateTravelTime } from "@/lib/NavigationService";

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
  isResolvedView?: boolean;
  hideResolvedOption?: boolean;
}

const IncidentDetailDialog = ({ incident, onUpdate, isResolvedView = false, hideResolvedOption = false }: IncidentDetailDialogProps) => {
  const { user } = useAuth();
  const { isPoliceSupervisor, isPoliceDispatcher, isPoliceOperator } = useUserRole();
  const { t } = useTranslation('emergency');
  
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
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;
  const [availableUnits, setAvailableUnits] = useState<{ unit_code: string; unit_name: string; status: string; coverage_city?: string }[]>([]);
  const [unitNames, setUnitNames] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [reporterInfo, setReporterInfo] = useState<{ name?: string; email?: string; contact?: string }>({});
  const [userUnits, setUserUnits] = useState<string[]>([]);
  const [dispatchingUnit, setDispatchingUnit] = useState('');
  const [availableOfficers, setAvailableOfficers] = useState<{id: string, label: string, coverage_city?: string}[]>([]);
  const [availableOperators, setAvailableOperators] = useState<{id: string, name: string, role: string}[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showEvidenceCapture, setShowEvidenceCapture] = useState(false);
  const [evidenceRefresh, setEvidenceRefresh] = useState(0);

  // Navigation handler
  const handleNavigate = () => {
    if (incident.location_latitude && incident.location_longitude) {
      openNavigation({
        latitude: Number(incident.location_latitude),
        longitude: Number(incident.location_longitude),
        label: incident.incident_number
      });
      toast.success(t('navigation.openingMaps'));
    }
  };

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


  // Fetch available operators via edge function (scope-aware)
  const fetchAvailableOperators = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('police-operator-management', {
        body: { action: 'getDispatchersInScope' }
      });
      if (error) throw error;
      const ops = (data?.data || []).map((op: any) => ({
        id: op.id,
        name: op.name,
        role: 'police_dispatcher'
      }));
      setAvailableOperators(ops);
    } catch (error) {
      console.error('Error fetching operators:', error);
      // Still show the reassignment UI even if loading operators failed
      setAvailableOperators([]);
    }
  };

  // Reassign dispatcher to another dispatcher in the same city
  const reassignDispatcher = async (newOperatorId: string) => {
    try {
      await supabase.functions.invoke('police-incident-actions', {
        body: { 
          action: 'reassignOperator', 
          incidentId: incident.id, 
          data: { 
            newOperatorId,
            oldOperatorId: incident.assigned_operator_id
          } 
        }
      });
      toast.success(t('incidentDetails.dispatcherReassignedSuccessfully'));
      onUpdate?.();
      loadIncidentLogs();
    } catch (error) {
      console.error('Error reassigning dispatcher:', error);
      toast.error(t('incidentDetails.failedToReassignDispatcher'));
    }
  };

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
      if (isResolved) {
        toast.error(t('incidentDetails.resolvedIncidentsCannotBeModified'));
        setIsEditing(false);
        return;
      }
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

      toast.success(t('incidentDetails.incidentUpdatedSuccessfully'));
      setIsEditing(false);
      onUpdate?.();
      loadIncidentLogs();
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error(t('incidentDetails.failedToUpdateIncident'));
    }
  };

  const handleMarkComplete = async () => {
    try {
      if (isResolved) {
        toast.error(t('incidentDetails.incidentAlreadyResolved'));
        return;
      }
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

      toast.success(t('incidentDetails.incidentMarkedComplete'));
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
    if (incident.status === 'resolved' || incident.status === 'closed') {
      toast.error('Cannot dispatch units to a resolved/closed incident');
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
      toast.error(t('incidentDetails.failedToAssignIncident'));
    }
  };
  // Permission checks - restrict modifications for resolved incidents
  const isResolved = incident.status === 'resolved' || incident.status === 'closed';
  const canEdit = (isPoliceSupervisor || isPoliceDispatcher) && !isResolved;
  const canComplete = (isPoliceOperator || isPoliceSupervisor) && !isResolved;
  const canAssignUnits = isPoliceDispatcher && !isResolved; // Only dispatchers can assign/reassign units to active incidents
  const canAddNotes = isPoliceSupervisor || isPoliceDispatcher || isPoliceOperator; // Notes allowed on all incidents
  const canRequestBackup = isPoliceOperator && !isResolved;
  const canUpdateStatus = (isPoliceSupervisor || isPoliceDispatcher || isPoliceOperator) && !isResolved; // Unit members can update status of their assigned incidents
  const canReopenIncident = isPoliceSupervisor && isResolved; // Only supervisors can reopen resolved incidents

  // Debug logging
  console.log('🔒 Incident permissions:', {
    incidentId: incident.id,
    status: incident.status,
    isResolved,
    isPoliceSupervisor,
    isPoliceDispatcher,
    isPoliceOperator,
    canEdit,
    canComplete,
    canAddNotes,
    canRequestBackup,
    canUpdateStatus,
    canReopenIncident,
    userId: user?.id
  });

  // Reopen incident function (supervisor only)
  const handleReopenIncident = async () => {
    try {
      await supabase.functions.invoke('police-incident-actions', {
        body: {
          action: 'updateStatus',
          incidentId: incident.id,
          data: {
            newStatus: 'reported',
            message: 'Incident reopened by supervisor for further investigation',
            updatedBy: user?.email || 'supervisor'
          }
        }
      });

      toast.success(t('incidentDetails.incidentReopenedSuccessfully'));
      onUpdate?.();
    } catch (error) {
      console.error('Error reopening incident:', error);
      toast.error(t('incidentDetails.failedToReopenIncident'));
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error(t('incidentDetails.pleaseEnterNote'));
      return;
    }

    setAddingNote(true);
    try {
      await supabase.functions.invoke('police-incident-actions', {
        body: {
          action: 'addNote',
          incidentId: incident.id,
          data: {
            notes: newNote.trim()
          }
        }
      });

      toast.success(t('incidentDetails.noteAddedSuccessfully'));
      setNewNote('');
      onUpdate?.();
      loadIncidentLogs();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error(t('incidentDetails.failedToAddNote'));
    } finally {
      setAddingNote(false);
    }
  };

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
      case 'en_route': return 'bg-blue-100 text-blue-800';
      case 'responding': return 'bg-blue-100 text-blue-800';
      case 'on_scene': return 'bg-purple-100 text-purple-800';
      case 'investigating': return 'bg-indigo-100 text-indigo-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Key Information */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 sm:p-4 md:p-6 rounded-lg border border-primary/20">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 md:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1 sm:gap-3 overflow-x-auto pb-1">
              <Badge variant="outline" className="font-mono text-xs sm:text-base px-2 sm:px-3 py-1 whitespace-nowrap shrink-0">
                {incident.incident_number}
              </Badge>
              <Badge variant="secondary" className={`${getStatusColor(incident.status)} text-xs sm:text-sm whitespace-nowrap shrink-0`}>
                {t(`statusLabels.${incident.status}`)}
              </Badge>
              <Badge variant="outline" className={`${getPriorityColor(incident.priority_level)} text-xs sm:text-sm whitespace-nowrap shrink-0`}>
                {t('priorityLevel')} {incident.priority_level}
              </Badge>
            </div>
            <h3 className="text-xl font-semibold capitalize text-primary">
              {t(`emergencyTypeLabels.${incident.emergency_type}`, incident.emergency_type.replace(/_/g, ' ').toUpperCase())}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('reported')}: {new Date(incident.reported_at).toLocaleString()}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {/* Navigation Button */}
            {incident.location_latitude && incident.location_longitude && (
              <Button variant="outline" size="sm" className="text-xs" onClick={handleNavigate}>
                <ExternalLink className="h-3 w-3 mr-1" />
                {t('navigation.navigate')}
              </Button>
            )}

            {/* Evidence Capture Button */}
            {isPoliceOperator && !isResolved && (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowEvidenceCapture(true)}>
                <Camera className="h-3 w-3 mr-1" />
                {t('evidence.capture')}
              </Button>
            )}

            {canRequestBackup && (
              <RequestBackupDialog unitId={user?.id || ''} unitCode="OFFICER">
                <Button variant="outline" size="sm" className="text-xs">
                  <Radio className="h-3 w-3 mr-1" />
                  {t('backup')}
                </Button>
              </RequestBackupDialog>
            )}
            
            {canUpdateStatus && (
              <IncidentStatusUpdateDialog incident={incident} onUpdate={onUpdate} hideResolvedOption={hideResolvedOption}>
                <Button variant="outline" size="sm" className="text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  {t('status')}
                </Button>
              </IncidentStatusUpdateDialog>
            )}

            {canReopenIncident && (
              <Button variant="outline" size="sm" className="text-xs" onClick={handleReopenIncident}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {t('reopen')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Evidence Capture Dialog */}
      <EvidenceCaptureDialog
        open={showEvidenceCapture}
        onOpenChange={setShowEvidenceCapture}
        incidentId={incident.id}
        incidentNumber={incident.incident_number}
        onEvidenceUploaded={() => setEvidenceRefresh(prev => prev + 1)}
      />

      {/* Add Note Section - Available for all incidents including resolved */}
      {canAddNotes && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">
               {t('incidentDetails.addFieldNote')}
               {isResolved && <span className="text-xs text-muted-foreground ml-2">{t('incidentDetails.documentationOnly')}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Textarea
                placeholder={t('incidentDetails.addFieldNotesPlaceholder')}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
              />
              <Button 
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="sm:self-end w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('incidentDetails.addNote')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('incidentDetails.ctrlEnterToAdd')}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-4">
        {/* Column 1: Emergency Information */}
        <div className="xl:col-span-2 space-y-3 md:space-y-4">
          {/* Emergency Information - Now Primary */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t('incidentDetails.emergencyInformation')}
              </CardTitle>
              <CardDescription>
                {t('incidentDetails.criticalIncidentDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {incident.incident_message && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('incidentDetails.emergencyMessage')}
                </label>
                <p className="mt-1 p-3 bg-white rounded border">{incident.incident_message}</p>
              </div>
            )}
            
            {/* Reporter Information */}
            {(incident.reporter_name || incident.reporter_email || incident.reporter_contact_info || reporterInfo.name || reporterInfo.email || reporterInfo.contact) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('incidentDetails.reporterInformation')}
                </label>
                <div className="mt-1 space-y-1">
                   {(incident.reporter_name || reporterInfo.name) && (
                     <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                       <span className="text-sm font-medium shrink-0">{t('incidentDetails.name')}:</span>
                       <span className="break-words">{incident.reporter_name || reporterInfo.name}</span>
                     </p>
                   )}
                   {(incident.reporter_email || reporterInfo.email) && (
                     <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                       <span className="text-sm font-medium shrink-0">{t('incidentDetails.email')}:</span>
                       <span className="font-mono text-xs sm:text-sm break-all overflow-hidden">{incident.reporter_email || reporterInfo.email}</span>
                     </p>
                   )}
                   {(incident.reporter_contact_info || reporterInfo.contact) && (
                     <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                       <span className="text-sm font-medium shrink-0">{t('incidentDetails.contact')}:</span>
                       <span className="font-mono text-xs sm:text-sm break-all overflow-hidden">{incident.reporter_contact_info || reporterInfo.contact}</span>
                     </p>
                   )}
                </div>
              </div>
            )}
            
            {incident.location_latitude && incident.location_longitude && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('incidentDetails.emergencyLocation')}
                </label>
                <div className="mt-1 space-y-3">
                   {/* Primary: UAC */}
                   {incident.incident_uac && (
                     <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                       <p className="text-xs font-medium text-blue-600 mb-1">{t('incidentDetails.unifiedAddressCode')}</p>
                       <p className="font-mono text-xs sm:text-sm lg:text-base font-semibold text-blue-800 break-all overflow-hidden">{incident.incident_uac}</p>
                     </div>
                   )}
                  
                  {/* Secondary: Structured Address (if available) */}
                  {(incident.street || incident.city || incident.region || incident.country) && (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-2">{t('incidentDetails.addressInformation')}</p>
                       <div className="space-y-1 text-sm">
                         {incident.building && (
                           <p className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                             <span className="font-medium shrink-0">{t('incidentDetails.building')}:</span> 
                             <span className="break-words">{incident.building}</span>
                           </p>
                         )}
                         {incident.street && (
                           <p className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                             <span className="font-medium shrink-0">{t('incidentDetails.street')}:</span> 
                             <span className="break-words">{incident.street}</span>
                           </p>
                         )}
                         {incident.city && (
                           <p className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                             <span className="font-medium shrink-0">{t('incidentDetails.city')}:</span> 
                             <span className="break-words">{incident.city}</span>
                           </p>
                         )}
                         {incident.region && (
                           <p className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                             <span className="font-medium shrink-0">{t('incidentDetails.region')}:</span> 
                             <span className="break-words">{incident.region}</span>
                           </p>
                         )}
                         {incident.country && (
                           <p className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                             <span className="font-medium shrink-0">{t('incidentDetails.country')}:</span> 
                             <span className="break-words">{incident.country}</span>
                           </p>
                         )}
                       </div>
                    </div>
                  )}
                  
                   {/* Coordinates */}
                   <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                     <p className="text-xs font-medium text-gray-600 mb-1">{t('incidentDetails.gpsCoordinates')}</p>
                      <p className="font-mono text-xs break-all overflow-hidden">
                        {incident.location_latitude.toFixed(6)}, {incident.location_longitude.toFixed(6)}
                      </p>
                   </div>
                  
                  {/* Generated Address (fallback) */}
                  {incident.location_address && !incident.street && (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">{t('incidentDetails.generatedAddress')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words overflow-hidden">{incident.location_address}</p>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      const dest = `${incident.location_latitude},${incident.location_longitude}`;
                      
                      try {
                        // Request location permission and get current position
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                          if (!('geolocation' in navigator)) {
                            reject(new Error('Geolocation not supported'));
                            return;
                          }
                          
                          navigator.geolocation.getCurrentPosition(
                            resolve,
                            reject,
                            {
                              enableHighAccuracy: true,
                              timeout: 10000,
                              maximumAge: 0,
                            }
                          );
                        });
                        
                        const origin = `${position.coords.latitude},${position.coords.longitude}`;
                        
                        // iOS-specific navigation handling
                        const userAgent = navigator.userAgent || navigator.vendor;
                        if (/iPad|iPhone|iPod/.test(userAgent)) {
                          // Use Apple Maps on iOS
                          const appleUrl = `maps://maps.apple.com/?saddr=${origin}&daddr=${dest}`;
                          try {
                            window.location.href = appleUrl;
                          } catch (error) {
                            // Fallback to web maps
                            const webUrl = `https://maps.apple.com/?saddr=${origin}&daddr=${dest}`;
                            window.location.href = webUrl;
                          }
                        } else {
                          // Use Google Maps for other platforms
                          const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
                          window.open(url, '_blank');
                        }
                        
                      } catch (error) {
                        // Fallback: open with destination only
                        const userAgent = navigator.userAgent || navigator.vendor;
                        if (/iPad|iPhone|iPod/.test(userAgent)) {
                          const appleUrl = `maps://maps.apple.com/?daddr=${dest}`;
                          try {
                            window.location.href = appleUrl;
                          } catch (error) {
                            window.location.href = `https://maps.apple.com/?daddr=${dest}`;
                          }
                        } else {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
                          window.open(url, '_blank');
                        }
                      }
                     }}
                     className="w-full text-xs sm:text-sm"
                   >
                     <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                     {t('incidentDetails.navigate')}
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
              {t('incidentDetails.assignmentAndNotes')}
              <div className="flex gap-2">
                {!isEditing && canEdit && (
                  <Button onClick={handleEdit} size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    {t('incidentDetails.edit')}
                  </Button>
                )}
                {isEditing && (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {t('save')}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      {t('cancel')}
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Dispatcher Reassignment - Only for dispatchers */}
            {isPoliceDispatcher && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('incidentDetails.reassignDispatcher')}
                </label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select 
                      value="" 
                      onValueChange={(operatorId) => {
                        if (operatorId && operatorId !== incident.assigned_operator_id) {
                          reassignDispatcher(operatorId);
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1 bg-background border border-input min-w-0">
                        <SelectValue placeholder={t('incidentDetails.selectDispatcherToReassign')} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-input z-50">
                        {availableOperators.length === 0 ? (
                          <SelectItem value="no-operators" disabled>
                            {t('incidentDetails.noOtherOperatorsOnline')}
                          </SelectItem>
                        ) : (
                          availableOperators
                            .filter(op => op.id !== incident.assigned_operator_id)
                            .map((operator) => (
                              <SelectItem key={operator.id} value={operator.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{operator.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {operator.role.replace('police_', '')}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('incidentDetails.reassignDispatcherHelp')}
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('incidentDetails.dispatchedUnits')}
              </label>
               {isEditing && canAssignUnits ? (
                 <div className="mt-2 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={newUnit} onValueChange={setNewUnit}>
                        <SelectTrigger className="flex-1 bg-background border border-input min-w-0">
                          <SelectValue placeholder={t('incidentDetails.selectUnitToAssign')} />
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
                      <Button onClick={addUnit} size="sm" disabled={!newUnit} className="whitespace-nowrap w-full sm:w-auto">{t('add')}</Button>
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
                       {t('incidentDetails.onlyDispatchersCanAssign')}
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
                     <span className="text-muted-foreground">{t('incidentDetails.noUnitsDispatched')}</span>
                   )}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('incidentDetails.dispatcherNotes')}</label>
              {isEditing ? (
                <Textarea
                  className="mt-1"
                  value={editData.dispatcher_notes}
                  onChange={(e) => setEditData({...editData, dispatcher_notes: e.target.value})}
                  placeholder={t('incidentDetails.addNotesPlaceholder')}
                  rows={4}
                />
              ) : (
                <p className="mt-1 p-3 bg-muted rounded">
                  {incident.dispatcher_notes || t('incidentDetails.noNotesAvailable')}
                </p>
              )}
            </div>

            {/* Field Notes Section */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('incidentDetails.fieldNotes')}</label>
              <div className="mt-1 space-y-2 max-h-48 overflow-y-auto">
                {logs.filter(log => log.action === 'field_note_added').length > 0 ? (
                  logs
                    .filter(log => log.action === 'field_note_added')
                    .map((log, index) => (
                      <div key={log.id || index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-blue-600 font-medium">
                            {userNames[log.user_id] || t('incidentDetails.unknownOfficer')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">
                          {log.details?.notes || log.details?.message || t('incidentDetails.noNoteContent')}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="mt-1 p-3 bg-muted rounded text-sm text-muted-foreground">
                    {t('incidentDetails.noFieldNotesAvailable')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t('evidence.title')}
            </CardTitle>
            <CardDescription>{t('evidence.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentEvidenceViewer 
              incidentId={incident.id} 
              refreshTrigger={evidenceRefresh}
            />
          </CardContent>
        </Card>


        {/* Action Buttons */}
        {!isEditing && (
            <div className="flex flex-col gap-3 pt-4 border-t">
             <div className="flex flex-wrap gap-2">
              {canComplete && incident.status !== 'resolved' && incident.status !== 'closed' && (
                <Button onClick={handleMarkComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('incidentDetails.markComplete')}
                </Button>
              )}
            </div>

            {/* Quick Action Section - Supervisor dispatcher assignment removed */}
            {canAssignUnits && (
              <div className="flex flex-col gap-2 w-full">
                <Select onValueChange={setDispatchingUnit} value={dispatchingUnit}>
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder={`${t('incidentDetails.dispatchUnit')}...`} />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-w-[90vw]">
                    {availableOfficers.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id} className="max-w-full">
                        <div className="truncate">{unit.label}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleDispatchIncident}
                  disabled={!dispatchingUnit}
                  className="w-full whitespace-nowrap"
                >
                  {t('incidentDetails.dispatchUnit')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column - Timeline and Detailed Logs */}
      <div className="space-y-3 md:space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('incidentDetails.timeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{t('incidentDetails.reported')}:</span>
                <span>{new Date(incident.reported_at).toLocaleString()}</span>
              </div>
              {incident.dispatched_at && (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">{t('incidentDetails.dispatched')}:</span>
                  <span>{new Date(incident.dispatched_at).toLocaleString()}</span>
                </div>
              )}
              {incident.responded_at && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{t('incidentDetails.responded')}:</span>
                  <span>{new Date(incident.responded_at).toLocaleString()}</span>
                </div>
              )}
              {incident.resolved_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{t('incidentDetails.resolved')}:</span>
                  <span>{new Date(incident.resolved_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('incidentDetails.activityLog')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.length > 0 ? (
                <>
                  {logs
                    .slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage)
                    .map((log, index) => (
                      <div key={log.id || index} className="border-l-2 border-gray-200 pl-3 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.action.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {userNames[log.user_id] || t('incidentDetails.unknownUser')}
                        </p>
                        {(log.details?.message || log.details?.notes) && (
                          <p className="text-sm text-gray-700 mb-1">
                            {log.details?.notes || log.details?.message}
                          </p>
                        )}
                        {log.details?.unit_name && (
                          <p className="text-xs text-muted-foreground">
                            {t('incidentDetails.unit')}: {log.details.unit_name} ({log.details.unit_code})
                          </p>
                        )}
                      </div>
                    ))}
                  
                  {/* Pagination */}
                  {logs.length > logsPerPage && (
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.ceil(logs.length / logsPerPage) }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < Math.ceil(logs.length / logsPerPage)) setCurrentPage(currentPage + 1);
                              }}
                              className={currentPage === Math.ceil(logs.length / logsPerPage) ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t('incidentDetails.noActivityLogsAvailable')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default IncidentDetailDialog;