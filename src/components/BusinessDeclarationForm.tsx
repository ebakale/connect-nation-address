import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const BUSINESS_CATEGORIES = [
  "RETAIL", "OFFICE", "RESTAURANT", "HOTEL", "HOSPITAL", "SCHOOL", 
  "UNIVERSITY", "GOVERNMENT_OFFICE", "POLICE_STATION", "FIRE_STATION",
  "EMBASSY", "BANK", "FACTORY", "WAREHOUSE", "FARM", "CHURCH",
  "MOSQUE", "MARKET", "SHOPPING_CENTER", "GAS_STATION", "AIRPORT", "PORT", "OTHER"
];

const ADDRESS_TYPES = [
  "COMMERCIAL", "GOVERNMENT", "INDUSTRIAL", "INSTITUTIONAL", 
  "PUBLIC_FACILITY", "AGRICULTURAL", "MIXED_USE"
];

interface BusinessDeclarationFormProps {
  prefilledUAC?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BusinessDeclarationForm({ prefilledUAC, onSuccess, onCancel }: BusinessDeclarationFormProps) {
  const { t } = useTranslation(['business', 'common']);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Organization Details
    organizationName: "",
    businessCategory: "",
    businessAddressType: "COMMERCIAL",
    registrationNumber: "",
    taxId: "",
    
    // Contact
    primaryContactName: "",
    primaryContactPhone: "",
    primaryContactEmail: "",
    secondaryContactPhone: "",
    websiteUrl: "",
    
    // Operating Info
    employeeCount: "",
    customerCapacity: "",
    servicesOffered: "",
    languagesSpoken: "Spanish",
    
    // Facilities
    parkingAvailable: false,
    parkingCapacity: "",
    wheelchairAccessible: false,
    publicService: false,
    appointmentRequired: false,
    
    // Visibility
    publiclyVisible: true,
    showOnMaps: true,
    showContactInfo: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t('common:pleaseLogin'));
      return;
    }

    if (!formData.organizationName || !formData.businessCategory) {
      toast.error(t('common:fillRequired'));
      return;
    }

    if (!prefilledUAC) {
      toast.error(t('business:registration.uacRequired'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-business-address', {
        body: {
          uac: prefilledUAC, // Use the prefilled UAC
          businessAddressType: formData.businessAddressType,
          organizationName: formData.organizationName,
          businessCategory: formData.businessCategory,
          registrationNumber: formData.registrationNumber,
          taxId: formData.taxId,
          primaryContactName: formData.primaryContactName,
          primaryContactPhone: formData.primaryContactPhone,
          primaryContactEmail: formData.primaryContactEmail,
          secondaryContactPhone: formData.secondaryContactPhone,
          websiteUrl: formData.websiteUrl,
          employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : null,
          customerCapacity: formData.customerCapacity ? parseInt(formData.customerCapacity) : null,
          parkingAvailable: formData.parkingAvailable,
          parkingCapacity: formData.parkingCapacity ? parseInt(formData.parkingCapacity) : null,
          wheelchairAccessible: formData.wheelchairAccessible,
          publicService: formData.publicService,
          appointmentRequired: formData.appointmentRequired,
          servicesOffered: formData.servicesOffered ? formData.servicesOffered.split(',').map((s: string) => s.trim()) : [],
          languagesSpoken: formData.languagesSpoken ? formData.languagesSpoken.split(',').map((s: string) => s.trim()) : ['Spanish'],
          publiclyVisible: formData.publiclyVisible,
          showOnMaps: formData.showOnMaps,
          showContactInfo: formData.showContactInfo,
        },
      });

      if (error) throw error;

      toast.success(t('business:registration.successMessage'));
      onSuccess?.();
    } catch (error: any) {
      console.error('Error registering business:', error);
      toast.error(error.message || t('common:error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* UAC Display (read-only) */}
      {prefilledUAC && (
        <div className="p-4 bg-muted rounded-lg">
          <Label className="text-sm font-medium">{t('common:addressUAC')}</Label>
          <p className="text-lg font-mono font-semibold text-primary mt-1">{prefilledUAC}</p>
        </div>
      )}

      {/* Organization Name */}
      <div>
        <Label htmlFor="orgName">{t('business:registration.organizationName')} *</Label>
        <Input
          id="orgName"
          value={formData.organizationName}
          onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
          required
        />
      </div>

      {/* Business Category */}
      <div>
        <Label htmlFor="category">{t('business:registration.businessCategory')} *</Label>
        <Select value={formData.businessCategory} onValueChange={(value) => setFormData(prev => ({ ...prev, businessCategory: value }))}>
          <SelectTrigger>
            <SelectValue placeholder={t('business:search.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>
                {t(`business:categories.${cat}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Address Type */}
      <div>
        <Label htmlFor="addressType">{t('common:addressType')}</Label>
        <Select value={formData.businessAddressType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessAddressType: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADDRESS_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {t(`business:addressTypes.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Registration Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="regNumber">{t('business:registration.registrationNumber')}</Label>
          <Input
            id="regNumber"
            value={formData.registrationNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="taxId">{t('business:registration.taxId')}</Label>
          <Input
            id="taxId"
            value={formData.taxId}
            onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="font-semibold">{t('business:registration.contactInformation')}</h3>
        
        <div>
          <Label htmlFor="contactName">{t('business:registration.primaryContact')}</Label>
          <Input
            id="contactName"
            value={formData.primaryContactName}
            onChange={(e) => setFormData(prev => ({ ...prev, primaryContactName: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">{t('business:registration.primaryPhone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.primaryContactPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryContactPhone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="email">{t('business:registration.primaryEmail')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.primaryContactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <Label htmlFor="services">{t('business:registration.servicesOffered')}</Label>
        <Textarea
          id="services"
          placeholder={t('common:commaSeparated')}
          value={formData.servicesOffered}
          onChange={(e) => setFormData(prev => ({ ...prev, servicesOffered: e.target.value }))}
          rows={3}
        />
      </div>

      {/* Accessibility Options */}
      <div className="space-y-3">
        <h3 className="font-semibold">{t('business:registration.accessibility')}</h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="wheelchair"
            checked={formData.wheelchairAccessible}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, wheelchairAccessible: checked as boolean }))}
          />
          <Label htmlFor="wheelchair" className="cursor-pointer">
            {t('business:search.wheelchairAccess')}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="publicService"
            checked={formData.publicService}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publicService: checked as boolean }))}
          />
          <Label htmlFor="publicService" className="cursor-pointer">
            {t('business:registration.publicService')}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="visible"
            checked={formData.publiclyVisible}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publiclyVisible: checked as boolean }))}
          />
          <Label htmlFor="visible" className="cursor-pointer">
            {t('business:registration.publiclyVisible')}
          </Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('common:cancel')}
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('business:registration.submitButton')}
        </Button>
      </div>
    </form>
  );
}
