import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, AlertTriangle, Clock, MapPin, Phone, User, 
  LogOut, Settings, Bell, CheckCircle, XCircle, Eye,
  Activity, Users, TrendingUp, AlertCircle
} from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import IncidentMap from '@/components/IncidentMap';
import IncidentList from '@/components/IncidentList';
import OperatorStatusPanel from '@/components/OperatorStatusPanel';
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
}

interface DashboardStats {
  activeIncidents: number;
  highPriorityIncidents: number;
  resolvedToday: number;
  averageResponseTime: number;
  activeOperators: number;
}

const PoliceDashboard = () => {
  const { 
    role, 
    loading, 
    isAdmin, 
    hasAdminAccess 
  } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  // State management
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeIncidents: 0,
    highPriorityIncidents: 0,
    resolvedToday: 0,
    averageResponseTime: 0,
    activeOperators: 0
  });
  const [operatorSession, setOperatorSession] = useState<any>(null);

  // Check if user has police role
  const hasPoliceRole = (userRole: string | null): boolean => {
    const policeRoles = ['police_operator', 'police_supervisor', 'police_dispatcher', 'admin'];
    return userRole ? policeRoles.includes(userRole) : false;
  };

  // Initialize operator session
  useEffect(() => {
    const initializeSession = async () => {
      if (!user || !hasPoliceRole(role)) return;

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
  }, [user, role]);

  // Fetch incidents and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!hasPoliceRole(role)) return;

      try {
        // Fetch incidents
        const { data: incidentsData, error: incidentsError } = await supabase
          .from('emergency_incidents')
          .select('*')
          .order('reported_at', { ascending: false })
          .limit(50);

        if (incidentsError) throw incidentsError;
        setIncidents(incidentsData || []);

        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const activeIncidents = incidentsData?.filter(i => 
          !['resolved', 'closed'].includes(i.status)
        ).length || 0;

        const highPriorityIncidents = incidentsData?.filter(i => 
          i.priority_level <= 2 && !['resolved', 'closed'].includes(i.status)
        ).length || 0;

        const resolvedToday = incidentsData?.filter(i => 
          i.resolved_at && new Date(i.resolved_at) >= today
        ).length || 0;

        // Get active operators count
        const { count: activeOperators } = await supabase
          .from('emergency_operator_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .is('session_end', null);

        setStats({
          activeIncidents,
          highPriorityIncidents,
          resolvedToday,
          averageResponseTime: 12, // This would be calculated from actual data
          activeOperators: activeOperators || 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();
  }, [role]);

  // Real-time subscriptions
  useEffect(() => {
    if (!hasPoliceRole(role)) return;

    const incidentsSubscription = supabase
      .channel('emergency-incidents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_incidents'
        },
        (payload) => {
          console.log('Incident update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setIncidents(prev => [payload.new as EmergencyIncident, ...prev]);
            
            // Show notification for new high-priority incidents
            const newIncident = payload.new as EmergencyIncident;
            if (newIncident.priority_level <= 2) {
              toast.error(`HIGH PRIORITY: New ${newIncident.emergency_type} incident #${newIncident.incident_number}`, {
                duration: 10000,
                action: {
                  label: "View",
                  onClick: () => setSelectedIncident(newIncident)
                }
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            setIncidents(prev => 
              prev.map(incident => 
                incident.id === payload.new.id ? payload.new as EmergencyIncident : incident
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(incidentsSubscription);
    };
  }, [role]);

  const handleSignOut = async () => {
    if (operatorSession) {
      // End operator session
      await supabase
        .from('emergency_operator_sessions')
        .update({ session_end: new Date().toISOString(), status: 'offline' })
        .eq('id', operatorSession.id);
    }
    signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-blue-50 flex items-center justify-center">
        <div className="text-lg animate-fade-in">{t('loading')}</div>
      </div>
    );
  }

  if (!hasPoliceRole(role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-blue-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                Police Emergency Command Center
              </h1>
              <p className="text-muted-foreground">Real-time emergency incident management</p>
              
              {operatorSession && (
                <div className="flex gap-2 mt-3">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Activity className="mr-1 h-3 w-3" />
                    Online
                  </Badge>
                  <Badge variant="secondary">
                    Session: {new Date(operatorSession.session_start).toLocaleTimeString()}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <LanguageSwitcher />
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.activeIncidents}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.highPriorityIncidents}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Resolved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Avg Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.averageResponseTime}m</div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Operators Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.activeOperators}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Incident List */}
          <div className="lg:col-span-2">
            <IncidentList 
              incidents={incidents}
              onSelectIncident={(incident) => setSelectedIncident(incident)}
              selectedIncident={selectedIncident}
            />
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {showMap ? 'Hide' : 'Show'} Incident Map
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Operator Status */}
            <OperatorStatusPanel operatorSession={operatorSession} />

            {/* Map */}
            {showMap && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Live Incident Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IncidentMap 
                    incidents={incidents}
                    selectedIncident={selectedIncident}
                    onSelectIncident={(incident) => setSelectedIncident(incident)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;