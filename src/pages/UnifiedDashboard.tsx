import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, Users, Settings, BarChart3, LogOut, Search, FileText, Clock, AlertCircle,
  Camera, CheckCircle, TrendingUp, Target, MapPin, AlertTriangle, Crown, Globe, FileCheck, Map, User, Phone,
  Database, Network, Home, Building2, Plus, Package, Sparkles
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import Footer from '@/components/Footer';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardBreadcrumb } from "@/components/DashboardBreadcrumb";

import { useNavigate } from "react-router-dom";

// Component imports
import AdminPanel from "@/components/AdminPanel";
import { GoogleMapsImporter } from "@/components/GoogleMapsImporter";
import { AddressDataManager } from "@/components/AddressDataManager";

import AddressSearch from "@/components/AddressSearch";
import AddressMapViewer from "@/components/AddressMapViewer";
import { AddressRequestForm } from "@/components/AddressRequestForm";
import { UnifiedAddressRequestFlow } from "@/components/UnifiedAddressRequestFlow";
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
import { UniversalFieldMap } from "@/components/UniversalFieldMap";
import { SavedLocationsManager } from "@/components/SavedLocationsManager";
import { RecentSearchesManager } from "@/components/RecentSearchesManager";
import { RolesDocumentGenerator } from "@/components/RolesDocumentGenerator";
import { SystemManualPDF } from "@/components/SystemManualPDF";
import EmergencyContacts from "@/components/EmergencyContacts";
import { ReporterNotifications } from "@/components/ReporterNotifications";
import { NotificationCenter } from "@/components/NotificationCenter";
import { OnboardingWalkthrough } from "@/components/OnboardingWalkthrough";
import { OfflineSyncQueue } from "@/components/OfflineSyncQueue";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import UniversalDashboardLocationMap from "@/components/UniversalDashboardLocationMap";
import { ResidencyVerificationManager } from "@/components/ResidencyVerificationManager";
import { ResidencyVerificationDashboard } from "@/components/ResidencyVerificationDashboard";
import { UserVerificationRequests } from "@/components/UserVerificationRequests";
import { CitizenAddressPortal } from "@/components/CitizenAddressPortal";
import { CARAdministrativeOverview } from '@/components/CARAdministrativeOverview';
import { CARQualityMetrics } from '@/components/CARQualityMetrics';
import { CARBulkOperations } from '@/components/CARBulkOperations';
import { NARAuthorityDashboard } from '@/components/NARAuthorityDashboard';
import { BusinessDirectory } from '@/components/BusinessDirectory';
import CitizenDeliveriesView from '@/components/citizen/CitizenDeliveriesView';
import { PickupRequestForm } from '@/components/postal/PickupRequestForm';
import { DeliveryPreferencesForm } from '@/components/postal/DeliveryPreferencesForm';
import { CitizenPickupRequestCard } from '@/components/postal/CitizenPickupRequestCard';
import { usePickupRequests } from '@/hooks/usePickupRequests';
import { useCitizenAddresses } from '@/hooks/useCAR';
import { Truck } from 'lucide-react';

