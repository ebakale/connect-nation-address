import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PickupRequest, PickupStatus } from '@/types/postalEnhanced';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, MapPin, Clock, User, Phone, Mail, 
  Scale, Calendar, UserCheck, Truck, CheckCircle2, FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface AgentProfile {
  full_name: string;
  phone?: string | null;
}

interface PickupRequestDetailProps {
  request: PickupRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestUpdated?: () => void;
}

export const PickupRequestDetail = ({ request, open, onOpenChange }: PickupRequestDetailProps) => {
  const { t } = useTranslation('postal');
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);

  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (!request?.assigned_agent_id) {
        setAgentProfile(null);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', request.assigned_agent_id)
        .single();

      if (data) {
        setAgentProfile(data);
      }
    };

    if (open && request?.assigned_agent_id) {
      fetchAgentProfile();
    }
  }, [open, request?.assigned_agent_id]);

  if (!request) return null;

  const getStatusBadgeVariant = (status: PickupStatus) => {
    switch (status) {
      case 'completed': return 'success';
      case 'en_route': return 'info';
      case 'assigned': return 'default';
      case 'scheduled': return 'warning';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const hasAssignment = !!request.assigned_agent_id;
  const showAssignmentSection = hasAssignment && ['assigned', 'en_route', 'completed', 'failed'].includes(request.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SheetTitle className="font-mono text-lg">{request.request_number}</SheetTitle>
            <Badge variant={getStatusBadgeVariant(request.status) as any}>
              {t(`pickup.status.${request.status}`)}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Pickup Location */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('pickup.pickupLocation')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs">{request.pickup_address_uac}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('pickup.schedule')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(request.preferred_date), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{t(`preferences.${request.preferred_time_window}`)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Package Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('pickup.packageDetails')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>{request.package_count} {t('pickup.packages')}</span>
              </div>
              {request.estimated_weight_grams && (
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span>{request.estimated_weight_grams}g</span>
                </div>
              )}
              {request.package_description && (
                <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">{request.package_description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('pickup.contactInfo')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              {request.contact_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{request.contact_name}</span>
                </div>
              )}
              {request.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${request.contact_phone}`} className="text-primary hover:underline">
                    {request.contact_phone}
                  </a>
                </div>
              )}
              {request.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${request.contact_email}`} className="text-primary hover:underline">
                    {request.contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Agent Assignment */}
          {showAssignmentSection && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {t('assignment.title')}
                </h3>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                  {agentProfile && (
                    <>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{agentProfile.full_name}</span>
                      </div>
                      {agentProfile.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${agentProfile.phone}`} className="text-primary hover:underline">
                            {agentProfile.phone}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                  
                  {request.assigned_at && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-muted-foreground text-xs">{t('assignment.assignedAt')}:</span>
                      <span className="text-xs">{format(new Date(request.assigned_at), 'MMM d, HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Completion Info */}
          {request.status === 'completed' && request.completed_at && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {t('pickup.completionInfo')}
                </h3>
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('pickup.completedAt')}:</span>
                    <span>{format(new Date(request.completed_at), 'PPP HH:mm')}</span>
                  </div>
                </div>
              </div>
            </>
          )}


          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('details.timeline')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('details.createdAt')}</span>
                <span>{format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('details.updatedAt')}</span>
                <span>{format(new Date(request.updated_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
