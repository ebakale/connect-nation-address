import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Clock,
  PlusCircle,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Trash2,
  ChevronDown,
  ChevronUp,
  Accessibility,
  Car,
  Bus,
  Languages,
  Briefcase,
  FileText,
  Hash,
  Calendar,
  Shield,
  MapPinned,
  User,
  Wrench,
  EyeOff,
  Map
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { BusinessViewDialog } from "@/components/BusinessViewDialog";
import { BusinessEditDialog } from "@/components/BusinessEditDialog";

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

export default function MyBusinesses() {
  const { t } = useTranslation(['business', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<OrganizationAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<OrganizationAddress | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    pending: 0
  });

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (user) {
      loadBusinesses();
    }
  }, [user]);

  const loadBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_addresses')
        .select(`
          *,
          addresses!organization_addresses_address_id_fkey (
            uac,
            street,
            city,
            region,
            country,
            latitude,
            longitude,
            verified,
            building
          )
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
      
      // Calculate statistics
      const total = data?.length || 0;
      const active = data?.filter(b => b.business_status === 'active').length || 0;
      const verified = data?.filter(b => b.addresses?.verified).length || 0;
      const pending = data?.filter(b => !b.addresses?.verified).length || 0;
      
      setStats({ total, active, verified, pending });
    } catch (error: any) {
      console.error('Error loading businesses:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBusiness = (business: OrganizationAddress) => {
    setSelectedBusiness(business);
    setViewDialogOpen(true);
  };

  const handleEditBusiness = (business: OrganizationAddress) => {
    setSelectedBusiness(business);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadBusinesses();
  };

  const handleDeleteBusiness = async (business: OrganizationAddress) => {
    if (!confirm(t('business:confirmDeleteBusiness'))) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('delete_business_record', {
        p_organization_id: business.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result?.success) {
        toast.success(t('business:businessDeletedSuccessfully'));
        loadBusinesses();
      } else {
        toast.error(result?.error || t('business:deleteFailed'));
      }
    } catch (error: any) {
      console.error('Error deleting business:', error);
      toast.error(error.message || t('business:deleteError'));
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const getStatusBadge = (status: string | null, verified: boolean) => {
    if (!verified) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t('business:dashboard.pendingVerification')}
        </Badge>
      );
    }
    
    if (status === 'active') {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          {t('business:dashboard.active')}
        </Badge>
      );
    }
    
    if (status === 'temporarily_closed') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {t('business:dashboard.temporarilyClosed')}
        </Badge>
      );
    }
    
    if (status === 'permanently_closed') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          {t('business:dashboard.permanentlyClosed')}
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        {status || t('business:dashboard.pending')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <BreadcrumbNavigation 
        items={[
          { label: t('common:dashboard'), onClick: () => navigate('/dashboard') },
          { label: t('business:dashboard.myBusinesses'), isActive: true }
        ]}
        className="mb-4"
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
            {t('business:dashboard.myBusinesses')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('business:dashboard.manageYourBusinesses')}
          </p>
        </div>
        <Button onClick={() => navigate('/business/register')} className="flex items-center gap-2 w-full sm:w-auto">
          <PlusCircle className="h-4 w-4" />
          {t('business:dashboard.addBusiness')}
        </Button>
      </div>

      {/* Statistics Cards */}
      {businesses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('business:dashboard.total')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('business:dashboard.active')}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('business:dashboard.verified')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('business:dashboard.pending')}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {businesses.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{t('business:dashboard.noBusinesses')}</h2>
          <p className="text-muted-foreground mb-6">{t('business:dashboard.getStarted')}</p>
          <Button onClick={() => navigate('/business/register')}>
            {t('business:dashboard.registerFirstBusiness')}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => {
            const isExpanded = expandedCards.has(business.id);
            
            return (
              <Collapsible 
                key={business.id} 
                open={isExpanded} 
                onOpenChange={() => toggleCard(business.id)}
              >
                <Card className={`overflow-hidden transition-shadow ${business.addresses?.verified ? 'border-l-4 border-l-green-500' : ''}`}>
                  {/* Header - Always Visible */}
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold truncate">{business.organization_name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {t(`business:categories.${business.business_category}`)}
                              </Badge>
                              {business.business_address_type && (
                                <Badge variant="outline" className="text-xs">
                                  {t(`business:addressTypes.${business.business_address_type}`)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {business.addresses && getStatusBadge(business.business_status, business.addresses.verified)}
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
                    <div className="px-4 pb-4 space-y-4 border-t pt-4">
                      {/* Address Section */}
                      {business.addresses && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {t('business:registration.location')}
                          </h4>
                          <div className="pl-6 space-y-1">
                            <div className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                              {business.addresses.uac}
                            </div>
                            <p className="text-sm">
                              {business.addresses.building && `${business.addresses.building}, `}
                              {business.addresses.street}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {business.addresses.city}, {business.addresses.region}, {business.addresses.country}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => openGoogleMaps(business.addresses!.latitude, business.addresses!.longitude)}
                            >
                              <Map className="h-3 w-3 mr-1" />
                              {t('common:viewOnMap')}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Contact Information */}
                      {(business.primary_contact_name || business.primary_contact_phone || business.primary_contact_email || business.website_url) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {t('business:registration.contactInformation')}
                          </h4>
                          <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {business.primary_contact_name && (
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{business.primary_contact_name}</span>
                              </div>
                            )}
                            {business.primary_contact_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{business.primary_contact_phone}</span>
                              </div>
                            )}
                            {business.secondary_contact_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{business.secondary_contact_phone}</span>
                              </div>
                            )}
                            {business.primary_contact_email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate">{business.primary_contact_email}</span>
                              </div>
                            )}
                            {business.website_url && (
                              <div className="flex items-center gap-2 col-span-full">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                <a 
                                  href={business.website_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
                                >
                                  {business.website_url}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Business Details */}
                      {(business.business_registration_number || business.tax_identification_number || business.employee_count || business.customer_capacity || business.license_expiry_date) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            {t('business:registration.businessDetails')}
                          </h4>
                          <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {business.business_registration_number && (
                              <div className="flex items-center gap-2">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span>{t('business:registration.businessRegistrationNumber')}: {business.business_registration_number}</span>
                              </div>
                            )}
                            {business.tax_identification_number && (
                              <div className="flex items-center gap-2">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span>{t('business:registration.taxId')}: {business.tax_identification_number}</span>
                              </div>
                            )}
                            {business.employee_count && (
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span>{business.employee_count} {t('business:dashboard.employees')}</span>
                              </div>
                            )}
                            {business.customer_capacity && (
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span>{t('business:registration.customerCapacity')}: {business.customer_capacity}</span>
                              </div>
                            )}
                            {business.license_expiry_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>{t('business:registration.licenseExpiryDate')}: {new Date(business.license_expiry_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Operations */}
                      {(business.operating_hours || business.seasonal_operation !== null || business.appointment_required) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {t('business:registration.operatingInformation')}
                          </h4>
                          <div className="pl-6 space-y-1 text-sm">
                            {business.operating_hours && (
                              <div className="flex items-start gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground mt-1" />
                                <span>{typeof business.operating_hours === 'string' ? business.operating_hours : JSON.stringify(business.operating_hours)}</span>
                              </div>
                            )}
                            {business.seasonal_operation && (
                              <Badge variant="secondary" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {t('business:registration.seasonalOperation')}
                              </Badge>
                            )}
                            {business.appointment_required && (
                              <Badge variant="secondary" className="text-xs">
                                {t('business:registration.appointmentRequired')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Accessibility & Amenities */}
                      {(business.wheelchair_accessible || business.parking_available || business.public_transport_access) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <Accessibility className="h-4 w-4" />
                            {t('business:registration.accessibility')}
                          </h4>
                          <div className="pl-6 flex flex-wrap gap-2">
                            {business.wheelchair_accessible && (
                              <Badge variant="outline" className="text-xs">
                                <Accessibility className="h-3 w-3 mr-1" />
                                {t('business:registration.wheelchairAccessible')}
                              </Badge>
                            )}
                            {business.parking_available && (
                              <Badge variant="outline" className="text-xs">
                                <Car className="h-3 w-3 mr-1" />
                                {t('business:registration.parkingAvailable')}
                                {business.parking_capacity && ` (${business.parking_capacity})`}
                              </Badge>
                            )}
                            {business.public_transport_access && business.public_transport_access.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Bus className="h-3 w-3 mr-1" />
                                {business.public_transport_access.join(', ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Services & Languages */}
                      {((business.services_offered && business.services_offered.length > 0) || (business.languages_spoken && business.languages_spoken.length > 0)) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <Wrench className="h-4 w-4" />
                            {t('business:registration.servicesOffered')} & {t('business:registration.languagesSpoken')}
                          </h4>
                          <div className="pl-6 space-y-2">
                            {business.services_offered && business.services_offered.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <Briefcase className="h-3 w-3 text-muted-foreground mt-1" />
                                {business.services_offered.map((service, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {business.languages_spoken && business.languages_spoken.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <Languages className="h-3 w-3 text-muted-foreground mt-1" />
                                {business.languages_spoken.map((lang, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Visibility Settings */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          {t('business:registration.visibilitySettings')}
                        </h4>
                        <div className="pl-6 flex flex-wrap gap-2">
                          <Badge variant={business.publicly_visible ? "default" : "secondary"} className="text-xs">
                            {business.publicly_visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                            {business.publicly_visible ? t('business:registration.publiclyVisible') : t('business:registration.private')}
                          </Badge>
                          {business.show_on_maps !== undefined && (
                            <Badge variant={business.show_on_maps ? "outline" : "secondary"} className="text-xs">
                              <MapPinned className="h-3 w-3 mr-1" />
                              {business.show_on_maps ? t('business:registration.showOnMaps') : t('business:registration.hiddenFromMaps')}
                            </Badge>
                          )}
                          {business.show_contact_info !== undefined && (
                            <Badge variant={business.show_contact_info ? "outline" : "secondary"} className="text-xs">
                              <Phone className="h-3 w-3 mr-1" />
                              {business.show_contact_info ? t('business:registration.showContactInfo') : t('business:registration.hideContactInfo')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Verification Info */}
                      {(business.verified_at || business.verified_by_authority) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <CheckCircle className="h-4 w-4" />
                            {t('business:verification.title')}
                          </h4>
                          <div className="pl-6 text-sm text-muted-foreground">
                            {business.verified_at && (
                              <p>{t('business:verification.verifiedAt')}: {new Date(business.verified_at).toLocaleDateString()}</p>
                            )}
                            {business.verified_by_authority && (
                              <p>{t('business:verification.verifiedBy')}: {business.verified_by_authority}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer with Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewBusiness(business)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('common:buttons.view')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditBusiness(business)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common:buttons.edit')}
                        </Button>
                        {business.organization_name === 'Unknown Organization' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDeleteBusiness(business)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common:buttons.delete')}
                          </Button>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {t('common:buttons.registered')}: {new Date(business.created_at || '').toLocaleDateString()}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* View Dialog */}
      <BusinessViewDialog
        business={selectedBusiness}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Edit Dialog */}
      <BusinessEditDialog
        business={selectedBusiness}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
