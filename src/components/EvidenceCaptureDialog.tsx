import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Camera, Upload, X, Loader2, MapPin, Image } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';

interface EvidenceCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: string;
  incidentNumber: string;
  onEvidenceUploaded?: () => void;
}

export const EvidenceCaptureDialog = ({
  open,
  onOpenChange,
  incidentId,
  incidentNumber,
  onEvidenceUploaded
}: EvidenceCaptureDialogProps) => {
  const { t, i18n } = useTranslation('emergency');
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('evidence.invalidFileType'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('evidence.fileTooLarge'));
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      captureLocation();
    }
  };

  const captureLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error) {
      console.log('Location capture failed:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error(t('evidence.selectPhoto'));
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `incidents/${incidentId}/${timestamp}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('incident-evidence')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create evidence record
      const { error: recordError } = await supabase
        .from('incident_evidence')
        .insert({
          incident_id: incidentId,
          officer_id: user.id,
          file_path: filePath,
          file_type: selectedFile.type,
          description: description || null,
          location_latitude: currentLocation?.lat || null,
          location_longitude: currentLocation?.lng || null
        });

      if (recordError) throw recordError;

      // Log the action
      await supabase
        .from('emergency_incident_logs')
        .insert({
          incident_id: incidentId,
          user_id: user.id,
          action: 'evidence_uploaded',
          details: {
            file_path: filePath,
            description: description,
            has_location: !!currentLocation
          }
        });

      toast.success(t('evidence.uploadSuccess'));
      onEvidenceUploaded?.();
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('evidence.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription('');
    setCurrentLocation(null);
    onOpenChange(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" key={i18n.resolvedLanguage}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('evidence.captureEvidence')}
          </DialogTitle>
          <DialogDescription>
            {t('evidence.captureDescription', { incident: incidentNumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Area */}
          {previewUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
              {currentLocation && (
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-8 w-8" />
                <span className="text-xs">{t('evidence.takePhoto')}</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-8 w-8" />
                <span className="text-xs">{t('evidence.chooseFile')}</span>
              </Button>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('evidence.photoDescription')}</Label>
            <Textarea
              id="description"
              placeholder={t('evidence.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleClose}>
              {t('common:button.cancel')}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('evidence.uploading')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('evidence.uploadPhoto')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceCaptureDialog;
