import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Phone, MapPin, Send, Loader2, Flame, Heart, Shield, Car, RefreshCw, Navigation } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { cn } from '@/lib/utils';

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

const QUICK_TYPES = [
  { value: 'fire', icon: Flame, label: 'Fire', color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { value: 'medical', icon: Heart, label: 'Medical', color: 'text-pink-600 bg-pink-50 border-pink-200 hover:bg-pink-100' },
  { value: 'police', icon: Shield, label: 'Police', color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { value: 'accident', icon: Car, label: 'Accident', color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
];

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

  useEffect(() => {
    return () => {
      setFormData({ emergencyType: '', message: '', contactInfo: '' });
      setIsSubmitting(false);
    };
  }, [prefilledAddress]);

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
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (error) {
      toast.error(t('emergency:errors.failedToSend'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine current step for visual indicator
  const currentStep = !formData.emergencyType ? 0 : !formData.message ? 1 : (!prefilledAddress && !latitude) ? 2 : 3;

  // GPS status
  const hasLocation = !!(prefilledAddress || (latitude && longitude));
  const gpsStatus = prefilledAddress ? 'prefilled' : (latitude && longitude) ? 'active' : geoLoading ? 'loading' : 'inactive';

  return (
    <Card className="max-w-md mx-auto border-destructive/20">
      <CardContent className="p-4 sm:p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1: Emergency Type */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                currentStep === 0 ? "bg-destructive text-destructive-foreground" : currentStep > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>1</span>
              <Label className="text-sm font-semibold">{t('emergency:emergencyType', { defaultValue: 'Emergency Type' })} *</Label>
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_TYPES.map(({ value, icon: Icon, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, emergencyType: value }))}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center",
                    formData.emergencyType === value
                      ? "ring-2 ring-destructive border-destructive shadow-sm scale-[1.02]"
                      : color
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-tight">{t(`emergency:types.${value}`, { defaultValue: label })}</span>
                </button>
              ))}
            </div>

            {/* Dropdown fallback for other types */}
            <Select
              value={formData.emergencyType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, emergencyType: value }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={t('emergency:selectEmergencyType', { defaultValue: 'Other type...' })} />
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

          {/* Step 2: Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                currentStep === 1 ? "bg-destructive text-destructive-foreground" : currentStep > 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>2</span>
              <Label htmlFor="message" className="text-sm font-semibold">{t('emergency:emergencyDescription', { defaultValue: 'Describe the Situation' })} *</Label>
            </div>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={t('emergency:describeEmergencyPlaceholder')}
              rows={3}
              required
            />
            <div>
              <Label htmlFor="contactInfo" className="text-xs text-muted-foreground">{t('emergency:contactInformation', { defaultValue: 'Contact Info (optional)' })}</Label>
              <Input
                id="contactInfo"
                type="tel"
                value={formData.contactInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                placeholder={t('emergency:phoneOptionalPlaceholder')}
                className="mt-1"
              />
            </div>
          </div>

          {/* Step 3: Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                currentStep === 2 ? "bg-destructive text-destructive-foreground" : currentStep > 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>3</span>
              <Label className="text-sm font-semibold">{t('emergency:yourLocation', { defaultValue: 'Your Location' })}</Label>
              {/* GPS Status Dot */}
              <span className={cn(
                "h-2.5 w-2.5 rounded-full",
                gpsStatus === 'active' || gpsStatus === 'prefilled' ? 'bg-green-500' : gpsStatus === 'loading' ? 'bg-yellow-500 animate-pulse' : 'bg-destructive'
              )} />
              <span className="text-xs text-muted-foreground">
                {gpsStatus === 'active' ? t('emergency:gpsActive', { defaultValue: 'GPS Active' }) :
                 gpsStatus === 'prefilled' ? t('emergency:addressSet', { defaultValue: 'Address Set' }) :
                 gpsStatus === 'loading' ? t('emergency:gettingLocation', { defaultValue: 'Getting location...' }) :
                 t('emergency:gpsInactive', { defaultValue: 'GPS Inactive' })}
              </span>
            </div>

            {prefilledAddress ? (
              <div className="bg-info/5 border border-info/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-info text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  {t('emergency:usingSearchAddress', { defaultValue: 'Using Address from Search' })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{prefilledAddress.street}, {prefilledAddress.city}</p>
                <p className="text-xs text-muted-foreground/70">
                  UAC: {prefilledAddress.uac} | {prefilledAddress.latitude.toFixed(4)}, {prefilledAddress.longitude.toFixed(4)}
                </p>
              </div>
            ) : latitude && longitude ? (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                    <Navigation className="h-4 w-4" />
                    {t('emergency:locationDetected')}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => getCurrentPosition()} className="h-7 px-2 text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t('emergency:refresh', { defaultValue: 'Refresh' })}
                  </Button>
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
                  onClick={() => getCurrentPosition()}
                  className="w-full"
                  disabled={geoLoading}
                >
                  {geoLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('emergency:gettingLocation')}</>
                  ) : (
                    <><MapPin className="mr-2 h-4 w-4" />{t('emergency:getCurrentLocation')}</>
                  )}
                </Button>
                {geoError && <p className="mt-2 text-sm text-destructive">{geoError}</p>}
              </div>
            )}
          </div>

          {/* Step 4: Submit */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                currentStep === 3 ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
              )}>4</span>
              <Label className="text-sm font-semibold">{t('emergency:sendAlert', { defaultValue: 'Send Alert' })}</Label>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t('emergency:disclaimer', { defaultValue: 'By submitting, you confirm this is a genuine emergency.' })}
            </p>

            <Button
              type="submit"
              className={cn(
                "w-full h-12 text-base font-semibold bg-destructive hover:bg-destructive/90",
                currentStep === 3 && "ring-2 ring-destructive/50 ring-offset-2 animate-pulse"
              )}
              disabled={isSubmitting || !hasLocation}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('emergency:sendingAlert')}</>
              ) : (
                <><Send className="mr-2 h-5 w-5" />{t('emergency:sendEmergencyAlert')}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmergencyAlertProcessor;
