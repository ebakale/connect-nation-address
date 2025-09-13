import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, AlertTriangle, Clock, MapPin, Phone, User, 
  LogOut, Settings, Bell, CheckCircle, XCircle, Eye,
  Activity, Users, TrendingUp, AlertCircle, Radio,
  Navigation, MessageSquare, Flag, Award
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import Footer from '@/components/Footer';
import { OfflineIndicator } from '@/components/OfflineIndicator';

import IncidentMap from '@/components/IncidentMap';
import IncidentList from '@/components/IncidentList';
import OperatorStatusPanel from '@/components/OperatorStatusPanel';
import { UnitStatusManager } from '@/components/UnitStatusManager';
import { ResponseTimeTracker } from '@/components/ResponseTimeTracker';
import { UnitFieldDashboard } from '@/components/UnitFieldDashboard';
import { UnitsOverview } from '@/components/UnitsOverview';
import { BackupNotificationManager } from '@/components/BackupNotificationManager';
import { UnitLeadDashboard } from '@/components/UnitLeadDashboard';
import { UnitLeadActions } from '@/components/UnitLeadActions';
import { PoliceAdminDashboard } from '@/components/PoliceAdminDashboard';
import { RequestBackupDialog } from '@/components/RequestBackupDialog';
import { BackupRequestsSentPanel } from '@/components/BackupRequestsSentPanel';
import { BackupNotificationsPanel } from '@/components/BackupNotificationsPanel';
import DispatcherCommunications from '@/components/DispatcherCommunications';
import { EnhancedSyncStatus } from '@/components/EnhancedSyncStatus';
import { UnitLeadershipDashboard } from '@/components/UnitLeadershipDashboard';
import { UnitPerformanceAnalytics } from '@/components/UnitPerformanceAnalytics';
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
  reporter_name?: string;
  reporter_email?: string;
  city?: string;
  region?: string;
  country?: string;
}

