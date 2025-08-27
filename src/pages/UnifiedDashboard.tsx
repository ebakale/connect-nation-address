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
    isPoliceRole
  } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect police roles to dedicated dashboard if they land here
  useEffect(() => {
    if (!loading && isPoliceRole) {
      navigate('/police', { replace: true });
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

  // Dialog states
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [submitRequestOpen, setSubmitRequestOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [verificationQueueOpen, setVerificationQueueOpen] = useState(false);
  const [publishingQueueOpen, setPublishingQueueOpen] = useState(false);
  const [unpublishingQueueOpen, setUnpublishingQueueOpen] = useState(false);
  const [showProvinceManagement, setShowProvinceManagement] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showVerificationTools, setShowVerificationTools] = useState(false);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('dashboard')}</h1>
              <p className="text-muted-foreground">{t('unifiedPortal')}</p>
              
              {/* User greeting */}
              {userProfile && (
                <p className="text-lg font-medium text-foreground mt-2">
                  {t('welcomeBack')}, {userProfile.full_name}!
                </p>
              )}
              
              {/* User roles display */}
              <div className="flex gap-2 mt-3">
                {userRoles.map((roleLabel) => (
                  <Badge key={roleLabel} variant="default">
                    {roleLabel}
                  </Badge>
                ))}
              </div>

              {/* Geographic scope */}
              {geographicScope.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {geographicScope.map((scope) => (
                    <Badge key={scope} variant="secondary">
                      {scope}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              
              <Button 
                variant="outline" 
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {t('editProfile')}
              </Button>
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        {/* Admin Metrics */}
        {hasAdminAccess && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('systemOverview')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">{t('clickToManageUsers')}</p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('userManagement')}</DialogTitle>
                    <DialogDescription>
                      {t('viewManageUsers')}
                    </DialogDescription>
                  </DialogHeader>
                  <AdminPanel />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('activeRoles')}</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeRoles}</div>
                      <p className="text-xs text-muted-foreground">{t('clickToManageRoles')}</p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('roleManagement')}</DialogTitle>
                    <DialogDescription>
                      {t('viewManageRoles')}
                    </DialogDescription>
                  </DialogHeader>
                  <AdminPanel />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('pendingApprovals')}</CardTitle>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                      <p className="text-xs text-muted-foreground">{t('clickToApproveRequests')}</p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('addressRequestApprovals')}</DialogTitle>
                    <DialogDescription>
                      {t('reviewApproveCitizen')}
                    </DialogDescription>
                  </DialogHeader>
                <AddressRequestApproval requests={[]} onUpdate={() => {}} />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('publicAddresses')}</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.publicAddresses}</div>
                      <p className="text-xs text-muted-foreground">{t('clickToViewAddresses')} ({stats.totalAddresses} {t('total')})</p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('addressAnalytics')}</DialogTitle>
                    <DialogDescription>
                      {t('viewDetailedStats')}
                    </DialogDescription>
                  </DialogHeader>
                  <AnalyticsReports />
                </DialogContent>
              </Dialog>
            </div>

            {/* System Documentation Card */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  System Documentation
                </CardTitle>
                <CardDescription>
                  Generate comprehensive documentation for system roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This document provides detailed explanations of all user roles in the National Digital Addressing Authority system, 
                    including their permissions, geographic scope, workflow stages, and specific responsibilities.
                  </p>
                  <RolesDocumentGenerator />
                  <SystemManualPDF />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Role-based Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Citizen Functions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Addresses
              </CardTitle>
              <CardDescription>
                Find verified addresses in the national database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Search Database
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Search Verified Addresses</DialogTitle>
                    <DialogDescription>
                      Search for verified addresses in the national database
                    </DialogDescription>
                  </DialogHeader>
                  <AddressSearch 
                    onSelectAddress={(address) => {
                      setSelectedAddress(address);
                      setSearchOpen(false);
                      setShowMapView(true);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Submit Request
              </CardTitle>
              <CardDescription>
                Submit a new address registration request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setSubmitRequestOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Address Status
              </CardTitle>
              <CardDescription>
                Track the status of your submitted requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setStatusOpen(true)}>
                <Clock className="mr-2 h-4 w-4" />
                Check Status
              </Button>
            </CardContent>
          </Card>

          {/* Field Agent Functions */}
          {canCreateDraftAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Capture New Address
                </CardTitle>
                <CardDescription>
                  Create a new draft address with photo evidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={captureOpen} onOpenChange={setCaptureOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Start Capture
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Capture New Address</DialogTitle>
                      <DialogDescription>
                        Fill in the address details and capture GPS coordinates for verification
                      </DialogDescription>
                    </DialogHeader>
                    <AddressCaptureForm 
                      onSave={() => setCaptureOpen(false)}
                      onCancel={() => setCaptureOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {isFieldAgent && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    My Drafts
                  </CardTitle>
                  <CardDescription>
                    Review and submit pending address drafts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={draftsOpen} onOpenChange={setDraftsOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        View Drafts
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Draft Management</DialogTitle>
                        <DialogDescription>
                          Review, edit, and submit your draft addresses
                        </DialogDescription>
                      </DialogHeader>
                      <DraftManager onClose={() => setDraftsOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    Field Map
                  </CardTitle>
                  <CardDescription>
                    View assigned areas and capture progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        Open Map
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Field Map</DialogTitle>
                        <DialogDescription>
                          View addresses and capture progress in your assigned area
                        </DialogDescription>
                      </DialogHeader>
                      <FieldMap onClose={() => setMapOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </>
          )}

          {/* Verifier Functions */}
          {canVerifyAddresses && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Review Queue
                  </CardTitle>
                  <CardDescription>
                    Process pending address submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={verificationQueueOpen} onOpenChange={setVerificationQueueOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Start Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Address Verification Queue</DialogTitle>
                        <DialogDescription>
                          Review and verify pending address submissions
                        </DialogDescription>
                      </DialogHeader>
                      <AddressVerificationQueue />
                    </DialogContent>
                  </Dialog>
                </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <FileText className="h-5 w-5 text-blue-500" />
                     Address Requests
                   </CardTitle>
                   <CardDescription>
                     Approve or reject citizen address requests
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   <Button className="w-full" onClick={() => setShowPendingRequests(true)}>
                     Review Requests
                   </Button>
                 </CardContent>
               </Card>

               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Verification Tools
                  </CardTitle>
                  <CardDescription>
                    Access verification and quality control tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" onClick={() => setShowVerificationTools(true)}>
                    Open Tools
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Registrar Functions */}
          {canPublishAddresses && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Publishing Queue
                  </CardTitle>
                  <CardDescription>
                    Review and publish verified addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={publishingQueueOpen} onOpenChange={setPublishingQueueOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Publish Addresses
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Address Publishing Queue</DialogTitle>
                        <DialogDescription>
                          Publish verified addresses to the national registry
                        </DialogDescription>
                      </DialogHeader>
                      <AddressPublishingQueue />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-orange-500" />
                    Published Addresses
                  </CardTitle>
                  <CardDescription>
                    Manage addresses in public registry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={unpublishingQueueOpen} onOpenChange={setUnpublishingQueueOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        Manage Published
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Published Addresses</DialogTitle>
                        <DialogDescription>
                          Remove addresses from the public registry
                        </DialogDescription>
                      </DialogHeader>
                      <AddressUnpublishingQueue />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Province Management
                  </CardTitle>
                  <CardDescription>
                    Manage provincial boundaries and hierarchy
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                   <Button className="w-full" variant="outline" onClick={() => setShowProvinceManagement(true)}>
                     Manage Province
                   </Button>
                 </CardContent>
              </Card>
            </>
          )}

          {/* Reports - Available to most roles */}
          {(isVerifier || isRegistrar || hasAdminAccess) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Reports & Analytics
                </CardTitle>
                <CardDescription>
                  View statistics and performance reports
                </CardDescription>
              </CardHeader>
               <CardContent>
                 <Button className="w-full" variant="outline" onClick={() => setShowAnalytics(true)}>
                   View Reports
                 </Button>
               </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Panel */}
        {hasAdminAccess && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">System Administration</h2>
            <AdminPanel />
          </div>
        )}

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-destructive" />
              {t('emergencyContacts')}
            </CardTitle>
            <CardDescription>
              {t('contactEmergencyServices')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmergencyContacts />
          </CardContent>
        </Card>

        {/* Important Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All address searches show verified addresses only</li>
                <li>• Personal information is protected and redacted</li>
                <li>• Coordinates are approximated for privacy</li>
                <li>• Submit requests for new address verification</li>
                {hasAdminAccess && <li>• Admin functions require elevated permissions</li>}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Submit Request Dialog */}
        <Dialog open={submitRequestOpen} onOpenChange={setSubmitRequestOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Address Request</DialogTitle>
            </DialogHeader>
            <AddressRequestForm 
              onCancel={() => setSubmitRequestOpen(false)}
              onSuccess={() => setSubmitRequestOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Status Dialog */}
        <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Address Request Status</DialogTitle>
            </DialogHeader>
            <AddressRequestStatus />
           </DialogContent>
         </Dialog>

         {/* Publishing Queue Dialog */}
         <Dialog open={publishingQueueOpen} onOpenChange={setPublishingQueueOpen}>
           <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Address Publishing Queue</DialogTitle>
               <DialogDescription>
                 Review and publish verified addresses to make them publicly accessible
               </DialogDescription>
             </DialogHeader>
             <AddressPublishingQueue />
           </DialogContent>
         </Dialog>

         {/* Province Management Dialog */}
         <Dialog open={showProvinceManagement} onOpenChange={setShowProvinceManagement}>
           <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Province Management</DialogTitle>
               <DialogDescription>
                 Manage administrative provinces and regions
               </DialogDescription>
             </DialogHeader>
             <ProvinceManagement />
           </DialogContent>
         </Dialog>

          {/* Analytics Dialog */}
          <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Reports & Analytics</DialogTitle>
                <DialogDescription>
                  View comprehensive reports and analytics
                </DialogDescription>
              </DialogHeader>
              <AnalyticsReports />
            </DialogContent>
          </Dialog>

          {/* Verification Tools Dialog */}
          <Dialog open={showVerificationTools} onOpenChange={setShowVerificationTools}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Verification Tools</DialogTitle>
                <DialogDescription>
                  Advanced tools for address verification and quality control
                </DialogDescription>
              </DialogHeader>
              <VerificationTools />
            </DialogContent>
           </Dialog>

           {/* Pending Requests Dialog */}
           <Dialog open={showPendingRequests} onOpenChange={setShowPendingRequests}>
             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle>Address Request Approval</DialogTitle>
                 <DialogDescription>
                   Review and approve pending address requests from citizens
                 </DialogDescription>
               </DialogHeader>
               <AddressRequestApproval requests={[]} onUpdate={() => {}} />
             </DialogContent>
           </Dialog>

         {/* Profile Editor Dialog */}
         <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Edit Profile</DialogTitle>
               <DialogDescription>
                 Update your personal information and account settings
               </DialogDescription>
             </DialogHeader>
             <ProfileEditor />
           </DialogContent>
         </Dialog>
        </div>
      </div>
    );
  };

export default UnifiedDashboard;