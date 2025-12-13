import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DeliveryStatus, DeliveryAssignment } from '@/types/postal';
import { supabase } from '@/integrations/supabase/client';
import { usePostalRole } from '@/hooks/usePostalRole';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { 
  Package, MapPin, Clock, User, Phone, Mail, 
  Scale, Ruler, DollarSign, FileSignature, ShieldCheck,
  Calendar, Building2, UserCheck, Truck, CheckCircle2, ArrowRight, Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface DeliveryOrderAssignment {
  id: string;
  agent_id: string;
  assigned_at: string;
  acknowledged_at?: string | null;
  started_at?: string | null;
  estimated_delivery_time?: string | null;
  route_sequence?: number | null;
  notes?: string | null;
  assigned_by: string;
}

interface DeliveryOrder {
  id: string;
  order_number: string;
  status: DeliveryStatus;
  priority_level: number;
  sender_name: string;
  sender_branch?: string | null;
  sender_phone?: string | null;
  sender_address_uac?: string | null;
  recipient_name: string;
  recipient_address_uac: string;
  recipient_phone?: string | null;
  recipient_email?: string | null;
  package_type: string;
  weight_grams?: number | null;
  dimensions_cm?: string | null;
  declared_value?: number | null;
  requires_signature?: boolean | null;
  requires_id_verification?: boolean | null;
  special_instructions?: string | null;
  notes?: string | null;
  scheduled_date?: string | null;
  delivery_deadline?: string | null;
  created_at: string;
  updated_at: string;
  delivery_assignments?: DeliveryOrderAssignment[];
}

interface AgentProfile {
  full_name: string;
  phone?: string | null;
}

interface DeliveryOrderDetailProps {
  order: DeliveryOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

export const DeliveryOrderDetail = ({ order, open, onOpenChange, onOrderUpdated }: DeliveryOrderDetailProps) => {
  const { t } = useTranslation('postal');
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { canUpdateOrderStatus, isPostalClerk } = usePostalRole();
  const { markAsReadyForAssignment } = useDeliveryOrders();

  const assignment = order?.delivery_assignments?.[0];
  const hasAssignment = !!assignment;
  const showAssignmentSection = hasAssignment && ['assigned', 'out_for_delivery', 'delivered', 'failed_delivery', 'address_not_found', 'returned_to_sender'].includes(order?.status || '');

  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (!assignment?.agent_id) {
        setAgentProfile(null);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', assignment.agent_id)
        .single();

      if (data) {
        setAgentProfile(data);
      }
    };

    if (open && assignment) {
      fetchAgentProfile();
    }
  }, [open, assignment]);

  if (!order) return null;

  const canMarkReady = canUpdateOrderStatus && order.status === 'pending_intake';

  const handleMarkReady = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const success = await markAsReadyForAssignment(order.id);
      if (success) {
        onOrderUpdated?.();
        onOpenChange(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'out_for_delivery': return 'info';
      case 'assigned': return 'default';
      case 'ready_for_assignment': return 'warning';
      case 'pending_intake': return 'secondary';
      case 'failed_delivery':
      case 'address_not_found': return 'destructive';
      case 'returned_to_sender': return 'muted';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: t('priority.level1'),
      2: t('priority.level2'),
      3: t('priority.level3'),
      4: t('priority.level4'),
      5: t('priority.level5'),
    };
    return labels[level] || t('priority.level3');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SheetTitle className="font-mono text-lg">{order.order_number}</SheetTitle>
            <Badge variant={getStatusBadgeVariant(order.status) as any}>
              {t(`status.${order.status}`)}
            </Badge>
            {order.priority_level <= 2 && (
              <Badge variant="destructive" className="text-xs">
                {getPriorityLabel(order.priority_level)}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Sender Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('sender.title')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.sender_name}</span>
              </div>
              {order.sender_branch && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{order.sender_branch}</span>
                </div>
              )}
              {order.sender_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.sender_phone}</span>
                </div>
              )}
              {order.sender_address_uac && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{order.sender_address_uac}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Recipient Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('recipient.title')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.recipient_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs">{order.recipient_address_uac}</span>
              </div>
              {order.recipient_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.recipient_phone}</span>
                </div>
              )}
              {order.recipient_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.recipient_email}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Package Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('package.title')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{t(`package.types.${order.package_type}`)}</Badge>
              </div>
              {order.weight_grams && (
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span>{order.weight_grams}g</span>
                </div>
              )}
              {order.dimensions_cm && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span>{order.dimensions_cm}</span>
                </div>
              )}
              {order.declared_value && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{order.declared_value.toLocaleString()} XAF</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent Assignment */}
          {showAssignmentSection && assignment && (
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
                  
                  {/* Assignment Timeline */}
                  <div className="pt-2 space-y-1.5 border-t border-border/50 mt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-muted-foreground text-xs">{t('assignment.assignedAt')}:</span>
                      <span className="text-xs">{format(new Date(assignment.assigned_at), 'MMM d, HH:mm')}</span>
                    </div>
                    {assignment.acknowledged_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-muted-foreground text-xs">{t('assignment.acknowledgedAt')}:</span>
                        <span className="text-xs">{format(new Date(assignment.acknowledged_at), 'MMM d, HH:mm')}</span>
                      </div>
                    )}
                    {assignment.started_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-muted-foreground text-xs">{t('assignment.startedAt')}:</span>
                        <span className="text-xs">{format(new Date(assignment.started_at), 'MMM d, HH:mm')}</span>
                      </div>
                    )}
                  </div>

                  {assignment.estimated_delivery_time && (
                    <div className="flex items-center gap-2 pt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('assignment.estimatedDelivery')}:</span>
                      <span>{format(new Date(assignment.estimated_delivery_time), 'MMM d, HH:mm')}</span>
                    </div>
                  )}

                  {assignment.route_sequence && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('assignment.routeSequence')}:</span>
                      <Badge variant="outline" className="text-xs">#{assignment.route_sequence}</Badge>
                    </div>
                  )}

                  {assignment.notes && (
                    <div className="pt-2 border-t border-border/50 mt-2">
                      <span className="text-muted-foreground text-xs">{t('assignment.assignmentNotes')}:</span>
                      <p className="text-xs mt-1">{assignment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Requirements */}
          {(order.requires_signature || order.requires_id_verification) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('details.requirements')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {order.requires_signature && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileSignature className="h-3 w-3" />
                      {t('package.requiresSignature')}
                    </Badge>
                  )}
                  {order.requires_id_verification && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {t('package.requiresIdVerification')}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Special Instructions */}
          {order.special_instructions && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('package.specialInstructions')}
                </h3>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {order.special_instructions}
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          {order.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('package.notes')}
                </h3>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {order.notes}
                </p>
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
                <span>{format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('details.updatedAt')}</span>
                <span>{format(new Date(order.updated_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
              {order.scheduled_date && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('schedule.scheduledDate')}</span>
                  <span>{format(new Date(order.scheduled_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              {order.delivery_deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('schedule.deadline')}</span>
                  <span>{format(new Date(order.delivery_deadline), 'MMM d, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {canMarkReady && (
            <>
              <Separator />
              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={handleMarkReady}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {t('actions.markReadyForAssignment')}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
