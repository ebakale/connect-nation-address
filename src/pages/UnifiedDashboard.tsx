import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, Users, Settings, BarChart3, LogOut, Search, FileText, Clock, AlertCircle,
  Camera, CheckCircle, TrendingUp, Target, MapPin, AlertTriangle, Crown, Globe, FileCheck, Map, User, Phone
} from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/Footer';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";

import { useNavigate } from "react-router-dom";

// Component imports
import AdminPanel from "@/components/AdminPanel";
import AddressSearch from "@/components/AddressSearch";
import AddressMapViewer from "@/components/AddressMapViewer";
import { AddressRequestForm } from "@/components/AddressRequestForm";
import { AddressRequestStatus } from "@/components/AddressRequestStatus";
import { AddressCaptureForm } from "@/components/AddressCaptureForm";
import { AddressVerificationQueue } from "@/components/AddressVerificationQueue";
import { AddressPublishingQueue } from "@/components/AddressPublishingQueue";
import { AddressUnpublishingQueue } from "@/components/AddressUnpublishingQueue";
import { ProvinceManagement } from "@/components/ProvinceManagement";
import { AnalyticsReports } from "@/components/AnalyticsReports";
import { VerificationTools } from "@/components/VerificationTools";
import { ProfileEditor } from "@/components/ProfileEditor";
import { AddressRequestApproval } from "@/components/AddressRequestApproval";
import DraftManager from "@/components/DraftManager";
import FieldMap from "@/components/FieldMap";
import { RolesDocumentGenerator } from "@/components/RolesDocumentGenerator";
import { SystemManualPDF } from "@/components/SystemManualPDF";
import EmergencyContacts from "@/components/EmergencyContacts";
import { ReporterNotifications } from "@/components/ReporterNotifications";

interface SearchResult {
  uac: string;
  readable: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  verified: boolean;
}

interface DashboardStats {
  totalUsers: number;
  activeRoles: number;
  pendingApprovals: number;
  totalAddresses: number;
  verifiedAddresses: number;
  publicAddresses: number;
}

interface PendingRequest {
  id: string;
  created_at: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  justification: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const UnifiedDashboard = () => {
  const { 
    role, 
    loading, 
    isAdmin, 
    isCitizen, 
    isFieldAgent, 
    isVerifier, 
    isRegistrar,
    getGeographicScope,
    hasAdminAccess,
    canCreateDraftAddress,
    canVerifyAddresses,
    canPublishAddresses,
    hasPoliceAccess,
    isPoliceRole,
    hasNDAAAccess,
    hasSystemAdminAccess
  } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Route users to appropriate dashboard based on their primary role
  useEffect(() => {
    if (!loading) {
      if (isPoliceRole) {
        navigate('/police', { replace: true });
      } else if (hasNDAAAccess && !hasSystemAdminAccess) {
        // NDAA admins get dedicated addressing dashboard
        navigate('/addressing', { replace: true });
      }
      // System admins and other addressing roles stay on unified dashboard
    }
  }, [loading, isPoliceRole, hasNDAAAccess, hasSystemAdminAccess, navigate]);

  // Stats state
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeRoles: 0,
    pendingApprovals: 0,
    totalAddresses: 0,
    verifiedAddresses: 0,
    publicAddresses: 0
  });

  // Pending requests state
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [userProfile, setUserProfile] = useState<{full_name: string; email: string} | null>(null);

  // Active view state
  const [activeView, setActiveView] = useState('overview');
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const [showMapView, setShowMapView] = useState(false);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!hasAdminAccess) return;
      
      try {
        // Fetch all stats in parallel
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
          publicAddresses: publicResult.count || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    const fetchPendingRequests = async () => {
      try {
        // First get the address requests
        const { data: requests, error: requestsError } = await supabase
          .from('address_requests')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10);

        if (requestsError) throw requestsError;

        if (!requests || requests.length === 0) {
          setPendingRequests([]);
          return;
        }

        // Get user IDs from requests
        const userIds = requests.map(r => r.user_id);

        // Get profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const combinedData = requests.map(request => {
          const profile = profiles?.find(p => p.user_id === request.user_id);
          return {
            ...request,
            profiles: {
              full_name: profile?.full_name || 'Unknown User',
              email: profile?.email || 'unknown@example.com'
            }
          };
        });

        setPendingRequests(combinedData);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setUserProfile(data || { full_name: 'User', email: user.email || '' });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({ full_name: 'User', email: user.email || '' });
      }
    };

    fetchStats();
    fetchPendingRequests();
    fetchUserProfile();
  }, [hasAdminAccess, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  // If showing map view for selected address
  if (showMapView && selectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <AddressMapViewer 
            address={selectedAddress}
            onBack={() => {
              setShowMapView(false);
              setSelectedAddress(null);
            }}
          />
        </div>
      </div>
    );
  }

  const geographicScope = getGeographicScope();
  const userRoles = [];
  if (isAdmin) userRoles.push('Admin');
  if (isVerifier) userRoles.push('Verifier');
  if (isRegistrar) userRoles.push('Registrar');
  if (isFieldAgent) userRoles.push('Field Agent');
  if (isCitizen) userRoles.push('Citizen');

  const handleSidebarNavigation = (viewId: string) => {
    setActiveView(viewId);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'overview': return t('dashboard');
      case 'search': return 'Search Addresses';
      case 'submit-request': return 'Submit Address Request';
      case 'request-status': return 'Request Status';
      case 'capture-address': return 'Capture Address';
      case 'verification-queue': return 'Verification Queue';
      case 'publishing-queue': return 'Publishing Queue';
      case 'unpublishing-queue': return 'Unpublishing Queue';
      case 'analytics': return 'Analytics';
      case 'province-management': return 'Province Management';
      case 'verification-tools': return 'Verification Tools';
      case 'profile': return 'Profile Settings';
      case 'emergency-contacts': return 'Emergency Contacts';
      default: return t('dashboard');
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'overview': return t('unifiedPortal');
      case 'search': return 'Find verified addresses in the national database';
      case 'submit-request': return 'Request a new address to be added to the system';
      case 'request-status': return 'Check the status of your address requests';
      case 'capture-address': return 'Capture and create new address drafts';
      case 'verification-queue': return 'Review and verify pending addresses';
      case 'publishing-queue': return 'Publish verified addresses to the public database';
      case 'unpublishing-queue': return 'Manage address unpublishing requests';
      case 'analytics': return 'View system analytics and reports';
      case 'province-management': return 'Manage provincial settings and configurations';
      case 'verification-tools': return 'Tools for address verification';
      case 'profile': return 'Update your personal information and settings';
      case 'emergency-contacts': return 'Manage emergency contact information';
      default: return t('unifiedPortal');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* User greeting */}
            {userProfile && (
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {t('welcomeBack')}, {userProfile.full_name}!
                </h2>
                <p className="text-muted-foreground mb-4">Here's what's happening with your account today.</p>
                
                {/* User roles display */}
                <div className="flex gap-2 mb-4">
                  {userRoles.map((roleLabel) => (
                    <Badge key={roleLabel} variant="default">
                      {roleLabel}
                    </Badge>
                  ))}
                </div>

                {/* Geographic scope */}
                {geographicScope.length > 0 && (
                  <div className="flex gap-2">
                    {geographicScope.map((scope) => (
                      <Badge key={scope} variant="secondary">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Admin Metrics */}
            {hasAdminAccess && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{t('systemOverview')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">Users in system</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('activeRoles')}</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeRoles}</div>
                      <p className="text-xs text-muted-foreground">Assigned roles</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveView('admin-panel')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('pendingApprovals')}</CardTitle>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                      <p className="text-xs text-muted-foreground">{t('clickToApproveRequests')}</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('publicAddresses')}</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.publicAddresses}</div>
                      <p className="text-xs text-muted-foreground">{stats.totalAddresses} total</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Admin Panel */}
                <AdminPanel />
              </div>
            )}

            {/* Incident Notifications */}
            <ReporterNotifications />
          </div>
        );

      case 'search':
        return (
          <div className="max-w-4xl">
            <AddressSearch 
              onSelectAddress={(address) => {
                setSelectedAddress(address);
                setShowMapView(true);
              }}
            />
          </div>
        );

      case 'submit-request':
        return (
          <div className="max-w-4xl">
            <AddressRequestForm 
              onCancel={() => setActiveView('overview')}
              onSuccess={() => setActiveView('overview')}
            />
          </div>
        );

      case 'request-status':
        return (
          <div className="max-w-4xl">
            <AddressRequestStatus />
          </div>
        );

      case 'capture-address':
        return (
          <div className="max-w-4xl">
            <AddressCaptureForm 
              onCancel={() => setActiveView('overview')}
            />
          </div>
        );

      case 'verification-queue':
        return (
          <div className="max-w-6xl">
            <AddressVerificationQueue />
          </div>
        );

      case 'publishing-queue':
        return (
          <div className="max-w-6xl">
            <AddressPublishingQueue />
          </div>
        );

      case 'unpublishing-queue':
        return (
          <div className="max-w-6xl">
            <AddressUnpublishingQueue />
          </div>
        );

      case 'analytics':
        return (
          <div className="max-w-6xl">
            <AnalyticsReports />
          </div>
        );

      case 'province-management':
        return (
          <div className="max-w-4xl">
            <ProvinceManagement />
          </div>
        );

      case 'verification-tools':
        return (
          <div className="max-w-4xl">
            <VerificationTools />
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-4xl">
            <ProfileEditor />
          </div>
        );

      case 'emergency-contacts':
        return (
          <div className="max-w-4xl">
            <EmergencyContacts />
          </div>
        );

      case 'admin-panel':
        return (
          <div className="max-w-6xl">
            <AdminPanel />
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-background">
        <DashboardSidebar 
          onNavigationClick={handleSidebarNavigation}
          pendingCount={stats.pendingApprovals}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1 ml-4 min-w-0">
                <h1 className="text-lg font-semibold leading-tight">{getViewTitle()}</h1>
                <p className="text-sm text-muted-foreground leading-tight mb-1">{getViewDescription()}</p>
              </div>
              <div className="flex items-center gap-2">
                <OfflineIndicator />
                {userProfile && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{userProfile.full_name}</p>
                    <div className="flex gap-1">
                      {userRoles.map((roleLabel) => (
                        <Badge key={roleLabel} variant="secondary" className="text-xs">
                          {roleLabel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={signOut} 
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {renderActiveView()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UnifiedDashboard;