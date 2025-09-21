import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, History, Plus, Shield } from 'lucide-react';
import { useCitizenAddresses } from '@/hooks/useCAR';
import { SetPrimaryAddressForm } from './SetPrimaryAddressForm';
import { AddSecondaryAddressForm } from './AddSecondaryAddressForm';
import { CurrentAddressesPanel } from './CurrentAddressesPanel';
import { AddressHistoryPanel } from './AddressHistoryPanel';
import { CitizenAddressVerificationManager } from './CitizenAddressVerificationManager';
import { useTranslation } from 'react-i18next';

export function CitizenAddressPortal() {
  const { t } = useTranslation(['common', 'address']);
  const [activeTab, setActiveTab] = useState('current');
  const { 
    currentAddresses, 
    primaryAddress, 
    secondaryAddresses, 
    addressHistory, 
    loading 
  } = useCitizenAddresses();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Home className="h-3 w-3" />
            {primaryAddress ? t('address:onePrimary') : t('address:noPrimary')}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {secondaryAddresses.length} {t('address:secondary')}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {t('address:current')}
          </TabsTrigger>
          <TabsTrigger value="set-primary" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('address:setPrimary')}
          </TabsTrigger>
          <TabsTrigger value="add-secondary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('address:addSecondary')}
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('address:verify')}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('address:history')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <CurrentAddressesPanel 
            primaryAddress={primaryAddress}
            secondaryAddresses={secondaryAddresses}
            onAddSecondary={() => setActiveTab('add-secondary')}
            onSetPrimary={() => setActiveTab('set-primary')}
          />
        </TabsContent>

        <TabsContent value="set-primary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                {t('address:setPrimaryAddress')}
              </CardTitle>
              <CardDescription>
                {t('address:primaryAddressDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SetPrimaryAddressForm onSuccess={() => setActiveTab('current')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-secondary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t('address:addSecondaryAddress')}
              </CardTitle>
              <CardDescription>
                {t('address:secondaryAddressDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddSecondaryAddressForm onSuccess={() => setActiveTab('current')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <CitizenAddressVerificationManager 
            onSuccess={() => {
              setActiveTab('current');
            }}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AddressHistoryPanel addressHistory={addressHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}