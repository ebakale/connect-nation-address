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
  AlertCircle
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";

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
  };
};

export default function MyBusinesses() {
  const { t } = useTranslation(['business', 'common']);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<OrganizationAddress[]>([]);
  const [loading, setLoading] = useState(true);

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
            verified
          )
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error: any) {
      console.error('Error loading businesses:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {t('business:dashboard.myBusinesses')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('business:dashboard.manageYourBusinesses')}
          </p>
        </div>
        <Button onClick={() => navigate('/business/register')} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {t('business:dashboard.addBusiness')}
        </Button>
      </div>

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {businesses.map((business) => (
            <Card key={business.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{business.organization_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`business:categories.${business.business_category}`)}
                  </p>
                </div>
                {business.addresses && getStatusBadge(business.business_status, business.addresses.verified)}
              </div>

              <div className="space-y-3 mb-4">
                {business.addresses && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{business.addresses.uac}</p>
                      <p className="text-muted-foreground">
                        {business.addresses.street}, {business.addresses.city}, {business.addresses.region}
                      </p>
                    </div>
                  </div>
                )}

                {business.primary_contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{business.primary_contact_phone}</span>
                  </div>
                )}

                {business.primary_contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{business.primary_contact_email}</span>
                  </div>
                )}

                {business.website_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
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

                {business.employee_count && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{business.employee_count} {t('business:registration.employees')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toast.info(t('common:comingSoon'))}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('common:view')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toast.info(t('common:comingSoon'))}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common:edit')}
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                {t('common:registered')}: {new Date(business.created_at || '').toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
