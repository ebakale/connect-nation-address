import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Search, FileText, Clock, LogOut, Phone, FileCheck,
  AlertCircle, User, Home, Settings, Users, Bell, Package, Truck,
  ArrowRight, Info, Plus
} from "lucide-react";

// Hooks and Components
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { usePerson, useCitizenAddresses } from "@/hooks/useCAR";
import { useTranslation } from 'react-i18next';

// Components from unified dashboard (maintaining these for duplicates)
import AddressSearch from "@/components/AddressSearch";
import AddressMapViewer from "@/components/AddressMapViewer";
import { AddressRequestForm } from "@/components/AddressRequestForm";
import { AddressRequestStatus } from "@/components/AddressRequestStatus";
import { ReporterNotifications } from "@/components/ReporterNotifications";
import { UserVerificationRequests } from "@/components/UserVerificationRequests";
import EmergencyContacts from "@/components/EmergencyContacts";
import Footer from '@/components/Footer';

// CAR components for personal address management
import { UnifiedAddressRequestFlow } from "@/components/UnifiedAddressRequestFlow";
import { SavedLocationsManager } from "@/components/SavedLocationsManager";
import { AddSecondaryAddressForm } from "@/components/AddSecondaryAddressForm";
import { AddressPrivacySettings } from "@/components/AddressPrivacySettings";
import { HouseholdManagement } from "@/components/HouseholdManagement";
import CitizenDeliveriesView from "@/components/citizen/CitizenDeliveriesView";
import { PickupRequestForm, DeliveryPreferencesForm } from "@/components/postal";
import { MapErrorBoundary } from "@/components/ErrorBoundary";
import { CitizenBusinessesTab } from "@/components/citizen/CitizenBusinessesTab";

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

