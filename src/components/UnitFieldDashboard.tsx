import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Geolocation } from '@capacitor/geolocation';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, Clock, MapPin, Navigation, CheckCircle, 
  Radio, Users, MessageSquare, Car, Shield,
  ArrowRight, Flag, AlertCircle, Send, Battery, Wifi,
  History, Settings, Zap, LogIn, LogOut, RefreshCw,
  Navigation2, Locate, Camera, FileText
} from 'lucide-react';

import { IncidentStatusUpdateDialog } from './IncidentStatusUpdateDialog';
import IncidentDetailDialog from './IncidentDetailDialog';
import IncidentMap from './IncidentMap';
import { useTranslation } from 'react-i18next';
import { UniversalLocationPicker } from './UniversalLocationPicker';
import { RequestBackupDialog } from './RequestBackupDialog';

interface IncidentAssignment {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  reported_at: string;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  incident_message?: string;
  dispatched_at?: string;
  responded_at?: string;
  resolved_at?: string;
  assigned_operator_id?: string;
  assigned_units?: string[];
  dispatcher_notes?: string;
  language_code?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  incident_uac?: string;
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
    newStatus: 'responding'
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
  const { t } = useTranslation(['common', 'emergency']);
  const [actionDialog, setActionDialog] = useState<{ action: FieldAction; incident: IncidentAssignment } | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [currentUAC, setCurrentUAC] = useState<string>('');
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
  const [autoGPSAttempted, setAutoGPSAttempted] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

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

  // Auto-update location on page load (browser tab only)
  useEffect(() => {
    if (autoGPSAttempted) return;
    const isInIframe = window !== window.top;
    if (isInIframe) return;
    if (unitInfo) {
      setAutoGPSAttempted(true);
      updateLocationWithGPS();
    }
  }, [unitInfo, autoGPSAttempted]);

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
            profiles!emergency_unit_members_officer_id_fkey(full_name, email)
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

  const acknowledgeMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.functions.invoke('unit-communications', {
        body: { 
          action: 'acknowledge_message',
          message_id: messageId
        }
      });

      if (error) throw error;

