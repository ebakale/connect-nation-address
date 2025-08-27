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
  Map, Camera, FileText, Send, Bell, Battery, Wifi,
  UserCheck, Upload, Download, History, Settings,
  Zap, Heart, Siren, LogIn, LogOut, RefreshCw,
  Headphones, Mic, Volume2, Navigation2, Locate
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface UnitFieldDashboardProps {
  unitIncidents: any[];
  isFieldOperatorMode?: boolean;
}

export const UnitFieldDashboard: React.FC<UnitFieldDashboardProps> = ({ 
  unitIncidents, 
  isFieldOperatorMode = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
  const [assignments, setAssignments] = useState<IncidentAssignment[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentAssignment | null>(null);
  const { t } = useLanguage();
  const [actionDialog, setActionDialog] = useState<{ action: FieldAction; incident: IncidentAssignment } | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [unitMembers, setUnitMembers] = useState<any[]>([]);
  const [unitStatus, setUnitStatus] = useState<string>('available');
  const [shiftStatus, setShiftStatus] = useState<'on_duty' | 'off_duty' | 'break'>('off_duty');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [incidentHistory, setIncidentHistory] = useState<IncidentAssignment[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [signalStrength, setSignalStrength] = useState(4);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [communicationLog, setCommunicationLog] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [quickMessage, setQuickMessage] = useState('');
  const [resourceRequest, setResourceRequest] = useState('');
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupReason, setBackupReason] = useState('');

  // Use the incidents passed from parent component
  useEffect(() => {
    setAssignments(unitIncidents);
    // Also filter for incident history (resolved/closed incidents)
    const historyIncidents = unitIncidents.filter(incident => 
      ['resolved', 'closed'].includes(incident.status)
    );
    setIncidentHistory(historyIncidents);
  }, [unitIncidents]);

  useEffect(() => {
    fetchUnitInfo();
    fetchUnitMembers();
    fetchRecentMessages();
    initializeGPS();
    checkBatteryStatus();
    setupRealtimeSubscription();
  }, [user]);

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
        const unit = data.emergency_units as UnitInfo;
        setUnitInfo(unit);
        setUnitStatus(unit.status);
      }
    } catch (error) {
      console.error('Error fetching unit info:', error);
    }
  };

  const fetchUnitMembers = async () => {
    if (!user) return;

    try {
      const { data: unitMembership } = await supabase
        .from('emergency_unit_members')
        .select('unit_id')
        .eq('officer_id', user.id)
        .single();

      if (unitMembership) {
        const { data: members, error } = await supabase
          .from('emergency_unit_members')
          .select(`
            officer_id,
            role,
            is_lead,
            profiles(full_name, email)
          `)
          .eq('unit_id', unitMembership.unit_id);

        if (error) throw error;
        setUnitMembers(members || []);
      }
    } catch (error) {
      console.error('Error fetching unit members:', error);
    }
  };

  const initializeGPS = () => {
    if ('geolocation' in navigator) {
      setGpsEnabled(true);
      // Auto-update location every 5 minutes when on duty
      if (shiftStatus === 'on_duty') {
        const interval = setInterval(() => {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            // Auto-update unit location
            updateUnitLocationCoordinates(latitude, longitude);
          });
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
      }
    }
  };

  const checkBatteryStatus = () => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  };

  const updateUnitStatus = async (newStatus: string) => {
    if (!unitInfo) return;

    try {
      const { error } = await supabase
        .from('emergency_units')
        .update({ status: newStatus })
        .eq('id', unitInfo.id);

      if (error) throw error;
      setUnitStatus(newStatus);
      toast({ title: t('unitStatusUpdated'), description: `${t('status')} changed to ${newStatus}` });
    } catch (error) {
      console.error('Error updating unit status:', error);
      toast({ title: 'Error', description: 'Failed to update unit status', variant: 'destructive' });
    }
  };

  const toggleShift = async () => {
    const newStatus = shiftStatus === 'off_duty' ? 'on_duty' : 'off_duty';
    
    try {
      // Log shift change
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: '00000000-0000-0000-0000-000000000000', // System log
          user_id: user?.id,
          action: newStatus === 'on_duty' ? 'shift_start' : 'shift_end',
          details: { 
            unit_code: unitInfo?.unit_code,
            timestamp: new Date().toISOString()
          }
        });

      setShiftStatus(newStatus);
      
      if (newStatus === 'on_duty') {
        await updateUnitStatus('available');
        initializeGPS();
      } else {
        await updateUnitStatus('off_duty');
      }

      toast({ 
        title: 'Shift updated', 
        description: `You are now ${newStatus.replace('_', ' ')}` 
      });
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({ title: 'Error', description: 'Failed to update shift status', variant: 'destructive' });
    }
  };

  const triggerEmergency = async () => {
    setEmergencyMode(true);
    
    try {
      // Send emergency alert
      await supabase.functions.invoke('notify-emergency-operators', {
        body: {
          type: 'officer_emergency',
          unit_code: unitInfo?.unit_code,
          officer_id: user?.id,
          location: unitInfo?.current_location,
          coordinates: {
            latitude: unitInfo?.location_latitude,
            longitude: unitInfo?.location_longitude
          }
        }
      });

      toast({ 
        title: 'EMERGENCY ALERT SENT', 
        description: 'All operators have been notified', 
        variant: 'destructive' 
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({ title: 'Error', description: 'Failed to send emergency alert', variant: 'destructive' });
    }

    // Auto-disable after 30 seconds unless manually disabled
    setTimeout(() => {
      if (emergencyMode) setEmergencyMode(false);
    }, 30000);
  };

  const updateUnitLocationCoordinates = async (latitude: number, longitude: number) => {
    if (!unitInfo) return;

    try {
      const { error } = await supabase
        .from('emergency_units')
        .update({ 
          location_latitude: latitude,
          location_longitude: longitude,
          location_updated_at: new Date().toISOString()
        })
        .eq('id', unitInfo.id);

      if (error) throw error;
      
      setUnitInfo(prev => prev ? {
        ...prev,
        location_latitude: latitude,
        location_longitude: longitude
      } : null);
    } catch (error) {
      console.error('Error updating coordinates:', error);
    }
  };

  const sendQuickMessage = async () => {
    if (!quickMessage.trim() || !unitInfo) return;

    try {
      const { data, error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          message_content: quickMessage,
          message_type: 'text',
          is_radio_code: false,
          priority_level: 3,
          unit_id: unitInfo.id
        }
      });

      if (error) throw error;

      // Add to local communication log for immediate feedback
      const newMessage = {
        id: data.communication?.id || Date.now().toString(),
        timestamp: new Date().toISOString(),
        from_unit_id: unitInfo.id,
        from_user_id: user?.id,
        message_content: quickMessage,
        message_type: 'text',
        is_radio_code: false,
        acknowledged: false,
        type: 'outgoing'
      };

      setCommunicationLog(prev => [newMessage, ...prev]);
      setQuickMessage('');

      toast({ title: 'Message sent', description: 'Message sent to dispatch successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  };

  const sendRadioCode = async (code: string, message: string) => {
    if (!unitInfo) return;

    try {
      const { data, error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          message_content: message,
          message_type: 'radio_code',
          is_radio_code: true,
          radio_code: code,
          priority_level: 2,
          unit_id: unitInfo.id
        }
      });

      if (error) throw error;

      // Add to local communication log
      const newMessage = {
        id: data.communication?.id || Date.now().toString(),
        timestamp: new Date().toISOString(),
        from_unit_id: unitInfo.id,
        from_user_id: user?.id,
        message_content: message,
        radio_code: code,
        message_type: 'radio_code',
        is_radio_code: true,
        acknowledged: false,
        type: 'outgoing'
      };

      setCommunicationLog(prev => [newMessage, ...prev]);
      toast({ title: `${code} sent`, description: message });
    } catch (error) {
      console.error('Error sending radio code:', error);
      toast({ title: 'Error', description: 'Failed to send radio code', variant: 'destructive' });
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'get_messages'
        }
      });

      if (error) throw error;

      setRecentMessages(data.messages || []);
      setCommunicationLog(data.messages || []);
      
      // Count unread messages (not acknowledged)
      const unread = (data.messages || []).filter((msg: any) => !msg.acknowledged).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user?.id) return;

    const channel = supabase
      .channel('unit-communications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'unit_communications'
        },
        (payload) => {
          const newMessage = {
            ...payload.new,
            type: payload.new.from_user_id === user.id ? 'outgoing' : 'incoming'
          };
          
          setCommunicationLog(prev => [newMessage, ...prev]);
          setRecentMessages(prev => [newMessage, ...prev]);
          
          // Increment unread count for incoming messages
          if (payload.new.from_user_id !== user.id) {
            setUnreadCount(prev => prev + 1);
            toast({ 
              title: 'New message', 
              description: `From ${payload.new.emergency_units?.unit_code || 'Dispatch'}: ${payload.new.message_content.substring(0, 50)}...`,
              duration: 5000
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'unit_communications'
        },
        (payload) => {
          // Update local messages when acknowledgment status changes
          setCommunicationLog(prev => 
            prev.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, acknowledged: payload.new.acknowledged, acknowledged_at: payload.new.acknowledged_at }
                : msg
            )
          );
          
          if (payload.new.acknowledged && payload.new.from_user_id === user.id) {
            toast({ 
              title: 'Message acknowledged', 
              description: 'Your message has been received by dispatch' 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const requestResource = async () => {
    if (!resourceRequest.trim() || !unitInfo) return;

    try {
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: '00000000-0000-0000-0000-000000000000', // System log
          user_id: user?.id,
          action: 'resource_request',
          details: { 
            unit_code: unitInfo.unit_code,
            request: resourceRequest,
            timestamp: new Date().toISOString()
          }
        });

      setResourceRequest('');
      setShowResourceDialog(false);
      toast({ title: 'Resource requested', description: 'Request sent to dispatch' });
    } catch (error) {
      console.error('Error requesting resource:', error);
      toast({ title: 'Error', description: 'Failed to send resource request', variant: 'destructive' });
    }
  };

  const handleEvidenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setEvidenceFiles(prev => [...prev, ...files]);
    toast({ title: 'Evidence added', description: `${files.length} file(s) added to evidence` });
  };

  const fetchAssignments = async () => {
    if (!unitInfo) {
      return;
    }

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
          dispatcher_notes,
          assigned_units
        `)
        .contains('assigned_units', [unitInfo.unit_code])
        .order('priority_level', { ascending: false })
        .order('dispatched_at', { ascending: true });

      if (error) throw error;
      
      // Filter to only include incidents assigned to valid registered units
      const validUnits = ['UNIT-001', 'UNIT-002', 'UNIT-003', 'UNIT-004', 'UNIT-005', 'UNIT-006', 'UNIT-007', 'UNIT-008'];
      const validAssignments = (data || []).filter(incident => 
        incident.assigned_units && 
        incident.assigned_units.length > 0 &&
        incident.assigned_units.some((unit: string) => validUnits.includes(unit)) &&
        incident.assigned_units.includes(unitInfo.unit_code)
      );
      
      console.log('UnitFieldDashboard: Found valid assignments:', validAssignments);
      setAssignments(validAssignments);
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

        toast({
          title: "Backup Requested Successfully",
          description: `Backup request sent to supervisors and dispatchers. ${backupResult?.notifications_sent || 0} notification(s) sent.`
        });
        
        // Skip the general success toast for backup requests since we show specific message above
        setActionDialog(null);
        setActionNotes('');
        return;
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
          // GPS not available, using manual location only
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

  // Request backup function for general use (not incident-specific)
  const requestBackup = async () => {
    if (!unitInfo || !backupReason.trim()) return;

    try {
      const { data: backupResult, error: backupError } = await supabase.functions.invoke('process-backup-request', {
        body: {
          incident_id: null, // General backup request, not incident-specific
          requesting_unit_code: unitInfo.unit_code,
          requesting_unit_name: unitInfo.unit_name,
          reason: backupReason,
          priority_level: 3, // Normal priority for general backup
          location: unitInfo.current_location || 'Unknown location',
          incident_number: null
        }
      });

      if (backupError) {
        console.error('Backup request failed:', backupError);
        throw new Error('Failed to send backup request');
      }

      toast({
        title: "Backup Requested Successfully",
        description: `General backup request sent to supervisors and dispatchers. ${backupResult?.notifications_sent || 0} notification(s) sent.`
      });
      
      setShowBackupDialog(false);
      setBackupReason('');
    } catch (error) {
      console.error('Error requesting backup:', error);
      toast({
        title: "Error",
        description: "Failed to request backup",
        variant: "destructive"
      });
    }
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Unit Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold truncate">
            {unitInfo.unit_code} - {isFieldOperatorMode ? "My Field Operations" : "Field Operations"}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            {isFieldOperatorMode 
              ? `Officer Dashboard - ${unitInfo.unit_name}` 
              : unitInfo.unit_name
            }
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${getIncidentStatusColor(unitStatus)}`} />
            <span className="truncate">{unitStatus.toUpperCase()}</span>
          </Badge>
          
          {/* Shift Status */}
          <Badge variant={shiftStatus === 'on_duty' ? 'default' : 'secondary'} 
                 className="flex items-center gap-1 sm:gap-2 text-xs">
            {shiftStatus === 'on_duty' ? <UserCheck className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
            <span className="truncate">{shiftStatus.replace('_', ' ').toUpperCase()}</span>
          </Badge>

          {/* System Status Indicators */}
          <div className="flex items-center gap-2">
            {gpsEnabled && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Locate className="h-3 w-3 text-green-600" />
                GPS
              </Badge>
            )}
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Battery className="h-3 w-3" />
              {batteryLevel}%
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              {signalStrength}/4
            </Badge>
          </div>

          {unitInfo.radio_frequency && (
            <Badge variant="outline">
              <Radio className="h-3 w-3 mr-1" />
              {unitInfo.radio_frequency}
            </Badge>
          )}
        </div>
      </div>

      {/* Emergency Alert Bar */}
      {emergencyMode && (
        <div className="bg-red-600 text-white p-4 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-bold">EMERGENCY MODE ACTIVE</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEmergencyMode(false)}
              className="bg-white text-red-600 hover:bg-gray-100"
            >
              Clear Alert
            </Button>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unit Status Controls */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Unit Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={shiftStatus === 'on_duty' ? 'destructive' : 'default'}
                size="sm"
                onClick={toggleShift}
                className="flex items-center gap-1"
              >
                {shiftStatus === 'on_duty' ? (
                  <>
                    <LogOut className="h-3 w-3" />
                    End Shift
                  </>
                ) : (
                  <>
                    <LogIn className="h-3 w-3" />
                    Start Shift
                  </>
                )}
              </Button>
              
              <Button 
                variant="destructive"
                size="sm"
                onClick={triggerEmergency}
                disabled={emergencyMode}
                className="flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                Emergency
              </Button>
            </div>
            
            <Select value={unitStatus} onValueChange={updateUnitStatus}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="en_route">En Route</SelectItem>
                <SelectItem value="on_scene">On Scene</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Quick Communication */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Quick Comm 
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {unreadCount} New
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Recent Messages - Improved with visual hierarchy */}
            <div className="bg-muted/30 rounded p-2 h-32 overflow-y-auto">
              <div className="text-xs font-medium mb-2 text-muted-foreground flex items-center justify-between">
                Recent Communications
                {communicationLog.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {communicationLog.length}
                  </Badge>
                )}
              </div>
              {communicationLog.length === 0 ? (
                <div className="text-xs text-muted-foreground italic text-center py-4">
                  No recent communications
                </div>
              ) : (
                <div className="space-y-1">
                  {communicationLog.slice(0, 5).map((comm) => (
                    <div key={comm.id} className={`text-xs p-2 rounded border-l-2 ${
                      comm.type === 'outgoing' 
                        ? 'bg-primary/10 border-l-primary text-primary-foreground/90'
                        : !comm.acknowledged 
                          ? 'bg-accent border-l-accent-foreground font-medium'
                          : 'bg-muted border-l-muted-foreground opacity-75'
                    }`}>
                      <div className="flex items-start gap-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            {comm.is_radio_code && (
                              <Badge variant="secondary" className="text-xs py-0 px-1 h-4">
                                <Radio className="h-2 w-2 mr-1" />
                                {comm.radio_code}
                              </Badge>
                            )}
                            <span className="text-xs opacity-75">
                              {comm.type === 'outgoing' ? 'TO DISPATCH' : 'FROM DISPATCH'}
                            </span>
                          </div>
                          <div className="font-medium">{comm.message_content}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-75">
                              {new Date(comm.timestamp || comm.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            {comm.type === 'outgoing' && (
                              <span className={`text-xs ${comm.acknowledged ? 'text-green-600' : 'text-yellow-600'}`}>
                                {comm.acknowledged ? '✓ Acknowledged' : '⏳ Pending'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Send Message */}
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Message dispatch..."
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border rounded"
                onKeyPress={(e) => e.key === 'Enter' && sendQuickMessage()}
              />
              <Button size="sm" onClick={sendQuickMessage} disabled={!quickMessage.trim()}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Radio Codes - Enhanced */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Quick Radio Codes</div>
              <div className="grid grid-cols-2 gap-1">
                <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-4', '10-4 Acknowledged')} className="text-xs">
                  <Radio className="h-3 w-3 mr-1" />
                  10-4
                </Button>
                <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-8', '10-8 In Service')} className="text-xs">
                  <Radio className="h-3 w-3 mr-1" />
                  10-8
                </Button>
                <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-23', '10-23 Arrived')} className="text-xs">
                  <Radio className="h-3 w-3 mr-1" />
                  10-23
                </Button>
                <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-24', '10-24 Complete')} className="text-xs">
                  <Radio className="h-3 w-3 mr-1" />
                  10-24
                </Button>
                <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-20', '10-20 Location Status')} className="text-xs">
                  <Radio className="h-3 w-3 mr-1" />
                  10-20
                </Button>
                <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-99', '10-99 Emergency!')} className="text-xs bg-destructive/10 hover:bg-destructive/20">
                  <Radio className="h-3 w-3 mr-1" />
                  10-99
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Request Backup Button - Always Available */}
            <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  Request Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Backup</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={backupReason}
                    onChange={(e) => setBackupReason(e.target.value)}
                    placeholder="Describe the reason for backup request..."
                    rows={3}
                  />
                  <Button onClick={requestBackup} disabled={!backupReason.trim()}>
                    Send Backup Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="grid grid-cols-2 gap-1">
              <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Car className="h-3 w-3 mr-1" />
                    <span className="text-xs">Resources</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Resources</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={resourceRequest}
                      onChange={(e) => setResourceRequest(e.target.value)}
                      placeholder="Describe the resources needed..."
                      rows={3}
                    />
                    <Button onClick={requestResource} disabled={!resourceRequest.trim()}>
                      Send Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                <History className="h-3 w-3 mr-1" />
                <span className="text-xs">History</span>
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Camera className="h-3 w-3 mr-1" />
                    <span className="text-xs">Evidence</span>
                  </span>
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                  onChange={handleEvidenceUpload}
                />
              </label>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.geolocation.getCurrentPosition((pos) => {
                  updateUnitLocationCoordinates(pos.coords.latitude, pos.coords.longitude);
                  toast({ title: 'Location updated', description: 'GPS coordinates synced' });
                })}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                <span className="text-xs">GPS</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Members - Restricted for field operators */}
      {unitMembers.length > 0 && !isFieldOperatorMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Unit Members ({unitMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unitMembers.map((member) => (
                <div key={member.officer_id} className="flex items-center gap-3 p-2 border rounded">
                  <div className={`w-3 h-3 rounded-full ${member.is_lead ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {member.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.role} {member.is_lead && '(Lead)'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Communications */}
      {communicationLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Communications
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {communicationLog.slice(0, 10).map((comm) => (
                <div key={comm.id} className={`flex items-start justify-between p-2 border rounded text-sm ${
                  comm.type === 'outgoing' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className="flex-1">
                    {comm.is_radio_code && (
                      <Badge variant="outline" className="text-xs mb-1">
                        {comm.radio_code}
                      </Badge>
                    )}
                    <p className="text-sm">{comm.message_content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comm.timestamp || comm.created_at).toLocaleTimeString()}
                      {comm.type === 'outgoing' && (
                        <span className="ml-2">
                          {comm.acknowledged ? '✓ Acknowledged' : 'Pending'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {evidenceFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Evidence Files ({evidenceFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {evidenceFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded text-xs">
                  <FileText className="h-3 w-3" />
                  <span className="truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incident History */}
      {showHistory && incidentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Incident History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {incidentHistory.slice(0, 10).map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <span className="font-medium">{incident.incident_number}</span>
                    <span className="ml-2 text-muted-foreground">{incident.emergency_type}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {incident.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Update - Own unit only for field operators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isFieldOperatorMode ? "My Location" : "Location Management"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isFieldOperatorMode && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                <p className="text-sm text-blue-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  You can only update your own unit's location
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isFieldOperatorMode ? "Update my location..." : "Update location manually..."}
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
              <p className="text-sm text-muted-foreground">
                Current: {unitInfo.current_location}
              </p>
            )}
            
            {unitInfo.location_latitude && unitInfo.location_longitude && (
              <p className="text-xs text-muted-foreground font-mono">
                GPS: {unitInfo.location_latitude.toFixed(6)}, {unitInfo.location_longitude.toFixed(6)}
              </p>
            )}
          </div>
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
                      (action.action === 'request_backup') || // Always available for any incident
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