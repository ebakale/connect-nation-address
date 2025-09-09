import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddresses } from "@/hooks/useAddresses";
import { useToast } from "@/hooks/use-toast";
import { generateUAC } from "@/lib/uacGenerator";
import { MapPin, Camera, Save, Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CameraCapture from "@/components/CameraCapture";
import { useTranslation } from 'react-i18next';

interface AddressCaptureFormProps {
  onSave?: () => void;
  onCancel?: () => void;
  initialData?: {
    id?: string;
    country: string;
    region: string;
    city: string;
    street: string;
    building?: string;
    address_type: string;
    latitude: number;
    longitude: number;
    description?: string;
    photo_url?: string;
  };
}

export const AddressCaptureForm = ({ onSave, onCancel, initialData }: AddressCaptureFormProps) => {
  const { user } = useAuth();
  const { t } = useTranslation('address');
  const [formData, setFormData] = useState({
    country: initialData?.country || "Equatorial Guinea",
    region: initialData?.region || "",
    city: initialData?.city || "",
    street: initialData?.street || "",
    building: initialData?.building || "",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
    address_type: initialData?.address_type || "residential",
    description: initialData?.description || ""
  });
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(initialData?.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { createAddress, updateAddressStatus, loading } = useAddresses();
  const { toast } = useToast();

  // Regions and cities of Equatorial Guinea (kept in sync with AddressRequestForm)
  const regions = [
    'Annobón',
    'Bioko Norte',
    'Bioko Sur',
    'Centro Sur',
    'Djibloho',
    'Kié-Ntem',
    'Litoral',
    'Wele-Nzas'
  ];

  const citiesByRegion: Record<string, string[]> = {
    'Annobón': ['San Antonio de Palé'],
    'Bioko Norte': ['Malabo', 'Rebola', 'Baney'],
    'Bioko Sur': ['Luba', 'Riaba', 'Moca'],
    'Centro Sur': ['Evinayong', 'Acurenam', 'Niefang'],
    'Djibloho': ['Ciudad de la Paz'],
    'Kié-Ntem': ['Ebebiyín', 'Mikomeseng', 'Ncue', 'Nsork Nsomo'],
    'Litoral': ['Bata', 'Mbini', 'Kogo', 'Acalayong'],
    'Wele-Nzas': ['Mongomo', 'Añisoc', 'Aconibe', 'Nsok']
  };

  const availableCities = formData.region ? citiesByRegion[formData.region] || [] : [];

  // UAC generation is now handled by the centralized system

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast({
            title: t('toasts.locationCaptured'),
            description: t('toasts.gpsCoordinatesSet')
          });
        },
        (error) => {
          toast({
            title: t('toasts.locationError'),
            description: t('toasts.couldNotGetLocation'),
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('toasts.fileTooLarge'),
          description: t('toasts.selectSmallerImage'),
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: t('toasts.invalidFileType'),
          description: t('toasts.selectImageFile'),
          variant: "destructive"
        });
        return;
      }

      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo || !user) return null;

    setUploading(true);
    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('address-photos')
        .upload(fileName, photo);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('address-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: t('toasts.uploadFailed'),
        description: t('toasts.failedToUploadPhoto'),
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.region || !formData.city || !formData.street) {
      toast({
        title: t('toasts.missingInformation'),
        description: t('toasts.fillRequiredFields'),
        variant: "destructive"
      });
      return;
    }

    // Upload photo if selected
    let photoUrl = photoPreview;
    if (photo) {
      photoUrl = await uploadPhoto();
      if (!photoUrl) return; // Upload failed
    }

    const addressData = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      verified: false,
      public: false,
      photo_url: photoUrl || null
    };

    if (initialData?.id) {
      // Update existing address
      const { error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', initialData.id);
      
      if (!error) {
        toast({
          title: t('toasts.addressUpdated'),
          description: t('toasts.draftUpdatedSuccessfully')
        });
        onSave?.();
      } else {
        toast({
          title: t('toasts.error'),
          description: t('toasts.failedToUpdateAddress'),
          variant: "destructive"
        });
      }
    } else {
      // Create new address
      const createData: any = { ...addressData };
      if (photo) {
        createData.photo = photo; // Let useAddresses handle the upload
        delete createData.photo_url; // Remove the preview URL
      }
      const result = await createAddress(createData);
      if (result) {
        onSave?.();
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {initialData ? t('editAddress') : t('captureNewAddress')}
        </CardTitle>
        <CardDescription>
          {initialData ? t('updateAddressDetails') : t('fillAddressDetailsAndCapture')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">{t('country')}</Label>
              <Input
                id="country"
                value={formData.country}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="region">{t('provinceRegion')} *</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, region: value, city: '' }));
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={t('selectProvince')} />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">{t('city')} *</Label>
              <Select 
                value={formData.city} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                disabled={!formData.region}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={formData.region ? t('selectCity') : t('selectProvinceFirst')} />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="street">{t('streetAddress')} *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder={t('streetAddressPlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="building">{t('buildingApartmentOptional')}</Label>
            <Input
              id="building"
              value={formData.building}
              onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
              placeholder={t('buildingPlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="address_type">{t('addressType')}</Label>
            <Select value={formData.address_type} onValueChange={(value) => setFormData(prev => ({ ...prev, address_type: value }))}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="residential">{t('residential')}</SelectItem>
                <SelectItem value="commercial">{t('commercial')}</SelectItem>
                <SelectItem value="industrial">{t('industrial')}</SelectItem>
                <SelectItem value="government">{t('government')}</SelectItem>
                <SelectItem value="educational">{t('educational')}</SelectItem>
                <SelectItem value="healthcare">{t('healthcare')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="latitude">{t('latitudeOptional')}</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder={t('latitudePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="longitude">{t('longitudeOptional')}</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder={t('longitudePlaceholder')}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full text-xs px-2"
              >
                <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="truncate">{t('captureCurrentLocation')}</span>
              </Button>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <Label>{t('addressPhotoOptional')}</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {photoPreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt={t('addressPreview')}
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('photoReadyToUpload')}
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Image className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    {t('addPhotoOfAddress')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCameraOpen(true)}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {t('takePhoto')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {t('uploadPhoto')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('photoUploadInfo')}
                  </p>
                </div>
              )}
            </div>
            
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <Label htmlFor="description">{t('descriptionNotes')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('additionalDetailsPlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {loading ? t('saving') : t('saveAddress')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('cancel')}
              </Button>
            )}
          </div>
        </form>
        <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('takePhoto')}</DialogTitle>
            </DialogHeader>
            <CameraCapture
              onCapture={(file, dataUrl) => {
                setPhoto(file);
                setPhotoPreview(dataUrl);
                setCameraOpen(false);
              }}
              onClose={() => setCameraOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};