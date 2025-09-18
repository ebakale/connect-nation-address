import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, Plus, Search, User, FileText, Clock } from "lucide-react";
import { CitizenAddressPortal } from "@/components/CitizenAddressPortal";
import AddressSearch from "@/components/AddressSearch";
import { useAuth } from "@/hooks/useAuth";
import { usePerson, useCitizenAddresses } from "@/hooks/useCAR";
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function CitizenPortal() {
  const { t } = useTranslation(['common', 'address']);
  const { user } = useAuth();
  const { person, loading: personLoading } = usePerson();
  const { 
    addresses, 
    loading: addressesLoading, 
    primaryAddress, 
    secondaryAddresses,
    addressHistory 
  } = useCitizenAddresses();
  const [activeTab, setActiveTab] = useState('overview');

  const loading = personLoading || addressesLoading;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{t('address:loginRequired')}</CardTitle>
            <CardDescription>
              {t('address:loginToAccessPortal')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/auth" className="w-full">
              <Button className="w-full">
                {t('common:login')}
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground text-center">
              {t('address:newUser')} <Link to="/auth" className="text-primary hover:underline">{t('common:signUp')}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {t('address:citizenPortal')}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t('address:manageYourAddresses')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  {t('common:dashboard')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                {t('address:overview')}
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('address:manageAddresses')}
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t('address:searchAddresses')}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('address:history')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('address:primaryAddress')}
                    </CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {primaryAddress ? '1' : '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {primaryAddress ? t('address:addressRegistered') : t('address:noAddressRegistered')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('address:secondaryAddresses')}
                    </CardTitle>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {secondaryAddresses.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('address:additionalAddresses')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('address:totalHistory')}
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {addressHistory.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('address:addressRecords')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Addresses Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      {t('address:primaryAddress')}
                    </CardTitle>
                    <CardDescription>
                      {t('address:yourMainResidence')}
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
                            <Badge variant="secondary" className="font-mono text-xs">
                              {primaryAddress.uac}
                            </Badge>
                          </div>
                          
                          {primaryAddress.unit_uac && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Unit UAC:</span>
                              <Badge variant="secondary" className="font-mono text-xs">
                                {primaryAddress.unit_uac}
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{t('address:scope')}:</span>
                            <Badge variant="outline">{primaryAddress.scope}</Badge>
                          </div>
                          
                          {primaryAddress.occupant && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Occupant Type:</span>
                              <Badge variant="outline">{primaryAddress.occupant}</Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{t('address:status')}:</span>
                            <Badge 
                              variant={primaryAddress.status === 'CONFIRMED' ? 'default' : 'secondary'}
                            >
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
                            <span className="font-medium">Address Kind:</span> {primaryAddress.address_kind}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{t('address:effectiveFrom')}:</span> {new Date(primaryAddress.effective_from).toLocaleDateString()}
                          </div>
                          {primaryAddress.effective_to && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Effective To:</span> {new Date(primaryAddress.effective_to).toLocaleDateString()}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Source:</span> {primaryAddress.source || 'N/A'}
                          </div>
                          {primaryAddress.address_description && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Description:</span> {primaryAddress.address_description}
                            </div>
                          )}
                          {primaryAddress.notes && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Notes:</span> {primaryAddress.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          {t('address:noPrimaryAddress')}
                        </p>
                        <Button 
                          onClick={() => setActiveTab('manage')}
                          size="sm"
                        >
                          {t('address:setPrimaryAddress')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Secondary Addresses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      {t('address:secondaryAddresses')}
                    </CardTitle>
                    <CardDescription>
                      {t('address:additionalLocations')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {secondaryAddresses.length > 0 ? (
                      <div className="space-y-3">
                        {secondaryAddresses.slice(0, 3).map((address) => (
                          <div key={address.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="font-medium text-sm">{address.uac}</span>
                              <p className="text-xs text-muted-foreground">{address.scope}</p>
                            </div>
                            <Badge 
                              variant={address.status === 'CONFIRMED' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {address.status}
                            </Badge>
                          </div>
                        ))}
                        {secondaryAddresses.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            +{secondaryAddresses.length - 3} {t('address:moreAddresses')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          {t('address:noSecondaryAddresses')}
                        </p>
                        <Button 
                          onClick={() => setActiveTab('manage')}
                          size="sm"
                          variant="outline"
                        >
                          {t('address:addSecondaryAddress')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <CitizenAddressPortal />
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    {t('address:searchPublicAddresses')}
                  </CardTitle>
                  <CardDescription>
                    {t('address:searchPublicAddressesDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddressSearch />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('address:addressHistory')}
                  </CardTitle>
                  <CardDescription>
                    {t('address:viewAllPreviousAddresses')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {addressHistory.length > 0 ? (
                    <div className="space-y-4">
                      {addressHistory.map((address) => (
                        <div key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{address.uac}</span>
                              <Badge variant="outline">{address.address_kind}</Badge>
                              <Badge variant="secondary">{address.scope}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t('address:effectiveFrom')}: {new Date(address.effective_from).toLocaleDateString()}
                              {address.effective_to && (
                                <> - {t('address:effectiveTo')}: {new Date(address.effective_to).toLocaleDateString()}</>
                              )}
                            </p>
                          </div>
                          <Badge 
                            variant={address.status === 'CONFIRMED' ? 'default' : 'secondary'}
                          >
                            {address.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('address:noAddressHistory')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}