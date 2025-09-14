import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Shield, MapPin, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import images
import policeOfficerImage from "@/assets/police-officer-eg.jpg";
import emergencyServicesImage from "@/assets/emergency-services-eg.jpg";

interface EmergencyContactProps {
  type: 'police' | 'emergency';
  icon: React.ReactNode;
  title: string;
  description: string;
  phoneNumber: string;
  image: string;
}

const EmergencyContact = ({ type, icon, title, description, phoneNumber, image }: EmergencyContactProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation(['common', 'emergency']);
  const { user } = useAuth();
  
  const {
    latitude,
    longitude,
    accuracy,
    error: locationError,
    loading: locationLoading,
    getCurrentPosition,
    clearLocation
  } = useGeolocation();

  const handleSendAlert = async () => {
    if (!latitude || !longitude) {
      toast.error(t('emergency:locationRequired'));
      return;
    }

    setIsSending(true);
    
    try {
      // Send emergency alert to police system
      const { data, error } = await supabase.functions.invoke('process-emergency-alert', {
        body: {
          message,
          latitude,
          longitude,
          emergencyType: type,
          contactInfo: null,
          reporterId: user?.id,
        }
      });

      if (error) throw error;
      
      setSent(true);
      toast.success(t('emergency:emergencyAlertSent'));
      
      // Auto close after showing success
      setTimeout(() => {
        setIsOpen(false);
        setSent(false);
        setMessage('');
        clearLocation();
      }, 3000);
      
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast.error(t('emergency:emergencyAlertFailed'));
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
      {/* Image Header */}
      <div className="relative h-32 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-destructive/90 via-destructive/40 to-transparent"></div>
        <div className="absolute bottom-3 left-4 right-4">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            {icon}
            {title}
          </CardTitle>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleCall}
          className="w-full"
        >
          <Phone className="mr-2 h-4 w-4" />
          {t('common:buttons.call')} {phoneNumber}
        </Button>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            // Automatically get location when dialog opens
            getCurrentPosition();
          } else {
            // Clear location when dialog closes
            clearLocation();
            setMessage('');
            setSent(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              {t('emergency:sendLocationAlert')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t('emergency:emergencyAlert')}
              </DialogTitle>
              <DialogDescription>
                {t('emergency:sendLocationToServices').replace('{service}', title)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {locationLoading && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    {t('emergency:automaticallyGettingLocation')}
                  </AlertDescription>
                </Alert>
              )}
              
              {!latitude && !locationLoading && !locationError && (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    {t('emergency:locationNeededForAlert')}
                  </AlertDescription>
                </Alert>
              )}
              
              {locationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {locationError}
                  </AlertDescription>
                </Alert>
              )}
              
              {latitude && longitude && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    {t('emergency:locationDetected')}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    {accuracy && ` (±${accuracy.toFixed(0)}m)`}
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <label className="text-sm font-medium">{t('emergency:emergencyMessage')}</label>
                <Textarea
                  placeholder={t('emergency:describeEmergency')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={getCurrentPosition}
                  disabled={locationLoading}
                  className="flex-1"
                >
                  {locationLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  {locationLoading ? t('emergency:gettingLocation') : t('emergency:retryLocation')}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleSendAlert}
                  disabled={!latitude || !longitude || isSending || sent}
                  className="flex-1"
                >
                  {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : sent ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <AlertTriangle className="mr-2 h-4 w-4" />
                  )}
                  {isSending ? t('emergency:sending') : sent ? t('emergency:sent') : t('emergency:sendAlert')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const EmergencyContacts = () => {
  const { t } = useTranslation(['common', 'emergency']);
  
  const emergencyContacts: EmergencyContactProps[] = [
    {
      type: 'police',
      icon: <Shield className="h-5 w-5" />,
      title: t('emergency:police'),
      description: t('emergency:policeDescription'),
      phoneNumber: '112',
      image: policeOfficerImage
    },
    {
      type: 'emergency',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t('emergency:emergencyServices'),
      description: t('emergency:emergencyServicesDescription'),
      phoneNumber: '911',
      image: emergencyServicesImage
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {emergencyContacts.map((contact) => (
        <EmergencyContact
          key={contact.type}
          {...contact}
        />
      ))}
    </div>
  );
};

export default EmergencyContacts;