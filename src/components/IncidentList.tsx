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
import { useTranslation } from "react-i18next";
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
  showStatusFilter?: boolean;
  showPriorityFilter?: boolean;
  isResolvedIncidents?: boolean;
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

const IncidentList = ({ incidents, onSelectIncident, selectedIncident, onUpdate, showStatusFilter = true, showPriorityFilter = true, isResolvedIncidents = false }: IncidentListProps) => {
  const { user } = useAuth();
  const { t } = useTranslation(['common', 'emergency']);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignDialog, setAssignDialog] = useState<string | null>(null);
  const [dispatchingUnit, setDispatchingUnit] = useState('');
  const [availableOfficers, setAvailableOfficers] = useState<{id: string, label: string, coverage_city?: string}[]>([]);
  const [unitNames, setUnitNames] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [decryptedInfo, setDecryptedInfo] = useState<Record<string, { message: string; address: string; coordinates?: { lat: number; lng: number }; uac?: string }>>({});
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // Pagination constants
  const incidentsPerPage = 5;

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
          coverage_city,
          emergency_unit_members(officer_id)
        `)
        .eq('status', 'available');

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

  const handleDispatchIncident = async (incidentId: string) => {
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

      const incident = incidents.find(i => i.id === incidentId);
      if (incident?.status === 'resolved' || incident?.status === 'closed') {
        toast.error('Cannot dispatch units to a resolved/closed incident');
        setAssignDialog(null);
        return;
      }
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

      // Send notification to assigned unit
      await supabase.functions.invoke('notify-unit-assignment', {
        body: {
          incidentId: incidentId,
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
        .eq('id', incidentId);

      toast.success(`Unit ${unitData.unit_name} (${unitCode}) dispatched to incident`);
      setAssignDialog(null);
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

  const filteredIncidents = incidents.filter(incident => {
    if (statusFilter !== 'all' && incident.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && incident.priority_level.toString() !== priorityFilter) return false;
    return true;
  });

  // Reset pagination when incidents change
  useEffect(() => {
    setCurrentPage(1);
  }, [incidents, statusFilter, priorityFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredIncidents.length / incidentsPerPage);
  const startIndex = (currentPage - 1) * incidentsPerPage;
  const paginatedIncidents = filteredIncidents.slice(startIndex, startIndex + incidentsPerPage);

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm sm:text-lg font-semibold">Active Incidents</h3>
          <p className="text-xs text-muted-foreground">
            {filteredIncidents.length} of {incidents.length} {t('emergencyIncidents').toLowerCase()}
          </p>
        </div>
        
        {/* Unassigned Incidents Alert */}
        {(() => {
          const unassignedIncidents = filteredIncidents.filter(i => !i.assigned_operator_id);
          
          if (unassignedIncidents.length > 0) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {unassignedIncidents.length} {unassignedIncidents.length > 1 ? t('common:incidents') : t('incident')} {t('common:needDispatcherAssignment')}
                </span>
              </div>
            );
          }
        })()}
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {showStatusFilter && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">{t('common:allStatus')}</SelectItem>
                <SelectItem value="reported">{t('reported')}</SelectItem>
                <SelectItem value="dispatched">{t('dispatched')}</SelectItem>
                <SelectItem value="responding">{t('responding')}</SelectItem>
                <SelectItem value="on_scene">{t('onScene')}</SelectItem>
              </SelectContent>
            </Select>
          )}

          {showPriorityFilter && (
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common:allPriority')}</SelectItem>
                <SelectItem value="1">{t('common:critical')}</SelectItem>
                <SelectItem value="2">{t('common:high')}</SelectItem>
                <SelectItem value="3">{t('common:medium')}</SelectItem>
                <SelectItem value="4">{t('common:low')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {t('showing')} {startIndex + 1}-{Math.min(startIndex + incidentsPerPage, filteredIncidents.length)} {t('of')} {filteredIncidents.length} {t('common:incidents')}
        </span>
        <span>
          {t('page')} {currentPage} {t('of')} {totalPages}
        </span>
      </div>

      {/* Simplified incident list */}
      <div className="space-y-2">
        {paginatedIncidents.map((incident) => {
          const isUnassigned = !incident.assigned_operator_id;
          const isResolved = incident.status === 'resolved' || incident.status === 'closed';
          
          
          return (
            <div 
              key={incident.id}
              className={`border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedIncident?.id === incident.id ? 'bg-primary/5 border-primary' : ''
              } ${
                isUnassigned && !isResolved ? 'border-l-4 border-l-red-500 bg-red-50/50' : ''
              } ${
                isResolved ? 'border-l-4 border-l-green-500 bg-green-50/50' : ''
              }`}
              onClick={() => {
                onSelectIncident(incident);
                setShowDetailDialog(true);
              }}
            >
            <div className="flex items-start justify-between gap-3">
              {/* Left side - Main info */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{getTypeIcon(incident.emergency_type)}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">
                    {incident.incident_number}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(incident.reported_at).toLocaleString()}
                  </div>
                  {/* Show location if available */}
                  {incident.incident_uac && (
                    <div className="text-xs text-blue-600 font-mono truncate max-w-full">
                      📍 {incident.incident_uac}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Status and priority badges */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Badge className={getPriorityColor(incident.priority_level)} variant="outline">
                  P{incident.priority_level}
                </Badge>
                <Badge className={getStatusColor(incident.status)} variant="outline">
                  {incident.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Bottom row - Assigned units and action hint */}
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {isResolved ? (
                  <span className="text-green-600 font-medium">
                    ✓ {t('emergency:incidentResolved')}
                  </span>
                ) : (
                  <span className={incident.assigned_operator_id ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                    {incident.assigned_operator_id ? `✓ ${t('emergency:dispatcherAssigned')}` : `⚠ ${t('emergency:unassigned')}`}
                  </span>
                )}
              </div>
              <span className="text-xs text-primary">
                {isResolved ? `${t('emergency:viewDetails')} →` : `${t('emergency:clickForDetails')} →`}
              </span>
            </div>
            </div>
          );
        })}
        {paginatedIncidents.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No incidents match the current filters</p>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[36px]"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Unit to Incident</DialogTitle>
            <DialogDescription>
              Select an available unit to dispatch to this incident
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={dispatchingUnit} onValueChange={setDispatchingUnit}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectAUnit')} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {availableOfficers
                  .filter((officer) => {
                    const inc = incidents.find((i) => i.id === assignDialog);
                    if (!inc || !inc.city) return true;
                    return officer.coverage_city === inc.city;
                  })
                  .map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignDialog(null)}>
                {t('cancel')}
              </Button>
              <Button 
                onClick={() => assignDialog && handleDispatchIncident(assignDialog)}
                disabled={!dispatchingUnit}
              >
                {t('dispatchUnit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single incident detail dialog */}
      {selectedIncident && showDetailDialog && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="text-left">
              <DialogTitle>Incident Details: {selectedIncident.incident_number}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <IncidentDetailDialog 
                incident={selectedIncident} 
                onUpdate={() => {
                  onUpdate?.();
                  setShowDetailDialog(false);
                }}
                isResolvedView={isResolvedIncidents}
                hideResolvedOption={!isResolvedIncidents}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IncidentList;