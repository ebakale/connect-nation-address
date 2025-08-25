import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, AlertTriangle, Clock, MapPin, Phone, User, 
  LogOut, Settings, Bell, CheckCircle, XCircle, Eye,
  Activity, Users, TrendingUp, AlertCircle, Radio,
  Navigation, MessageSquare, Flag
} from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
  const { user, signOut } = useAuth();
  const { role, isPoliceOperator, isPoliceDispatcher, isPoliceSupervisor, isAdmin, loading, hasPoliceAccess, isUnitLead } = useUserRole();
  const { t } = useLanguage();
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<string>('');
  const [showMap, setShowMap] = useState(false);
  const [showUnitsOverview, setShowUnitsOverview] = useState(false);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
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
      if (isPoliceOperator) {
        setActiveTab('field'); // Field officers see their assignments first
      } else if (isPoliceDispatcher) {
        setActiveTab('dispatch'); // Dispatchers see command center first
      } else if (isPoliceSupervisor) {
        setActiveTab('coordination'); // Supervisors see coordination first
      } else if (isAdmin) {
        setActiveTab('dispatch'); // Admins see command center first
      }
    }
  }, [role, activeTab, isPoliceOperator, isPoliceDispatcher, isPoliceSupervisor, isAdmin]);

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
        toast.error('Failed to initialize operator session');
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
          user_role_metadata(scope_type, scope_value)
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
        reporter_name: 'Unknown',
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

  // Fetch incidents and calculate stats - filtered by user's city
  const fetchIncidents = async () => {
    if (!hasPoliceAccess) return;

    try {
      let query = supabase
        .from('emergency_incidents')
        .select('*');

      // Supervisors see all incidents assigned to their units regardless of status
      // Other roles see only active incidents
      if (!isPoliceSupervisor) {
        query = query.in('status', ['reported', 'dispatched', 'responding', 'on_scene']);
      }

      query = query.order('priority_level', { ascending: false })
        .order('reported_at', { ascending: false });

      // Filter by user's assigned city
      if (userCity) {
        query = query.eq('city', userCity);
      }

      const { data: incidentsData, error } = await query;

      if (error) throw error;

      const enrichedIncidents = incidentsData?.map(incident => ({
        ...incident,
        reporter_name: 'Unknown',
        reporter_email: ''
      })) || [];

      // Filter incidents - only show unassigned ones to dispatchers/supervisors
      const validIncidents = enrichedIncidents.filter(incident => {
        // Show unassigned incidents only to dispatchers/supervisors
        if (!incident.assigned_units || incident.assigned_units.length === 0) {
          return isPoliceDispatcher || isDispatchSupervisor;
        }
        
        // For assigned incidents, show based on role and unit membership
        const validUnits = ['UNIT-001', 'UNIT-002', 'UNIT-003', 'UNIT-004', 'UNIT-005', 'UNIT-006', 'UNIT-007', 'UNIT-008'];
        const hasValidUnit = incident.assigned_units.some((unit: string) => validUnits.includes(unit));
        
        // Supervisors can see incidents assigned to their units
        const userUnitCodes = userUnits.map(u => u.unit_code);
        const hasUserUnit = incident.assigned_units.some((unit: string) => userUnitCodes.includes(unit));
        return hasValidUnit || (isPoliceSupervisor && hasUserUnit);
      });

      setIncidents(validIncidents);
      
      // Calculate stats
      const stats = calculateDashboardStats(enrichedIncidents);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  // Fetch area-specific incidents based on the supervisor's primary unit coverage (fallback to role city)
  const fetchAreaIncidents = async () => {
    if (!hasPoliceAccess) return;

    const filterCity = userUnit?.coverage_city || userCity;
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
        reporter_name: 'Unknown',
        reporter_email: ''
      })) || [];

      // Filter area incidents - geographic-based, not unit-based
      const validAreaIncidents = enrichedIncidents.filter(incident => {
        // Show unassigned incidents only to dispatchers/supervisors
        if (!incident.assigned_units || incident.assigned_units.length === 0) {
          return isPoliceDispatcher || isDispatchSupervisor;
        }
        
        // For assigned incidents in the area, show based on valid unit assignments
        const validUnits = ['UNIT-001', 'UNIT-002', 'UNIT-003', 'UNIT-004', 'UNIT-005', 'UNIT-006', 'UNIT-007', 'UNIT-008'];
        return incident.assigned_units.some((unit: string) => validUnits.includes(unit));
      });

      setAreaIncidents(validAreaIncidents);
    } catch (error) {
      console.error('Error fetching area incidents:', error);
    }
  };
  const calculateDashboardStats = (incidents: EmergencyIncident[]): DashboardStats => {
    const activeIncidents = incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length;
    const totalIncidents = incidents.length;
    const resolvedIncidents = incidents.filter(i => ['resolved', 'closed'].includes(i.status)).length;
    
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
        toast.success(`Successfully created ${data.users?.length || 0} police users`);
      } else {
        throw new Error(data?.error || 'Failed to create users');
      }
    } catch (error) {
      console.error('Error creating police users:', error);
      toast.error('Failed to create police users');
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
                <LanguageSwitcher />
                <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
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
                     Unit Lead
                   </Badge>
                 )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <LanguageSwitcher />
              <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Field Operators have limited tab access */}
          {isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher ? (
            <TabsList className="flex w-full flex-wrap gap-1">
              <TabsTrigger value="field" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{t('myUnit')}</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">Support</span>
              </TabsTrigger>
            </TabsList>
          ) : (
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
              <TabsTrigger value="field" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{t('myUnit')}</span>
              </TabsTrigger>
              {/* Different tab based on role */}
              {(isPoliceDispatcher || isAdmin) ? (
                <TabsTrigger value="dispatch" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                   {t('dispatchCenter')}
                </TabsTrigger>
              ) : isPoliceSupervisor ? (
                <TabsTrigger value="coordination" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('coordinationCenter')}
                </TabsTrigger>
              ) : null}
              {(isPoliceSupervisor || isAdmin) && (
                <TabsTrigger value="management" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Management
                </TabsTrigger>
              )}
            </TabsList>
          )}

          {/* Field Operations Tab */}
          <TabsContent value="field" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Radio className="h-3 w-3" />
                {isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher 
                  ? "My Field Operations" 
                  : "Field Operations"
                }
              </Badge>
              <p className="text-sm text-muted-foreground">
                {isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher 
                  ? "Manage your assignments, unit status, and field communications"
                  : "Manage your unit assignments and field activities"
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
            
            {/* Return to Field View Button */}
            {showUnitLeadDashboard && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUnitLeadDashboard(false)}
                >
                  Return to Field Operations
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Dispatch Center Tab - Restricted to Dispatchers and Admins */}
          {(isPoliceDispatcher || isAdmin) && (
            <TabsContent value="dispatch" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-2">
                 <Activity className="h-3 w-3" />
                 {t('dispatchCenter')}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Monitor incidents, assign units, and coordinate emergency response
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('activeIncidents')}</p>
                      <p className="text-lg sm:text-2xl font-bold text-red-600">{dashboardStats.activeIncidents}</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('availableUnits')}</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">{dashboardStats.availableUnits}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('avgResponseTime')}</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{dashboardStats.avgResponseTime}m</p>
                    </div>
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('operatorsOnline')}</p>
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">{dashboardStats.operatorsOnline}</p>
                    </div>
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Incidents List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                       <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6" />
                       {t('activeIncidents')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IncidentList 
                      incidents={incidents}
                      onUpdate={fetchIncidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(incident) => setSelectedIncident(incident)}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel */}
              <div className="space-y-6">
                {/* Unit Status Manager for current user */}
                {userUnit && (
                  <UnitStatusManager 
                    unit={userUnit} 
                    onUpdate={() => fetchUserUnit()} 
                  />
                )}
                
                {/* Response Time Metrics */}
                <ResponseTimeTracker showRecentOnly={true} />

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    {isPoliceSupervisor && (
                      <CardDescription>Supervisor Actions Available</CardDescription>
                    )}
                    {isPoliceDispatcher && (
                      <CardDescription>Dispatcher Actions Available</CardDescription>
                    )}
                    {isPoliceOperator && (
                      <CardDescription>Operator Actions Available</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => setShowUnitsOverview(true)}
                      variant="outline" 
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Units Overview
                    </Button>
                    {(isPoliceSupervisor || isAdmin) && (
                      <Button 
                        onClick={() => window.location.href = '/units-profiles'}
                        variant="outline" 
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Units & Profiles
                      </Button>
                    )}
                    {(isPoliceSupervisor || isAdmin) && (
                      <Button 
                        onClick={createPoliceUsers}
                        variant="outline" 
                        className="w-full"
                      >
                        Seed Police Users (Admin Only)
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Operator Status */}
                <OperatorStatusPanel 
                  operatorSession={operatorSession}
                />

                {/* Incident Map */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Incident Map
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMap(!showMap)}
                        className="ml-auto"
                      >
                        {showMap ? 'Hide' : 'Show'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  {showMap && (
                    <CardContent>
                      <IncidentMap 
                        incidents={incidents} 
                        selectedIncident={selectedIncident}
                        onSelectIncident={(incident) => setSelectedIncident(incident)}
                      />
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>
          )}

          {/* Unit Coordination Tab - Supervisors Only */}
          {isPoliceSupervisor && (
            <TabsContent value="coordination" className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                   {t('coordinationCenter')}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Coordinate with other units and monitor area-specific incidents
                </p>
              </div>

              {/* Simplified Stats for Supervisors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">My Area Incidents</p>
                        <p className="text-2xl font-bold text-red-600">{areaIncidents.filter(i => !['resolved','closed'].includes(i.status)).length}</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Units</p>
                        <p className="text-2xl font-bold text-green-600">{dashboardStats.availableUnits}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response Time</p>
                        <p className="text-2xl font-bold text-blue-600">{dashboardStats.avgResponseTime}m</p>
                      </div>
                      <Clock className="h-5 w-5 text-blue-600" />
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
                       Area Incidents
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
                  {(isPoliceSupervisor || isPoliceDispatcher) && (
                    <BackupNotificationManager />
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Coordination Actions</CardTitle>
                      <CardDescription>Supervisor coordination tools</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={() => setShowUnitsOverview(true)}
                        variant="outline" 
                        className="w-full"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        View All Units
                      </Button>
                      <Button 
                        onClick={() => window.location.href = '/units-profiles'}
                        variant="outline" 
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage My Units
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => toast.info('Backup request feature coming soon')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Regional Backup
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Unit Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userUnit && (
                        <UnitStatusManager 
                          unit={userUnit} 
                          onUpdate={() => fetchUserUnit()} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Support Tab - Field Officers */}
          {isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher && (
            <TabsContent value="support" className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" />
                  Support & Resources
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Access support resources and communication tools
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Emergency Contacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="p-2 border rounded">
                      <p className="font-medium">Dispatch Center</p>
                      <p className="text-sm text-muted-foreground">911 or Internal: 100</p>
                    </div>
                    <div className="p-2 border rounded">
                      <p className="font-medium">Supervisor</p>
                      <p className="text-sm text-muted-foreground">Internal: 200</p>
                    </div>
                    <div className="p-2 border rounded">
                      <p className="font-medium">Medical Support</p>
                      <p className="text-sm text-muted-foreground">Internal: 300</p>
                    </div>
                  </CardContent>
                </Card>

                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <MessageSquare className="h-5 w-5" />
                       Field Actions
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-3">
                     <Button 
                       variant="outline" 
                       className="w-full"
                       onClick={() => setActiveTab('field')}
                     >
                       <Users className="h-4 w-4 mr-2" />
                       Request Backup
                     </Button>
                     <Button 
                       variant="outline" 
                       className="w-full"
                       onClick={() => setActiveTab('field')}
                     >
                       <Flag className="h-4 w-4 mr-2" />
                       Update Status
                     </Button>
                     <Button 
                       variant="outline" 
                       className="w-full"
                       onClick={() => setActiveTab('field')}
                     >
                       <Radio className="h-4 w-4 mr-2" />
                       Go to My Unit
                     </Button>
                   </CardContent>
                 </Card>
              </div>
            </TabsContent>
          )}

          {/* Management Tab - Supervisors Only */}
          {(isPoliceSupervisor || isAdmin) && (
            <TabsContent value="management" className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Unit Management
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Manage emergency units, officer assignments, and performance analytics
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => window.location.href = '/units-profiles'}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Units & Profiles
                    </CardTitle>
                    <CardDescription>
                      Manage emergency units and officer profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Open Management Console
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Analytics
                    </CardTitle>
                    <CardDescription>
                      Response times and unit performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponseTimeTracker showRecentOnly={false} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Status
                    </CardTitle>
                    <CardDescription>
                      Overall system health and statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-lg">{dashboardStats.totalIncidents}</p>
                        <p className="text-muted-foreground">Total Incidents</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">{dashboardStats.resolvedIncidents}</p>
                        <p className="text-muted-foreground">Resolved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default PoliceDashboard;