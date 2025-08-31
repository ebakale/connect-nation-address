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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="mb-12 relative z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-6">
              {/* Main Title */}
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent animate-fade-in">
                  {t('dashboard')}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 font-medium animate-fade-in delay-100">
                  {t('unifiedPortal')}
                </p>
              </div>
              
              {/* User greeting with enhanced styling */}
              {userProfile && (
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in delay-200">
                  <p className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    {t('welcomeBack')}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{userProfile.full_name}</span>!
                  </p>
                  
                  {/* User roles with enhanced badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {userRoles.map((roleLabel, index) => (
                      <div key={roleLabel} className={`animate-scale-in delay-${(index + 1) * 100}`}>
                        <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <Shield className="h-3 w-3 mr-1" />
                          {roleLabel}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Geographic scope with enhanced styling */}
                  {geographicScope.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {geographicScope.map((scope, index) => (
                        <div key={scope} className={`animate-fade-in delay-${(index + 1) * 150}`}>
                          <Badge variant="secondary" className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 hover:shadow-md transition-all duration-300">
                            <MapPin className="h-3 w-3 mr-1" />
                            {scope}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons with enhanced styling */}
            <div className="flex gap-3 animate-fade-in delay-300">
              <OfflineIndicator />
              <Button 
                variant="outline" 
                onClick={() => setProfileOpen(true)}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <User className="h-4 w-4 mr-2" />
                {t('editProfile')}
              </Button>
              <Button 
                variant="outline" 
                onClick={signOut} 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Admin Metrics */}
        {hasAdminAccess && (
          <div className="mb-12 relative z-10 animate-fade-in delay-400">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('systemOverview')}</h2>
              <p className="text-slate-600 dark:text-slate-300">Monitor key metrics and system performance</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="group animate-scale-in delay-500">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">{t('totalUsers')}</CardTitle>
                    <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-300">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{stats.totalUsers}</div>
                    <p className="text-xs text-blue-600/70 dark:text-blue-300/70 font-medium">Active system users</p>
                  </CardContent>
                </Card>
              </div>

              <div className="group animate-scale-in delay-600">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{t('activeRoles')}</CardTitle>
                    <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/20 rounded-lg group-hover:bg-emerald-500/20 transition-colors duration-300">
                      <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">{stats.activeRoles}</div>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-300/70 font-medium">Assigned roles</p>
                  </CardContent>
                </Card>
              </div>

              <div className="group animate-scale-in delay-700">
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200/50 dark:border-amber-800/50 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">{t('pendingApprovals')}</CardTitle>
                    <div className="p-2 bg-amber-500/10 dark:bg-amber-400/20 rounded-lg group-hover:bg-amber-500/20 transition-colors duration-300">
                      <Settings className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">{stats.pendingApprovals}</div>
                    <p className="text-xs text-amber-600/70 dark:text-amber-300/70 font-medium">Awaiting review</p>
                  </CardContent>
                </Card>
              </div>

              <div className="group animate-scale-in delay-800">
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200/50 dark:border-purple-800/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">{t('publicAddresses')}</CardTitle>
                    <div className="p-2 bg-purple-500/10 dark:bg-purple-400/20 rounded-lg group-hover:bg-purple-500/20 transition-colors duration-300">
                      <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">{stats.publicAddresses}</div>
                    <p className="text-xs text-purple-600/70 dark:text-purple-300/70 font-medium">{stats.totalAddresses} total addresses</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Enhanced Admin Panel */}
            <div className="animate-fade-in delay-900">
              <AdminPanel />
            </div>
          </div>
        )}

        {/* Enhanced Role-based Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 animate-fade-in delay-1000">
          
          {/* Enhanced Citizen Functions */}
          <div className="group animate-scale-in delay-1100">
            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-500/10 dark:bg-blue-400/20 rounded-xl group-hover:bg-blue-500/20 transition-colors duration-300">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-semibold">
                    Search Addresses
                  </span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Find verified addresses in the national database with advanced search capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <Search className="h-4 w-4 mr-2" />
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
          </div>

          {/* Submit Request Card */}
          <div className="group animate-scale-in delay-1200">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900 dark:to-teal-900 border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/20 rounded-xl group-hover:bg-emerald-500/20 transition-colors duration-300">
                    <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-semibold">
                    Submit Request
                  </span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Submit a new address registration request with photo documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                  onClick={() => setSubmitRequestOpen(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Address Status Card */}
          <div className="group animate-scale-in delay-1300">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 border-amber-200/50 dark:border-amber-700/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-amber-500/10 dark:bg-amber-400/20 rounded-xl group-hover:bg-amber-500/20 transition-colors duration-300">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-semibold">
                    Address Status
                  </span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Track the status of your submitted requests and view progress
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                  onClick={() => setStatusOpen(true)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Check Status
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contacts */}
          <div className="group animate-scale-in delay-1400">
            <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 border-red-200/50 dark:border-red-700/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-red-500/10 dark:bg-red-400/20 rounded-xl group-hover:bg-red-500/20 transition-colors duration-300">
                    <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-semibold">
                    Emergency Contacts
                  </span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Get immediate help when you need it most - Police and Emergency Services
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <EmergencyContacts />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        <div>
          {/* Submit Request Dialog */}
          <Dialog open={submitRequestOpen} onOpenChange={setSubmitRequestOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Address Request</DialogTitle>
                <DialogDescription>
                  Submit a new address for verification and registration
                </DialogDescription>
              </DialogHeader>
              <AddressRequestForm />
            </DialogContent>
          </Dialog>

          {/* Status Dialog */}
          <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Address Request Status</DialogTitle>
                <DialogDescription>
                  Check the status of your submitted address requests
                </DialogDescription>
              </DialogHeader>
              <AddressRequestStatus />
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
        
        {/* Enhanced Footer */}
        <footer className="relative z-10 mt-16 animate-fade-in delay-1200">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-white/20 dark:border-slate-700/50 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <img 
                    src="/lovable-uploads/ff1703fb-c7ab-498c-8bb5-931d66522fba.png" 
                    alt="BIAKAM Logo" 
                    className="h-8 w-auto" 
                  />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                {t('copyrightBiakam')}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('footerDescription')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default UnifiedDashboard;