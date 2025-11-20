/**
 * @deprecated This component is now embedded in UnifiedAddressRequestFlow.
 * For new address requests, use UnifiedAddressRequestFlow instead.
 * This component should not be used as a standalone form.
 */

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Camera, Upload, X, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CameraCapture from '@/components/CameraCapture';
import { ResidencyVerificationForm } from '@/components/ResidencyVerificationForm';
interface AddressRequestFormProps {
  mode?: 'standalone' | 'embedded';
  onCancel?: () => void;
  onSuccess?: (requestId?: string, uac?: string) => void;
}

const VERIFICATION_STEPS = {
  ADDRESS_REQUEST: 'address_request',
  RESIDENCY_VERIFICATION: 'residency_verification',
  COMPLETE: 'complete'
} as const;

export const AddressRequestForm = ({ mode = 'standalone', onCancel, onSuccess }: AddressRequestFormProps) => {
  const { t } = useTranslation('address');
  const [formData, setFormData] = useState({
    country: 'Equatorial Guinea',
    region: '',
    city: '',
    street: '',
    building: '',
    latitude: '',
    longitude: '',
    address_type: 'residential',
    description: '',
    justification: '',
    claimant_type: 'owner' // new field to distinguish claimants
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [proofOfOwnership, setProofOfOwnership] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<keyof typeof VERIFICATION_STEPS | string>(VERIFICATION_STEPS.ADDRESS_REQUEST);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  // Regions and cities of Equatorial Guinea
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
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
            title: t('locationCaptured'),
            description: t('locationCapturedDesc')
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: t('locationError'),
            description: t('locationErrorDesc'),
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: t('locationNotSupported'),
        description: t('locationNotSupportedDesc'),
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('fileTooLarge'),
          description: t('fileTooLargeDesc'),
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: t('invalidFileType'),
          description: t('invalidFileTypeDesc'),
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
        title: t('uploadFailed'),
        description: t('uploadFailedDesc'),
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

  const handleProofSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for documents
        toast({
          title: t('fileTooLarge'),
          description: t('fileTooLargeDoc'),
          variant: "destructive"
        });
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t('invalidFileType'),
          description: t('invalidFileTypeDoc'),
          variant: "destructive"
        });
        return;
      }

      setProofOfOwnership(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProofPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setProofPreview(""); // For PDFs, no preview
      }
    }
  };

  const removeProof = () => {
    setProofOfOwnership(null);
    setProofPreview("");
    if (proofInputRef.current) proofInputRef.current.value = "";
  };

  const uploadProofOfOwnership = async (): Promise<string | null> => {
    if (!proofOfOwnership || !user) return null;

    setUploading(true);
    try {
      const fileExt = proofOfOwnership.name.split('.').pop();
      const fileName = `proof-documents/${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('address-photos')
        .upload(fileName, proofOfOwnership);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('address-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading proof of ownership:', error);
      toast({
        title: t('uploadFailed'),
        description: t('uploadFailedDocDesc'),
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t('error'),
        description: t('mustBeLoggedIn'),
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.region || !formData.city || !formData.street || !formData.justification) {
      toast({
        title: t('error'),
        description: t('fillAllRequired'),
        variant: "destructive"
      });
      return;
    }

    // Validate proof of ownership for property claimants
    if (formData.claimant_type === 'owner' && !proofOfOwnership) {
      toast({
        title: t('proofOfOwnershipRequired'),
        description: t('proofOfOwnershipRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Upload photo if selected
      let photoUrl = null;
      if (photo) {
        photoUrl = await uploadPhoto();
        if (!photoUrl) return; // Upload failed
      }

      // Upload proof of ownership if selected
      let proofUrl = null;
      if (proofOfOwnership) {
        proofUrl = await uploadProofOfOwnership();
        if (!proofUrl) return; // Upload failed
      }

      const requestData = {
        ...formData,
        requester_id: user.id,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        photo_url: photoUrl,
        proof_of_ownership_url: proofUrl
      };

      const { data: insertedData, error } = await supabase
        .from('address_requests')
        .insert(requestData)
        .select('id')
        .single();

      if (error) throw error;

      setSubmittedRequestId(insertedData.id);
      
      toast({
        title: t('success'),
        description: t('requestSubmittedToast')
      });

      // In embedded mode, call onSuccess immediately with requestId
      if (mode === 'embedded') {
        onSuccess?.(insertedData.id, undefined);
        return;
      }

      // In standalone mode, move to verification step
      setCurrentStep(VERIFICATION_STEPS.RESIDENCY_VERIFICATION);

      // Don't reset form or call onSuccess yet - wait for verification step
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: t('error'),
        description: error.message || t('failedToSubmit'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    // Reset form and complete the process
    setFormData({
      country: 'Equatorial Guinea',
      region: '',
      city: '',
      street: '',
      building: '',
      latitude: '',
      longitude: '',
      address_type: 'residential',
      description: '',
      justification: '',
      claimant_type: 'owner'
    });
    setPhoto(null);
    setPhotoPreview("");
    setProofOfOwnership(null);
    setProofPreview("");
    setCurrentStep(VERIFICATION_STEPS.ADDRESS_REQUEST);
    setSubmittedRequestId(null);
    onSuccess?.();
  };

  const handleSkipVerification = () => {
    handleVerificationSuccess();
  };

  if (currentStep === VERIFICATION_STEPS.RESIDENCY_VERIFICATION && submittedRequestId) {
    return (
      <div className="space-y-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{t('requestSubmittedTitle')}</CardTitle>
            <CardDescription>
              {t('requestSubmittedDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleSkipVerification}
                className="flex-1"
              >
                {t('skipVerification')}
              </Button>
              <Button 
                onClick={() => setCurrentStep(VERIFICATION_STEPS.RESIDENCY_VERIFICATION)}
                className="flex-1"
              >
                {t('continueVerification')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Note: Address verification now requires CAR address setup first */}
        <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{t('requestSubmittedHeader')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('requestSubmittedInfo')}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleVerificationSuccess}>
              {t('continueToDashboard')}
            </Button>
            <Button variant="outline" onClick={handleSkipVerification}>
              {t('skipForNow')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('submitRequestTitle')}</CardTitle>
        <CardDescription>
          {t('submitRequestDescription')}
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
                placeholder={t('streetPlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="building">{t('buildingApartment')}</Label>
            <Input
              id="building"
              value={formData.building}
              onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
              placeholder={t('buildingPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address_type">{t('addressTypeLabel')}</Label>
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
            <div>
              <Label htmlFor="claimant_type">{t('claimantType')}</Label>
              <Select value={formData.claimant_type} onValueChange={(value) => setFormData(prev => ({ ...prev, claimant_type: value }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="owner">{t('propertyOwner')}</SelectItem>
                  <SelectItem value="resident">{t('resident')}</SelectItem>
                  <SelectItem value="representative">{t('authorizedRepresentative')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="latitude">{t('latitude')}</Label>
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
              <Label htmlFor="longitude">{t('longitude')}</Label>
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
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t('getLocation')}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Proof of Ownership Section - Required for Property Owners */}
          {formData.claimant_type === 'owner' && (
            <div className="space-y-4">
              <Label>{t('proofOfOwnership')} * <span className="text-sm text-muted-foreground">{t('proofRequired')}</span></Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                {proofOfOwnership ? (
                  <div className="space-y-4">
                    <div className="relative">
                      {proofPreview ? (
                        <img
                          src={proofPreview}
                          alt={t('proofPreviewAlt')}
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="bg-muted rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="font-medium">{proofOfOwnership.name}</p>
                          <p className="text-sm text-muted-foreground">{t('documentReady')}</p>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeProof}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {t('documentReadyUpload')}
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {t('uploadProofDocument')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => proofInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {t('uploadDocument')}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {t('maxFileSize10MB')}<br/>
                      {t('proofExamples')}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Hidden proof input */}
              <input
                ref={proofInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleProofSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="space-y-4">
            <Label>{t('addressPhoto')}</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {photoPreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt={t('addressPreviewAlt')}
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
                    {t('photoReady')}
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Image className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    {t('addPhotoLocation')}
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
                    {t('maxFileSize5MB')}
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
            <Label htmlFor="justification">{t('justification')} *</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
              placeholder={t('justificationPlaceholder')}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('submitting') : t('submitRequest')}
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
              <DialogTitle>{t('takePhotoTitle')}</DialogTitle>
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