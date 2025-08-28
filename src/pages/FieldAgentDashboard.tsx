import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, FileText, Map, Clock, CheckCircle, TrendingUp, Target, Camera, LogOut } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { AddressCaptureForm } from "@/components/AddressCaptureForm";
import DraftManager from "@/components/DraftManager";
import FieldMap from "@/components/FieldMap";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';
import Footer from '@/components/Footer';


const FieldAgentDashboard = () => {
  const { role, loading, getGeographicScope } = useUserRole();
  const { user, signOut } = useAuth();
  const { t } = useTranslation('dashboard');
  const [captureOpen, setCaptureOpen] = useState(false);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  const geographicScope = getGeographicScope();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('fieldAgentDashboard')}</h1>
              <p className="text-muted-foreground">{t('captureAndDraftAddresses')}</p>
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
              
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">{t('todaysCaptures')}</CardTitle>
              <Camera className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">12</div>
              <p className="text-xs text-muted-foreground truncate">{t('fromYesterday')}</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">{t('pendingDrafts')}</CardTitle>
              <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">5</div>
              <p className="text-xs text-muted-foreground truncate">{t('awaitingSubmission')}</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">{t('submitted')}</CardTitle>
              <CheckCircle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">147</div>
              <p className="text-xs text-muted-foreground truncate">{t('thisMonth')}</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium truncate">{t('accuracyRate')}</CardTitle>
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground truncate">{t('verificationRate')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                {t('captureNewAddress')}
              </CardTitle>
              <CardDescription>
                {t('createNewDraft')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={captureOpen} onOpenChange={setCaptureOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    {t('startCapture')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('captureNewAddressTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('fillAddressDetails')}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t('myDrafts')}
              </CardTitle>
              <CardDescription>
                {t('reviewPendingDrafts')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={draftsOpen} onOpenChange={setDraftsOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    {t('viewDrafts')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('draftManagement')}</DialogTitle>
                    <DialogDescription>
                      {t('reviewEditSubmit')}
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
                <MapPin className="h-5 w-5 text-primary" />
                {t('fieldMap')}
              </CardTitle>
              <CardDescription>
                {t('viewAssignedAreas')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    {t('openMap')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('fieldMapTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('viewAddressesProgress')}
                    </DialogDescription>
                  </DialogHeader>
                  <FieldMap onClose={() => setMapOpen(false)} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FieldAgentDashboard;