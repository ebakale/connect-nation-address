import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeliveryStatus } from '@/types/postal';
import { 
  Package, MapPin, Clock, User, Phone, Mail, 
  Scale, Ruler, DollarSign, FileSignature, ShieldCheck,
  Calendar, Building2
} from 'lucide-react';
import { format } from 'date-fns';

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
}

interface DeliveryOrderDetailProps {
  order: DeliveryOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeliveryOrderDetail = ({ order, open, onOpenChange }: DeliveryOrderDetailProps) => {
  const { t } = useTranslation('postal');

  if (!order) return null;

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
        </div>
      </SheetContent>
    </Sheet>
  );
};
