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
import { useTranslation } from 'react-i18next';
import Footer from '@/components/Footer';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";

import { useNavigate } from "react-router-dom";

// Component imports
import AdminPanel from "@/components/AdminPanel";
import { GoogleMapsImporter } from "@/components/GoogleMapsImporter";
import { AddressDataManager } from "@/components/AddressDataManager";

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
import DashboardLocationMap from "@/components/DashboardLocationMap";
import { ResidencyVerificationManager } from "@/components/ResidencyVerificationManager";
import { ResidencyVerificationDashboard } from "@/components/ResidencyVerificationDashboard";
import { UserVerificationRequests } from "@/components/UserVerificationRequests";
import { CitizenAddressPortal } from "@/components/CitizenAddressPortal";
import { NARCARTestPanel } from "@/components/NARCARTestPanel";
import { UnifiedAddressDashboard } from "@/components/UnifiedAddressDashboard";
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
  const { t } = useTranslation(['common', 'dashboard']);
  const navigate = useNavigate();

  // Route users to appropriate dashboard based on their primary role
  useEffect(() => {
    if (!loading) {
      if (isPoliceRole) {
        navigate('/police', { replace: true });
      }
      // All addressing-related roles now stay on unified dashboard
    }
  }, [loading, isPoliceRole, navigate]);

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
        const userIds = requests.map(r => (r as any).user_id).filter(Boolean);

        // Get profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const combinedData = requests.map(request => {
          const profile = profiles?.find(p => p.user_id === (request as any).user_id);
          return {
            ...request,
            profiles: {
              full_name: profile?.full_name || t('dashboard:unknownUser'),
              email: profile?.email || t('dashboard:unknownEmail')
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

        setUserProfile(data || { full_name: t('dashboard:user'), email: user.email || '' });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({ full_name: t('dashboard:user'), email: user.email || '' });
      }
    };

    fetchStats();
    fetchPendingRequests();
    fetchUserProfile();
  }, [hasAdminAccess, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-lg">{t('common:buttons.loading')}</div>
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
  if (isAdmin) userRoles.push(t('dashboard:admin'));
  if (isVerifier) userRoles.push(t('dashboard:verifier'));
  if (isRegistrar) userRoles.push(t('dashboard:registrar'));
  if (isFieldAgent) userRoles.push(t('dashboard:fieldAgent'));
  if (isCitizen) userRoles.push(t('dashboard:citizen'));

  const handleSidebarNavigation = (viewId: string) => {
    setActiveView(viewId);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'address-data': return t('dashboard:addressData');
      case 'address-search': return t('dashboard:addressSearch');
      case 'submit-request': return t('dashboard:submitRequest');
      case 'request-status': return t('dashboard:requestStatus');
      case 'capture-address': return t('dashboard:captureAddress');
      case 'verification-queue': return t('dashboard:verificationQueue');
      case 'publishing-queue': return t('dashboard:publishingQueue');
      case 'unpublishing-queue': return t('dashboard:unpublishingQueue');
      case 'analytics': return t('dashboard:analytics');
      case 'province-management': return t('dashboard:provinceManagement');
      case 'verification-tools': return t('dashboard:verificationTools');
      case 'residency-verification-manager': return 'Residency Verification Manager';
      case 'residency-verification-dashboard': return 'My Verification Requests';
      case 'citizen-address-portal': return 'My Addresses (CAR)';
      case 'profile': return t('dashboard:title');
      case 'emergency-contacts': return t('dashboard:emergencyContacts');
      default: return t('dashboard:title');
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'address-data': return t('dashboard:addressDataDescription');
      case 'address-search': return t('dashboard:searchDescription');
      case 'submit-request': return t('dashboard:submitRequestDescription');
      case 'request-status': return t('dashboard:requestStatusDescription');
      case 'capture-address': return t('dashboard:captureAddressDescription');
      case 'verification-queue': return t('dashboard:verificationQueueDescription');
      case 'publishing-queue': return t('dashboard:publishingQueueDescription');
      case 'unpublishing-queue': return t('dashboard:unpublishingQueueDescription');
      case 'analytics': return t('dashboard:analyticsDescription');
      case 'province-management': return t('dashboard:provinceManagementDescription');
      case 'verification-tools': return t('dashboard:verificationToolsDescription');
      case 'residency-verification-manager': return 'Manage and review residency verification requests from citizens';
      case 'residency-verification-dashboard': return 'View and edit your residency verification requests. Upload new documents and track status changes.';
      case 'citizen-address-portal': return 'Manage your citizen addresses in the Citizen Address Repository (CAR). Set primary and secondary addresses.';
      case 'profile': return t('dashboard:welcomeMessage');
      case 'emergency-contacts': return t('dashboard:welcomeMessage');
      default: return t('dashboard:welcomeMessage');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* User greeting */}
            {userProfile && (
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {t('dashboard:welcomeBack', { name: userProfile.full_name })}
                </h2>
                <p className="text-muted-foreground mb-3 text-sm">{t('dashboard:welcomeMessage')}</p>
                
                {/* User roles display */}
                <div className="flex gap-2 mb-3">
                  {userRoles.map((roleLabel) => (
                    <Badge key={roleLabel} variant="default" className="text-xs">
                      {roleLabel}
                    </Badge>
                  ))}
                </div>

                {/* Geographic scope */}
                {geographicScope.length > 0 && (
                  <div className="flex gap-2">
                    {geographicScope.map((scope) => (
                      <Badge key={scope} variant="secondary" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address Search Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                {/* Search Addresses */}
                <Card className="shadow-card w-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Search className="h-5 w-5" />
                      {t('dashboard:searchAddresses')}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {t('dashboard:findVerifiedAddresses')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <AddressSearch 
                      onSelectAddress={setSelectedAddress}
                    />
                  </CardContent>
                </Card>

                {/* Search Tips */}
                <Card className="shadow-card w-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{t('dashboard:searchTips')}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{t('dashboard:searchByUac')}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{t('dashboard:searchByUacDesc')}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{t('dashboard:searchByAddress')}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{t('dashboard:searchByAddressDesc')}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{t('dashboard:searchByCity')}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{t('dashboard:searchByCityDesc')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Nearby Map and Points of Interest */}
                <Card className="shadow-card w-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5" />
                      {t('dashboard:nearbyMapPoi')}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {t('dashboard:nearbyMapDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="min-h-[400px] sm:min-h-[500px] w-full">
                      <DashboardLocationMap 
                        searchedAddress={selectedAddress}
                        onAddressSearched={setSelectedAddress}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Map Features */}
                <Card className="shadow-card w-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{t('dashboard:mapFeatures')}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{t('dashboard:currentLocation')}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{t('dashboard:currentLocationDesc')}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{t('dashboard:nearbyAddresses')}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{t('dashboard:nearbyAddressesDesc')}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{t('dashboard:pointsOfInterest')}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{t('dashboard:pointsOfInterestDesc')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Only visible on larger screens */}
              <div className="xl:col-span-1 space-y-6">
                <Card className="shadow-card w-full sticky top-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{t('dashboard:quickActions')}</CardTitle>
                    <CardDescription className="text-sm">
                      {t('dashboard:additionalToolsShortcuts')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                       <div className="p-3 bg-muted/50 rounded-lg">
                         <p className="font-medium text-sm mb-1">{t('dashboard:recentSearches')}</p>
                         <p className="text-muted-foreground text-xs">{t('dashboard:recentSearchesDesc')}</p>
                       </div>
                       <div className="p-3 bg-muted/50 rounded-lg">
                         <p className="font-medium text-sm mb-1">{t('dashboard:savedLocations')}</p>
                         <p className="text-muted-foreground text-xs">{t('dashboard:savedLocationsDesc')}</p>
                       </div>
                       <div className="p-3 bg-muted/50 rounded-lg">
                         <p className="font-medium text-sm mb-1">{t('dashboard:exportData')}</p>
                         <p className="text-muted-foreground text-xs">{t('dashboard:exportDataDesc')}</p>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Admin Quick Access Notice */}
            {hasAdminAccess && (
              <Card className="shadow-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('dashboard:adminFunctions')}
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard:adminFunctionsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{t('dashboard:useAdminPanel')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('dashboard:useAdminPanelDesc')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setActiveView('admin-panel')}
                      variant="outline"
                    >
                      {t('dashboard:openAdminPanel')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        );

      case 'address-data':
        return (
          <div className="max-w-6xl">
            <AddressDataManager />
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

      case 'residency-verification-manager':
        return (
          <div className="max-w-6xl">
            <ResidencyVerificationManager />
          </div>
        );

      case 'residency-verification-dashboard':
        return (
          <div className="max-w-6xl">
            <UserVerificationRequests />
          </div>
        );

      case 'emergency-contacts':
        return (
          <div className="max-w-4xl">
            <EmergencyContacts />
          </div>
        );

      case 'citizen-address-portal':
        return (
          <div className="max-w-6xl">
            <CitizenAddressPortal />
          </div>
        );

      case 'unified-address-dashboard':
        return (
          <div className="max-w-7xl">
            <UnifiedAddressDashboard />
          </div>
        );

      case 'admin-panel':
        return (
          <div className="max-w-6xl space-y-6">
            <AdminPanel />
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('dashboard:selectOptionHelp')}</p>
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
          <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center px-4 py-3">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1 ml-4 min-w-0">
                <h1 className="text-lg font-semibold leading-tight">{getViewTitle()}</h1>
                <p className="text-sm text-muted-foreground mt-1 mb-2 break-words leading-normal">{getViewDescription()}</p>
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
                  <span className="hidden sm:inline">{t('common:navigation.logout', { defaultValue: 'Logout' })}</span>
                </Button>
              </div>
            </div>
            <div className="border-b"></div>
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