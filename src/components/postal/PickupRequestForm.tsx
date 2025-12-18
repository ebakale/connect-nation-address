import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePickupRequests } from '@/hooks/usePickupRequests';
import { useCitizenAddresses } from '@/hooks/useCAR';
import { UACAddressPicker, SelectedAddress } from '@/components/UACAddressPicker';
import { TimeWindow } from '@/types/postalEnhanced';
import { CalendarIcon, Package, MapPin, Home, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface PickupRequestFormProps {
  open: boolean;
  onClose: () => void;
}

interface AddressDetail {
  uac: string;
  street: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  address_type: string;
  verified: boolean;
  public: boolean;
  building?: string;
  kind: string;
}

export const PickupRequestForm = ({ open, onClose }: PickupRequestFormProps) => {
  const { t } = useTranslation('postal');
  const { createRequest } = usePickupRequests();
  const { currentAddresses, loading: addressesLoading } = useCitizenAddresses();
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(undefined);
  const [addressMode, setAddressMode] = useState<'my-addresses' | 'search'>('my-addresses');
  const [myAddressDetails, setMyAddressDetails] = useState<AddressDetail[]>([]);

  const [formData, setFormData] = useState({
    pickup_address_uac: '',
    package_description: '',
    package_count: 1,
    estimated_weight_grams: undefined as number | undefined,
    preferred_time_window: 'any' as TimeWindow,
    contact_name: '',
    contact_phone: '',
    pickup_notes: '',
  });

  // Fetch address details for citizen's addresses
  useEffect(() => {
    const fetchAddressDetails = async () => {
      if (!currentAddresses || currentAddresses.length === 0) {
        setMyAddressDetails([]);
        return;
      }

      try {
        const uacs = currentAddresses.map(a => a.uac);
        const { data, error } = await supabase
          .from('addresses')
          .select('uac, street, city, region, country, latitude, longitude, address_type, verified, public, building')
          .in('uac', uacs);

        if (error) throw error;

        const details: AddressDetail[] = currentAddresses.map(addr => {
          const detail = data?.find(d => d.uac === addr.uac);
          return {
            uac: addr.uac,
            street: detail?.street || '',
            city: detail?.city || '',
            region: detail?.region || '',
            country: detail?.country || '',
            latitude: detail?.latitude || 0,
            longitude: detail?.longitude || 0,
            address_type: detail?.address_type || 'residential',
            verified: detail?.verified || false,
            public: detail?.public || false,
            building: detail?.building,
            kind: addr.address_kind
          };
        });
        setMyAddressDetails(details);
      } catch (error) {
        console.error('Error fetching address details:', error);
      }
    };

    fetchAddressDetails();
  }, [currentAddresses]);

  const handleMyAddressSelect = (uac: string) => {
    const detail = myAddressDetails.find(d => d.uac === uac);
    if (detail) {
      setSelectedAddress({
        uac: detail.uac,
        country: detail.country,
        region: detail.region,
        city: detail.city,
        street: detail.street,
        building: detail.building,
        latitude: detail.latitude,
        longitude: detail.longitude,
        address_type: detail.address_type,
        description: `${detail.street}, ${detail.city}`,
        verified: detail.verified,
        public: detail.public
      });
      setFormData({ ...formData, pickup_address_uac: uac });
    }
  };

  const timeWindows: TimeWindow[] = ['any', 'morning', 'afternoon', 'evening'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress || !preferredDate || !formData.contact_name) return;

    setLoading(true);
    const success = await createRequest({
      pickup_address_uac: selectedAddress.uac,
      package_description: formData.package_description || undefined,
      package_count: formData.package_count,
      estimated_weight_grams: formData.estimated_weight_grams,
      preferred_date: format(preferredDate, 'yyyy-MM-dd'),
      preferred_time_window: formData.preferred_time_window,
      contact_name: formData.contact_name,
      contact_phone: formData.contact_phone || undefined,
      pickup_notes: formData.pickup_notes || undefined,
    });
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('pickup.requestTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Address */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('pickup.pickupLocation')}
            </h3>
            <div className="space-y-2">
              <Label>{t('pickup.address')} *</Label>
              
              <Tabs value={addressMode} onValueChange={(v) => {
                setAddressMode(v as 'my-addresses' | 'search');
                setSelectedAddress(null);
                setFormData({ ...formData, pickup_address_uac: '' });
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="my-addresses" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {t('pickup.myAddresses', 'My Addresses')}
                  </TabsTrigger>
                  <TabsTrigger value="search" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    {t('pickup.searchAddress')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="my-addresses" className="mt-3">
                  {addressesLoading ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      {t('common:buttons.loading')}
                    </div>
                  ) : myAddressDetails.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
                      {t('pickup.noRegisteredAddresses', 'No registered addresses. Use the search tab to find an address.')}
                    </div>
                  ) : (
                    <Select
                      value={selectedAddress?.uac || ''}
                      onValueChange={handleMyAddressSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('pickup.selectMyAddress', 'Select one of your addresses')} />
                      </SelectTrigger>
                      <SelectContent>
                        {myAddressDetails.map((addr) => (
                          <SelectItem key={addr.uac} value={addr.uac}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{addr.uac}</span>
                              {addr.kind === 'PRIMARY' && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('pickup.primary', 'Primary')}
                                </Badge>
                              )}
                              <span className="text-muted-foreground text-sm truncate max-w-[200px]">
                                {addr.street}, {addr.city}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TabsContent>

                <TabsContent value="search" className="mt-3">
                  <UACAddressPicker
                    onAddressSelect={(address) => {
                      setSelectedAddress(address);
                      setFormData({ ...formData, pickup_address_uac: address.uac });
                    }}
                    onClear={() => {
                      setSelectedAddress(null);
                      setFormData({ ...formData, pickup_address_uac: '' });
                    }}
                    placeholder={t('pickup.searchAddress')}
                    showDescription={true}
                    allowPrivateAddresses={true}
                  />
                </TabsContent>
              </Tabs>

              {/* Show selected address confirmation */}
              {selectedAddress && (
                <div className="p-3 bg-muted/50 rounded-md border">
                  <div className="text-sm font-medium">{t('pickup.selectedAddress', 'Selected Address')}</div>
                  <div className="font-mono text-sm">{selectedAddress.uac}</div>
                  {selectedAddress.description && (
                    <div className="text-sm text-muted-foreground">{selectedAddress.description}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('pickup.packageDetails')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('pickup.packageDescription')}</Label>
                <Textarea
                  value={formData.package_description}
                  onChange={(e) => setFormData({ ...formData, package_description: e.target.value })}
                  placeholder={t('pickup.descriptionPlaceholder')}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pickup.packageCount')} *</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.package_count}
                  onChange={(e) => setFormData({ ...formData, package_count: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pickup.estimatedWeight')}</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.estimated_weight_grams || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_weight_grams: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder={t('pickup.weightPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('pickup.schedule')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('pickup.preferredDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !preferredDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {preferredDate ? format(preferredDate, "PPP") : t('pickup.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={preferredDate}
                      onSelect={setPreferredDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('pickup.preferredTime')}</Label>
                <Select
                  value={formData.preferred_time_window}
                  onValueChange={(v) => setFormData({ ...formData, preferred_time_window: v as TimeWindow })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeWindows.map((tw) => (
                      <SelectItem key={tw} value={tw}>
                        {t(`preferences.${tw}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('pickup.contactInfo')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('pickup.contactName')} *</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pickup.contactPhone')}</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t('pickup.notes')}</Label>
            <Textarea
              value={formData.pickup_notes}
              onChange={(e) => setFormData({ ...formData, pickup_notes: e.target.value })}
              placeholder={t('pickup.notesPlaceholder')}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {t('common:buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedAddress || !preferredDate || !formData.contact_name}
              className="w-full sm:w-auto"
            >
              {loading ? t('common:buttons.loading') : t('pickup.submitRequest')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
