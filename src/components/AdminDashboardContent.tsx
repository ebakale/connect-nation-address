import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Shield, Map, CheckCircle, AlertTriangle, 
  BarChart3, TrendingUp, Database, Activity, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

// Component imports
import AdminPanel from "@/components/AdminPanel";
import { AddressVerificationQueue } from "@/components/AddressVerificationQueue";
import { AddressRequestApproval } from "@/components/AddressRequestApproval";
import { AnalyticsReports } from "@/components/AnalyticsReports";
import { ProvinceManagement } from "@/components/ProvinceManagement";
import { RolesDocumentGenerator } from "@/components/RolesDocumentGenerator";

interface DashboardStats {
  totalUsers: number;
  activeRoles: number;
  pendingApprovals: number;
  totalAddresses: number;
  verifiedAddresses: number;
  publicAddresses: number;
  pendingVerifications: number;
  systemHealth: number;
}

interface AdminDashboardContentProps {
  activeSection: string;
}

export function AdminDashboardContent({ activeSection }: AdminDashboardContentProps) {
  const { hasAdminAccess } = useUserRole();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeRoles: 0,
    pendingApprovals: 0,
    totalAddresses: 0,
    verifiedAddresses: 0,
    publicAddresses: 0,
    pendingVerifications: 0,
    systemHealth: 99.9
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!hasAdminAccess) return;
      
      try {
        setLoading(true);
        const [
          profilesResult,
          rolesResult,
          requestsResult,
          addressesResult,
          verifiedResult,
          publicResult
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('user_roles').select('role', { count: 'exact', head: true }),
          supabase.from('address_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('addresses').select('id', { count: 'exact', head: true }),
          supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('verified', true),
          supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('public', true)
        ]);

        setStats({
          totalUsers: profilesResult.count || 0,
          activeRoles: rolesResult.count || 0, 
          pendingApprovals: requestsResult.count || 0,
          totalAddresses: addressesResult.count || 0,
          verifiedAddresses: verifiedResult.count || 0,
          publicAddresses: publicResult.count || 0,
          pendingVerifications: requestsResult.count || 0,
          systemHealth: 99.9
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [hasAdminAccess]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">System Overview</h2>
        <p className="text-muted-foreground">Monitor key metrics and system performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRoles}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              Excellent performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Address System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Address System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Addresses</span>
              <Badge variant="secondary">{stats.totalAddresses}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Verified</span>
              <Badge variant="default">{stats.verifiedAddresses}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Public</span>
              <Badge variant="outline">{stats.publicAddresses}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Last 24h:</span>
                <span className="ml-2 font-medium">15 new registrations</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">This week:</span>
                <span className="ml-2 font-medium">48 addresses verified</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">This month:</span>
                <span className="ml-2 font-medium">156 approvals processed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Shield className="h-4 w-4 mr-2" />
              Assign Roles
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/dashboard'}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Review Approvals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-fade-in">Loading...</div>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'users':
      case 'roles':
      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {activeSection === 'users' && 'User Management'}
                {activeSection === 'roles' && 'Role Management'}
                {activeSection === 'system' && 'System Settings'}
              </h2>
              <p className="text-muted-foreground">
                {activeSection === 'users' && 'Manage user accounts and permissions'}
                {activeSection === 'roles' && 'Configure roles and access levels'}
                {activeSection === 'system' && 'System configuration and settings'}
              </p>
            </div>
            <AdminPanel />
          </div>
        );
      case 'verification':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Verification Queue</h2>
              <p className="text-muted-foreground">Review and verify pending address submissions</p>
            </div>
            <AddressVerificationQueue />
          </div>
        );
      case 'approvals':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Approval Queue</h2>
              <p className="text-muted-foreground">Process pending address requests</p>
            </div>
            <AddressRequestApproval requests={[]} onUpdate={() => {}} />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">System Analytics</h2>
              <p className="text-muted-foreground">Detailed analytics and reporting</p>
            </div>
            <AnalyticsReports />
          </div>
        );
      case 'provinces':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Province Management</h2>
              <p className="text-muted-foreground">Manage provinces and geographic regions</p>
            </div>
            <ProvinceManagement />
          </div>
        );
      case 'documentation':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">System Documentation</h2>
              <p className="text-muted-foreground">Generate and manage system documentation</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Role Documentation Generator</CardTitle>
                <CardDescription>
                  Generate comprehensive documentation for system roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RolesDocumentGenerator />
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {renderContent()}
    </div>
  );
}