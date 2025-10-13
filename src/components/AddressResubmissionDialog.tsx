import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, MapPin, FileText, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface RejectedAddress {
  id: string;
  requester_id?: string;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  address_type: string;
  description?: string;
  justification: string;
  rejection_reason: string;
  rejection_notes?: string;
  rejected_by: string;
  rejected_at: string;
  created_at: string;
}

interface AddressResubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectedAddress: RejectedAddress | null;
  onSuccess?: () => void;
}

const resubmissionSchema = z.object({
  street: z.string().trim().min(1, "Street address is required").max(200, "Street address must be less than 200 characters"),
  city: z.string().trim().min(1, "City is required").max(100, "City must be less than 100 characters"),
  region: z.string().trim().min(1, "Region is required").max(100, "Region must be less than 100 characters"),
  country: z.string().trim().min(1, "Country is required").max(100, "Country must be less than 100 characters"),
  building: z.string().trim().max(100, "Building must be less than 100 characters").optional(),
  address_type: z.string().min(1, "Address type is required"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  latitude: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  longitude: z.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
  photo_url: z.string().url("Invalid photo URL").optional().or(z.literal("")),
  justification: z.string().trim().min(10, "Justification must be at least 10 characters").max(1000, "Justification must be less than 1000 characters"),
});

export function AddressResubmissionDialog({ 
  open, 
  onOpenChange, 
  rejectedAddress, 
  onSuccess 
}: AddressResubmissionDialogProps) {
  const { t } = useTranslation('address');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    region: "",
    country: "",
    building: "",
    address_type: "residential",
    description: "",
    latitude: 0,
    longitude: 0,
    photo_url: "",
    justification: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with rejected address data when dialog opens
  useEffect(() => {
    if (rejectedAddress && open) {
      setFormData({
        street: rejectedAddress.street || "",
        city: rejectedAddress.city || "",
        region: rejectedAddress.region || "",
        country: rejectedAddress.country || "",
        building: rejectedAddress.building || "",
        address_type: rejectedAddress.address_type || "residential",
        description: rejectedAddress.description || "",
        latitude: rejectedAddress.latitude || 0,
        longitude: rejectedAddress.longitude || 0,
        photo_url: "",
        justification: `Resubmission addressing: ${rejectedAddress.rejection_reason}. ${rejectedAddress.rejection_notes || ""}`.trim(),
      });
      setErrors({});
    }
  }, [rejectedAddress, open]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    try {
      resubmissionSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!rejectedAddress || !validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('resubmit_address_request', {
        p_original_request_id: rejectedAddress.id,
        p_user_id: rejectedAddress.requester_id,
        p_latitude: formData.latitude,
        p_longitude: formData.longitude,
        p_street: formData.street,
        p_city: formData.city,
        p_region: formData.region,
        p_country: formData.country,
        p_building: formData.building || null,
        p_address_type: formData.address_type,
        p_description: formData.description || null,
        p_photo_url: formData.photo_url || null,
        p_justification: formData.justification,
      });

      if (error) throw error;

      toast.success(t('resubmissionSuccessful'));
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error resubmitting address:', error);
      toast.error(t('failedToResubmitAddress'));
    } finally {
      setLoading(false);
    }
  };

  if (!rejectedAddress) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('guideResubmission')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rejection Feedback Section */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{t('rejectionFeedback')}:</p>
                <p className="text-sm">{rejectedAddress.rejection_reason}</p>
                {rejectedAddress.rejection_notes && (
                  <p className="text-sm italic">{rejectedAddress.rejection_notes}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Guidance Section */}
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <p className="text-sm">
                {t('resubmissionGuidance')}
              </p>
            </AlertDescription>
          </Alert>

          {/* Resubmission Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">{t('street')} *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder={t('streetPlaceholder')}
                className={errors.street ? "border-destructive" : ""}
              />
              {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t('city')} *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder={t('cityPlaceholder')}
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">{t('region')} *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder={t('regionPlaceholder')}
                className={errors.region ? "border-destructive" : ""}
              />
              {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{t('country')} *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder={t('countryPlaceholder')}
                className={errors.country ? "border-destructive" : ""}
              />
              {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="building">{t('buildingOptional')}</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                placeholder={t('buildingPlaceholder')}
                className={errors.building ? "border-destructive" : ""}
              />
              {errors.building && <p className="text-sm text-destructive">{errors.building}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_type">{t('addressType')} *</Label>
              <Select
                value={formData.address_type}
                onValueChange={(value) => handleInputChange('address_type', value)}
              >
                <SelectTrigger className={errors.address_type ? "border-destructive" : ""}>
                  <SelectValue placeholder={t('selectAddressType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">{t('addressType.residential')}</SelectItem>
                  <SelectItem value="commercial">{t('addressType.commercial')}</SelectItem>
                  <SelectItem value="industrial">{t('addressType.industrial')}</SelectItem>
                  <SelectItem value="mixed">{t('addressType.mixed')}</SelectItem>
                  <SelectItem value="institutional">{t('addressType.institutional')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.address_type && <p className="text-sm text-destructive">{errors.address_type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude">{t('latitude')} *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                placeholder="1.6508"
                className={errors.latitude ? "border-destructive" : ""}
              />
              {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">{t('longitude')} *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                placeholder="10.2679"
                className={errors.longitude ? "border-destructive" : ""}
              />
              {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('descriptionOptional')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url">{t('photoOptional')}</Label>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <Input
                id="photo_url"
                type="url"
                value={formData.photo_url}
                onChange={(e) => handleInputChange('photo_url', e.target.value)}
                placeholder={t('photoUrlPlaceholder')}
                className={errors.photo_url ? "border-destructive" : ""}
              />
            </div>
            {errors.photo_url && <p className="text-sm text-destructive">{errors.photo_url}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification">{t('justification')} *</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => handleInputChange('justification', e.target.value)}
              placeholder={t('justificationPlaceholder')}
              rows={4}
              className={errors.justification ? "border-destructive" : ""}
            />
            {errors.justification && <p className="text-sm text-destructive">{errors.justification}</p>}
            <p className="text-xs text-muted-foreground">
              {t('justificationHelpText')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? t('submittingResubmission') : t('submitResubmission')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}