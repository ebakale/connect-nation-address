import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  Clock,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Trash2,
  ChevronDown,
  ChevronUp,
  Map,
  Plus,
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { BusinessViewDialog } from "@/components/BusinessViewDialog";
import { BusinessEditDialog } from "@/components/BusinessEditDialog";
import { EmptyState } from "@/components/ui/empty-state";

type OrganizationAddress = Database["public"]["Tables"]["organization_addresses"]["Row"] & {
  phone?: string;
  email?: string;
  website?: string;
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

interface CitizenBusinessesTabProps {
  onRequestNewBusiness?: () => void;
}

export const CitizenBusinessesTab: React.FC<CitizenBusinessesTabProps> = ({ onRequestNewBusiness }) => {
  const { t } = useTranslation(['business', 'common']);
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<OrganizationAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<OrganizationAddress | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ total: 0, active: 0, verified: 0, pending: 0 });

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const loadBusinesses = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_addresses')
        .select(`
          *,
          addresses!organization_addresses_address_id_fkey (
            uac, street, city, region, country, latitude, longitude, verified, building
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);

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
  }, [user]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleDeleteBusiness = async (business: OrganizationAddress) => {
    if (!confirm(t('business:confirmDeleteBusiness'))) return;
    try {
      const { data, error } = await supabase.rpc('delete_business_record', {
        p_organization_id: business.id
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
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
        <Badge variant="default" className="flex items-center gap-1 bg-success">
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
    return <Badge variant="outline">{status || t('business:dashboard.pending')}</Badge>;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('business:dashboard.myBusinesses')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('business:dashboard.manageYourBusinesses')}
          </p>
        </div>
        {onRequestNewBusiness && (
          <Button onClick={onRequestNewBusiness} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('business:dashboard.addBusiness')}
          </Button>
        )}
      </div>

      {/* Statistics */}
      {businesses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('business:dashboard.total')}</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('business:dashboard.active')}</p>
                <p className="text-xl font-bold text-success">{stats.active}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('business:dashboard.verified')}</p>
                <p className="text-xl font-bold text-info">{stats.verified}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-info" />
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('business:dashboard.pending')}</p>
                <p className="text-xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Business List */}
      {businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('business:dashboard.noBusinesses')}
          description={t('business:dashboard.getStarted')}
          action={onRequestNewBusiness ? {
            label: t('business:dashboard.registerFirstBusiness'),
            onClick: onRequestNewBusiness,
          } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {businesses.map((business) => {
            const isExpanded = expandedCards.has(business.id);
            return (
              <Collapsible
                key={business.id}
                open={isExpanded}
                onOpenChange={() => toggleCard(business.id)}
              >
                <Card className={`overflow-hidden transition-shadow ${business.addresses?.verified ? 'border-l-4 border-l-success' : ''}`}>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold truncate">{business.organization_name}</h3>
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
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4 border-t pt-4">
                      {/* Address */}
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

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">{t('business:registration.contactInformation')}</h4>
                        <div className="pl-6 space-y-1 text-sm">
                          {business.phone && (
                            <p className="flex items-center gap-2"><Phone className="h-3 w-3" />{business.phone}</p>
                          )}
                          {business.email && (
                            <p className="flex items-center gap-2"><Mail className="h-3 w-3" />{business.email}</p>
                          )}
                          {business.website && (
                            <p className="flex items-center gap-2">
                              <Globe className="h-3 w-3" />
                              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{business.website}</a>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedBusiness(business); setViewDialogOpen(true); }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {t('common:buttons.view')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedBusiness(business); setEditDialogOpen(true); }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          {t('common:buttons.edit')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBusiness(business)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {t('common:buttons.delete')}
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      {selectedBusiness && (
        <>
          <BusinessViewDialog
            business={selectedBusiness}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
          <BusinessEditDialog
            business={selectedBusiness}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={loadBusinesses}
          />
        </>
      )}
    </div>
  );
};
