import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Shield, MapPin, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface EmergencyContactProps {
  type: 'police' | 'emergency';
  icon: React.ReactNode;
  title: string;
  description: string;
  phoneNumber: string;
}

const EmergencyContact = ({ type, icon, title, description, phoneNumber }: EmergencyContactProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();
  
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
      toast.error(t('locationRequired'));
      return;
    }

    setIsSending(true);
    
    try {
      // Simulate sending emergency alert with location
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would send the alert to emergency services
      console.log('Emergency alert sent:', {
        type,
        message,
        location: { latitude, longitude, accuracy },
        timestamp: new Date().toISOString()
      });
      
      setSent(true);
      toast.success(t('emergencyAlertSent'));
      
      // Auto close after showing success
      setTimeout(() => {
        setIsOpen(false);
        setSent(false);
        setMessage('');
        clearLocation();
      }, 3000);
      
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast.error(t('emergencyAlertFailed'));
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
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
          {t('call')} {phoneNumber}
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              {t('sendLocationAlert')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t('emergencyAlert')}
              </DialogTitle>
              <DialogDescription>
                {t('sendLocationToServices').replace('{service}', title)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {!latitude && !locationLoading && (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    {t('locationNeededForAlert')}
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
                    {t('locationDetected')}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    {accuracy && ` (±${accuracy.toFixed(0)}m)`}
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <label className="text-sm font-medium">{t('emergencyMessage')}</label>
                <Textarea
                  placeholder={t('describeEmergency')}
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
                  {locationLoading ? t('gettingLocation') : t('getLocation')}
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
                  {isSending ? t('sending') : sent ? t('sent') : t('sendAlert')}
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
  const { t } = useLanguage();
  
  const emergencyContacts: EmergencyContactProps[] = [
    {
      type: 'police',
      icon: <Shield className="h-5 w-5" />,
      title: t('police'),
      description: t('policeDescription'),
      phoneNumber: '112'
    },
    {
      type: 'emergency',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t('emergencyServices'),
      description: t('emergencyServicesDescription'),
      phoneNumber: '911'
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