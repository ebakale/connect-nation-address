import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, MapPin, CheckCircle, X, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryProofCaptureProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProofData) => Promise<{ success: boolean }>;
  orderNumber: string;
  recipientName: string;
  orderId: string;
}

export interface ProofData {
  proof_type: string;
  photo_url?: string;
  received_by_name?: string;
  relationship_to_recipient?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export const DeliveryProofCapture = ({
  open,
  onClose,
  onSubmit,
  orderNumber,
  recipientName,
  orderId
}: DeliveryProofCaptureProps) => {
  const { t } = useTranslation('postal');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProofData>({
    proof_type: 'photo',
    received_by_name: recipientName,
    relationship_to_recipient: 'recipient',
    notes: ''
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPhotoPreview(null);
      setPhotoUrl(null);
      setShowCamera(false);
      setCameraError(null);
      setFormData({
        proof_type: 'photo',
        received_by_name: recipientName,
        relationship_to_recipient: 'recipient',
        notes: ''
      });
    }
  }, [open, recipientName]);

  // Get current location on open
  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('Location access denied:', err)
      );
    }
  }, [open]);

  // Start/stop camera stream
  useEffect(() => {
    if (showCamera && !Capacitor.isNativePlatform()) {
      startWebCamera();
    }
    return () => {
      stopWebCamera();
    };
  }, [showCamera]);

  // Cleanup camera on dialog close
  useEffect(() => {
    if (!open) {
      stopWebCamera();
    }
  }, [open]);

  const startWebCamera = async () => {
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError(t('proof.cameraError'));
      toast.error(t('proof.cameraError'));
    }
  };

  const stopWebCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureFromWebCamera = async () => {
    if (!videoRef.current) return;
    
    setUploadingPhoto(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, width, height);
      
      // Get data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhotoPreview(dataUrl);
      
      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setUploadingPhoto(false);
          return;
        }
        
        const fileName = `${orderId}-${Date.now()}.jpg`;
        const filePath = `proofs/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('delivery-proof')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            upsert: false,
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(t('proof.uploadError'));
          setUploadingPhoto(false);
          return;
        }
        
        const { data: urlData } = supabase.storage
          .from('delivery-proof')
          .getPublicUrl(filePath);
        
        setPhotoUrl(urlData.publicUrl);
        toast.success(t('proof.photoCaptured'));
        setShowCamera(false);
        stopWebCamera();
        setUploadingPhoto(false);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Capture error:', error);
      toast.error(t('proof.uploadError'));
      setUploadingPhoto(false);
    }
  };

  const capturePhoto = async () => {
    // Check if running on native platform (iOS/Android)
    if (Capacitor.isNativePlatform()) {
      setUploadingPhoto(true);
      try {
        const photo = await CapacitorCamera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          saveToGallery: false,
        });

        if (photo.base64String) {
          setPhotoPreview(`data:image/${photo.format || 'jpeg'};base64,${photo.base64String}`);

          const byteCharacters = atob(photo.base64String);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: `image/${photo.format || 'jpeg'}` });

          const fileName = `${orderId}-${Date.now()}.${photo.format || 'jpg'}`;
          const filePath = `proofs/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('delivery-proof')
            .upload(filePath, blob, {
              contentType: `image/${photo.format || 'jpeg'}`,
              upsert: false,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            toast.error(t('proof.uploadError'));
            setUploadingPhoto(false);
            return;
          }

          const { data: urlData } = supabase.storage
            .from('delivery-proof')
            .getPublicUrl(filePath);

          setPhotoUrl(urlData.publicUrl);
          toast.success(t('proof.photoCaptured'));
        }
      } catch (error: any) {
        console.error('Camera error:', error);
        toast.error(t('proof.cameraError'));
      }
      setUploadingPhoto(false);
    } else {
      // Web browser - show live camera view
      setShowCamera(true);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFilePhoto(file);
    }
    e.target.value = '';
  };

  const uploadFilePhoto = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      const fileName = `${orderId}-${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
      const filePath = `proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('delivery-proof')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(t('proof.uploadError'));
        return;
      }

      const { data: urlData } = supabase.storage
        .from('delivery-proof')
        .getPublicUrl(filePath);

      setPhotoUrl(urlData.publicUrl);
      toast.success(t('proof.photoCaptured'));
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(t('proof.uploadError'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoUrl(null);
  };

  const cancelCamera = () => {
    setShowCamera(false);
    stopWebCamera();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await onSubmit({
        ...formData,
        photo_url: photoUrl || undefined,
        latitude: location?.lat,
        longitude: location?.lng
      });

      if (result.success) {
        toast.success(t('proof.captureSuccess'));
        onClose();
      } else {
        toast.error(t('proof.captureError'));
      }
    } catch {
      toast.error(t('proof.captureError'));
    } finally {
      setLoading(false);
    }
  };

  const relationships = [
    { value: 'recipient', label: t('proof.recipientSelf') },
    { value: 'family', label: t('proof.family') },
    { value: 'neighbor', label: t('proof.neighbor') },
    { value: 'security', label: t('proof.security') },
    { value: 'other', label: t('proof.other') }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t('proof.captureTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium">{orderNumber}</p>
            <p className="text-muted-foreground">{recipientName}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('proof.receivedBy')}</Label>
            <Input
              value={formData.received_by_name || ''}
              onChange={(e) => setFormData({ ...formData, received_by_name: e.target.value })}
              placeholder={t('proof.enterName')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('proof.relationship')}</Label>
            <Select
              value={formData.relationship_to_recipient}
              onValueChange={(v) => setFormData({ ...formData, relationship_to_recipient: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relationships.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('proof.notes')}</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('proof.notesPlaceholder')}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {location ? (
              <span className="text-green-600">{t('proof.locationCaptured')}</span>
            ) : (
              <span>{t('proof.gettingLocation')}</span>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Photo Section */}
          <div className="space-y-2">
            <Label>{t('proof.photo')}</Label>
            
            {showCamera ? (
              // Live camera view for web browsers
              <div className="space-y-3">
                <div className="relative aspect-[4/3] w-full bg-muted rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef} 
                    playsInline 
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                {cameraError && (
                  <p className="text-destructive text-sm">{cameraError}</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={captureFromWebCamera}
                    disabled={uploadingPhoto || !!cameraError}
                    className="flex-1"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Camera className="h-4 w-4 mr-2" />
                    )}
                    {t('proof.capture')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={cancelCamera}
                    className="flex-1"
                  >
                    {t('common:buttons.cancel')}
                  </Button>
                </div>
              </div>
            ) : photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Delivery proof" 
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
                {photoUrl && (
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    {t('proof.uploaded')}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-20 flex-col gap-2" 
                  onClick={capturePhoto}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      <span className="text-xs">{t('proof.takePhoto')}</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-20 flex-col gap-2" 
                  onClick={handleUploadClick}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">{t('proof.uploadPhoto')}</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('common:buttons.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.received_by_name}
            className="w-full sm:w-auto"
          >
            {loading ? t('common:buttons.loading') : t('proof.confirmDelivery')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
