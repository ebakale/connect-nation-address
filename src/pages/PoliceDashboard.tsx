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
  region?: string;
  city?: string;
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
  const { role, isPoliceOperator, isPoliceDispatcher, isPoliceSupervisor, isAdmin, loading, hasPoliceAccess } = useUserRole();
  const { t } = useLanguage();
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<string>('');
  const [showMap, setShowMap] = useState(false);
  const [showUnitsOverview, setShowUnitsOverview] = useState(false);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
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
  const [userUnitCodes, setUserUnitCodes] = useState<string[]>([]);
  const [userUnitRegion, setUserUnitRegion] = useState<string | null>(null);
  const [userUnitCity, setUserUnitCity] = useState<string | null>(null);

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
    if (user?.id) {
      fetchUserUnits();
    }
  }, [user, hasPoliceAccess]);

  // Fetch user's unit assignments
  const fetchUserUnits = async () => {
    if (!user?.id) return;

    try {
      const { data: unitMemberships, error } = await supabase
        .from('emergency_unit_members')
        .select(`
          emergency_units(unit_code, current_location)
        `)
        .eq('officer_id', user.id);

      if (error) throw error;

      const unitCodes = unitMemberships?.map(membership => 
        membership.emergency_units?.unit_code
      ).filter(Boolean) || [];
      
      // Get the region/city from the first unit's location
      const firstUnit = unitMemberships?.[0]?.emergency_units;
      if (firstUnit?.current_location) {
        const locationParts = firstUnit.current_location.split(',');
        const city = locationParts[0]?.trim();
        const region = (locationParts.length >= 3
          ? locationParts[locationParts.length - 2]
          : locationParts[1])?.trim(); // Fallback if only "City, Region"
        if (city) setUserUnitCity(city);
        if (region) setUserUnitRegion(region);
      }
      
      setUserUnitCodes(unitCodes);
    } catch (error) {
      console.error('Error fetching user units:', error);
    }
  };

  // Fetch incidents and calculate stats
  const fetchIncidents = async () => {
    if (!hasPoliceAccess) return;

    try {
      const { data: incidentsData, error } = await supabase
        .from('emergency_incidents')
        .select('*')
        .in('status', ['reported', 'dispatched', 'responded'])
        .order('priority_level', { ascending: false })
        .order('reported_at', { ascending: true });

      if (error) throw error;

      const enrichedIncidents = incidentsData?.map(incident => ({
        ...incident,
        reporter_name: 'Unknown',
        reporter_email: ''
      })) || [];

      setIncidents(enrichedIncidents);
      
      // Calculate stats
      const stats = calculateDashboardStats(enrichedIncidents);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching incidents:', error);
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
    fetchIncidents();
  }, [hasPoliceAccess]);

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
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need police operator credentials to access this dashboard.
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
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
                    <h1 className="text-2xl font-bold">Police Command Center</h1>
                    <p className="text-sm text-muted-foreground">Units Overview</p>
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">Police Command Center</h1>
                  <p className="text-sm text-muted-foreground">
                    Emergency Response & Field Operations
                  </p>
                </div>
              </div>
              
              {/* Role Badges */}
              <div className="flex gap-2">
                {isPoliceSupervisor && (
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    Supervisor
                  </Badge>
                )}
                {isPoliceDispatcher && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Dispatcher
                  </Badge>
                )}
                {isPoliceOperator && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Field Officer
                  </Badge>
                )}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="field" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              My Unit
            </TabsTrigger>
            {/* Different tab based on role */}
            {(isPoliceDispatcher || isAdmin) ? (
              <TabsTrigger value="dispatch" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Command Center
              </TabsTrigger>
            ) : isPoliceSupervisor ? (
              <TabsTrigger value="coordination" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Unit Coordination
              </TabsTrigger>
            ) : (
              <TabsTrigger value="support" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Support
              </TabsTrigger>
            )}
            {(isPoliceSupervisor || isAdmin) && (
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Management
              </TabsTrigger>
            )}
          </TabsList>

          {/* Field Operations Tab */}
          <TabsContent value="field" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Radio className="h-3 w-3" />
                Field Operations
              </Badge>
              <p className="text-sm text-muted-foreground">
                Manage your unit assignments and field activities
              </p>
            </div>
            <UnitFieldDashboard />
          </TabsContent>

          {/* Dispatch Center Tab */}
          <TabsContent value="dispatch" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                Command Center
              </Badge>
              <p className="text-sm text-muted-foreground">
                Monitor incidents, assign units, and coordinate emergency response
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Incidents</p>
                      <p className="text-2xl font-bold text-red-600">{dashboardStats.activeIncidents}</p>
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

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Operators Online</p>
                      <p className="text-2xl font-bold text-purple-600">{dashboardStats.operatorsOnline}</p>
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
                    <CardTitle className="text-xl flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      Active Incidents
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
                <UnitStatusManager />
                
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

          {/* Unit Coordination Tab - Supervisors Only */}
          {isPoliceSupervisor && (
            <TabsContent value="coordination" className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Unit Coordination
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
                        <p className="text-2xl font-bold text-red-600">{dashboardStats.activeIncidents}</p>
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
                {/* Unit Area Incidents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Unit Area Incidents
                    </CardTitle>
                    <CardDescription>
                      All incidents in your unit area
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IncidentList 
                      incidents={incidents.filter(incident => 
                        (userUnitRegion && incident.region && incident.region.toLowerCase().trim() === userUnitRegion.toLowerCase().trim()) ||
                        (userUnitCity && incident.city && incident.city.toLowerCase().trim() === userUnitCity.toLowerCase().trim())
                      )}
                      onUpdate={fetchIncidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(incident) => setSelectedIncident(incident)}
                    />
                  </CardContent>
                </Card>

                {/* My Unit Assigned Incidents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      My Unit Incidents
                    </CardTitle>
                    <CardDescription>
                      All incidents assigned to your unit (accepted and pending)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IncidentList 
                      incidents={incidents.filter(incident => 
                        incident.assigned_units?.some(unit => userUnitCodes.includes(unit))
                      )}
                      onUpdate={fetchIncidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(incident) => setSelectedIncident(incident)}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions for Supervisors */}
              <div className="space-y-6">
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
                    <UnitStatusManager />
                  </CardContent>
                </Card>
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
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => toast.info('Request backup feature available in My Unit tab')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Request Backup
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => toast.info('Status update feature available in My Unit tab')}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Update Status
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