interface DashboardStats {
  activeIncidents: number;
  availableUnits: number;
  avgResponseTime: number;
  operatorsOnline: number;
  totalIncidents: number;
  resolvedIncidents: number;
}

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role, isPoliceOperator, isPoliceDispatcher, isPoliceSupervisor, isPoliceAdmin, isAdmin, loading, hasPoliceAccess, hasPoliceAdminAccess, isUnitLead } = useUserRole();
  const { t } = useTranslation('emergency');
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<string>('');
  const [showMap, setShowMap] = useState(false);
  const [showUnitsOverview, setShowUnitsOverview] = useState(false);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [resolvedIncidents, setResolvedIncidents] = useState<EmergencyIncident[]>([]);
  const [areaIncidents, setAreaIncidents] = useState<EmergencyIncident[]>([]);
  const [unitIncidents, setUnitIncidents] = useState<EmergencyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeIncidents: 0,
    availableUnits: 0,
    avgResponseTime: 0,
    operatorsOnline: 0,
    totalIncidents: 0,
    resolvedIncidents: 0
  });
  const [operatorSession, setOperatorSession] = useState<any>(null);
  const [userUnit, setUserUnit] = useState<any>(null);
  const [userUnits, setUserUnits] = useState<any[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [isDispatchSupervisor, setIsDispatchSupervisor] = useState<boolean>(false);
  const [showUnitLeadDashboard, setShowUnitLeadDashboard] = useState(false);
  // Set default tab based on user role
  useEffect(() => {
    if (!activeTab && role) {
      if (isPoliceOperator && !hasPoliceAdminAccess && !isPoliceSupervisor) {
        setActiveTab('field'); // Only field officers see their unit assignments
      } else if (isPoliceDispatcher) {
        setActiveTab('dispatch'); // Dispatchers see command center first
      } else if (isPoliceSupervisor && !hasPoliceAdminAccess) {
        setActiveTab('coordination'); // Supervisors see coordination first (no unit assignment)
      } else if (hasPoliceAdminAccess) {
        setActiveTab('admin'); // Police admins see admin first
      } else if (isAdmin) {
        setActiveTab('dispatch'); // Admins see command center first
      }
    }
  }, [role, activeTab, isPoliceOperator, isPoliceDispatcher, isPoliceSupervisor, isPoliceAdmin, isAdmin, hasPoliceAdminAccess]);

  // Initialize operator session
  useEffect(() => {
    const initializeSession = async () => {
      if (!user || !hasPoliceAccess) return;

      try {
        // Check for existing active session
        const { data: existingSession } = await supabase
          .from('emergency_operator_sessions')
          .select('*')
          .eq('operator_id', user.id)
          .is('session_end', null)
          .maybeSingle();

        if (existingSession) {
          setOperatorSession(existingSession);
        } else {
          // Create new session
          const { data: newSession, error } = await supabase
            .from('emergency_operator_sessions')
            .insert({
              operator_id: user.id,
              status: 'active'
            })
            .select()
            .single();

          if (error) throw error;
          setOperatorSession(newSession);
        }
      } catch (error) {
        console.error('Error initializing operator session:', error);
        toast.error(t('failedToInitializeOperatorSession'));
      }
    };

    initializeSession();
  }, [user, hasPoliceAccess]);

  // Fetch user's unit and city assignment
  const fetchUserUnit = async () => {
    if (!user || !hasPoliceAccess) return;

    try {
      // Get unit memberships for this user (may belong to multiple units)
      const { data: unitMemberships, error } = await supabase
        .from('emergency_unit_members')
        .select(`
          unit_id,
          is_lead,
          role,
          emergency_units (
            id,
            unit_name,
            unit_code,
            unit_type,
            coverage_region,
            coverage_city,
            current_location
          )
        `)
        .eq('officer_id', user.id);

      if (error) throw error;

      const units = (unitMemberships || [])
        .map((m: any) => m.emergency_units)
        .filter(Boolean);

      const leadMembership = (unitMemberships || []).find((m: any) => m?.is_lead || m?.role === 'sergeant');
      const primaryUnit = leadMembership?.emergency_units || units[0] || null;

      // If we have a primary unit, fetch its members
      if (primaryUnit) {
        const { data: unitMembers, error: membersError } = await supabase
          .from('emergency_unit_members')
          .select(`
            id,
            officer_id,
            role,
            is_lead,
            profiles!emergency_unit_members_officer_id_fkey(full_name, email, phone)
          `)
          .eq('unit_id', primaryUnit.id);

        if (!membersError && unitMembers) {
          primaryUnit.emergency_unit_members = unitMembers;
        } else {
          console.error('Error fetching unit members:', membersError);
          primaryUnit.emergency_unit_members = [];
        }
      }

      setUserUnits(units);
      setUserUnit(primaryUnit);

      // Determine if user is a supervisor of a Dispatch unit
      const dispatchSupervisor = (unitMemberships || []).some((m: any) =>
        (m?.is_lead || m?.role === 'sergeant') && m?.emergency_units?.unit_type === 'dispatch'
      );
      setIsDispatchSupervisor(dispatchSupervisor);
      // Get user's city assignment from role metadata
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role,
          user_role_metadata!fk_user_role_metadata_user_role(scope_type, scope_value)
        `)
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      // Find city assignment
      const cityMetadata = roleData?.find(role => 
        role.user_role_metadata?.some(meta => meta.scope_type === 'city')
      );
      
      const assignedCity = cityMetadata?.user_role_metadata?.find(meta => meta.scope_type === 'city')?.scope_value || null;
      setUserCity(assignedCity);
    } catch (error) {
      console.error('Error fetching user unit and city:', error);
    }
  };

  // Fetch unit-specific incidents (for "My Unit" tab)
  const fetchUnitIncidents = async () => {
    if (!hasPoliceAccess || !userUnits.length) return;

    try {
      const userUnitCodes = userUnits.map(u => u.unit_code);
      
      let query = supabase
        .from('emergency_incidents')
        .select('*');

      // Supervisors see all incidents assigned to their units regardless of status
      if (!isPoliceSupervisor) {
        query = query.in('status', ['reported', 'dispatched', 'responding', 'on_scene']);
      }

      query = query.order('priority_level', { ascending: false })
        .order('reported_at', { ascending: false });

      const { data: incidentsData, error } = await query;
      if (error) throw error;

      const enrichedIncidents = incidentsData?.map(incident => ({
        ...incident,
        reporter_name: t('unknown'),
        reporter_email: ''
      })) || [];

      // Filter for incidents assigned to user's units
      const unitSpecificIncidents = enrichedIncidents.filter(incident => {
        if (!incident.assigned_units || incident.assigned_units.length === 0) {
          return false; // Unit tab only shows assigned incidents
        }
        
        return incident.assigned_units.some((unit: string) => userUnitCodes.includes(unit));
      });

      setUnitIncidents(unitSpecificIncidents);
    } catch (error) {
      console.error('Error fetching unit incidents:', error);
    }
  };

  // Fetch active incidents - filtered by user's city
  const fetchIncidents = async () => {
    if (!hasPoliceAccess) return;

    try {
      let query = supabase
        .from('emergency_incidents')
        .select('*');

      // Active incidents only
      query = query.in('status', ['reported', 'dispatched', 'responding', 'on_scene'])
        .order('priority_level', { ascending: false })
        .order('reported_at', { ascending: false });

      // Filter by user's assigned city
      if (userCity) {
        console.log('🏙️ Dispatcher assigned city:', userCity);
        query = query.eq('city', userCity);
      } else {
        console.log('⚠️ No assigned city found for dispatcher');
      }

      const { data: incidentsData, error } = await query;

      if (error) throw error;

      const enrichedIncidents = incidentsData?.map(incident => ({
        ...incident,
        reporter_name: t('unknown'),
        reporter_email: ''
      })) || [];

      // Filter incidents for UI panels
      const validIncidents = enrichedIncidents.filter(incident => {
        // Supervisors/Admin: see all active incidents in their city
        if (isPoliceSupervisor || isAdmin) {
          return true;
        }
        
        // Dispatchers: only see incidents assigned to them
        if (isPoliceDispatcher) {
          return incident.assigned_operator_id === user?.id;
        }
        
        // Operators: only incidents assigned to their units
        if (isPoliceOperator) {
          const userUnitCodes = userUnits.map(u => u.unit_code);
          return (incident.assigned_units || []).some((unit: string) => userUnitCodes.includes(unit));
        }
        
        return false;
      });

      setIncidents(validIncidents);
      console.log('📊 Active incidents loaded:', {
        total: enrichedIncidents.length,
        afterFiltering: validIncidents.length,
        userCity,
        userRole: { isPoliceDispatcher, isPoliceSupervisor, isPoliceOperator, isAdmin }
      });
    } catch (error) {
      console.error('Error fetching active incidents:', error);
    }
  };

  // Fetch resolved incidents - filtered by user's city
  const fetchResolvedIncidents = async () => {
    if (!hasPoliceAccess) return;

    try {
      let query = supabase
        .from('emergency_incidents')
        .select('*');

      // Resolved/closed incidents only
      query = query.in('status', ['resolved', 'closed'])
        .order('resolved_at', { ascending: false })
        .limit(50); // Limit to last 50 resolved incidents

      // Filter by user's assigned city
      if (userCity) {
        query = query.eq('city', userCity);
      }

      const { data: incidentsData, error } = await query;

      if (error) throw error;

      const enrichedIncidents = incidentsData?.map(incident => ({
        ...incident,
        reporter_name: t('unknown'),
        reporter_email: ''
      })) || [];

      // Filter incidents for UI panels
      const validResolvedIncidents = enrichedIncidents.filter(incident => {
        // Supervisors/Admin: see all resolved incidents in their city
        if (isPoliceSupervisor || isAdmin) {
          return true;
        }
        
        // Dispatchers: only see incidents assigned to them
        if (isPoliceDispatcher) {
          return incident.assigned_operator_id === user?.id;
        }
        
        // Operators: only incidents assigned to their units
        if (isPoliceOperator) {
          const userUnitCodes = userUnits.map(u => u.unit_code);
          return (incident.assigned_units || []).some((unit: string) => userUnitCodes.includes(unit));
        }
        
        return false;
      });

      setResolvedIncidents(validResolvedIncidents);
      console.log('📊 Resolved incidents loaded:', {
        total: enrichedIncidents.length,
        afterFiltering: validResolvedIncidents.length,
        userCity,
        userRole: { isPoliceDispatcher, isPoliceSupervisor, isPoliceOperator, isAdmin }
      });

      // Calculate stats using both active and resolved incidents
      const allIncidents = [...incidents, ...validResolvedIncidents];
      const stats = calculateDashboardStats(allIncidents);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching resolved incidents:', error);
    }
  };

  // Fetch area-specific incidents based on supervisor's role city assignment (priority) or unit coverage
  const fetchAreaIncidents = async () => {
    if (!hasPoliceAccess) return;

    // For supervisors, prioritize role metadata city over unit coverage city
    const filterCity = isPoliceSupervisor 
      ? (userCity || userUnit?.coverage_city)
      : (userUnit?.coverage_city || userCity);
    
    if (!filterCity) return;

    try {
      let query = supabase
        .from('emergency_incidents')
        .select('*');

      // Area incidents always show only active incidents for all roles
      query = query.in('status', ['reported', 'dispatched', 'responding', 'on_scene'])
        .order('priority_level', { ascending: false })
        .order('reported_at', { ascending: false })
        .eq('city', filterCity);

      const { data: incidentsData, error } = await query;
      if (error) throw error;

      const enrichedIncidents = incidentsData?.map(incident => ({
        ...incident,
        reporter_name: t('unknown'),
        reporter_email: ''
      })) || [];

      // Filter area incidents - only assigned incidents for dispatchers
      const validAreaIncidents = enrichedIncidents.filter(incident => {
        if (isPoliceSupervisor || isAdmin) {
          return true;
        }
        
        // Dispatchers: only see incidents assigned to them
        if (isPoliceDispatcher) {
          return incident.assigned_operator_id === user?.id;
        }
        
        // Operators: only incidents assigned to their units
        if (isPoliceOperator) {
          const userUnitCodes = userUnits.map(u => u.unit_code);
          return (incident.assigned_units || []).some((unit: string) => userUnitCodes.includes(unit));
        }
        
        return false;
      });

      setAreaIncidents(validAreaIncidents);
    } catch (error) {
      console.error('Error fetching area incidents:', error);
    }
  };
  const calculateDashboardStats = (incidents: EmergencyIncident[]): DashboardStats => {
    // Apply role-specific filtering for stats calculation
    let relevantIncidents = incidents;
    
    // Dispatchers: only count incidents assigned to them
    if (isPoliceDispatcher && !isPoliceSupervisor) {
      relevantIncidents = incidents.filter(incident => {
        return incident.assigned_operator_id === user?.id;
      });
    }
    
    // Field operators: only count incidents assigned to their units
    if (isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher) {
      const userUnitCodes = userUnits.map(u => u.unit_code);
      relevantIncidents = incidents.filter(incident => {
        return (incident.assigned_units || []).some((unit: string) => userUnitCodes.includes(unit));
      });
    }
    
    const activeIncidents = relevantIncidents.filter(i => !['resolved', 'closed'].includes(i.status)).length;
    const totalIncidents = relevantIncidents.length;
    const resolvedIncidents = relevantIncidents.filter(i => ['resolved', 'closed'].includes(i.status)).length;
    
    console.log('📈 Dashboard stats calculation:', {
      totalRetrieved: incidents.length,
      afterRoleFiltering: relevantIncidents.length,
      activeCount: activeIncidents,
      role: { isPoliceDispatcher, isPoliceSupervisor, isPoliceOperator }
    });
    
    return {
      activeIncidents,
      availableUnits: 8, // This would come from units table
      avgResponseTime: 12, // This would be calculated from response times
      operatorsOnline: 5, // This would come from active sessions
      totalIncidents,
      resolvedIncidents
    };
  };

  useEffect(() => {
    fetchUserUnit();
  }, [hasPoliceAccess]);

  // Fetch incidents when user city or unit coverage changes
  useEffect(() => {
    if (userCity || userUnit?.coverage_city || (userUnits && userUnits.length > 0)) {
      fetchIncidents();
      fetchResolvedIncidents();
      fetchAreaIncidents();
      fetchUnitIncidents();
    }
  }, [userCity, userUnit?.coverage_city, userUnits.length, hasPoliceAccess, isPoliceSupervisor]);

  // Real-time subscription
  useEffect(() => {
    if (!hasPoliceAccess) return;

    const channel = supabase
      .channel('incidents-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_incidents'
        },
        () => {
          fetchIncidents();
          fetchResolvedIncidents();
          fetchAreaIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasPoliceAccess]);

  const createPoliceUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seed-police-users');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(t('successfullyCreatedPoliceUsers', { count: data.users?.length || 0 }));
      } else {
        throw new Error(data?.error || 'Failed to create users');
      }
    } catch (error) {
      console.error('Error creating police users:', error);
      toast.error(t('failedToCreatePoliceUsers'));
    }
  };

  const handleSignOut = async () => {
    if (operatorSession) {
      await supabase
        .from('emergency_operator_sessions')
        .update({ session_end: new Date().toISOString(), status: 'offline' })
        .eq('id', operatorSession.id);
    }
    signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasPoliceAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-red-600">
               <Shield className="h-5 w-5" />
               {t('accessDenied')}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground mb-4">
               {t('pleaseLogInToAccess')}
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
               <LogOut className="mr-2 h-4 w-4" />
               {t('logout')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show units overview if requested
  if (showUnitsOverview) {
    return (
      <div className="min-h-screen bg-background">
       <header className="border-b bg-card">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <Shield className="h-8 w-8 text-blue-600" />
                 <div>
                    <h1 className="text-2xl font-bold">{t('policeCommandCenter')}</h1>
                    <p className="text-sm text-muted-foreground">{t('emergencyIncidents')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                   <LogOut className="h-4 w-4" />
                   {t('common:logout')}
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <UnitsOverview onClose={() => setShowUnitsOverview(false)} />
        </main>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg md:text-2xl font-bold truncate">{t('policeCommandCenter')}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {t('emergencyResponse')}
                  </p>
                </div>
              </div>
              
              {/* Role Badges */}
              <div className="hidden md:flex gap-2">
                {isPoliceSupervisor && (
              <Badge variant="default" className="bg-purple-100 text-purple-800 text-xs">
                {t('supervisor')}
              </Badge>
                )}
                 {isPoliceDispatcher && (
                   <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                     {t('dispatch')}
                   </Badge>
                 )}
                  {isPoliceOperator && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {t('field')}
                    </Badge>
                  )}
                 {isUnitLead && (
                   <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                      {t('unitLead')}
                   </Badge>
                 )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <OfflineIndicator />
              <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('common:logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Optimized Layout */}
      <main className="px-2 sm:px-4 py-3">
        {/* Show admin panel directly if user has only admin access */}
        {hasPoliceAdminAccess && !isPoliceOperator && !isPoliceDispatcher && !isPoliceSupervisor ? (
          <div className="max-w-7xl mx-auto">
            <PoliceAdminDashboard />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Return to Field Operations Button - Top of page */}
            {showUnitLeadDashboard && (
              <div className="flex justify-start mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUnitLeadDashboard(false)}
                >
                  {t('returnToFieldOperations')}
                </Button>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
              {/* Compact Tab Navigation */}
              {isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher ? (
                <TabsList className="grid grid-cols-2 gap-2">
                  <TabsTrigger value="field" className="text-sm">
                    <Radio className="h-4 w-4 mr-2" />
                    {t('myUnit')}
                  </TabsTrigger>
                </TabsList>
              ) : (
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {!hasPoliceAdminAccess && !isPoliceSupervisor && isPoliceOperator && (
                    <TabsTrigger value="field" className="text-sm">
                      <Radio className="h-4 w-4 mr-2" />
                      {t('myUnit')}
                    </TabsTrigger>
                  )}
                  {(isPoliceDispatcher || isAdmin) ? (
                    <TabsTrigger value="dispatch" className="text-sm">
                      <Activity className="h-4 w-4 mr-2" />
                      {t('dispatchCenter')}
                    </TabsTrigger>
                  ) : isPoliceSupervisor ? (
                    <TabsTrigger value="coordination" className="text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      {t('coordinationCenter')}
                    </TabsTrigger>
                  ) : null}
                   {(isPoliceSupervisor || isAdmin) && (
                     <TabsTrigger value="leadership" className="text-sm">
                       <Award className="h-4 w-4 mr-2" />
                        {t('leadership')}
                     </TabsTrigger>
                   )}
                   {(isPoliceSupervisor || isAdmin) && (
                     <TabsTrigger value="management" className="text-sm">
                       <Users className="h-4 w-4 mr-2" />
                        {t('management')}
                     </TabsTrigger>
                   )}
                  {hasPoliceAdminAccess && (
                    <TabsTrigger value="admin" className="text-sm">
                      <Settings className="h-4 w-4 mr-2" />
                        {t('admin')}
                    </TabsTrigger>
                  )}
                </TabsList>
              )}

          {/* Field Operations Tab */}
          <TabsContent value="field" className="space-y-6">
            <div className="flex items-center flex-wrap gap-4 mb-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Radio className="h-3 w-3" />
                 {isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher 
                   ? t('myFieldOperations')
                   : t('fieldOperations')
                 }
              </Badge>
              <p className="text-sm text-muted-foreground">
                 {isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher 
                   ? t('manageAssignments')
                   : t('manageUnitAssignments')
                 }
              </p>
              
              {/* Show Unit Lead Dashboard if user is a unit lead */}
              {showUnitLeadDashboard && isUnitLead && userUnit && (
                <UnitLeadDashboard 
                  userUnit={userUnit}
                  onRefresh={() => {
                    fetchUserUnit();
                    fetchUnitIncidents();
                  }}
                />
              )}
            </div>
            
            {/* Show standard field dashboard if not showing unit lead dashboard */}
            {!showUnitLeadDashboard && (
              <UnitFieldDashboard 
                unitIncidents={unitIncidents} 
                isFieldOperatorMode={isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher}
              />
            )}
            
            {/* Unit Lead Actions Panel */}
            {isUnitLead && !showUnitLeadDashboard && (
              <UnitLeadActions 
                onOpenUnitDashboard={() => setShowUnitLeadDashboard(true)}
              />
            )}
            
          </TabsContent>

          {/* Dispatch Center Tab - Compact Tabbed Layout */}
          {(isPoliceDispatcher || isAdmin) && (
            <TabsContent value="dispatch" className="space-y-4">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                 <p className="text-sm text-muted-foreground">
                   {userCity ? `${t('coverage')}: ${userCity}` : t('allAreas')}
                 </p>
              </div>

              {/* Compact Key Metrics */}
              <div className="grid grid-cols-4 gap-2">
                <Card className="p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-600">{dashboardStats.activeIncidents}</p>
                    <p className="text-xs text-muted-foreground">{t('active')}</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{dashboardStats.availableUnits}</p>
                    <p className="text-xs text-muted-foreground">{t('units')}</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{dashboardStats.avgResponseTime}m</p>
                    <p className="text-xs text-muted-foreground">{t('response')}</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-purple-600">{dashboardStats.operatorsOnline}</p>
                    <p className="text-xs text-muted-foreground">{t('online')}</p>
                  </div>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="incidents" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
                  <TabsTrigger value="incidents" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                     {t('incidents')}
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                     {t('map')}
                  </TabsTrigger>
                  <TabsTrigger value="units" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                     {t('units')}
                  </TabsTrigger>
                  <TabsTrigger value="communications" className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {t('comms')}
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                     {t('metrics')}
                  </TabsTrigger>
                  <TabsTrigger value="backup" className="flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                     {t('backup')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="incidents" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          {t('emergencyIncidentsTitle')}
                        </CardTitle>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {incidents.length} {t('active')} • {resolvedIncidents.length} {t('resolved')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="active" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="active" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {t('active')} ({incidents.length})
                          </TabsTrigger>
                          <TabsTrigger value="resolved" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {t('resolved')} ({resolvedIncidents.length})
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="active" className="mt-4">
                          <IncidentList 
                            incidents={incidents}
                            onUpdate={() => {
                              fetchIncidents();
                              fetchResolvedIncidents();
                            }}
                            selectedIncident={selectedIncident}
                            onSelectIncident={(incident) => setSelectedIncident(incident)}
                            showStatusFilter={true}
                            showPriorityFilter={true}
                            isResolvedIncidents={false}
                          />
                        </TabsContent>
                        
                        <TabsContent value="resolved" className="mt-4">
                          <IncidentList 
                            incidents={resolvedIncidents}
                            onUpdate={() => {
                              fetchIncidents();
                              fetchResolvedIncidents();
                            }}
                            selectedIncident={selectedIncident}
                            onSelectIncident={(incident) => setSelectedIncident(incident)}
                            showStatusFilter={false}
                            showPriorityFilter={true}
                            isResolvedIncidents={true}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="map" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {t('liveIncidentMap')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 rounded-lg overflow-hidden">
                        <IncidentMap 
                          incidents={incidents} 
                          selectedIncident={selectedIncident}
                          onSelectIncident={(incident) => setSelectedIncident(incident)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="units" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('unitsOverview')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => setShowUnitsOverview(true)}
                          variant="outline" 
                          className="w-full mb-4"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {t('viewAllUnits')}
                        </Button>
                        {userUnit && (
                          <div className="space-y-2">
                            <h4 className="font-medium">{t('myUnit')}</h4>
                            <p className="text-sm text-muted-foreground">
                              {userUnit.unit_name} ({userUnit.unit_code})
                            </p>
                            <UnitStatusManager 
                              unit={userUnit} 
                              onUpdate={() => fetchUserUnit()} 
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('emergency:unitManagementLabel')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(isPoliceSupervisor || isAdmin) && (
          <Button 
            onClick={() => navigate('/units-profiles')}
            variant="outline" 
            className="w-full mb-4"
          >
            <Users className="h-4 w-4 mr-2" />
            {t('manageUnitsProfiles')}
          </Button>
                        )}
                        <OperatorStatusPanel 
                          operatorSession={operatorSession}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="communications" className="mt-4">
                  <DispatcherCommunications />
                </TabsContent>

                <TabsContent value="metrics" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {t('responseMetrics')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponseTimeTracker showRecentOnly={false} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="backup" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {t('sentRequests')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BackupRequestsSentPanel />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {t('receivedNotifications')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BackupNotificationsPanel />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* Unit Coordination Tab - Supervisors Only */}
          {isPoliceSupervisor && (
            <TabsContent value="coordination" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-2 w-fit">
                  <Users className="h-3 w-3" />
                   {t('coordinationCenter')}
                </Badge>
                 <p className="text-xs sm:text-sm text-muted-foreground">
                   {t('coordinateOtherUnits')}
                 </p>
              </div>

              {/* Simplified Stats for Supervisors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('myAreaIncidents')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{areaIncidents.filter(i => !['resolved','closed'].includes(i.status)).length}</p>
                      </div>
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('availableUnits')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{dashboardStats.availableUnits}</p>
                      </div>
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('avgResponseTime')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{dashboardStats.avgResponseTime}m</p>
                      </div>
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coordination Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Area Incidents - Filtered by unit coverage area */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                        {t('areaIncidents')}
                       {(userUnit?.coverage_city || userCity) && (
                         <Badge variant="secondary" className="ml-2">
                           {userUnit?.coverage_city || userCity}
                         </Badge>
                       )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IncidentList 
                      incidents={areaIncidents}
                      onUpdate={fetchAreaIncidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(incident) => setSelectedIncident(incident)}
                    />
                  </CardContent>
                </Card>

                {/* Quick Actions for Supervisors */}
                <div className="space-y-6">
                  {/* Backup Requests Panel */}
                  <BackupRequestsSentPanel />
                  <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('coordinationActions')}</CardTitle>
                        <CardDescription>{t('supervisorCoordinationTools')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={() => navigate('/units-profiles')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {t('manageMyUnits')}
                      </Button>
                      <RequestBackupDialog 
                        unitId={userUnit?.id || ''} 
                        unitCode={userUnit?.unit_code || ''}
                        isSupervisor={isPoliceSupervisor}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled={!isPoliceSupervisor && !userUnit}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {t('requestRegionalBackup')}
                        </Button>
                      </RequestBackupDialog>
                    </CardContent>
                  </Card>

                  {userUnit && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('unitStatus')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <UnitStatusManager 
                          unit={userUnit} 
                          onUpdate={() => fetchUserUnit()} 
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          )}


          {/* Leadership Tab - Supervisors and Unit Leads */}
          {(isPoliceSupervisor || isAdmin || isUnitLead) && (
            <TabsContent value="leadership" className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center gap-4 mb-2">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Award className="h-3 w-3" />
                    {t('unitLeadershipTools')}
                  </Badge>
                </div>
                 <p className="text-muted-foreground">
                   {t('manageUnitsPerformance')}
                 </p>
              </div>

              <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                   <TabsTrigger value="dashboard">{t('teamManagement')}</TabsTrigger>
                   <TabsTrigger value="performance">{t('performanceAnalytics')}</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <UnitLeadershipDashboard />
                </TabsContent>

                <TabsContent value="performance">
                  <UnitPerformanceAnalytics />
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* Management Tab - Supervisors Only */}
          {(isPoliceSupervisor || isAdmin) && (
            <TabsContent value="management" className="space-y-8">
              <div className="border-b pb-4">
                <div className="flex items-center gap-4 mb-2">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {t('unitManagement')}
                  </Badge>
                </div>
                 <p className="text-muted-foreground">
                   {t('manageUnitsOfficers')}
                 </p>
              </div>

              {/* Quick Actions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                   {t('quickActions')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
                        onClick={() => navigate('/units-profiles')}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-medium">{t('unitsProfilesManagement')}</h4>
                            <p className="text-sm text-muted-foreground">{t('manageUnitsOfficers')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="font-medium">{t('systemOverview')}</h4>
                            <p className="text-sm text-muted-foreground">{t('viewSystemHealthStats')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Analytics Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('performanceAnalytics')}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Response Time Analytics */}
                  <Card>
                    <CardHeader className="pb-4">
                       <CardTitle className="text-base">{t('responseTimeMetrics')}</CardTitle>
                       <CardDescription>
                         {t('unitPerformanceAnalysis')}
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponseTimeTracker showRecentOnly={false} />
                    </CardContent>
                  </Card>

                  {/* System Statistics */}
                  <Card>
                    <CardHeader className="pb-4">
                       <CardTitle className="text-base">{t('systemStatistics')}</CardTitle>
                       <CardDescription>
                         {t('overallIncidentMetrics')}
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{dashboardStats.totalIncidents}</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('totalIncidents')}</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{dashboardStats.resolvedIncidents}</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('resolved')}</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg col-span-2">
                          <p className="text-xl font-bold text-blue-600">
                            {dashboardStats.totalIncidents > 0 
                              ? ((dashboardStats.resolvedIncidents / dashboardStats.totalIncidents) * 100).toFixed(1)
                              : 0}%
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{t('resolutionRate')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Police Admin Tab - Police Admins Only */}
          {hasPoliceAdminAccess && (
            <TabsContent value="admin" className="space-y-6">
              <PoliceAdminDashboard />
            </TabsContent>
          )}
            </Tabs>
          </div>
        )}
      </main>
    </div>
    <Footer />
    </>
  );
};

export default PoliceDashboard;