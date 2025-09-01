import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Shield, Settings, Database, Activity, 
  UserCheck, UserPlus, Key, ChartBar, Clock,
  AlertTriangle, CheckCircle, FileText, Radio
} from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import UserManager from "./UserManager";
import UnitManagement from "./UnitManagement";
import SystemConfiguration from "./SystemConfiguration";
import PoliceAnalytics from "./PoliceAnalytics";

interface PoliceStats {
  totalOfficers: number;
  activeOperators: number;
  totalUnits: number;
  activeUnits: number;
  totalIncidents: number;
  activeIncidents: number;
  avgResponseTime: number;
}

export const PoliceAdminDashboard = () => {
  const { hasPoliceAdminAccess, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<PoliceStats>({
    totalOfficers: 0,
    activeOperators: 0,
    totalUnits: 0,
    activeUnits: 0,
    totalIncidents: 0,
    activeIncidents: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasPoliceAdminAccess) {
      fetchPoliceStats();
    }
  }, [hasPoliceAdminAccess]);


  const fetchPoliceStats = async () => {
    try {
      setLoading(true);
      
      // Fetch police officers count
      const { data: officers, error: officersError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['police_operator', 'police_supervisor', 'police_dispatcher', 'police_admin']);
      
      if (officersError) throw officersError;

      // Fetch active operator sessions
      const { data: activeSessions, error: sessionsError } = await supabase
        .from('emergency_operator_sessions')
        .select('id')
        .eq('status', 'active')
        .is('session_end', null);
      
      if (sessionsError) throw sessionsError;

      // Fetch emergency units
      const { data: units, error: unitsError } = await supabase
        .from('emergency_units')
        .select('id, status');
      
      if (unitsError) throw unitsError;

      // Fetch incidents
      const { data: allIncidents, error: incidentsError } = await supabase
        .from('emergency_incidents')
        .select('id, status, reported_at, responded_at');
      
      if (incidentsError) throw incidentsError;

      // Calculate stats
      const activeUnits = units?.filter(u => u.status === 'available').length || 0;
      const activeIncidents = allIncidents?.filter(i => 
        ['reported', 'dispatched', 'responding', 'on_scene'].includes(i.status)
      ).length || 0;

      // Calculate average response time (simplified)
      const respondedIncidents = allIncidents?.filter(i => i.responded_at) || [];
      let avgResponseTime = 0;
      if (respondedIncidents.length > 0) {
        const totalResponseTime = respondedIncidents.reduce((sum, incident) => {
          const reportedTime = new Date(incident.reported_at).getTime();
          const respondedTime = new Date(incident.responded_at).getTime();
          return sum + (respondedTime - reportedTime);
        }, 0);
        avgResponseTime = Math.round(totalResponseTime / respondedIncidents.length / (1000 * 60)); // in minutes
      }

      setStats({
        totalOfficers: officers?.length || 0,
        activeOperators: activeSessions?.length || 0,
        totalUnits: units?.length || 0,
        activeUnits,
        totalIncidents: allIncidents?.length || 0,
        activeIncidents,
        avgResponseTime
      });
    } catch (error) {
      console.error('Error fetching police stats:', error);
      toast.error('Failed to load police statistics');
    } finally {
      setLoading(false);
    }
  };

  const createPoliceUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seed-police-users');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(`Successfully created ${data.users?.length || 0} police users`);
        fetchPoliceStats(); // Refresh stats
      } else {
        throw new Error(data?.error || 'Failed to create users');
      }
    } catch (error) {
      console.error('Error creating police users:', error);
      toast.error('Failed to create police users');
    }
  };

  if (!hasPoliceAdminAccess) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need police administrator privileges to access this section.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Police Administration</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage police system users, units, and configurations
          </p>
        </div>
        <Button onClick={createPoliceUsers} className="flex items-center gap-2 text-sm sm:text-base px-3 py-2 w-fit self-start sm:self-auto">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Police Users</span>
          <span className="sm:hidden">Create Users</span>
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOfficers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeOperators} currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Police Units</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUnits} available for deployment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeIncidents} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}m</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-1">
          <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">User Management</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">Unit Management</span>
            <span className="sm:hidden">Units</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">System Config</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Police User Management</CardTitle>
              <CardDescription>
                Manage police officers, dispatchers, and supervisors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Police Unit Management</CardTitle>
              <CardDescription>
                Create, edit, and manage police patrol units, rapid response teams, and specialized units
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnitManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure police system settings and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemConfiguration />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Police Analytics</CardTitle>
              <CardDescription>
                View performance metrics and operational analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PoliceAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};