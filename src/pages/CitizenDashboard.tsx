import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, FileText, AlertCircle, Clock, LogOut } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
              <LanguageSwitcher />
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                {t('searchAddresses')}
              </CardTitle>
              <CardDescription>
                {t('findVerifiedAddresses')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
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
                      console.log('Selected address:', address);
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
                {t('submitRequest')}
              </CardTitle>
              <CardDescription>
                {t('submitNewRequest')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setSubmitRequestOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                {t('newRequest')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t('addressStatus')}
              </CardTitle>
              <CardDescription>
                {t('trackRequestStatus')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setStatusOpen(true)}>
                <Clock className="mr-2 h-4 w-4" />
                {t('checkStatus')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
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