const CitizenPortalUnified = () => {
  const { user, isAuthenticated, signOut, signIn } = useUnifiedAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { t } = useTranslation();
  
  // CAR-specific hooks and state (only when authenticated)
  const { person } = usePerson();
  const { 
    primaryAddress, 
    secondaryAddresses, 
    loading: carLoading,
    refetch: fetchAddresses 
  } = useCitizenAddresses();

  // UI State
  const [activeTab, setActiveTab] = useState('public');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [submitRequestOpen, setSubmitRequestOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [verificationRequestsOpen, setVerificationRequestsOpen] = useState(false);
  const [addressFlowOpen, setAddressFlowOpen] = useState(false);
  const [secondaryAddressFormOpen, setSecondaryAddressFormOpen] = useState(false);
  const [pickupRequestOpen, setPickupRequestOpen] = useState(false);
  const [deliveryPreferencesOpen, setDeliveryPreferencesOpen] = useState(false);
  const [selectedAddressForPrefs, setSelectedAddressForPrefs] = useState<string>('');

  // Set default tab to 'addresses' for authenticated users on initial load only
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('addresses');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // CAR data is automatically fetched by the useCitizenAddresses hook
  // No need for a manual refetch here - it caused infinite loops

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

  // If showing map view for selected address
  if (showMapView && selectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/8 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <MapErrorBoundary>
            <AddressMapViewer
              address={selectedAddress}
              onBack={() => {
                setShowMapView(false);
                setSelectedAddress(null);
              }}
            />
          </MapErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/8 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('address:citizenPortal')}
              </h1>
              <p className="text-muted-foreground">
                {isAuthenticated 
                  ? t('dashboard:welcomeMessage') 
                  : t('address:searchVerifiedAddresses')
                }
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {isAuthenticated ? (
                <>
                  {user?.profile?.full_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                      <User className="h-4 w-4" />
                      <span>{user.profile.full_name}</span>
                    </div>
                  )}
                  <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    {t('auth:logout')}
                  </Button>
                </>
              ) : (
                <Button onClick={() => window.location.href = '/auth'} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('auth:login')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-3 lg:grid-cols-4 h-auto p-1 gap-1">
              <TabsTrigger value="public" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                <Search className="h-4 w-4 shrink-0" />
                <span>Search</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                <FileText className="h-4 w-4 shrink-0" />
                <span>Requests</span>
              </TabsTrigger>
              {isAuthenticated && (
                <>
                  <TabsTrigger value="addresses" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                    <Home className="h-4 w-4 shrink-0" />
                    <span>My Addresses</span>
                  </TabsTrigger>
                  <TabsTrigger value="household" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Household</span>
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>Saved</span>
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                    <FileCheck className="h-4 w-4 shrink-0" />
                    <span>Verification</span>
                  </TabsTrigger>
                  <TabsTrigger value="deliveries" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                    <Package className="h-4 w-4 shrink-0" />
                    <span>Deliveries</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                    <Settings className="h-4 w-4 shrink-0" />
                    <span>Privacy</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap">
                    <Bell className="h-4 w-4 shrink-0" />
                    <span>Alerts</span>
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="emergency" className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap text-destructive data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>Emergency</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Public Search Tab */}
          <TabsContent value="public" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  {t('address:searchAddresses')}
                </CardTitle>
                <CardDescription>{t('address:findVerifiedAddresses')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddressSearch
                  onSelectAddress={(address) => {
                    setSelectedAddress(address);
                    setShowMapView(true);
                  }}
                  onRegisterAddress={() => {
                    if (isAuthenticated) {
                      setAddressFlowOpen(true);
                    } else {
                      window.location.href = '/auth';
                    }
                  }}
                />
              </CardContent>
            </Card>

            {!isAuthenticated && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5 text-primary" />
                    {t('auth:loginRequired')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Sign in to manage your personal address, submit registration requests, and track verification status.
                  </p>
                  <Button onClick={() => window.location.href = '/auth'} className="w-full sm:w-auto">
                    <User className="h-4 w-4 mr-2" />
                    {t('auth:login')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    {t('dashboard:submitRequest')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('dashboard:submitRequestDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => setSubmitRequestOpen(true)}
                    disabled={!isAuthenticated}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t('dashboard:newRequest')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    {t('dashboard:requestStatus')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('dashboard:requestStatusDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => setStatusOpen(true)}
                    disabled={!isAuthenticated}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {t('dashboard:checkStatus')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Addresses Tab (authenticated only) */}
          {isAuthenticated && (
            <TabsContent value="addresses" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      Primary Address
                    </CardTitle>
                    <CardDescription>
                      Your main residence address from the Citizen Address Repository
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {primaryAddress ? (
                      <div className="space-y-4">
                        {primaryAddress.street && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium text-sm flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-primary" /> Address Location
                              </div>
                              <div className="text-sm">
                                <div>{primaryAddress.street}</div>
                                {primaryAddress.building && <div>{primaryAddress.building}</div>}
                                <div>{primaryAddress.city}, {primaryAddress.region}</div>
                                <div>{primaryAddress.country}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">UAC</span>
                            <Badge variant="outline" className="font-mono text-xs">{primaryAddress.uac}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Type</span>
                            <Badge variant="secondary">{primaryAddress.address_kind}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Status</span>
                            <Badge variant={primaryAddress.status === 'CONFIRMED' ? 'default' : 'destructive'}>
                              {primaryAddress.status}
                            </Badge>
                          </div>
                          {primaryAddress.nar_verified !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">NAR Verified</span>
                              <Badge variant={primaryAddress.nar_verified ? 'default' : 'destructive'}>
                                {primaryAddress.nar_verified ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="pt-2 border-t space-y-1 text-sm text-muted-foreground">
                          <div><span className="font-medium text-foreground">Effective:</span> {primaryAddress.effective_from} – {primaryAddress.effective_to || 'ongoing'}</div>
                          {primaryAddress.address_description && (
                            <div><span className="font-medium text-foreground">Notes:</span> {primaryAddress.address_description}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Informative empty state explaining the two-step process */}
                        <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
                          <Home className="h-10 w-10 text-muted-foreground mx-auto" />
                          <div>
                            <p className="font-medium">No primary address set</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your primary address is your official residence on record.
                            </p>
                          </div>
                        </div>
                        {/* Two-step explanation */}
                        <div className="rounded-lg bg-muted/40 p-4 space-y-3 text-sm">
                          <p className="font-medium flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" /> How it works
                          </p>
                          <div className="space-y-2 text-muted-foreground">
                            <div className="flex items-start gap-2">
                              <span className="font-mono text-primary font-bold shrink-0">1.</span>
                              <span>Search the National Address Registry (NAR) for your home address.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-mono text-primary font-bold shrink-0">2a.</span>
                              <span>If your address is found — declare it as your primary residence.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-mono text-primary font-bold shrink-0">2b.</span>
                              <span>If your address is <strong>not</strong> in the registry yet — submit a registration request and we'll add it.</span>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full" onClick={() => setAddressFlowOpen(true)}>
                          <Search className="h-4 w-4 mr-2" />
                          Find or Register My Address
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Secondary Addresses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-secondary" />
                      Secondary Addresses ({secondaryAddresses.length})
                    </CardTitle>
                    <CardDescription>
                      Additional addresses (work, temporary, etc.)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {secondaryAddresses.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {secondaryAddresses.map((address) => (
                          <div key={address.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {address.uac}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {address.address_kind}
                              </Badge>
                            </div>
                            {address.street && (
                              <div className="text-sm text-muted-foreground">
                                {address.street}, {address.city}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">No secondary addresses</p>
                      </div>
                    )}
                    <Button 
                      onClick={() => setSecondaryAddressFormOpen(true)} 
                      className="w-full mt-4"
                      variant="outline"
                    >
                      Add Secondary Address
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Household Tab (authenticated only) */}
          {isAuthenticated && (
            <TabsContent value="household" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">My Household</h2>
                <p className="text-sm text-muted-foreground">
                  Manage the people who live at your primary address — family members, dependents, and residents.
                </p>
              </div>
              {primaryAddress ? (
                <HouseholdManagement />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center space-y-4">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto" />
                    <div>
                      <p className="font-medium">No primary address set</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You need a primary address before you can declare household members.
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab('addresses')}>
                      <Home className="h-4 w-4 mr-2" />
                      Set Up My Address First
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Saved Locations Tab (authenticated only) */}
          {isAuthenticated && (
            <TabsContent value="saved" className="space-y-6">
              <SavedLocationsManager />
            </TabsContent>
          )}

          {/* Verification Tab (authenticated only) */}
          {isAuthenticated && (
            <TabsContent value="verification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Residency Verification Requests
                  </CardTitle>
                  <CardDescription>
                    Manage your residency verification requests and upload supporting documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setVerificationRequestsOpen(true)} className="w-full">
                    <FileCheck className="mr-2 h-4 w-4" />
                    View My Verification Requests
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Notifications Tab (authenticated only) */}
          {isAuthenticated && (
            <TabsContent value="notifications" className="space-y-6">
              <ReporterNotifications />
            </TabsContent>
          )}

          {/* Privacy Settings Tab */}
          {isAuthenticated && (
            <TabsContent value="privacy" className="space-y-6">
              <AddressPrivacySettings />
            </TabsContent>
          )}

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-destructive" />
                    {t('emergency:contacts')}
                  </CardTitle>
                  <CardDescription>
                    {t('emergency:contactEmergencyServices')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmergencyContacts />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    {t('common:importantInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>All searches return verified addresses only</li>
                    <li>Personal information is protected and secure</li>
                    <li>Coordinates are approximate for security</li>
                    <li>Submit requests for new address registration</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deliveries Tab — Incoming + Pickup unified (authenticated only) */}
          {isAuthenticated && (
            <TabsContent value="deliveries" className="space-y-6">
              <Tabs defaultValue="incoming">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="incoming" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Incoming
                  </TabsTrigger>
                  <TabsTrigger value="pickups" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Pickups
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="incoming" className="mt-4">
                  <CitizenDeliveriesView />
                </TabsContent>

                <TabsContent value="pickups" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        {t('postal:pickup.title', 'Request Pickup')}
                      </CardTitle>
                      <CardDescription>
                        {t('postal:pickup.description', 'Schedule a pickup for your packages')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setPickupRequestOpen(true)}>
                        <Truck className="h-4 w-4 mr-2" />
                        {t('postal:pickup.requestPickup', 'Request Pickup')}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="mt-4 space-y-4">
                  {primaryAddress ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          {t('postal:preferences.title', 'Delivery Preferences')}
                        </CardTitle>
                        <CardDescription>
                          {t('postal:preferences.managePreferences', 'Manage delivery preferences for your addresses')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
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
                      <CardContent className="py-10 text-center space-y-3">
                        <Package className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Set a primary address first to manage delivery preferences.
                        </p>
                        <Button variant="outline" onClick={() => setActiveTab('addresses')}>
                          <Home className="h-4 w-4 mr-2" /> Set Up Address
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}
        </Tabs>

        {/* Footer */}
        <Footer />

        {/* Dialogs */}
        {/* Submit Request Dialog */}
        <Dialog open={submitRequestOpen} onOpenChange={setSubmitRequestOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('dashboard:submitRequest')}</DialogTitle>
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
              <DialogTitle>{t('dashboard:requestStatus')}</DialogTitle>
            </DialogHeader>
            <AddressRequestStatus />
          </DialogContent>
        </Dialog>

        {/* Verification Requests Dialog */}
        <Dialog open={verificationRequestsOpen} onOpenChange={setVerificationRequestsOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>My Verification Requests</DialogTitle>
            </DialogHeader>
            <UserVerificationRequests />
          </DialogContent>
        </Dialog>

        {/* Unified Address Registration / Declaration Flow */}
        <Dialog open={addressFlowOpen} onOpenChange={setAddressFlowOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Find or Register Your Address
              </DialogTitle>
              <DialogDescription>
                Search the national registry for your address. If it's not there yet, you can submit a registration request in the same flow.
              </DialogDescription>
            </DialogHeader>
            <UnifiedAddressRequestFlow
              initialMode="citizen"
              onComplete={() => {
                setAddressFlowOpen(false);
                fetchAddresses();
              }}
              onCancel={() => setAddressFlowOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Secondary Address Form Dialog */}
        <Dialog open={secondaryAddressFormOpen} onOpenChange={setSecondaryAddressFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Secondary Address</DialogTitle>
              <DialogDescription>
                Add an additional address (work, temporary residence, etc.)
              </DialogDescription>
            </DialogHeader>
            <AddSecondaryAddressForm 
              onSuccess={() => {
                setSecondaryAddressFormOpen(false);
                fetchAddresses();
              }}
            />
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSecondaryAddressFormOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pickup Request Dialog */}
        <PickupRequestForm
          open={pickupRequestOpen}
          onClose={() => setPickupRequestOpen(false)}
        />

        {/* Delivery Preferences Dialog */}
        <DeliveryPreferencesForm
          open={deliveryPreferencesOpen}
          onClose={() => setDeliveryPreferencesOpen(false)}
          addressUac={selectedAddressForPrefs}
        />
      </div>
    </div>
  );
};

export default CitizenPortalUnified;