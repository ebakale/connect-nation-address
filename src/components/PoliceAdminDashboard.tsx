import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ResponsiveTabsList } from "@/components/ui/responsive-tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Shield, Settings, Database, Activity, 
  UserCheck, Key, ChartBar, Clock,
  AlertTriangle, CheckCircle, FileText, Radio, ScrollText
} from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useTranslation } from 'react-i18next';
import UserManager from "./UserManager";
import UnitManagement from "./UnitManagement";
import SystemConfiguration from "./SystemConfiguration";
import PoliceAnalytics from "./PoliceAnalytics";
import AuditLogViewer from "./AuditLogViewer";

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
      toast.error(t('emergency:policeAdminDashboard.failedToLoadStats'));
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
            {t('emergency:policeAdminDashboard.accessDenied')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('emergency:policeAdminDashboard.accessDeniedMessage')}
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
        <h1 className="text-2xl sm:text-3xl font-bold">{t('emergency:policeAdminDashboard.policeAdministration')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('emergency:policeAdminDashboard.managePoliceSystem')}
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('emergency:policeAdminDashboard.totalOfficers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOfficers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeOperators} {t('emergency:policeAdminDashboard.currentlyActive')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('emergency:policeAdminDashboard.policeUnits')}</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUnits} {t('emergency:policeAdminDashboard.availableForDeployment')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('emergency:totalIncidents')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeIncidents} {t('emergency:active')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('emergency:policeAdminDashboard.avgResponseTimeTitle')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}m</div>
            <p className="text-xs text-muted-foreground">
              {t('emergency:policeAdminDashboard.last30Days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <PoliceAdminTabs t={t} />
    </div>
  );
};

// Extracted component for the tabs section
const PoliceAdminTabs = ({ t }: { t: (key: string) => string }) => {
  const [activeTab, setActiveTab] = React.useState('users');

  const policeTabs = [
    { value: 'users', label: t('emergency:policeAdminDashboard.userManagement') },
    { value: 'units', label: t('emergency:policeAdminDashboard.unitManagement') },
    { value: 'system', label: t('emergency:policeAdminDashboard.systemConfig') },
    { value: 'analytics', label: t('emergency:policeAdminDashboard.analytics') },
    { value: 'audit', label: t('emergency:policeAdminDashboard.auditLogs') },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <ResponsiveTabsList
        tabs={policeTabs}
        value={activeTab}
        onValueChange={setActiveTab}
      />
        
      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('emergency:policeAdminDashboard.policeUserManagement')}</CardTitle>
            <CardDescription>
              Police-specific user management. For comprehensive user and role management, use the main Admin Panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Comprehensive Admin Functions</h4>
                    <p className="text-sm text-muted-foreground">
                      Full user management, role assignment, and system administration are available in the main Admin Panel.
                    </p>
                  </div>
                </div>
              </div>
              <UserManager />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="units" className="space-y-4">
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
      </TabsContent>
      
      <TabsContent value="system" className="space-y-4">
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
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-4">
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
      </TabsContent>

      <TabsContent value="audit" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              {t('emergency:auditLog.title')}
            </CardTitle>
            <CardDescription>
              {t('emergency:auditLog.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuditLogViewer />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};