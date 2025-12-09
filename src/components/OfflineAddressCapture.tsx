import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineAddresses } from '@/hooks/useOfflineData';
import { useOffline } from '@/hooks/useOffline';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Save, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export const OfflineAddressCapture = () => {
  const { t } = useTranslation('address');
  const { user } = useAuth();
  const { saveAddress } = useOfflineAddresses();
  const { isOnline } = useOffline();
  const { latitude, longitude, getCurrentPosition, loading: geoLoading } = useGeolocation();
  
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    region: '',
    country: 'Equatorial Guinea',
    building: '',
    address_type: 'residential',
    description: ''
  });
  
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('offlineCapture.pleaseLoginToSave'));
      return;
    }

    if (!latitude || !longitude) {
      toast.error(t('offlineCapture.locationRequired'));
      return;
    }

    if (!formData.street || !formData.city) {
      toast.error(t('offlineCapture.streetCityRequired'));
      return;
    }

    try {
      setSaving(true);
      
      await saveAddress({
        user_id: user.id,
        latitude,
        longitude,
        ...formData
      });

      // Reset form
      setFormData({
        street: '',
        city: '',
        region: '',
        country: 'Equatorial Guinea',
        building: '',
        address_type: 'residential',
        description: ''
      });

      const message = isOnline 
        ? t('offlineCapture.addressSavedSuccessfully')
        : t('offlineCapture.addressSavedOffline');
      
      toast.success(message);
      
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error(t('offlineCapture.failedToSaveAddress'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t('offlineCapture.captureAddress')}
          </CardTitle>
          <Badge variant="outline" className={isOnline ? "text-green-700 border-green-200" : "text-orange-700 border-orange-200"}>
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? t('offlineCapture.online') : t('offlineCapture.offlineMode')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Section */}
          <div className="space-y-2">
            <Label>{t('offlineCapture.location')}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentPosition}
                disabled={geoLoading}
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {geoLoading ? t('offlineCapture.gettingLocation') : t('offlineCapture.getCurrentLocation')}
              </Button>
              {latitude && longitude && (
                <Badge variant="secondary">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </Badge>
              )}
            </div>
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">{t('offlineCapture.streetAddress')} *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder={t('offlineCapture.streetPlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="building">{t('offlineCapture.buildingNumber')}</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                placeholder={t('offlineCapture.buildingPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t('offlineCapture.city')} *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder={t('offlineCapture.cityPlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">{t('offlineCapture.region')}</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => handleInputChange('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('offlineCapture.selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bioko Norte">Bioko Norte</SelectItem>
                  <SelectItem value="Bioko Sur">Bioko Sur</SelectItem>
                  <SelectItem value="Litoral">Litoral</SelectItem>
                  <SelectItem value="Centro Sur">Centro Sur</SelectItem>
                  <SelectItem value="Kié-Ntem">Kié-Ntem</SelectItem>
                  <SelectItem value="Wele-Nzas">Wele-Nzas</SelectItem>
                  <SelectItem value="Djibloho">Djibloho</SelectItem>
                  <SelectItem value="Annobón">Annobón</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{t('offlineCapture.country')}</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_type">{t('offlineCapture.addressType')}</Label>
              <Select
                value={formData.address_type}
                onValueChange={(value) => handleInputChange('address_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">{t('offlineCapture.residential')}</SelectItem>
                  <SelectItem value="commercial">{t('offlineCapture.commercial')}</SelectItem>
                  <SelectItem value="industrial">{t('offlineCapture.industrial')}</SelectItem>
                  <SelectItem value="institutional">{t('offlineCapture.institutional')}</SelectItem>
                  <SelectItem value="recreational">{t('offlineCapture.recreational')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('offlineCapture.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('offlineCapture.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={saving || !latitude || !longitude}
            className="w-full flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? t('offlineCapture.saving') : t('offlineCapture.saveAddress')}
          </Button>

          {!isOnline && (
            <div className="text-sm text-muted-foreground text-center p-2 bg-orange-50 rounded-md">
              📡 {t('offlineCapture.workingOffline')}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
