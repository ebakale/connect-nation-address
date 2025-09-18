import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, History, Plus } from 'lucide-react';
import { useCitizenAddresses } from '@/hooks/useCAR';
import { SetPrimaryAddressForm } from './SetPrimaryAddressForm';
import { AddSecondaryAddressForm } from './AddSecondaryAddressForm';
import { CurrentAddressesPanel } from './CurrentAddressesPanel';
import { AddressHistoryPanel } from './AddressHistoryPanel';
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('address:title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('address:manageYourAddresses')}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Home className="h-3 w-3" />
            {primaryAddress ? '1 Primary' : 'No Primary'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {secondaryAddresses.length} Secondary
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Current
          </TabsTrigger>
          <TabsTrigger value="set-primary" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Set Primary
          </TabsTrigger>
          <TabsTrigger value="add-secondary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Secondary
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
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
                Set Primary Address
              </CardTitle>
              <CardDescription>
                Your primary address is your main residence. You can only have one primary address at a time.
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
                Add Secondary Address
              </CardTitle>
              <CardDescription>
                Secondary addresses can include work locations, temporary residences, or other relevant locations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddSecondaryAddressForm onSuccess={() => setActiveTab('current')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AddressHistoryPanel addressHistory={addressHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}