      // Update local state
      setCommunicationLog(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : msg
        )
      );

      setRecentMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : msg
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      toast({
        title: t('messageAcknowledged'),
        description: t('messageMarkedAsAcknowledged')
      });
    } catch (error) {
      console.error('Error acknowledging message:', error);
      toast({
        title: t('common:error'),
        description: t('failedToAcknowledgeMessage'),
        variant: "destructive"
      });
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
              title: t('fieldDashboard.messageAcknowledged'), 
              description: t('fieldDashboard.messageReceivedByDispatch') 
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

  const getCurrentLocation = () => {
    if (!gpsEnabled || !('geolocation' in navigator)) {
      toast({ title: 'GPS unavailable', description: 'Location services are not available', variant: 'destructive' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await updateUnitLocationCoordinates(latitude, longitude);
        toast({ title: 'Location updated', description: 'GPS coordinates updated successfully' });
      },
      (error) => {
        console.error('GPS error:', error);
        toast({ title: 'GPS error', description: 'Failed to get current location', variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
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
          reported_at,
          location_address,
          location_latitude,
          location_longitude,
          incident_message,
          dispatched_at,
          responded_at,
          resolved_at,
          assigned_operator_id,
          assigned_units,
          dispatcher_notes,
          language_code,
          street,
          city,
          region,
          country,
          incident_uac
        `)
        .contains('assigned_units', [unitInfo.unit_code])
        .order('priority_level', { ascending: false })
        .order('dispatched_at', { ascending: true });

      if (error) throw error;
      
      // Assigned incidents already filtered by this unit's code; no additional hardcoded filtering
      const validAssignments = (data || []);
      console.log('UnitFieldDashboard: Found assignments for unit', unitInfo.unit_code, validAssignments);
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

        if (action.newStatus === 'responding' && !incident.responded_at) {
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
      if (action.newStatus && ['responding', 'on_scene'].includes(action.newStatus)) {
        await supabase
          .from('emergency_units')
          .update({ 
            status: action.newStatus === 'responding' ? 'dispatched' : 'busy',
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
          title: t('backupRequestedSuccessfully'),
          description: `${t('backupRequestSentToSupervisors')} ${backupResult?.notifications_sent || 0} ${t('notificationsSent')}`
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
        title: t('actionCompleted'),
        description: `${action.label} ${t('executedSuccessfullyFor')} ${incident.incident_number}`
      });
    } catch (error) {
      console.error('Error executing field action:', error);
      toast({
        title: t('common:error'),
        description: t('failedToExecuteAction'),
        variant: "destructive"
      });
    }
  };

  async function findNearestUAC(latitude: number, longitude: number): Promise<string | null> {
    try {
      const deltaLat = 20 / 111320; // ~degrees for 20m latitude
      const deltaLon = 20 / (111320 * Math.cos(latitude * Math.PI / 180) || 1);

      const { data: nearbyAddresses } = await supabase
        .from('addresses')
        .select('uac, latitude, longitude')
        .gte('latitude', latitude - deltaLat)
        .lte('latitude', latitude + deltaLat)
        .gte('longitude', longitude - deltaLon)
        .lte('longitude', longitude + deltaLon);

      let nearest: string | null = null;
      let minDistance = Infinity;
      if (nearbyAddresses && Array.isArray(nearbyAddresses)) {
        for (const addr of nearbyAddresses) {
          const aLat = Number(addr.latitude);
          const aLon = Number(addr.longitude);
          if (!isNaN(aLat) && !isNaN(aLon)) {
            const d = calculateDistance(latitude, longitude, aLat, aLon);
            if (d <= 20 && d < minDistance) {
              minDistance = d;
              nearest = addr.uac as string;
            }
          }
        }
      }
      return nearest;
    } catch (e) {
      console.error('Error finding nearest UAC:', e);
      return null;
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

  const updateLocationWithGPS = async () => {
    if (!unitInfo) return;

    setIsUpdatingLocation(true);
    try {
      const isInIframe = window !== window.top;
      if (isInIframe) {
        throw new Error('GPS location is not available in the editor preview. Please open the app in a new browser tab to use GPS functionality.');
      }

      // Require HTTPS for browser geolocation (except localhost)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Location only works over HTTPS. Please open the secure (https) version of this site.');
      }

      // Browser permission pre-check (for clearer messaging)
      if ('permissions' in navigator && typeof (navigator as any).permissions.query === 'function') {
        try {
          const perm = await (navigator as any).permissions.query({ name: 'geolocation' as PermissionName });
          if (perm.state === 'denied') {
            throw new Error('Browser location permission denied. Click the lock icon in the address bar and allow Location, then try again.');
          }
        } catch {}
      }

      // Helper to get position via browser with robust fallbacks
      const browserGetPosition = async (): Promise<GeolocationPosition> => {
        if (!('geolocation' in navigator)) throw new Error('Geolocation API not available in this browser.');

        // First attempt: getCurrentPosition (fast path)
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
            });
          });
          return pos;
        } catch (err: any) {
          // Second attempt: watchPosition to wait for first fix (better on cold start)
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            const timer = setTimeout(() => {
              try { navigator.geolocation.clearWatch(watchId); } catch {}
              reject(new Error('Timed out waiting for GPS fix. Move to open sky and try again.'));
            }, 25000);
            const watchId = navigator.geolocation.watchPosition(
              (p) => {
                clearTimeout(timer);
                try { navigator.geolocation.clearWatch(watchId); } catch {}
                resolve(p);
              },
              (watchErr) => {
                clearTimeout(timer);
                try { navigator.geolocation.clearWatch(watchId); } catch {}
                reject(watchErr);
              },
              { enableHighAccuracy: true, maximumAge: 0 }
            );
          });
          return pos;
        }
      };

      let latitude: number | null = null;
      let longitude: number | null = null;

      // Try Capacitor first (mobile/web plugin), then browser
      try {
        const perm = await Geolocation.requestPermissions();
        if ((perm as any)?.location === 'granted') {
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 20000 });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        }
      } catch {}

      if (latitude === null || longitude === null) {
        const position = await browserGetPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      // Check for nearby UACs within 20 meters using a small bounding box then precise distance filter
      const deltaLat = 20 / 111320; // ~degrees for 20m latitude
      const deltaLon = 20 / (111320 * Math.cos(latitude * Math.PI / 180) || 1);

      const { data: nearbyAddresses } = await supabase
        .from('addresses')
        .select('uac, latitude, longitude, street, building')
        .gte('latitude', latitude - deltaLat)
        .lte('latitude', latitude + deltaLat)
        .gte('longitude', longitude - deltaLon)
        .lte('longitude', longitude + deltaLon);

      let nearestUAC: any = null;
      let minDistance = Infinity;

      if (nearbyAddresses && Array.isArray(nearbyAddresses)) {
        for (const address of nearbyAddresses) {
          const aLat = Number(address.latitude);
          const aLon = Number(address.longitude);
          if (!isNaN(aLat) && !isNaN(aLon)) {
            const distance = calculateDistance(latitude, longitude, aLat, aLon);
            if (distance <= 20 && distance < minDistance) {
              minDistance = distance;
              nearestUAC = address;
            }
          }
        }
      }

      let locationDescription = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      if (nearestUAC) {
        locationDescription = `${nearestUAC.street || 'Near'} ${nearestUAC.building || ''} (${nearestUAC.uac})`.trim();
      }

      const sanitizeAddressDisplay = (input?: string) => {
        if (!input) return '';
        return input.replace(/^\s*(Emergency Location|Dirección)\s*:\s*/i, '').trim();
      };

      // Set current UAC state for display
      setCurrentUAC(nearestUAC?.uac ?? '');

      const { error } = await supabase
        .from('emergency_units')
        .update({
          current_location: locationDescription,
          location_latitude: latitude,
          location_longitude: longitude,
          location_updated_at: new Date().toISOString(),
        })
        .eq('id', unitInfo.id);

      if (error) throw error;

      await fetchUnitInfo();

      toast({
        title: 'Location Updated',
        description: nearestUAC
          ? `Located near ${nearestUAC.uac} (${minDistance.toFixed(0)}m away)`
          : 'GPS coordinates updated successfully'
      });

    } catch (error: any) {
      console.error('GPS error:', error);
      let msg = 'Failed to get current location.';
      if (error?.code === 1 || /denied/i.test(error?.message || '')) {
        msg = 'Location permission denied. Click the lock icon and allow Location, then retry.';
      } else if (error?.code === 2) {
        msg = 'Position unavailable. Move to an open area or check if location services are on.';
        setShowLocationPicker(true);
      } else if (error?.code === 3 || /Timed out/i.test(error?.message || '')) {
        msg = 'Location timed out. Move to open sky and try again.';
        setShowLocationPicker(true);
      } else if (typeof error?.message === 'string') {
        msg = error.message;
      }
      toast({ title: 'GPS Error', description: msg, variant: 'destructive' });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
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
            <h2 className="text-2xl font-bold mb-4">{t('fieldDashboard.noUnitAssignment')}</h2>
            <p className="text-muted-foreground">
              {t('fieldDashboard.noUnitAssignmentDescription')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unit Info Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('fieldDashboard.title')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {unitInfo ? `${unitInfo.unit_code} - ${unitInfo.unit_name}` : t('fieldDashboard.loadingUnitInfo')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={shiftStatus === 'on_duty' ? 'default' : 'secondary'} className="whitespace-nowrap">
                {shiftStatus === 'on_duty' ? t('fieldDashboard.onDuty') : 
                 shiftStatus === 'off_duty' ? t('fieldDashboard.offDuty') : 
                 t('fieldDashboard.onBreak')}
              </Badge>
              <div className={`w-3 h-3 rounded-full ${
                unitStatus === 'available' ? 'bg-green-500' :
                unitStatus === 'busy' ? 'bg-red-500' :
                unitStatus === 'en_route' ? 'bg-blue-500' :
                unitStatus === 'on_scene' ? 'bg-orange-500' : 'bg-gray-500'
              }`} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* System Status Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              <span>{t('fieldDashboard.battery')}: {batteryLevel}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span>{t('fieldDashboard.signal')}: {signalStrength}/4</span>
            </div>
            <div className="flex items-center gap-2">
              <Locate className="h-4 w-4" />
              <span className={gpsEnabled ? 'text-green-600' : 'text-red-600'}>
                {t('fieldDashboard.gps')}: {gpsEnabled ? t('fieldDashboard.on') : t('fieldDashboard.off')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span>{t('fieldDashboard.radio')}: {unitInfo?.radio_frequency || t('fieldDashboard.na')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('fieldDashboard.activeIncidents')}
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('navigation.map')}
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('fieldDashboard.fieldOperationsControl')}
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('fieldDashboard.unitCommunications')}
            </TabsTrigger>
          </TabsList>

        {/* Active Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('fieldDashboard.currentAssignments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <div className="space-y-2">
                  {assignments.map((incident) => (
                    <div 
                      key={incident.id} 
                      className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            incident.priority_level === 1 ? 'bg-red-500' :
                            incident.priority_level === 2 ? 'bg-orange-500' :
                            incident.priority_level === 3 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="font-medium">{incident.incident_number}</p>
                            <p className="text-sm text-muted-foreground">{t(`fieldDashboard.emergencyTypes.${incident.emergency_type}`) || incident.emergency_type.replace(/_/g, ' ').toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{t(`fieldDashboard.statuses.${incident.status}`) || incident.status}</Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {incident.location_address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{t('common:navigation.address')}: {(() => {
                            const sanitizeAddressDisplay = (input?: string) => {
                              if (!input) return '';
                              return input.replace(/^\s*(Emergency Location|Dirección)\s*:\s*/i, '').trim();
                            };
                            return sanitizeAddressDisplay(incident.location_address);
                          })()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No active assignments</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('fieldDashboard.incidentLocations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <IncidentMap 
                  incidents={assignments}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(incident) => setSelectedIncident(incident)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Field Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('fieldDashboard.fieldOperationsControl')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Shift and Emergency Controls */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={shiftStatus === 'on_duty' ? 'destructive' : 'default'}
                  onClick={toggleShift}
                  className="flex items-center gap-2"
                >
                  {shiftStatus === 'on_duty' ? (
                    <>
                      <LogOut className="h-4 w-4" />
                      {t('fieldDashboard.endShift')}
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      {t('fieldDashboard.startShift')}
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={triggerEmergency}
                  disabled={emergencyMode}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  {t('fieldDashboard.emergencyButton')}
                </Button>
              </div>

              {/* Unit Status */}
              <div className="space-y-3">
                <h4 className="font-medium">{t('fieldDashboard.unitStatus.label')}</h4>
                <Select value={unitStatus} onValueChange={updateUnitStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">{t('fieldDashboard.unitStatus.available')}</SelectItem>
                    <SelectItem value="busy">{t('fieldDashboard.unitStatus.busy')}</SelectItem>
                    <SelectItem value="en_route">{t('fieldDashboard.unitStatus.en_route')}</SelectItem>
                    <SelectItem value="on_scene">{t('fieldDashboard.unitStatus.on_scene')}</SelectItem>
                    <SelectItem value="out_of_service">{t('fieldDashboard.unitStatus.out_of_service')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Management */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('fieldDashboard.locationManagement')}
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={updateLocationWithGPS}
                    disabled={isUpdatingLocation}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Navigation2 className="h-4 w-4" />
                    {isUpdatingLocation ? t('fieldDashboard.gettingGPS') : t('fieldDashboard.updateGPS')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowLocationPicker(true)}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    {t('fieldDashboard.pickOnMap')}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('fieldDashboard.enterUacOrLocation')}
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <Button 
                    onClick={updateUnitLocation}
                    disabled={!currentLocation.trim() || isUpdatingLocation}
                    size="sm"
                  >
                    {t('fieldDashboard.update')}
                  </Button>
                </div>
                
                {(unitInfo?.current_location || currentUAC) && (
                  <p className="text-sm text-muted-foreground">
                    {t('fieldDashboard.currentLabel')} <span className="font-mono">{currentUAC || unitInfo?.current_location}</span>
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">{t('quickActions')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <RequestBackupDialog unitId={unitInfo?.id} unitCode={unitInfo?.unit_code}>
                    <Button variant="outline" className="text-xs">
                      <Users className="h-4 w-4 mr-2" />
                      {t('emergency:requestBackup')}
                    </Button>
                  </RequestBackupDialog>
                  
                  <Button variant="outline" className="text-xs" onClick={() => setShowResourceDialog(true)}>
                    <Car className="h-4 w-4 mr-2" />
                    {t('fieldDashboard.requestResources')}
                  </Button>
                  
                  <Button variant="outline" className="text-xs" onClick={() => setShowHistory(!showHistory)}>
                    <History className="h-4 w-4 mr-2" />
                    {t('fieldDashboard.viewHistory')}
                  </Button>
                  
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild className="w-full text-xs">
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        {t('fieldDashboard.evidence')}
                      </span>
                    </Button>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleEvidenceUpload}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('fieldDashboard.unitCommunications')}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 whitespace-nowrap">
                    {t('fieldDashboard.unread', { count: unreadCount })}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recent Messages */}
              <div className="bg-muted/30 rounded-lg p-4 h-64 overflow-y-auto">
                {recentMessages.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    {t('fieldDashboard.noRecentCommunications')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentMessages.slice(0, 8).map((comm) => (
                      <div key={comm.id} className={`text-sm p-3 rounded border-l-4 ${
                        comm.type === 'outgoing' 
                          ? 'bg-primary/10 border-l-primary'
                          : !comm.acknowledged 
                            ? 'bg-accent border-l-accent-foreground font-medium'
                            : 'bg-muted border-l-muted-foreground opacity-75'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {comm.is_radio_code && (
                                <Badge variant="secondary" className="text-xs">
                                  <Radio className="h-3 w-3 mr-1" />
                                  {comm.radio_code}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {comm.type === 'outgoing' ? t('fieldDashboard.toDispatch') : t('fieldDashboard.fromDispatch')}
                              </span>
                            </div>
                            <p className="mb-1">{comm.message_content}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(comm.timestamp || comm.created_at).toLocaleTimeString()}
                              </span>
                              {comm.type === 'outgoing' && (
                                <span className={`text-xs ${comm.acknowledged ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {comm.acknowledged ? t('fieldDashboard.acknowledged') : t('fieldDashboard.pending')}
                                </span>
                              )}
                            </div>
                          </div>
                          {comm.type === 'incoming' && !comm.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs ml-2"
                              onClick={() => acknowledgeMessage(comm.id)}
                            >
                              {t('fieldDashboard.ack')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Send Message */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('fieldDashboard.sendMessagePlaceholder')}
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded-md"
                    onKeyPress={(e) => e.key === 'Enter' && sendQuickMessage()}
                  />
                  <Button onClick={sendQuickMessage} disabled={!quickMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              
              {/* Radio Codes */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">{t('fieldDashboard.quickRadioCodes')}</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-4', '10-4 Acknowledged')}>
                    <Radio className="h-3 w-3 mr-1" />
                    10-4
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-8', '10-8 In Service')}>
                    <Radio className="h-3 w-3 mr-1" />
                    10-8
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-23', '10-23 Arrived')}>
                    <Radio className="h-3 w-3 mr-1" />
                    10-23
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-24', '10-24 Complete')}>
                    <Radio className="h-3 w-3 mr-1" />
                    10-24
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-20', '10-20 Location Status')}>
                    <Radio className="h-3 w-3 mr-1" />
                    10-20
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendRadioCode('10-99', '10-99 Emergency!')} className="bg-destructive/10 hover:bg-destructive/20">
                    <Radio className="h-3 w-3 mr-1" />
                    10-99
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      <UniversalLocationPicker
        open={showLocationPicker}
        onOpenChange={setShowLocationPicker}
        initialCenter={unitInfo?.location_latitude && unitInfo?.location_longitude ? [unitInfo.location_latitude, unitInfo.location_longitude] : undefined}
        onConfirm={async (lat, lng) => {
          if (!unitInfo) return;
          const desc = `Manual: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          const { error } = await supabase
            .from('emergency_units')
            .update({
              current_location: desc,
              location_latitude: lat,
              location_longitude: lng,
              location_updated_at: new Date().toISOString(),
            })
            .eq('id', unitInfo.id);
          if (error) {
            toast({ title: t('fieldDashboard.errorTitle'), description: t('fieldDashboard.failedToSaveManualLocation'), variant: 'destructive' });
            return;
          }
          setUnitInfo(prev => prev ? { ...prev, current_location: desc, location_latitude: lat, location_longitude: lng } : prev);
          // Try to find and set the nearest UAC for display
          const nearest = await findNearestUAC(lat, lng);
          setCurrentUAC(nearest || '');
          toast({ title: t('fieldDashboard.locationUpdated'), description: t('fieldDashboard.manualLocationSet') });
        }}
      />

      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('fieldDashboard.requestResources')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={resourceRequest}
              onChange={(e) => setResourceRequest(e.target.value)}
              placeholder={t('fieldDashboard.resourcesPlaceholder')}
              rows={3}
            />
            <Button onClick={requestResource} disabled={!resourceRequest.trim()}>
              {t('fieldDashboard.sendRequest')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {actionDialog && (
        <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.action.label} - {actionDialog.incident.incident_number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded">
                <p className="font-medium">{actionDialog.incident.emergency_type.replace(/_/g, ' ').toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">
                  Priority {actionDialog.incident.priority_level} • {formatLocation(actionDialog.incident)}
                </p>
              </div>
              
              {actionDialog.action.requiresNotes && (
                <div>
                  <label className="text-sm font-medium">
                    {actionDialog.action.action === 'request_backup' ? t('fieldDashboard.reasonForBackup') : t('fieldDashboard.notes')}
                  </label>
                  <Textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={actionDialog.action.action === 'request_backup' 
                      ? t('fieldDashboard.describeBackupSituation')
                      : t('fieldDashboard.addNotesPlaceholder')
                    }
                    rows={3}
                  />
                </div>
              )}
              
              <Button 
                onClick={executeFieldAction} 
                className="w-full"
                disabled={actionDialog.action.requiresNotes && !actionNotes.trim()}
              >
                {t('fieldDashboard.confirmAction', { action: actionDialog.action.label })}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Evidence Files */}
      {evidenceFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('fieldDashboard.evidenceFiles')} ({evidenceFiles.length})
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
              {t('fieldDashboard.recentIncidentHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {incidentHistory.slice(0, 10).map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <span className="font-medium">{incident.incident_number}</span>
                    <span className="ml-2 text-muted-foreground">{incident.emergency_type.replace(/_/g, ' ').toUpperCase()}</span>
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

      {/* Incident Detail Dialog */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{t('fieldDashboard.incidentDetailsTitle', { number: selectedIncident.incident_number })}</DialogTitle>
            <DialogDescription>
              {t('fieldDashboard.incidentDetailsDescription')}
            </DialogDescription>
            </DialogHeader>
            <IncidentDetailDialog
              incident={selectedIncident}
              onUpdate={() => {
                fetchAssignments();
                setSelectedIncident(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
