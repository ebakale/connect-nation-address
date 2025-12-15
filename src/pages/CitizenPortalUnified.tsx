import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Search, FileText, Clock, LogOut, Phone, FileCheck, 
  AlertCircle, User, Home, Settings, Users, Bell, Package, Truck
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
import { SetPrimaryAddressForm } from "@/components/SetPrimaryAddressForm";
import { SavedLocationsManager } from "@/components/SavedLocationsManager";
import { AddSecondaryAddressForm } from "@/components/AddSecondaryAddressForm";
import { AddressPrivacySettings } from "@/components/AddressPrivacySettings";
import CitizenDeliveriesView from "@/components/citizen/CitizenDeliveriesView";
import { PickupRequestForm, DeliveryPreferencesForm } from "@/components/postal";

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
  const [primaryAddressFormOpen, setPrimaryAddressFormOpen] = useState(false);
  const [secondaryAddressFormOpen, setSecondaryAddressFormOpen] = useState(false);
  const [pickupRequestOpen, setPickupRequestOpen] = useState(false);
  const [deliveryPreferencesOpen, setDeliveryPreferencesOpen] = useState(false);
  const [selectedAddressForPrefs, setSelectedAddressForPrefs] = useState<string>('');

  // Effect to set default tab based on auth status
  useEffect(() => {
    if (isAuthenticated && activeTab === 'public') {
      setActiveTab('addresses');
    }
  }, [isAuthenticated, activeTab]);

  // Effect to fetch CAR data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAddresses();
    }
  }, [isAuthenticated, user, fetchAddresses]);

  if (roleLoading || carLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5 flex items-center justify-center">
        <div className="text-lg animate-fade-in">{t('common:buttons.loading')}</div>
      </div>
    );
  }

  // If showing map view for selected address
  if (showMapView && selectedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5">
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            {isAuthenticated && (
              <>
                <TabsTrigger value="addresses" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">My Addresses</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Saved</span>
                </TabsTrigger>
                <TabsTrigger value="verification" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Verification</span>
                </TabsTrigger>
                <TabsTrigger value="deliveries" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('postal:myDeliveries.title', 'Deliveries')}</span>
                </TabsTrigger>
                <TabsTrigger value="pickup" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('postal:pickup.title', 'Pickup')}</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Alerts</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Emergency</span>
            </TabsTrigger>
          </TabsList>

          {/* Public Search Tab */}
          <TabsContent value="public" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Search className="h-4 w-4 text-primary" />
                    {t('address:searchAddresses')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('address:findVerifiedAddresses')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        {t('address:searchDatabase')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{t('address:searchAddresses')}</DialogTitle>
                        <DialogDescription>
                          {t('address:findVerifiedAddresses')}
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

              {!isAuthenticated && (
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {t('auth:loginRequired')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Sign in to access personal address management, submit requests, and track verification status.
                    </p>
                    <Button onClick={() => window.location.href = '/auth'} className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      {t('auth:login')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
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
                        {/* Address Location Info */}
                        {primaryAddress.street && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">📍 Address Location</div>
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
                            <span className="font-medium">UAC:</span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {primaryAddress.uac}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Kind:</span>
                            <Badge variant="secondary">
                              {primaryAddress.address_kind}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Status:</span>
                            <Badge variant={primaryAddress.status === 'CONFIRMED' ? 'default' : 'destructive'}>
                              {primaryAddress.status}
                            </Badge>
                          </div>
                          
                          {primaryAddress.nar_verified !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">NAR Verified:</span>
                              <Badge variant={primaryAddress.nar_verified ? 'default' : 'destructive'}>
                                {primaryAddress.nar_verified ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-2 border-t space-y-1">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Effective:</span> {primaryAddress.effective_from} to {primaryAddress.effective_to || 'ongoing'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Occupant:</span> {primaryAddress.occupant || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Source:</span> {primaryAddress.source || 'N/A'}
                          </div>
                          {primaryAddress.address_description && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Description:</span> {primaryAddress.address_description}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No primary address set</p>
                        <Button onClick={() => setPrimaryAddressFormOpen(true)}>
                          Set Primary Address
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
                    <AlertCircle className="h-5 w-5 text-amber-500" />
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

          {/* My Deliveries Tab (authenticated only) */}
          {isAuthenticated && (
            <TabsContent value="deliveries">
              <CitizenDeliveriesView />
            </TabsContent>
          )}

          {/* Pickup Request Tab (authenticated only) */}
          {isAuthenticated && (
            <TabsContent value="pickup" className="space-y-6">
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
                <CardContent className="space-y-4">
                  <Button onClick={() => setPickupRequestOpen(true)}>
                    <Truck className="h-4 w-4 mr-2" />
                    {t('postal:pickup.requestPickup', 'Request Pickup')}
                  </Button>
                  
                  {primaryAddress && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('postal:preferences.managePreferences', 'Manage delivery preferences for your addresses')}
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedAddressForPrefs(primaryAddress.uac);
                          setDeliveryPreferencesOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {t('postal:preferences.title', 'Delivery Preferences')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
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

        {/* Primary Address Form Dialog */}
        <Dialog open={primaryAddressFormOpen} onOpenChange={setPrimaryAddressFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Set Primary Address</DialogTitle>
              <DialogDescription>
                Choose your primary residence address from the NAR database
              </DialogDescription>
            </DialogHeader>
            <SetPrimaryAddressForm 
              onSuccess={() => {
                setPrimaryAddressFormOpen(false);
                fetchAddresses();
              }}
            />
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setPrimaryAddressFormOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
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