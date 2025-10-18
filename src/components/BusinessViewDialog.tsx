import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Globe, Users, Clock, Building2, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Database } from "@/integrations/supabase/types";

type OrganizationAddress = Database["public"]["Tables"]["organization_addresses"]["Row"] & {
  addresses?: {
    uac: string;
    street: string;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
    verified: boolean;
    building?: string;
  };
};

interface BusinessViewDialogProps {
  business: OrganizationAddress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusinessViewDialog({ business, open, onOpenChange }: BusinessViewDialogProps) {
  const { t } = useTranslation(['business', 'common']);

  if (!business) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="h-6 w-6" />
            {business.organization_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status & Category */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {t(`business:categories.${business.business_category}`)}
            </Badge>
            {business.business_address_type && (
              <Badge variant="outline">
                {business.business_address_type}
              </Badge>
            )}
            {business.addresses?.verified ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('business:dashboard.verified')}
              </Badge>
            ) : (
              <Badge variant="outline">
                <XCircle className="h-3 w-3 mr-1" />
                {t('business:dashboard.unverified')}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Address Information */}
          {business.addresses && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('business:registration.locationDetails')}
              </h3>
              <div className="space-y-2 text-sm pl-7">
                <div>
                  <span className="font-medium">UAC:</span> {business.addresses.uac}
                </div>
                <div>
                  <span className="font-medium">{t('address:street')}:</span> {business.addresses.street}
                  {business.addresses.building && `, ${business.addresses.building}`}
                </div>
                <div>
                  <span className="font-medium">{t('address:city')}:</span> {business.addresses.city}
                </div>
                <div>
                  <span className="font-medium">{t('address:region')}:</span> {business.addresses.region}
                </div>
                <div>
                  <span className="font-medium">{t('address:country')}:</span> {business.addresses.country}
                </div>
                <div>
                  <span className="font-medium">{t('address:coordinates')}:</span>{' '}
                  {business.addresses.latitude.toFixed(6)}, {business.addresses.longitude.toFixed(6)}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">{t('business:registration.contactInformation')}</h3>
            <div className="space-y-3 pl-2">
              {business.primary_contact_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{business.primary_contact_name}</span>
                </div>
              )}
              {business.primary_contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${business.primary_contact_phone}`} className="hover:underline">
                    {business.primary_contact_phone}
                  </a>
                </div>
              )}
              {business.secondary_contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${business.secondary_contact_phone}`} className="hover:underline">
                    {business.secondary_contact_phone} <span className="text-muted-foreground">(Secondary)</span>
                  </a>
                </div>
              )}
              {business.primary_contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${business.primary_contact_email}`} className="hover:underline">
                    {business.primary_contact_email}
                  </a>
                </div>
              )}
              {business.website_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={business.website_url}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                  >
                    {business.website_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Business Details */}
          <div>
            <h3 className="font-semibold mb-3">{t('business:registration.businessDetails')}</h3>
            <div className="space-y-2 text-sm pl-2">
              {business.business_registration_number && (
                <div>
                  <span className="font-medium">{t('business:registration.registrationNumber')}:</span>{' '}
                  {business.business_registration_number}
                </div>
              )}
              {business.tax_identification_number && (
                <div>
                  <span className="font-medium">{t('business:registration.taxId')}:</span>{' '}
                  {business.tax_identification_number}
                </div>
              )}
              {business.employee_count && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{business.employee_count} {t('business:registration.employees')}</span>
                </div>
              )}
              {business.customer_capacity && (
                <div>
                  <span className="font-medium">{t('business:registration.customerCapacity')}:</span>{' '}
                  {business.customer_capacity}
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          {(business.parking_available || business.wheelchair_accessible) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">{t('business:registration.amenities')}</h3>
                <div className="space-y-2 text-sm pl-2">
                  {business.parking_available && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{t('business:registration.parkingAvailable')}</span>
                      {business.parking_capacity && (
                        <span className="text-muted-foreground">({business.parking_capacity} spaces)</span>
                      )}
                    </div>
                  )}
                  {business.wheelchair_accessible && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{t('business:registration.wheelchairAccessible')}</span>
                    </div>
                  )}
                  {business.appointment_required && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{t('business:registration.appointmentRequired')}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Services & Languages */}
          {(business.services_offered?.length || business.languages_spoken?.length) && (
            <>
              <Separator />
              <div className="space-y-3">
                {business.services_offered && business.services_offered.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('business:registration.servicesOffered')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {business.services_offered.map((service, index) => (
                        <Badge key={index} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {business.languages_spoken && business.languages_spoken.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('business:registration.languages')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {business.languages_spoken.map((lang, index) => (
                        <Badge key={index} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>{t('common:registered')}: {new Date(business.created_at || '').toLocaleString()}</span>
            </div>
            {business.updated_at && business.updated_at !== business.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{t('common:updated')}: {new Date(business.updated_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}