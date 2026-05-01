import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Search, FileText, Clock, LogOut, Phone, FileCheck,
  AlertCircle, User, Home, Settings, Users, Bell, Package, Truck,
  ArrowRight, Info, Plus, Building2, Shield, ChevronRight
} from "lucide-react";

// Hooks and Components
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { usePerson, useCitizenAddresses } from "@/hooks/useCAR";
import { useTranslation } from 'react-i18next';

// Components
import AddressSearch from "@/components/AddressSearch";
import AddressMapViewer from "@/components/AddressMapViewer";
import { AddressRequestForm } from "@/components/AddressRequestForm";
import { AddressRequestStatus } from "@/components/AddressRequestStatus";
import { ReporterNotifications } from "@/components/ReporterNotifications";
import { UserVerificationRequests } from "@/components/UserVerificationRequests";
import EmergencyContacts from "@/components/EmergencyContacts";
import Footer from '@/components/Footer';
import MobileHeader from '@/components/MobileHeader';

// CAR components
import { UnifiedAddressRequestFlow } from "@/components/UnifiedAddressRequestFlow";
import { SavedLocationsManager } from "@/components/SavedLocationsManager";
import { AddSecondaryAddressForm } from "@/components/AddSecondaryAddressForm";
import { AddressPrivacySettings } from "@/components/AddressPrivacySettings";
import { HouseholdManagement } from "@/components/HouseholdManagement";
import CitizenDeliveriesView from "@/components/citizen/CitizenDeliveriesView";
import { PickupRequestForm, DeliveryPreferencesForm } from "@/components/postal";
import { MapErrorBoundary } from "@/components/ErrorBoundary";
import { CitizenBusinessesTab } from "@/components/citizen/CitizenBusinessesTab";
import CitizenBottomNav, { type CitizenSection } from "@/components/citizen/CitizenBottomNav";

interface SearchResult {
  uac: string;
  readable: string;
  coordinates: { lat: number; lng: number };
  type: string;
  verified: boolean;
}

