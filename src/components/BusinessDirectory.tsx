import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, MapPin, Phone, Mail, Clock, Users, Accessibility, Search, 
  ChevronDown, ChevronUp, Globe, CheckCircle2, FileText, Hash, Car,
  Bus, Languages, Briefcase, ExternalLink, Calendar, Shield
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface OrganizationAddress {
  id: string;
  organization_name: string;
  business_category: string;
  business_address_type: string;
  business_registration_number?: string;
  tax_identification_number?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  secondary_contact_phone?: string;
  primary_contact_email?: string;
  website_url?: string;
  employee_count?: number;
  customer_capacity?: number;
  parking_available: boolean;
  parking_capacity?: number;
  wheelchair_accessible: boolean;
  is_public_service: boolean;
  appointment_required: boolean;
  services_offered?: string[];
  languages_spoken?: string[];
  operating_hours?: any;
  public_transport_access?: string[];
  seasonal_operation?: boolean;
  business_status?: string;
  publicly_visible: boolean;
  show_contact_info: boolean;
  verified_at?: string;
  authority_type?: string;
  created_at?: string;
  addresses: {
    uac: string;
    street: string;
    building?: string;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

export function BusinessDirectory() {
  const { t } = useTranslation(['business', 'address', 'common']);
  const [businesses, setBusinesses] = useState<OrganizationAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_addresses')
        .select(`
          *,
          addresses!organization_addresses_address_id_fkey (
            uac,
            street,
            building,
            city,
            region,
            country,
            latitude,
            longitude
          )
        `)
        .eq('publicly_visible', true)
        .order('organization_name');

      if (error) throw error;

      setBusinesses(data || []);
      
      const uniqueCategories = Array.from(
        new Set(data?.map(b => b.business_category).filter(Boolean) || [])
      ).sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error(t('search.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.organization_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      business.services_offered?.some(s => 
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCategory = categoryFilter === "all" || 
      business.business_category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('search.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search.searchBusinesses')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder={t('search.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allCategories')}</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {t(`categories.${category}`, { defaultValue: category })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {t('search.resultsFound', { count: filteredBusinesses.length })}
      </p>

      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('search.noBusinessesFound')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredBusinesses.map((business) => {
            const isVerified = !!business.verified_at;
            const isExpanded = expandedCards.has(business.id);
            
            return (
              <Card 
                key={business.id} 
                className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                  isVerified ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <Collapsible open={isExpanded} onOpenChange={() => toggleCard(business.id)}>
                  {/* Card Header - Always Visible */}
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer hover:bg-muted/30 transition-colors p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground break-words">
                                {business.organization_name}
                              </h3>
                              {isVerified && (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t('common:verified')}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {t(`categories.${business.business_category}`, { defaultValue: business.business_category })}
                              </Badge>
                              {business.business_address_type && (
                                <Badge variant="outline" className="text-xs">
                                  {t(`addressTypes.${business.business_address_type}`, { defaultValue: business.business_address_type })}
                                </Badge>
                              )}
                              {business.is_public_service && (
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-xs gap-1">
                                  <Shield className="h-3 w-3" />
                                  {t('search.publicService')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 p-1">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 px-4 space-y-4">
                      <Separator />
                      
                      {/* Address Section */}
                      {business.addresses && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {t('address:address')}
                          </h4>
                          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            {business.addresses.uac && (
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                                  {business.addresses.uac}
                                </code>
                              </div>
                            )}
                            <p className="text-sm break-words">
                              {business.addresses.building && `${business.addresses.building}, `}
                              {business.addresses.street}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {business.addresses.city}, {business.addresses.region}, {business.addresses.country}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${business.addresses.latitude},${business.addresses.longitude}`,
                                  '_blank'
                                );
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t('search.viewOnMap')}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Contact & Business Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contact Section */}
                        {business.show_contact_info && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {t('registration.contactInformation')}
                            </h4>
                            <div className="space-y-2 text-sm">
                              {business.primary_contact_name && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="break-words">{business.primary_contact_name}</span>
                                </div>
                              )}
                              {business.primary_contact_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <a 
                                    href={`tel:${business.primary_contact_phone}`} 
                                    className="text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {business.primary_contact_phone}
                                  </a>
                                </div>
                              )}
                              {business.secondary_contact_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <a 
                                    href={`tel:${business.secondary_contact_phone}`} 
                                    className="text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {business.secondary_contact_phone}
                                  </a>
                                </div>
                              )}
                              {business.primary_contact_email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <a 
                                    href={`mailto:${business.primary_contact_email}`} 
                                    className="text-primary hover:underline break-all"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {business.primary_contact_email}
                                  </a>
                                </div>
                              )}
                              {business.website_url && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <a 
                                    href={business.website_url.startsWith('http') ? business.website_url : `https://${business.website_url}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline break-all"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {business.website_url}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Business Details Section */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {t('registration.businessDetails')}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {business.business_registration_number && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">{t('registration.registrationNumber')}:</span>
                                <span className="font-mono">{business.business_registration_number}</span>
                              </div>
                            )}
                            {business.tax_identification_number && (
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">{t('registration.taxId')}:</span>
                                <span className="font-mono">{business.tax_identification_number}</span>
                              </div>
                            )}
                            {business.employee_count && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">{t('registration.employeeCount')}:</span>
                                <span>{business.employee_count}</span>
                              </div>
                            )}
                            {business.customer_capacity && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">{t('registration.customerCapacity')}:</span>
                                <span>{business.customer_capacity}</span>
                              </div>
                            )}
                            {business.business_status && (
                              <div className="flex items-center gap-2">
                                <Badge variant={business.business_status === 'ACTIVE' ? 'default' : 'secondary'}>
                                  {business.business_status}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amenities Section */}
                      {(business.parking_available || business.wheelchair_accessible || 
                        business.appointment_required || business.public_transport_access?.length) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Accessibility className="h-4 w-4" />
                            {t('registration.amenities')}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {business.parking_available && (
                              <Badge variant="outline" className="gap-1">
                                <Car className="h-3 w-3" />
                                {t('search.parking')}
                                {business.parking_capacity && ` (${business.parking_capacity})`}
                              </Badge>
                            )}
                            {business.wheelchair_accessible && (
                              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                                <Accessibility className="h-3 w-3" />
                                {t('search.accessible')}
                              </Badge>
                            )}
                            {business.appointment_required && (
                              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600">
                                <Calendar className="h-3 w-3" />
                                {t('search.appointmentRequired')}
                              </Badge>
                            )}
                            {business.public_transport_access?.map((transport, idx) => (
                              <Badge key={idx} variant="outline" className="gap-1">
                                <Bus className="h-3 w-3" />
                                {transport}
                              </Badge>
                            ))}
                            {business.seasonal_operation && (
                              <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600">
                                <Clock className="h-3 w-3" />
                                {t('registration.seasonalOperation')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Services Section */}
                      {business.services_offered && business.services_offered.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {t('registration.servicesOffered')}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {business.services_offered.map((service, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages Section */}
                      {business.languages_spoken && business.languages_spoken.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            {t('registration.languagesSpoken')}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {business.languages_spoken.map((language, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Verification Info Footer */}
                      {isVerified && (
                        <>
                          <Separator />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span>{t('verification.verifiedOn')}: {formatDate(business.verified_at)}</span>
                            </div>
                            {business.authority_type && (
                              <span>{t('verification.verifiedBy')}: {business.authority_type}</span>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
