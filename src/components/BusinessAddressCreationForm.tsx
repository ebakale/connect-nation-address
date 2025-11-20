import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BusinessMapLocationPicker } from "./BusinessMapLocationPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Phone, Clock, Accessibility } from "lucide-react";

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

interface BusinessAddressCreationFormProps {
  onSuccess: (requestId: string) => void;
  onCancel: () => void;
}

export function BusinessAddressCreationForm({ onSuccess, onCancel }: BusinessAddressCreationFormProps) {
  const { t } = useTranslation(['business', 'common']);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("organization");
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string; province_id: string }[]>([]);
  const [availableCities, setAvailableCities] = useState<{ id: string; name: string }[]>([]);

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
    
    // Location
    latitude: null as number | null,
    longitude: null as number | null,
    street: "",
    city: "",
    region: "",
    country: "Equatorial Guinea",
    building: "",
    description: "",
    
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

  // Fetch provinces and cities on mount
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const provincesResponse = await supabase
          .from('provinces' as any)
          .select('id, name')
          .order('name');

        if (provincesResponse.error) throw provincesResponse.error;
        setProvinces((provincesResponse.data as any) || []);

        const citiesResponse = await supabase
          .from('cities' as any)
          .select('id, name, province_id')
          .order('name');

        if (citiesResponse.error) throw citiesResponse.error;
        setCities((citiesResponse.data as any) || []);
      } catch (error) {
        console.error('Error fetching location data:', error);
        toast.error(t('common:error'));
      }
    };

    fetchLocationData();
  }, [t]);

  // Update available cities when region changes
  useEffect(() => {
    if (formData.region) {
      const selectedProvince = provinces.find(p => p.name === formData.region);
      if (selectedProvince) {
        const filteredCities = cities.filter(c => c.province_id === selectedProvince.id);
        setAvailableCities(filteredCities);
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.region, provinces, cities]);

  const handleLocationSelect = (lat: number, lng: number, address: any) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      street: address.street || "",
      city: address.city || "",
      region: address.region || "",
      country: address.country || "Equatorial Guinea",
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t('common:pleaseLogin'));
      return;
    }

    if (!formData.organizationName || !formData.businessCategory) {
      toast.error(t('common:fillRequired'));
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error(t('business:registration.selectLocation'));
      return;
    }

    if (!formData.street || !formData.city || !formData.region) {
      toast.error(t('common:fillRequired'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-business-address', {
        body: {
          latitude: formData.latitude,
          longitude: formData.longitude,
          street: formData.street,
          city: formData.city,
          region: formData.region,
          country: formData.country,
          building: formData.building,
          description: formData.description,
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
      onSuccess(data.requestId);
    } catch (error: any) {
      console.error('Error registering business:', error);
      toast.error(error.message || t('common:error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="w-full">{/* Removed grid-cols-5 to allow flex-wrap */}
          <TabsTrigger value="organization">
            <Building2 className="h-4 w-4 mr-2" />
            {t('business:registration.organizationDetails')}
          </TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="h-4 w-4 mr-2" />
            {t('business:registration.locationAddress')}
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="h-4 w-4 mr-2" />
            {t('business:registration.contactInformation')}
          </TabsTrigger>
          <TabsTrigger value="operating">
            <Clock className="h-4 w-4 mr-2" />
            {t('business:registration.operatingInformation')}
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Accessibility className="h-4 w-4 mr-2" />
            {t('business:registration.accessibility')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4 mt-6">
          <div>
            <Label htmlFor="orgName">{t('business:registration.organizationName')} *</Label>
            <Input
              id="orgName"
              value={formData.organizationName}
              onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
              required
            />
          </div>

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
        </TabsContent>

        <TabsContent value="location" className="space-y-4 mt-6">
          <BusinessMapLocationPicker onLocationSelect={handleLocationSelect} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">{t('common:street')} *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="building">{t('common:building')}</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="region">{t('common:region')} *</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, region: value, city: "" }));
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={t('common:select') + "..."} />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {provinces.map(province => (
                    <SelectItem key={province.id} value={province.name}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">{t('common:city')} *</Label>
              <Select 
                value={formData.city} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                disabled={!formData.region}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={formData.region ? t('common:select') + "..." : t('business:registration.selectProvinceFirst')} />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {availableCities.map(city => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t('common:description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('business:registration.descriptionPlaceholder')}
            />
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-6">
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
              <Label htmlFor="phone2">{t('business:registration.secondaryPhone')}</Label>
              <Input
                id="phone2"
                type="tel"
                value={formData.secondaryContactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryContactPhone: e.target.value }))}
              />
            </div>
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

          <div>
            <Label htmlFor="website">{t('business:registration.website')}</Label>
            <Input
              id="website"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="operating" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employees">{t('business:registration.employeeCount')}</Label>
              <Input
                id="employees"
                type="number"
                value={formData.employeeCount}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="capacity">{t('business:registration.customerCapacity')}</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.customerCapacity}
                onChange={(e) => setFormData(prev => ({ ...prev, customerCapacity: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="services">{t('business:registration.servicesOffered')}</Label>
            <Textarea
              id="services"
              placeholder={t('common:commaSeparated')}
              value={formData.servicesOffered}
              onChange={(e) => setFormData(prev => ({ ...prev, servicesOffered: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="languages">{t('business:registration.languagesSpoken')}</Label>
            <Input
              id="languages"
              placeholder={t('common:commaSeparated')}
              value={formData.languagesSpoken}
              onChange={(e) => setFormData(prev => ({ ...prev, languagesSpoken: e.target.value }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4 mt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="parking"
                checked={formData.parkingAvailable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, parkingAvailable: checked as boolean }))}
              />
              <Label htmlFor="parking">{t('business:registration.parkingAvailable')}</Label>
            </div>

            {formData.parkingAvailable && (
              <div>
                <Label htmlFor="parkingCap">{t('business:registration.parkingCapacity')}</Label>
                <Input
                  id="parkingCap"
                  type="number"
                  value={formData.parkingCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, parkingCapacity: e.target.value }))}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="wheelchair"
                checked={formData.wheelchairAccessible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, wheelchairAccessible: checked as boolean }))}
              />
              <Label htmlFor="wheelchair">{t('business:registration.wheelchairAccessible')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="publicService"
                checked={formData.publicService}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publicService: checked as boolean }))}
              />
              <Label htmlFor="publicService">{t('business:registration.publicService')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="appointment"
                checked={formData.appointmentRequired}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, appointmentRequired: checked as boolean }))}
              />
              <Label htmlFor="appointment">{t('business:registration.appointmentRequired')}</Label>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium">{t('business:registration.visibilitySettings')}</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible"
                checked={formData.publiclyVisible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publiclyVisible: checked as boolean }))}
              />
              <Label htmlFor="visible">{t('business:registration.publiclyVisible')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="maps"
                checked={formData.showOnMaps}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showOnMaps: checked as boolean }))}
              />
              <Label htmlFor="maps">{t('business:registration.showOnMaps')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="contact"
                checked={formData.showContactInfo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showContactInfo: checked as boolean }))}
              />
              <Label htmlFor="contact">{t('business:registration.showContactInfo')}</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          {t('business:registration.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading ? t('common:buttons.loading') : t('business:registration.submitRegistration')}
        </Button>
      </div>
    </div>
  );
}
