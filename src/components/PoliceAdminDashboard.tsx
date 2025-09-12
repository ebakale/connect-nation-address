import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Shield, Settings, Database, Activity, 
  UserCheck, Key, ChartBar, Clock,
  AlertTriangle, CheckCircle, FileText, Radio
} from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('emergency');
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
      toast.error(t('policeAdminDashboard.failedToLoadStats'));
    } finally {
      setLoading(false);
    }
  };


  if (!hasPoliceAdminAccess) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            {t('policeAdminDashboard.accessDenied')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('policeAdminDashboard.accessDeniedMessage')}
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('policeAdminDashboard.policeAdministration')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('policeAdminDashboard.managePoliceSystem')}
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('policeAdminDashboard.totalOfficers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOfficers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeOperators} {t('policeAdminDashboard.currentlyActive')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('policeAdminDashboard.policeUnits')}</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUnits} {t('policeAdminDashboard.availableForDeployment')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalIncidents')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeIncidents} {t('active')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('policeAdminDashboard.avgResponseTimeTitle')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}m</div>
            <p className="text-xs text-muted-foreground">
              {t('policeAdminDashboard.last30Days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-1">
          <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">{t('policeAdminDashboard.userManagement')}</span>
            <span className="sm:hidden">{t('policeAdminDashboard.users')}</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">{t('policeAdminDashboard.unitManagement')}</span>
            <span className="sm:hidden">{t('policeAdminDashboard.units')}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">{t('policeAdminDashboard.systemConfig')}</span>
            <span className="sm:hidden">{t('policeAdminDashboard.config')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">{t('policeAdminDashboard.analytics')}</span>
            <span className="sm:hidden">{t('policeAdminDashboard.stats')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('policeAdminDashboard.policeUserManagement')}</CardTitle>
              <CardDescription>
                {t('policeAdminDashboard.manageOfficersDescription')}
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
              <CardTitle>{t('policeAdminDashboard.policeUnitManagement')}</CardTitle>
              <CardDescription>
                {t('policeAdminDashboard.manageUnitsDescription')}
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
              <CardTitle>{t('policeAdminDashboard.systemConfiguration')}</CardTitle>
              <CardDescription>
                {t('policeAdminDashboard.configureSystemDescription')}
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
              <CardTitle>{t('policeAdminDashboard.policeAnalytics')}</CardTitle>
              <CardDescription>
                {t('policeAdminDashboard.viewMetricsDescription')}
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