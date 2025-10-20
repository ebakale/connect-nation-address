import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type OrganizationAddress = Database["public"]["Tables"]["organization_addresses"]["Row"];

interface BusinessEditDialogProps {
  business: OrganizationAddress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BusinessEditDialog({ business, open, onOpenChange, onSuccess }: BusinessEditDialogProps) {
  const { t } = useTranslation(['business', 'common']);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization_name: '',
    business_category: '',
    primary_contact_name: '',
    primary_contact_phone: '',
    primary_contact_email: '',
    secondary_contact_phone: '',
    website_url: '',
    employee_count: '',
    customer_capacity: '',
    services_offered: [] as string[],
    languages_spoken: [] as string[],
    parking_available: false,
    parking_capacity: '',
    wheelchair_accessible: false,
    public_service: false,
    appointment_required: false,
    business_status: 'active',
    publicly_visible: true,
    show_on_maps: true,
    show_contact_info: true,
  });

  useEffect(() => {
    if (business && open) {
      setFormData({
        organization_name: business.organization_name || '',
        business_category: business.business_category || '',
        primary_contact_name: business.primary_contact_name || '',
        primary_contact_phone: business.primary_contact_phone || '',
        primary_contact_email: business.primary_contact_email || '',
        secondary_contact_phone: business.secondary_contact_phone || '',
        website_url: business.website_url || '',
        employee_count: business.employee_count?.toString() || '',
        customer_capacity: business.customer_capacity?.toString() || '',
        services_offered: business.services_offered || [],
        languages_spoken: business.languages_spoken || [],
        parking_available: business.parking_available || false,
        parking_capacity: business.parking_capacity?.toString() || '',
        wheelchair_accessible: business.wheelchair_accessible || false,
        public_service: business.is_public_service || false,
        appointment_required: business.appointment_required || false,
        business_status: business.business_status || 'active',
        publicly_visible: business.publicly_visible ?? true,
        show_on_maps: business.show_on_maps ?? true,
        show_contact_info: business.show_contact_info ?? true,
      });
    }
  }, [business, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setLoading(true);
    try {
      const updateData: any = {
        organization_name: formData.organization_name,
        business_category: formData.business_category || null,
        primary_contact_name: formData.primary_contact_name || null,
        primary_contact_phone: formData.primary_contact_phone || null,
        primary_contact_email: formData.primary_contact_email || null,
        secondary_contact_phone: formData.secondary_contact_phone || null,
        website_url: formData.website_url || null,
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
        customer_capacity: formData.customer_capacity ? parseInt(formData.customer_capacity) : null,
        services_offered: formData.services_offered,
        languages_spoken: formData.languages_spoken,
        parking_available: formData.parking_available,
        parking_capacity: formData.parking_available && formData.parking_capacity 
          ? parseInt(formData.parking_capacity) 
          : null,
        wheelchair_accessible: formData.wheelchair_accessible,
        is_public_service: formData.public_service,
        appointment_required: formData.appointment_required,
        business_status: formData.business_status,
        publicly_visible: formData.publicly_visible,
        show_on_maps: formData.show_on_maps,
        show_contact_info: formData.show_contact_info,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('organization_addresses')
        .update(updateData)
        .eq('id', business.id);

      if (error) throw error;

      toast.success(t('business:dashboard.updateSuccess'));
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating business:', error);
      toast.error(error.message || t('business:dashboard.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (!business) return null;

  const BUSINESS_CATEGORIES = [
    "RETAIL", "OFFICE", "RESTAURANT", "HOTEL", "HOSPITAL", "SCHOOL", 
    "UNIVERSITY", "GOVERNMENT_OFFICE", "POLICE_STATION", "FIRE_STATION",
    "EMBASSY", "BANK", "FACTORY", "WAREHOUSE", "FARM", "CHURCH",
    "MOSQUE", "MARKET", "SHOPPING_CENTER", "GAS_STATION", "AIRPORT", "PORT", "OTHER"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('business:dashboard.editBusiness')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('business:registration.organizationDetails')}</h3>
            
            <div>
              <Label htmlFor="organization_name">{t('business:registration.organizationName')} *</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="business_category">{t('business:registration.businessCategory')}</Label>
              <Select value={formData.business_category} onValueChange={(value) => setFormData({ ...formData, business_category: value })}>
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

            <div>
              <Label htmlFor="business_status">{t('business:dashboard.status')}</Label>
              <Select value={formData.business_status} onValueChange={(value) => setFormData({ ...formData, business_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('business:dashboard.active')}</SelectItem>
                  <SelectItem value="temporarily_closed">{t('business:dashboard.temporarilyClosed')}</SelectItem>
                  <SelectItem value="permanently_closed">{t('business:dashboard.permanentlyClosed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('business:registration.contactInformation')}</h3>
            
            <div>
              <Label htmlFor="primary_contact_name">{t('business:registration.contactName')}</Label>
              <Input
                id="primary_contact_name"
                value={formData.primary_contact_name}
                onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_contact_phone">{t('business:registration.phone')}</Label>
                <Input
                  id="primary_contact_phone"
                  type="tel"
                  value={formData.primary_contact_phone}
                  onChange={(e) => setFormData({ ...formData, primary_contact_phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="secondary_contact_phone">{t('business:registration.secondaryPhone')}</Label>
                <Input
                  id="secondary_contact_phone"
                  type="tel"
                  value={formData.secondary_contact_phone}
                  onChange={(e) => setFormData({ ...formData, secondary_contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="primary_contact_email">{t('business:registration.email')}</Label>
              <Input
                id="primary_contact_email"
                type="email"
                value={formData.primary_contact_email}
                onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="website_url">{t('business:registration.website')}</Label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('business:registration.businessDetails')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_count">{t('business:registration.employeeCount')}</Label>
                <Input
                  id="employee_count"
                  type="number"
                  min="0"
                  value={formData.employee_count}
                  onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="customer_capacity">{t('business:registration.customerCapacity')}</Label>
                <Input
                  id="customer_capacity"
                  type="number"
                  min="0"
                  value={formData.customer_capacity}
                  onChange={(e) => setFormData({ ...formData, customer_capacity: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="services_offered">{t('business:registration.servicesOffered')}</Label>
              <Textarea
                id="services_offered"
                placeholder={t('common:commaSeparated')}
                value={formData.services_offered.join(', ')}
                onChange={(e) => setFormData({ ...formData, services_offered: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>

            <div>
              <Label htmlFor="languages_spoken">{t('business:registration.languagesSpoken')}</Label>
              <Input
                id="languages_spoken"
                placeholder={t('common:commaSeparated')}
                value={formData.languages_spoken.join(', ')}
                onChange={(e) => setFormData({ ...formData, languages_spoken: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('business:registration.amenities')}</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="parking_available">{t('business:registration.parkingAvailable')}</Label>
              <Switch
                id="parking_available"
                checked={formData.parking_available}
                onCheckedChange={(checked) => setFormData({ ...formData, parking_available: checked })}
              />
            </div>

            {formData.parking_available && (
              <div>
                <Label htmlFor="parking_capacity">{t('business:registration.parkingCapacity')}</Label>
                <Input
                  id="parking_capacity"
                  type="number"
                  min="0"
                  value={formData.parking_capacity}
                  onChange={(e) => setFormData({ ...formData, parking_capacity: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="wheelchair_accessible">{t('business:registration.wheelchairAccessible')}</Label>
              <Switch
                id="wheelchair_accessible"
                checked={formData.wheelchair_accessible}
                onCheckedChange={(checked) => setFormData({ ...formData, wheelchair_accessible: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="appointment_required">{t('business:registration.appointmentRequired')}</Label>
              <Switch
                id="appointment_required"
                checked={formData.appointment_required}
                onCheckedChange={(checked) => setFormData({ ...formData, appointment_required: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="public_service">{t('business:registration.publicService')}</Label>
              <Switch
                id="public_service"
                checked={formData.public_service}
                onCheckedChange={(checked) => setFormData({ ...formData, public_service: checked })}
              />
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('business:registration.visibilitySettings')}</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="publicly_visible">{t('business:registration.publiclyVisible')}</Label>
              <Switch
                id="publicly_visible"
                checked={formData.publicly_visible}
                onCheckedChange={(checked) => setFormData({ ...formData, publicly_visible: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_on_maps">{t('business:registration.showOnMaps')}</Label>
              <Switch
                id="show_on_maps"
                checked={formData.show_on_maps}
                onCheckedChange={(checked) => setFormData({ ...formData, show_on_maps: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_contact_info">{t('business:registration.showContactInfo')}</Label>
              <Switch
                id="show_contact_info"
                checked={formData.show_contact_info}
                onCheckedChange={(checked) => setFormData({ ...formData, show_contact_info: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common:saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}