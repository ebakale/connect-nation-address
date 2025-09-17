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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PoliceSidebar } from "@/components/PoliceSidebar";

// Import all police components
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

// Import from UnitsAndProfilesPage
import { UnitManagementDashboard } from '@/components/UnitManagementDashboard';
import { OfficerProfileDashboard } from '@/components/OfficerProfileDashboard';

// Import admin components
import UserManager from '@/components/UserManager';
import UnitManagement from '@/components/UnitManagement';
import SystemConfiguration from '@/components/SystemConfiguration';
import PoliceAnalytics from '@/components/PoliceAnalytics';

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

const PoliceUnifiedDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role, isPoliceOperator, isPoliceDispatcher, isPoliceSupervisor, isPoliceAdmin, isAdmin, loading, hasPoliceAccess, hasPoliceAdminAccess, isUnitLead } = useUserRole();
  const { t } = useTranslation(['emergency', 'common']);
  
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
    if (!activeTab) {
      if (isPoliceOperator && !isPoliceSupervisor) {
        setActiveTab('field');
      } else if (isPoliceDispatcher) {
        setActiveTab('dispatch');
      } else if (isPoliceSupervisor) {
        setActiveTab('coordination');
      } else if (isPoliceAdmin) {
        setActiveTab('admin');
      } else {
        setActiveTab('field');
      }
    }
  }, [isPoliceOperator, isPoliceDispatcher, isPoliceSupervisor, isPoliceAdmin, activeTab]);

  // Fetch functions (keeping existing logic)
  const fetchIncidents = async () => {
    try {
      let query = supabase
        .from('emergency_incidents')
        .select('*')
        .in('status', ['reported', 'dispatched', 'in_progress'])
        .order('reported_at', { ascending: false });

      if (userCity && !isPoliceSupervisor) {
        query = query.eq('city', userCity);
      }

      const { data, error } = await query;
      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const fetchResolvedIncidents = async () => {
    try {
      let query = supabase
        .from('emergency_incidents')
        .select('*')
        .in('status', ['resolved', 'closed'])
        .order('resolved_at', { ascending: false })
        .limit(20);

      if (userCity && !isPoliceSupervisor) {
        query = query.eq('city', userCity);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResolvedIncidents(data || []);
    } catch (error) {
      console.error('Error fetching resolved incidents:', error);
    }
  };

  const fetchAreaIncidents = async () => {
    try {
      if (!userCity && (!userUnits || userUnits.length === 0)) return;

      let query = supabase
        .from('emergency_incidents')
        .select('*')
        .order('reported_at', { ascending: false })
        .limit(50);

      if (userCity) {
        query = query.eq('city', userCity);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAreaIncidents(data || []);
    } catch (error) {
      console.error('Error fetching area incidents:', error);
    }
  };

  const fetchUnitIncidents = async () => {
    try {
      if (!userUnit && (!userUnits || userUnits.length === 0)) return;

      const unitIds = userUnits.length > 0 ? userUnits.map(u => u.id) : [userUnit?.id].filter(Boolean);
      if (unitIds.length === 0) return;

      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('*')
        .overlaps('assigned_units', unitIds)
        .order('reported_at', { ascending: false });

      if (error) throw error;
      setUnitIncidents(data || []);
    } catch (error) {
      console.error('Error fetching unit incidents:', error);
    }
  };

  const fetchUserUnit = async () => {
    if (!user?.id || !hasPoliceAccess) return;

    try {
      // Get user's unit membership
      const { data: memberData, error: memberError } = await supabase
        .from('emergency_unit_members')
        .select(`
          unit_id,
          is_lead,
          role,
          emergency_units (*)
        `)
        .eq('officer_id', user.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const primaryUnit = memberData[0];
        setUserUnit(primaryUnit.emergency_units);
        
        // Check if user is unit lead
        if (primaryUnit.is_lead || primaryUnit.role === 'lead') {
          // User is a unit lead - get all units they lead
          const leadUnits = memberData.filter(m => m.is_lead || m.role === 'lead')
            .map(m => m.emergency_units);
          setUserUnits(leadUnits);
        } else {
          setUserUnits([primaryUnit.emergency_units]);
        }

        const city = primaryUnit.emergency_units?.coverage_city;
        if (city) {
          setUserCity(city);
        }
      }

      // Check for supervisor role with geographic scope
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role,
          user_role_metadata (
            scope_type,
            scope_value
          )
        `)
        .eq('user_id', user.id)
        .eq('role', 'police_supervisor');

      if (roleError) throw roleError;

      if (roleData && roleData.length > 0) {
        const supervisorRole = roleData[0];
        const metadata = supervisorRole.user_role_metadata?.[0];
        
        if (metadata && (metadata.scope_type === 'city' || metadata.scope_type === 'geographic')) {
          setUserCity(metadata.scope_value);
          setIsDispatchSupervisor(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user unit:', error);
    }
  };

  const fetchOperatorSession = async () => {
    if (!user?.id || !hasPoliceAccess) return;

    try {
      const { data, error } = await supabase
        .from('emergency_operator_sessions')
        .select('*')
        .eq('operator_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setOperatorSession(data);
    } catch (error) {
      console.error('Error fetching operator session:', error);
    }
  };

  const calculateDashboardStats = (): DashboardStats => {
    const activeIncidents = incidents.filter(i => 
      ['reported', 'dispatched', 'in_progress'].includes(i.status)
    ).length;
    
    const totalIncidents = incidents.length + resolvedIncidents.length;
    const resolvedCount = resolvedIncidents.length;
    
    return {
      activeIncidents,
      availableUnits: 8,
      avgResponseTime: 12,
      operatorsOnline: 5,
      totalIncidents,
      resolvedIncidents: resolvedCount
    };
  };

  useEffect(() => {
    fetchUserUnit();
  }, [hasPoliceAccess]);

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

  useEffect(() => {
    setDashboardStats(calculateDashboardStats());
  }, [incidents, resolvedIncidents]);

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
               {t('common:accessDenied')}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground mb-4">
               Please log in to access the police operations center.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              {t('common:login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showUnitsOverview) {
    return (
      <div className="min-h-screen bg-background">
        <UnitsOverview onClose={() => setShowUnitsOverview(false)} />
        <Footer />
      </div>
    );
  }

  if (showUnitLeadDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <UnitLeadDashboard userUnit={userUnit} />
        <Footer />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'field':
        return (
          <div className="space-y-6">
            <div className="flex items-center flex-wrap gap-4 mb-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                Field Operations
              </Badge>
              {userUnit && (
                <Badge variant="secondary">
                  {userUnit.unit_name} ({userUnit.unit_code})
                </Badge>
              )}
            </div>

            <OperatorStatusPanel 
              operatorSession={operatorSession}
            />

            {(isPoliceOperator || isPoliceSupervisor || isAdmin) && userUnit && (
              <UnitFieldDashboard 
                unitIncidents={unitIncidents}
                isFieldOperatorMode={isPoliceOperator && !isPoliceSupervisor && !isPoliceDispatcher}
              />
            )}
            
            {isUnitLead && !showUnitLeadDashboard && (
              <UnitLeadActions 
                onOpenUnitDashboard={() => setShowUnitLeadDashboard(true)}
              />
            )}
          </div>
        );

      case 'dispatch':
        if (!(isPoliceDispatcher || isAdmin)) return null;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <p className="text-sm text-muted-foreground">
                 {userCity ? `Coverage: ${userCity}` : 'All Areas'}
               </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Card className="p-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-red-600">{dashboardStats.activeIncidents}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{dashboardStats.availableUnits}</p>
                  <p className="text-xs text-muted-foreground">Units</p>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">{dashboardStats.avgResponseTime}m</p>
                  <p className="text-xs text-muted-foreground">Response</p>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-600">{dashboardStats.operatorsOnline}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="incidents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
                <TabsTrigger value="incidents" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                   Incidents
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                   Map
                </TabsTrigger>
                <TabsTrigger value="units" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                   Units
                </TabsTrigger>
                <TabsTrigger value="communications" className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Comms
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                   Metrics
                </TabsTrigger>
                <TabsTrigger value="backup" className="flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                   Backup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="incidents" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Emergency Incidents
                      </CardTitle>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {incidents.length} Active • {resolvedIncidents.length} Resolved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="active" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="active" className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Active ({incidents.length})
                        </TabsTrigger>
                        <TabsTrigger value="resolved" className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Resolved ({resolvedIncidents.length})
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
                      Live Incident Map
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
                      <CardTitle className="text-base">Units Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowUnitsOverview(true)}
                        variant="outline" 
                        className="w-full mb-4"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        View All Units
                      </Button>
                      {userUnit && (
                        <div className="space-y-2">
                          <h4 className="font-medium">My Unit</h4>
                          <p className="text-sm text-muted-foreground">
                            {String(userUnit.unit_name || 'Unknown Unit')} ({String(userUnit.unit_code || 'Unknown Code')})
                          </p>
                          <UnitStatusManager 
                            unit={userUnit} 
                            onUpdate={() => fetchUserUnit()} 
                          />
                        </div>
                      )}
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
                      Response Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponseTimeTracker />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backup" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Request Backup</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BackupRequestsSentPanel />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Backup Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BackupNotificationsPanel />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'coordination':
        if (!isPoliceSupervisor) return null;
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <Badge variant="outline" className="flex items-center gap-2 w-fit">
                <Activity className="h-4 w-4" />
                Unit Coordination
              </Badge>
              {userCity && (
                <Badge variant="secondary" className="w-fit">
                  Area: {userCity}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Units Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowUnitsOverview(true)}
                    className="w-full mb-4"
                  >
                    View Units Overview
                  </Button>
                  
                  {userUnits.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Supervision Scope</h4>
                      {userUnits.slice(0, 3).map((unit, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm font-medium">{unit.unit_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {unit.status || 'Available'}
                          </Badge>
                        </div>
                      ))}
                      {userUnits.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          And {userUnits.length - 3} more units
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Area Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{areaIncidents.filter(i => ['reported', 'dispatched', 'in_progress'].includes(i.status)).length}</p>
                        <p className="text-sm text-muted-foreground">Active Incidents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{userUnits.filter(u => u.status === 'available').length}</p>
                        <p className="text-sm text-muted-foreground">Available Units</p>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{areaIncidents.filter(i => ['resolved', 'closed'].includes(i.status)).length}</p>
                        <p className="text-sm text-muted-foreground">Resolved Today</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Area Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncidentList 
                  incidents={areaIncidents}
                  onUpdate={() => {
                    fetchAreaIncidents();
                    fetchIncidents();
                  }}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(incident) => setSelectedIncident(incident)}
                  showStatusFilter={true}
                  showPriorityFilter={true}
                  isResolvedIncidents={false}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'leadership':
        if (!(isPoliceSupervisor || isAdmin || isUnitLead)) return null;
        return (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <div className="flex items-center gap-4 mb-2">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Leadership Dashboard
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <UnitLeadershipDashboard />
              </TabsContent>

              <TabsContent value="performance">
                <UnitPerformanceAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'management':
        if (!(isPoliceSupervisor || isAdmin)) return null;
        return (
          <div className="space-y-8">
            <div className="border-b pb-4">
              <div className="flex items-center gap-4 mb-2">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Operational Management
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage operational aspects of emergency response
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-5 w-5" />
                    Backup Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BackupNotificationManager />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5" />
                    Response Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponseTimeTracker />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5" />
                    Communications Hub
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DispatcherCommunications />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-5 w-5" />
                    Operator Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OperatorStatusPanel 
                    operatorSession={operatorSession}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'units-profiles':
        if (!(isPoliceSupervisor || isAdmin)) return null;
        return (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <div className="flex items-center gap-4 mb-2">
                <Badge variant="outline" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Units & Profiles Management
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage emergency units and officer profiles
              </p>
            </div>

            <Tabs defaultValue="units" className="w-full">
              <TabsList className="flex w-full">
                <TabsTrigger value="units" className="flex items-center gap-2 flex-1">
                  <Shield className="h-4 w-4" />
                  Unit Management
                </TabsTrigger>
                <TabsTrigger value="officers" className="flex items-center gap-2 flex-1">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Officer Profiles & Performance</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="units" className="mt-6">
                <UnitManagementDashboard />
              </TabsContent>

              <TabsContent value="officers" className="mt-6">
                <OfficerProfileDashboard />
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'admin-users':
        if (!isAdmin) return null;
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('emergency:policeAdminDashboard.policeUserManagement')}</CardTitle>
              <CardDescription>
                {t('emergency:policeAdminDashboard.manageOfficersDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6 w-full min-w-0">
              <UserManager />
            </CardContent>
          </Card>
        );

      case 'admin-units':
        if (!isAdmin) return null;
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('emergency:policeAdminDashboard.policeUnitManagement')}</CardTitle>
              <CardDescription>
                {t('emergency:policeAdminDashboard.manageUnitsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnitManagement />
            </CardContent>
          </Card>
        );

      case 'admin-system':
        if (!isAdmin) return null;
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('emergency:policeAdminDashboard.systemConfiguration')}</CardTitle>
              <CardDescription>
                {t('emergency:policeAdminDashboard.configureSystemDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemConfiguration />
            </CardContent>
          </Card>
        );

      case 'admin-analytics':
        if (!isAdmin) return null;
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('emergency:policeAdminDashboard.policeAnalytics')}</CardTitle>
              <CardDescription>
                {t('emergency:policeAdminDashboard.viewMetricsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PoliceAnalytics />
            </CardContent>
          </Card>
        );

      case 'admin':
        if (!hasPoliceAdminAccess || isAdmin) return null;
        return (
          <div className="space-y-6">
            <PoliceAdminDashboard />
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Select a tab from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <PoliceSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with sidebar trigger */}
          <header className="h-16 flex items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 min-w-0">
            <div className="flex items-center gap-2 md:gap-4 px-3 md:px-6 w-full min-w-0">
              <SidebarTrigger />
              <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm md:text-xl font-semibold truncate">Police Operations Center</h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {userCity ? `Coverage: ${userCity}` : 'National Operations'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                <OfflineIndicator />
                
                {user && (
                  <div className="flex items-center gap-1 md:gap-2">
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {role?.replace('police_', '').toUpperCase()}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-3 md:p-6 overflow-y-auto min-w-0">
            {renderActiveView()}
          </main>

          {/* Footer */}
          <footer className="border-t bg-background/50 py-4 px-6 mt-auto">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">
                Emergency Services Platform v2.1.0
              </p>
              <p className="text-xs text-muted-foreground">
                © 2025 BIAKAM - Police Operations Center
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PoliceUnifiedDashboard;
