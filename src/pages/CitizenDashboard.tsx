import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, FileText, AlertCircle, Clock, LogOut, Phone } from "lucide-react";
import EmergencyContacts from "@/components/EmergencyContacts";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from '@/contexts/LanguageContext';

import AddressSearch from "@/components/AddressSearch";
import AddressMapViewer from "@/components/AddressMapViewer";
import { AddressRequestForm } from "@/components/AddressRequestForm";
import { AddressRequestStatus } from "@/components/AddressRequestStatus";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

const CitizenDashboard = () => {
  const { role, loading } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [submitRequestOpen, setSubmitRequestOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-destructive/5 flex items-center justify-center">
        <div className="text-lg animate-fade-in">{t('loading')}</div>
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
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('citizenPortal')}</h1>
              <p className="text-muted-foreground">{t('searchVerifiedAddresses')}</p>
            </div>
            <div className="flex gap-2">
              
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Card className="min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Search className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">{t('searchAddresses')}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {t('findVerifiedAddresses')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full text-xs py-2">
                    {t('searchDatabase')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('searchAddresses')}</DialogTitle>
                    <DialogDescription>
                      {t('findVerifiedAddresses')}
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

          <Card className="min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">{t('submitRequest')}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {t('submitNewRequest')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full text-xs py-2" onClick={() => setSubmitRequestOpen(true)}>
                <FileText className="mr-1 h-3 w-3" />
                {t('newRequest')}
              </Button>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate">{t('addressStatus')}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {t('trackRequestStatus')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full text-xs py-2" onClick={() => setStatusOpen(true)}>
                <Clock className="mr-1 h-3 w-3" />
                {t('checkStatus')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                {t('importantInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t('allSearchesVerified')}</li>
                <li>{t('personalInfoProtected')}</li>
                <li>{t('coordinatesApproximate')}</li>
                <li>{t('submitRequestsNew')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Submit Request Dialog */}
        <Dialog open={submitRequestOpen} onOpenChange={setSubmitRequestOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('submitAddressRequest')}</DialogTitle>
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
              <DialogTitle>{t('addressRequestStatus')}</DialogTitle>
            </DialogHeader>
            <AddressRequestStatus />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CitizenDashboard;