import { NARCARTestPanel } from "@/components/NARCARTestPanel";
import { RegistrarDashboardView } from "@/components/RegistrarDashboardView";
import { SystemIntegration } from "@/components/SystemIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    roleMetadata,
    loading, 
    isAdmin, 
    isCitizen, 
    isFieldAgent, 
    isVerifier, 
    isRegistrar,
    isCarAdmin,
    isResidencyVerifier,
    getGeographicScope,
    hasAdminAccess,
    canCreateDraftAddress,
    canVerifyAddresses,
    canPublishAddresses,
    hasPoliceAccess,
    isPoliceRole,
    isPostalRole,
    hasNDAAAccess,
    hasSystemAdminAccess,
    isNARAuthority
  } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  
  const navigate = useNavigate();

  // Get geographical scope from role metadata
  const geographicScope = roleMetadata.find(m => 
    m.scope_type === 'region' || m.scope_type === 'province' || m.scope_type === 'city'
  );

  // Route users to appropriate dashboard based on their primary role
  useEffect(() => {
    if (!loading) {
      if (isPoliceRole) {
        navigate('/police', { replace: true });
      } else if (isPostalRole) {
        navigate('/postal', { replace: true });
      }
      // All addressing-related roles now stay on unified dashboard
    }
  }, [loading, isPoliceRole, isPostalRole, navigate]);

  // Stats state
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeRoles: 0,
    pendingApprovals: 0,
    totalAddresses: 0,
    verifiedAddresses: 0,
    publicAddresses: 0
  });

  // Unified stats for NAR/CAR integration
  const [unifiedStats, setUnifiedStats] = useState({
    totalNARAddresses: 0,
    totalCARAddresses: 0,
    pendingCARVerifications: 0,
    pendingResidencyVerifications: 0,
    publishedAddresses: 0,
    activeUsers: 0
  });

  // Pending requests state
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [userProfile, setUserProfile] = useState<{full_name: string; email: string} | null>(null);

  // Active view state
  const [activeView, setActiveView] = useState('overview');
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'k', ctrl: true, handler: () => setActiveView('address-search'), description: 'Open search', category: 'Navigation' },
    { key: 'n', ctrl: true, handler: () => setActiveView('unified-address-request'), description: 'New request', category: 'Navigation' },
    { key: '/', ctrl: true, handler: () => setShortcutsOpen(true), description: 'Show shortcuts', category: 'General' },
  ]);

  // Postal/Pickup state
  const [pickupRequestOpen, setPickupRequestOpen] = useState(false);
  const [deliveryPreferencesOpen, setDeliveryPreferencesOpen] = useState(false);
  const [selectedAddressForPrefs, setSelectedAddressForPrefs] = useState<string>('');
  const [citizenAddressDetails, setCitizenAddressDetails] = useState<Array<{uac: string; street: string; city: string}>>([]);
  const { requests: pickupRequests, fetchRequests: fetchPickupRequests, updateRequest, cancelRequest } = usePickupRequests();
  
  // Use the proper hook that handles auth_user_id -> person_id lookup correctly
  const { currentAddresses, loading: addressesLoading } = useCitizenAddresses();

  // Fetch address details (street, city) for citizen addresses from the hook
  useEffect(() => {
    const fetchAddressDetails = async () => {
      if (!currentAddresses || currentAddresses.length === 0) {
        setCitizenAddressDetails([]);
        return;
      }
      
      try {
        const uacs = currentAddresses.map(a => a.uac);
        const { data, error } = await supabase
          .from('addresses')
          .select('uac, street, city')
          .in('uac', uacs);
        
        if (!error && data) {
          setCitizenAddressDetails(data as Array<{ uac: string; street: string; city: string }>);
        }
      } catch (error) {
        console.error('Error fetching address details:', error);
      }
    };
    
    fetchAddressDetails();
  }, [currentAddresses]);

  // Auto-open specific dashboards for different roles
  useEffect(() => {
    if (!loading) {
      if (isNARAuthority) {
        // NAR authorities get their dedicated dashboard
        setActiveView('nar-authority-dashboard');
      } else if (isRegistrar && !hasAdminAccess) {
        // Registrars go to their dedicated dashboard unless they're also admins
        setActiveView('registrar-dashboard');
      } else if (isResidencyVerifier) {
        setActiveView('residency-verification');
      }
      // CAR Admin defaults to 'overview' which shows their role-specific stats
    }
  }, [loading, isNARAuthority, isRegistrar, hasAdminAccess, isResidencyVerifier]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!hasAdminAccess && !isVerifier && !isFieldAgent) return;
      
      try {
        // Build base queries with geographical scope filter for verifiers and field agents
        const buildQuery = (baseQuery: any) => {
          // Only apply geographical filtering for non-admins
          if (hasAdminAccess || !geographicScope) return baseQuery;
          
          if (geographicScope.scope_type === 'city') {
            return baseQuery.ilike('city', geographicScope.scope_value);
          } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
            return baseQuery.ilike('region', geographicScope.scope_value);
          }
          return baseQuery;
        };

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
          buildQuery(supabase.from('address_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
          buildQuery(supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('verified', true)),
          buildQuery(supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('verified', true)),
          buildQuery(supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('public', true).eq('verified', true))
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

    const fetchUnifiedStats = async () => {
      try {
        // Build request body with geographic scope if user has restricted access
        const requestBody = (!hasAdminAccess && geographicScope) ? {
          scope_type: geographicScope.scope_type,
          scope_value: geographicScope.scope_value
        } : {};

        const { data, error } = await supabase.functions.invoke('unified-address-statistics', {
          body: requestBody
        })
        
        if (error) {
          console.error('Error fetching statistics:', error)
          return
        }
        
        setUnifiedStats({
          totalNARAddresses: data.totalNARAddresses || 0,
          totalCARAddresses: data.totalCARAddresses || 0,
          pendingCARVerifications: data.pendingCARVerifications || 0,
          pendingResidencyVerifications: data.pendingResidencyVerifications || 0,
          publishedAddresses: data.publishedAddresses || 0,
          activeUsers: data.activeUsers || 0
        })
      } catch (error) {
        console.error('Failed to fetch unified statistics:', error)
      }
    };

    const fetchPendingRequests = async () => {
      try {
        // Build query with geographical scope filter
        let query = supabase
          .from('address_requests')
          .select('*')
          .eq('status', 'pending');

        // Apply geographical scope filter for verifiers and field agents
        if (!hasAdminAccess && geographicScope) {
          if (geographicScope.scope_type === 'city') {
            query = query.ilike('city', geographicScope.scope_value);
          } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
            query = query.ilike('region', geographicScope.scope_value);
          }
        }

        const { data: requests, error: requestsError } = await query
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
    fetchUnifiedStats();
    fetchPendingRequests();
    fetchUserProfile();
  }, [hasAdminAccess, isVerifier, isFieldAgent, user, geographicScope]);

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

  const scopeFromMetadata = getGeographicScope();
  const userRoles = [];
  if (isAdmin) userRoles.push(t('dashboard:admin'));
  if (isVerifier) userRoles.push(t('dashboard:verifier'));
  if (isRegistrar) userRoles.push(t('dashboard:registrar'));
  if (isFieldAgent) userRoles.push(t('dashboard:fieldAgentRole'));
  if (isCarAdmin) userRoles.push(t('dashboard:carAdmin'));
  if (isResidencyVerifier) userRoles.push(t('dashboard:residencyVerifier'));
  if (isCitizen) userRoles.push(t('dashboard:citizen'));

  // Debug logging for registrar users
  console.log('Debug - User roles:', { isRegistrar, hasAdminAccess, activeView });

  const handleSidebarNavigation = (viewId: string) => {
    console.log('Debug - Navigating to view:', viewId);
    setActiveView(viewId);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'address-data': return t('dashboard:addressData');
      case 'address-search': return t('dashboard:addressSearch');
      case 'submit-request': return t('dashboard:submitRequest');
      case 'request-status': return t('dashboard:requestStatus');
      case 'capture-address': return t('dashboard:captureAddress');
      case 'field-drafts': return t('dashboard:myDrafts');
      case 'field-map': return t('dashboard:fieldMapNav');
      case 'verification-queue': return t('dashboard:verificationQueue');
      case 'analytics': return t('dashboard:analytics');
      case 'province-management': return t('dashboard:provinceManagement');
      case 'verification-tools': return t('dashboard:verificationTools');
      case 'residency-verification': return t('dashboard:residencyVerification');
      case 'residency-verification-dashboard': return t('dashboard:myVerificationRequests');
      case 'my-address-requests': return t('dashboard:myAddressRequests');
      case 'citizen-address-portal': return t('dashboard:myAddressesCar');
      case 'my-deliveries': return t('dashboard:myDeliveries');
      case 'recent-searches': return t('dashboard:recentSearches');
      case 'saved-locations': return t('dashboard:savedLocations');
      case 'saved-addresses': return t('dashboard:savedAddresses');
      case 'profile': return t('dashboard:title');
      case 'emergency-contacts': return t('dashboard:emergencyContacts');
      case 'registrar-dashboard': return t('dashboard:registrarDashboard');
      case 'nar-authority-dashboard': return t('dashboard:narAuthorityDashboard');
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
      case 'field-drafts': return t('dashboard:reviewPendingDrafts');
      case 'field-map': return t('dashboard:viewAssignedAreas');
      case 'verification-queue': return t('dashboard:verificationQueueDescription');
      case 'analytics': return t('dashboard:analyticsDescription');
      case 'province-management': return t('dashboard:provinceManagementDescription');
      case 'verification-tools': return t('dashboard:verificationToolsDescription');
      case 'residency-verification': return t('dashboard:manageResidencyVerifications');
      case 'residency-verification-dashboard': return t('dashboard:myVerificationRequestsDesc');
      case 'my-address-requests': return t('dashboard:myAddressRequestsDesc');
      case 'citizen-address-portal': return t('dashboard:myAddressesCarDesc');
      case 'recent-searches': return t('dashboard:recentSearchesDesc');
      case 'saved-locations': return t('dashboard:savedLocationsDesc');
      case 'profile': return t('dashboard:welcomeMessage');
      case 'emergency-contacts': return t('dashboard:welcomeMessage');
      case 'nar-authority-dashboard': return t('dashboard:narAuthorityDashboardDesc');
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
              <div className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 rounded-lg p-4 md:p-6 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-lg md:text-xl font-bold text-foreground">
                      {t('dashboard:welcomeBack', { name: userProfile.full_name })}
                    </h2>
                    <p className="text-sm text-muted-foreground">{t('dashboard:welcomeMessage')}</p>
                    
                    {/* User roles display */}
                    <div className="flex flex-wrap gap-2">
                      {userRoles.map((roleLabel) => (
                        <Badge key={roleLabel} variant="default" className="text-xs">
                          {roleLabel}
                        </Badge>
                      ))}
                    </div>

                    {/* Geographic scope */}
                    {scopeFromMetadata.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {scopeFromMetadata.map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* System Overview - Only for Operational Roles (not pure admin) */}
            {((isVerifier || isRegistrar) && !isAdmin) && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:narAddresses')}</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{unifiedStats.totalNARAddresses}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('dashboard:nationalRegistry')}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-secondary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:carAddresses')}</CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{unifiedStats.totalCARAddresses}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('dashboard:citizenAddresses')}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:pendingVerifications')}</CardTitle>
                      <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600">{unifiedStats.pendingCARVerifications + unifiedStats.pendingResidencyVerifications}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('dashboard:requiresReview')}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:integrationStatus')}</CardTitle>
                      <Network className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600">{t('dashboard:active')}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('dashboard:narCarSync')}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Integration Status Alert */}
                <Alert>
                  <Network className="h-4 w-4" />
                  <AlertDescription>
                    {t('dashboard:integrationDescription')}
                  </AlertDescription>
                </Alert>
              </>
            )}

            {/* Admin Quick Access - Pure Admin Functions Only */}
            {(isAdmin || hasNDAAAccess) && (
              <Card className="shadow-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('dashboard:adminFunctions')}
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard:systemAdministration')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Settings className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{t('dashboard:adminPanel')}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('dashboard:manageUsersPermissions')}
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setActiveView('admin-panel')}
                          variant="outline"
                          size="sm"
                        >
                          {t('common:buttons.open')}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Network className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{t('dashboard:systemIntegration')}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('dashboard:apiWebhooks')}
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setActiveView('integration')}
                          variant="outline"
                          size="sm"
                        >
                          {t('common:buttons.open')}
                        </Button>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t('dashboard:adminOnlyNote')}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Citizen Quick Actions */}
            {isCitizen && (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle className="text-lg">{t('dashboard:quickActions')}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t('dashboard:selectActionBelow')}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto min-h-[100px] flex flex-col items-center justify-center gap-2 p-4 hover:bg-primary/5"
                    onClick={() => setActiveView('unified-address-request')}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">{t('dashboard:registerAddress')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t('dashboard:registerResidentialBusiness')}</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto min-h-[100px] flex flex-col items-center justify-center gap-2 p-4 hover:bg-primary/5"
                    onClick={() => setActiveView('address-search')}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">{t('dashboard:addressSearch')}</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto min-h-[100px] flex flex-col items-center justify-center gap-2 p-4 hover:bg-primary/5"
                    onClick={() => setActiveView('citizen-address-portal')}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">{t('dashboard:myAddresses')}</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto min-h-[100px] flex flex-col items-center justify-center gap-2 p-4 hover:bg-primary/5"
                    onClick={() => setActiveView('emergency-contacts')}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">{t('dashboard:emergencyContacts')}</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto min-h-[100px] flex flex-col items-center justify-center gap-2 p-4 hover:bg-primary/5"
                    onClick={() => setActiveView('my-deliveries')}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">{t('dashboard:myDeliveries')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t('dashboard:myDeliveriesDesc')}</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            )}

            {isCarAdmin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:confirmedAddresses')}</CardTitle>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600">{unifiedStats.totalCARAddresses}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('dashboard:verifiedCitizen')}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:pendingAddresses')}</CardTitle>
                      <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600">{unifiedStats.pendingCARVerifications}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('dashboard:awaitingYourReview')}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:residencyVerifications')}</CardTitle>
                      <Shield className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{unifiedStats.pendingResidencyVerifications}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('dashboard:pendingDocuments')}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard:workloadStatus')}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{t('dashboard:active')}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('dashboard:carVerifierOnDuty')}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* CAR Verifier Actions */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    {t('dashboard:carVerifierActions')}
                  </AlertDescription>
                </Alert>
              </>
            )}

            {/* Address Search Section - Only for operational roles, not pure admin */}
            {!isAdmin && !hasNDAAAccess && (
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
                        <UniversalDashboardLocationMap 
                          searchedAddress={selectedAddress}
                          onAddressSearched={setSelectedAddress}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Directory */}
                  <Card className="shadow-card w-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building2 className="h-5 w-5" />
                        {t('business:directory.title', { defaultValue: 'Business Directory' })}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {t('business:directory.description', { defaultValue: 'Find registered businesses and services' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <BusinessDirectory />
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
                      <div className="space-y-3">
                        <Button 
                          onClick={() => setActiveView('recent-searches')}
                          className="w-full justify-start gap-2 h-auto py-3"
                          variant="outline"
                        >
                          <Search className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">{t('dashboard:recentSearches')}</div>
                            <div className="text-xs text-muted-foreground">{t('dashboard:recentSearchesDesc')}</div>
                          </div>
                        </Button>
                        
                        <Button 
                          onClick={() => setActiveView('saved-addresses')}
                          className="w-full justify-start gap-2 h-auto py-3"
                          variant="outline"
                        >
                          <MapPin className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">{t('dashboard:savedAddresses')}</div>
                            <div className="text-xs text-muted-foreground">{t('dashboard:savedAddressesDesc')}</div>
                          </div>
                        </Button>
                        
                        <Button 
                          onClick={() => setActiveView('address-data')}
                          className="w-full justify-start gap-2 h-auto py-3"
                          variant="outline"
                        >
                          <FileCheck className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">{t('dashboard:exportData')}</div>
                            <div className="text-xs text-muted-foreground">{t('dashboard:exportDataDesc')}</div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

          </div>
        );

      case 'address-search':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:addressSearch')}</h2>
                <p className="text-muted-foreground">{t('dashboard:searchNationalRegistry')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:narPublicAccess')}</Badge>
            </div>
            <AddressSearch onRegisterAddress={() => setActiveView('unified-address-request')} />
          </div>
        );

      case 'address-data':
        return (
          <div className="max-w-6xl">
            <AddressDataManager />
          </div>
        );



      case 'submit-request':
      case 'unified-address-request':
        return (
          <div className="max-w-4xl">
            <UnifiedAddressRequestFlow
              initialMode="citizen"
              onComplete={() => setActiveView('overview')}
              onCancel={() => setActiveView('overview')}
            />
          </div>
        );

      case 'request-status':
      case 'my-address-requests':
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

      case 'field-drafts':
        return (
          <div className="max-w-6xl">
            <DraftManager />
          </div>
        );

      case 'field-map':
        return (
          <div className="max-w-7xl">
            <UniversalFieldMap />
          </div>
        );

      case 'verification-queue':
        return (
          <div className="max-w-6xl">
            <AddressVerificationQueue />
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

      case 'recent-searches':
        return (
          <div className="max-w-6xl">
            <RecentSearchesManager 
              onSearchSelect={(query) => {
                setActiveView('address-search');
                // Here you could pass the query to the search component
              }}
            />
          </div>
        );

      case 'saved-addresses':
        return (
          <div className="max-w-6xl">
            <SavedLocationsManager />
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-4xl space-y-6">
            <ProfileEditor />
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.dispatchEvent(new Event('show-onboarding'))}
                className="gap-2 text-muted-foreground"
              >
                <Sparkles className="h-4 w-4" />
                Show Tour Again
              </Button>
            </div>
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

      case 'my-deliveries':
        return (
          <div className="max-w-6xl">
            <CitizenDeliveriesView />
          </div>
        );

      case 'citizen-address-portal':
        return (
          <div className="max-w-6xl">
            <CitizenAddressPortal onNavigateToRegister={() => setActiveView('unified-address-request')} />
          </div>
        );


      case 'residency-verification':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:residencyVerification')}</h2>
                <p className="text-muted-foreground">{t('dashboard:manageResidencyVerifications')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:carVerifier')}</Badge>
            </div>
            <ResidencyVerificationManager />
          </div>
        );


      case 'car-admin':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:carAdministration')}</h2>
                <p className="text-muted-foreground">{t('dashboard:manageCitizenAddressRepository')}</p>
              </div>
              <Badge variant="outline">{t('dashboard:carAdmin')}</Badge>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">{t('dashboard:overview')}</TabsTrigger>
                <TabsTrigger value="verification">{t('dashboard:residencyVerification')}</TabsTrigger>
                <TabsTrigger value="quality">{t('dashboard:qualityMetrics')}</TabsTrigger>
                <TabsTrigger value="operations">{t('dashboard:bulkOperations')}</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <CARAdministrativeOverview />
              </TabsContent>
              <TabsContent value="verification">
                <ResidencyVerificationManager />
              </TabsContent>
              <TabsContent value="quality">
                <CARQualityMetrics />
              </TabsContent>
              <TabsContent value="operations">
                <CARBulkOperations />
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'car-analytics':
        // Redirect to car-admin for consolidated interface
        setActiveView('car-admin');
        return null;

      case 'admin-panel':
        return (
          <div className="max-w-6xl space-y-6">
            <AdminPanel />
          </div>
        );

      case 'integration':
        return (
          <div className="max-w-7xl">
            <SystemIntegration />
          </div>
        );

      case 'registrar-dashboard':
        return (
          <div className="max-w-7xl">
            <RegistrarDashboardView />
          </div>
        );

      case 'nar-authority-dashboard':
        return (
          <div className="max-w-7xl">
            <NARAuthorityDashboard />
          </div>
        );

      case 'request-pickup':
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:requestPickup')}</h2>
                <p className="text-muted-foreground">{t('dashboard:requestPickupDescription')}</p>
              </div>
              <Badge variant="outline">
                <Package className="h-3 w-3 mr-1" />
                {t('common:postal')}
              </Badge>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {t('dashboard:schedulePickup')}
                </CardTitle>
                <CardDescription>{t('dashboard:schedulePickupDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setPickupRequestOpen(true)}>
                  <Package className="h-4 w-4 mr-2" />
                  {t('dashboard:createPickupRequest')}
                </Button>
              </CardContent>
            </Card>
            
            {pickupRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard:myPickupRequests')}</CardTitle>
                  <CardDescription>{t('dashboard:myPickupRequestsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pickupRequests.map((request) => (
                      <CitizenPickupRequestCard
                        key={request.id}
                        request={request}
                        onCancel={cancelRequest}
                        onUpdate={updateRequest}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'delivery-preferences':
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard:deliveryPreferences')}</h2>
                <p className="text-muted-foreground">{t('dashboard:deliveryPreferencesDescription')}</p>
              </div>
              <Badge variant="outline">
                <Settings className="h-3 w-3 mr-1" />
                {t('common:preferences')}
              </Badge>
            </div>
            
            {addressesLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    {t('common:loading')}...
                  </p>
                </CardContent>
              </Card>
            ) : citizenAddressDetails.length > 0 ? (
              <div className="grid gap-4">
                {citizenAddressDetails.map((address) => (
                  <Card key={address.uac}>
                    <CardHeader>
                      <CardTitle className="text-lg">{address.street}</CardTitle>
                      <CardDescription>{address.city} - UAC: {address.uac}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedAddressForPrefs(address.uac);
                          setDeliveryPreferencesOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {t('dashboard:managePreferences')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    {t('dashboard:noAddressesForPreferences')}
                  </p>
                </CardContent>
              </Card>
            )}
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
      <div className="min-h-screen w-full flex bg-background overflow-x-hidden">
        <DashboardSidebar 
          onNavigationClick={handleSidebarNavigation}
          pendingCount={stats.pendingApprovals}
          activeItemId={activeView}
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 py-2 gap-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold leading-tight whitespace-nowrap truncate">{getViewTitle()}</h1>
                  
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <NotificationCenter />
                <OfflineSyncQueue />
                <ThemeToggle />
                <div className="hidden sm:block">
                  <LanguageSwitcher />
                </div>
                <OfflineIndicator />
                {userProfile && (
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium whitespace-nowrap">{userProfile.full_name}</p>
                    <div className="flex gap-1 justify-end">
                      {userRoles.slice(0, 2).map((roleLabel, index) => (
                        <Badge key={`${roleLabel}-${index}`} variant="secondary" className="text-xs">
                          {String(roleLabel)}
                        </Badge>
                      ))}
                      {userRoles.length > 2 && <Badge variant="secondary" className="text-xs">+{userRoles.length - 2}</Badge>}
                    </div>
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={signOut} 
                  className="flex items-center gap-1 shrink-0"
                  aria-label={t('navigation.logout', { ns: 'common' })}
                  title={t('navigation.logout', { ns: 'common' })}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline text-xs">{t('navigation.logout', { ns: 'common' })}</span>
                </Button>
              </div>
            </div>
            <div className="border-b"></div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="p-4 sm:p-6 max-w-full">
              {renderActiveView()}
            </div>
          </main>
        </div>

        {/* Pickup Request Dialog */}
        <PickupRequestForm 
          open={pickupRequestOpen} 
          onClose={() => {
            setPickupRequestOpen(false);
            fetchPickupRequests();
          }}
        />

        {/* Delivery Preferences Dialog */}
        <DeliveryPreferencesForm 
          open={deliveryPreferencesOpen} 
          onClose={() => setDeliveryPreferencesOpen(false)}
          addressUac={selectedAddressForPrefs}
        />

        {/* Onboarding Walkthrough */}
        <OnboardingWalkthrough onNavigate={handleSidebarNavigation} />

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      </div>
    </SidebarProvider>
  );
};

export default UnifiedDashboard;