const CitizenPortalUnified = () => {
  const { user, isAuthenticated, signOut, signIn } = useUnifiedAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { t } = useTranslation();
  
  const { person } = usePerson();
  const { 
    primaryAddress, secondaryAddresses, 
    loading: carLoading, refetch: fetchAddresses 
  } = useCitizenAddresses();

  // Navigation state
  const [activeSection, setActiveSection] = useState<CitizenSection>('home');
  const [moreSubTab, setMoreSubTab] = useState('requests');
  
  // UI State
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [submitRequestOpen, setSubmitRequestOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [verificationRequestsOpen, setVerificationRequestsOpen] = useState(false);
  const [addressFlowOpen, setAddressFlowOpen] = useState(false);
  const [secondaryAddressFormOpen, setSecondaryAddressFormOpen] = useState(false);
  const [pickupRequestOpen, setPickupRequestOpen] = useState(false);
  const [deliveryPreferencesOpen, setDeliveryPreferencesOpen] = useState(false);
  const [selectedAddressForPrefs, setSelectedAddressForPrefs] = useState('');

  // Default section based on auth
  useEffect(() => {
    if (isAuthenticated) {
      setActiveSection('home');
    } else {
      setActiveSection('search');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (roleLoading || carLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/8 via-background to-secondary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">{t('common:buttons.loading')}</p>
        </div>
      </div>
    );
  }

  // Map view for selected address
  if (showMapView && selectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/8 via-background to-secondary/5">
        <MobileHeader
          title={selectedAddress.readable}
          onBack={() => { setShowMapView(false); setSelectedAddress(null); }}
          isAuthenticated={isAuthenticated}
          userName={user?.profile?.full_name || user?.email?.split('@')[0]}
          onSignOut={signOut}
        />
        <div className="p-4">
          <MapErrorBoundary>
            <AddressMapViewer
              address={selectedAddress}
              onBack={() => { setShowMapView(false); setSelectedAddress(null); }}
            />
          </MapErrorBoundary>
        </div>
      </div>
    );
  }

  const userName = user?.profile?.full_name || user?.email?.split('@')[0] || 'User';

  // Auth gate component for sections that require login
  const AuthGate = ({ section }: { section: string }) => (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-6 text-center space-y-3">
        <User className="h-8 w-8 text-primary mx-auto" />
        <p className="font-medium text-sm">{t('auth:loginRequired')}</p>
        <p className="text-xs text-muted-foreground">Sign in to access {section}.</p>
        <Button onClick={() => window.location.href = '/auth'} className="min-h-[44px]">
          <User className="h-4 w-4 mr-2" /> {t('auth:login')}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/8 via-background to-secondary/5 flex flex-col">
      {/* Compact Header */}
      <MobileHeader
        title="ConEG"
        subtitle={t('address:citizenPortal')}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onSignOut={signOut}
        onSignIn={() => window.location.href = '/auth'}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-4 sm:px-6 max-w-2xl mx-auto space-y-4">

          {/* ============ SEARCH ============ */}
          {activeSection === 'search' && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-4 w-4 text-primary" />
                    {t('address:searchAddresses')}
                  </CardTitle>
                  <CardDescription className="text-xs">{t('address:findVerifiedAddresses')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddressSearch
                    onSelectAddress={(address) => { setSelectedAddress(address); setShowMapView(true); }}
                    onRegisterAddress={() => {
                      if (isAuthenticated) { setAddressFlowOpen(true); }
                      else { window.location.href = '/auth'; }
                    }}
                  />
                </CardContent>
              </Card>

              {!isAuthenticated && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{t('auth:loginRequired')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sign in to manage your addresses and submit requests.
                        </p>
                        <Button onClick={() => window.location.href = '/auth'} className="mt-3 w-full min-h-[44px]">
                          <User className="h-4 w-4 mr-2" />
                          {t('auth:login')}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* ============ HOME (My Addresses) ============ */}
          {activeSection === 'home' && (
            isAuthenticated ? (
              <div className="space-y-4">
                {/* Primary Address */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Home className="h-4 w-4 text-primary" />
                      Primary Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {primaryAddress ? (
                      <div className="space-y-3">
                        {primaryAddress.street && (
                          <div className="bg-muted/30 p-3 rounded-lg text-sm">
                            <div className="font-medium flex items-center gap-1.5 mb-1">
                              <MapPin className="h-3.5 w-3.5 text-primary" /> Location
                            </div>
                            <div>{primaryAddress.street}</div>
                            {primaryAddress.building && <div>{primaryAddress.building}</div>}
                            <div>{primaryAddress.city}, {primaryAddress.region}</div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">UAC</span>
                            <Badge variant="outline" className="font-mono text-[10px]">{primaryAddress.uac}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={primaryAddress.status === 'CONFIRMED' ? 'default' : 'destructive'} className="text-[10px]">
                              {primaryAddress.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
                          <Home className="h-8 w-8 text-muted-foreground mx-auto" />
                          <p className="font-medium text-sm">No primary address set</p>
                          <p className="text-xs text-muted-foreground">Search the registry or submit a registration request.</p>
                        </div>
                        <Button className="w-full min-h-[44px]" onClick={() => setAddressFlowOpen(true)}>
                          <Search className="h-4 w-4 mr-2" />
                          Find or Register My Address
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Secondary Addresses */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-secondary" />
                        Secondary ({secondaryAddresses.length})
                      </CardTitle>
                      <Button variant="ghost" onClick={() => setSecondaryAddressFormOpen(true)} className="min-h-[44px] min-w-[44px] text-xs px-3">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </CardHeader>
                  {secondaryAddresses.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {secondaryAddresses.map((address) => (
                          <div key={address.id} className="p-3 border rounded-lg flex items-center justify-between gap-2 min-h-[48px]">
                            <div className="min-w-0">
                              <Badge variant="outline" className="font-mono text-[10px]">{address.uac}</Badge>
                              {address.street && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">{address.street}, {address.city}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-[10px] shrink-0">{address.address_kind}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Saved Locations */}
                <SavedLocationsManager />
              </div>
            ) : (
              <AuthGate section="your address dashboard" />
            )
          )}

          {/* ============ DELIVERIES ============ */}
          {activeSection === 'deliveries' && (
            isAuthenticated ? (
              <Tabs defaultValue="incoming">
                <TabsList className="w-full grid grid-cols-3 h-11">
                  <TabsTrigger value="incoming" className="text-xs min-h-[44px]">
                    <Package className="h-4 w-4 mr-1" /> Incoming
                  </TabsTrigger>
                  <TabsTrigger value="pickups" className="text-xs min-h-[44px]">
                    <Truck className="h-4 w-4 mr-1" /> Pickups
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="text-xs min-h-[44px]">
                    <Settings className="h-4 w-4 mr-1" /> Prefs
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="incoming" className="mt-3">
                  <CitizenDeliveriesView />
                </TabsContent>
                <TabsContent value="pickups" className="mt-3">
                  <Card>
                    <CardContent className="py-4">
                      <Button onClick={() => setPickupRequestOpen(true)} className="w-full min-h-[44px]">
                        <Truck className="h-4 w-4 mr-2" />
                        {t('postal:pickup.requestPickup', 'Request Pickup')}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="preferences" className="mt-3">
                  {primaryAddress ? (
                    <Card>
                      <CardContent className="py-4">
                        <Button
                          variant="outline"
                          className="w-full min-h-[44px]"
                          onClick={() => {
                            setSelectedAddressForPrefs(primaryAddress.uac);
                            setDeliveryPreferencesOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t('postal:preferences.title', 'Manage Preferences')}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-6 text-center space-y-2">
                        <Package className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground">Set a primary address first.</p>
                        <Button variant="outline" className="min-h-[44px]" onClick={() => setActiveSection('home')}>
                          <Home className="h-4 w-4 mr-2" /> Set Up Address
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <AuthGate section="deliveries" />
            )
          )}

          {/* ============ HOUSEHOLD ============ */}
          {activeSection === 'household' && (
            isAuthenticated ? (
              primaryAddress ? (
                <HouseholdManagement />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center space-y-3">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="font-medium text-sm">No primary address set</p>
                    <p className="text-xs text-muted-foreground">Set up your address first to manage household members.</p>
                    <Button className="min-h-[44px]" onClick={() => setActiveSection('home')}>
                      <Home className="h-4 w-4 mr-2" /> Set Up Address
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              <AuthGate section="household management" />
            )
          )}

          {/* ============ MORE (overflow menu) ============ */}
          {activeSection === 'more' && (
            <div className="space-y-4">
              {/* Quick-access grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'requests', icon: FileText, label: 'Requests' },
                  ...(isAuthenticated ? [
                    { id: 'businesses', icon: Building2, label: 'Businesses' },
                    { id: 'verification', icon: FileCheck, label: 'Verification' },
                    { id: 'notifications', icon: Bell, label: 'Alerts' },
                    { id: 'privacy', icon: Settings, label: 'Privacy' },
                  ] : []),
                  { id: 'emergency', icon: Phone, label: 'Emergency' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setMoreSubTab(item.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all min-h-[72px] ${
                      moreSubTab === item.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${
                      item.id === 'emergency' ? 'text-destructive' :
                      moreSubTab === item.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className={`text-[11px] font-medium ${moreSubTab === item.id ? 'text-primary' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Requests */}
              {moreSubTab === 'requests' && (
                <div className="space-y-3">
                  <Card className="overflow-hidden">
                    <button 
                      className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors min-h-[56px]"
                      onClick={() => setSubmitRequestOpen(true)}
                      disabled={!isAuthenticated}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium">{t('dashboard:submitRequest')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard:submitRequestDescription')}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  </Card>
                  <Card className="overflow-hidden">
                    <button 
                      className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors min-h-[56px]"
                      onClick={() => setStatusOpen(true)}
                      disabled={!isAuthenticated}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium">{t('dashboard:requestStatus')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard:requestStatusDescription')}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  </Card>
                </div>
              )}

              {/* Businesses */}
              {moreSubTab === 'businesses' && isAuthenticated && (
                <CitizenBusinessesTab onRequestNewBusiness={() => setAddressFlowOpen(true)} />
              )}

              {/* Verification */}
              {moreSubTab === 'verification' && isAuthenticated && (
                <Card>
                  <CardContent className="py-4">
                    <Button onClick={() => setVerificationRequestsOpen(true)} className="w-full min-h-[44px]">
                      <FileCheck className="h-4 w-4 mr-2" />
                      View My Verification Requests
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Notifications */}
              {moreSubTab === 'notifications' && isAuthenticated && (
                <ReporterNotifications />
              )}

              {/* Privacy */}
              {moreSubTab === 'privacy' && isAuthenticated && (
                <AddressPrivacySettings />
              )}

              {/* Emergency */}
              {moreSubTab === 'emergency' && (
                <div className="space-y-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base text-destructive">
                        <Phone className="h-4 w-4" />
                        {t('emergency:contacts')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EmergencyContacts />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>All searches return verified addresses only</li>
                          <li>Personal information is protected and secure</li>
                          <li>Coordinates are approximate for security</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Profile + Sign Out */}
              {isAuthenticated && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full min-h-[44px]" onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer - desktop only */}
        <div className="hidden lg:block">
          <Footer />
        </div>
      </main>

      {/* Bottom Navigation */}
      <CitizenBottomNav
        activeSection={activeSection}
        onNavigate={setActiveSection}
        isAuthenticated={isAuthenticated}
      />

      {/* ============ DIALOGS (full-screen on mobile) ============ */}
      <Dialog open={submitRequestOpen} onOpenChange={setSubmitRequestOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('dashboard:submitRequest')}</DialogTitle>
          </DialogHeader>
          <AddressRequestForm 
            onCancel={() => setSubmitRequestOpen(false)}
            onSuccess={() => setSubmitRequestOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('dashboard:requestStatus')}</DialogTitle>
          </DialogHeader>
          <AddressRequestStatus />
        </DialogContent>
      </Dialog>

      <Dialog open={verificationRequestsOpen} onOpenChange={setVerificationRequestsOpen}>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>My Verification Requests</DialogTitle>
          </DialogHeader>
          <UserVerificationRequests />
        </DialogContent>
      </Dialog>

      <Dialog open={addressFlowOpen} onOpenChange={setAddressFlowOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Find or Register Your Address
            </DialogTitle>
            <DialogDescription>
              Search the national registry for your address. If it's not there yet, you can submit a registration request.
            </DialogDescription>
          </DialogHeader>
          <UnifiedAddressRequestFlow
            initialMode="citizen"
            onComplete={() => { setAddressFlowOpen(false); fetchAddresses(); }}
            onCancel={() => setAddressFlowOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={secondaryAddressFormOpen} onOpenChange={setSecondaryAddressFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Secondary Address</DialogTitle>
            <DialogDescription>Add an additional address (work, temporary residence, etc.)</DialogDescription>
          </DialogHeader>
          <AddSecondaryAddressForm 
            onSuccess={() => { setSecondaryAddressFormOpen(false); fetchAddresses(); }}
          />
          <Button variant="outline" onClick={() => setSecondaryAddressFormOpen(false)} className="w-full mt-2 min-h-[44px]">
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      <PickupRequestForm open={pickupRequestOpen} onClose={() => setPickupRequestOpen(false)} />
      <DeliveryPreferencesForm open={deliveryPreferencesOpen} onClose={() => setDeliveryPreferencesOpen(false)} addressUac={selectedAddressForPrefs} />
    </div>
  );
};

export default CitizenPortalUnified;
