import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";

interface EmergencyAlertData {
  message: string;
  latitude: number;
  longitude: number;
  emergencyType: string;
  contactInfo?: string;
}

interface EmergencyAlertProcessorProps {
  onSuccess?: () => void;
  prefilledAddress?: {
    uac: string;
    street: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
  };
}

const EmergencyAlertProcessor = ({ onSuccess, prefilledAddress }: EmergencyAlertProcessorProps) => {
  const { t } = useTranslation(['emergency', 'common']);
  const { user } = useAuth();
  const { latitude, longitude, loading: geoLoading, error: geoError, getCurrentPosition } = useGeolocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emergencyType: '',
    message: '',
    contactInfo: ''
  });

  const processEmergencyAlert = async (alertData: EmergencyAlertData) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-emergency-alert', {
        body: {
          ...alertData,
          reporterId: user?.id,
          language: 'en'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing emergency alert:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use prefilled coordinates if available, otherwise use current location
    const useLat = prefilledAddress?.latitude || latitude;
    const useLng = prefilledAddress?.longitude || longitude;
    
    if (!useLat || !useLng) {
      toast.error(t('emergency:errors.locationRequired'));
      return;
    }

    if (!formData.emergencyType || !formData.message) {
      toast.error(t('emergency:errors.requiredFields'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const alertData: EmergencyAlertData = {
        emergencyType: formData.emergencyType,
        message: `${formData.message}${prefilledAddress ? `\n\nAddress: ${prefilledAddress.street}, ${prefilledAddress.city}\nUAC: ${prefilledAddress.uac}` : ''}`,
        latitude: useLat,
        longitude: useLng,
        contactInfo: formData.contactInfo || undefined
      };

      await processEmergencyAlert(alertData);
      
      toast.success(t('emergency:success.alertSent'));
      setFormData({ emergencyType: '', message: '', contactInfo: '' });
      
      // Call onSuccess callback to close the emergency section
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500); // Give user time to see the success message
      }
    } catch (error) {
      toast.error(t('emergency:errors.failedToSend'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">{t('emergency:emergencyAlert')}</CardTitle>
        </div>
        <Badge variant="destructive" className="animate-pulse">
          {t('emergency:emergencyServicesOnly')}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="emergencyType">{t('emergency:emergencyType')} *</Label>
            <Select 
              value={formData.emergencyType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, emergencyType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('emergency:selectEmergencyType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fire">{t('emergency:types.fire')}</SelectItem>
                <SelectItem value="medical">{t('emergency:types.medical')}</SelectItem>
                <SelectItem value="police">{t('emergency:types.police')}</SelectItem>
                <SelectItem value="accident">{t('emergency:types.accident')}</SelectItem>
                <SelectItem value="natural_disaster">{t('emergency:types.naturalDisaster')}</SelectItem>
                <SelectItem value="other">{t('emergency:types.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">{t('emergency:emergencyDescription')} *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={t('emergency:describeEmergencyPlaceholder')}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">{t('emergency:contactInformation')}</Label>
            <Input
              id="contactInfo"
              type="tel"
              value={formData.contactInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
              placeholder={t('emergency:phoneOptionalPlaceholder')}
            />
          </div>

          {prefilledAddress ? (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Using Address from Search</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {prefilledAddress.street}, {prefilledAddress.city}
              </p>
              <p className="text-xs text-blue-500">
                UAC: {prefilledAddress.uac} | Lat: {prefilledAddress.latitude.toFixed(6)}, Lon: {prefilledAddress.longitude.toFixed(6)}
              </p>
            </div>
          ) : latitude && longitude ? (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{t('emergency:locationDetected')}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Lat: {latitude.toFixed(6)}, Lon: {longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  console.log('Get Current Location button clicked');
                  getCurrentPosition();
                }}
                className="w-full"
                disabled={geoLoading}
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('emergency:gettingLocation')}
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    {t('emergency:getCurrentLocation')}
                  </>
                )}
              </Button>
              {geoError && (
                <p className="mt-2 text-sm text-destructive">{geoError}</p>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={isSubmitting || (!prefilledAddress && (!latitude || !longitude))}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('emergency:sendingAlert')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t('emergency:sendEmergencyAlert')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmergencyAlertProcessor;