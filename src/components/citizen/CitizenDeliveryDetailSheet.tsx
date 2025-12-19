import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CitizenDelivery } from '@/hooks/useCitizenDeliveries';
import { 
  Package, MapPin, Clock, User, 
  Scale, Ruler, DollarSign, FileSignature, ShieldCheck,
  Calendar, Building2, CheckCircle2, Banknote, Camera, AlertCircle, Truck
} from 'lucide-react';
import { format } from 'date-fns';

interface CitizenDeliveryDetailSheetProps {
  delivery: CitizenDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CitizenDeliveryDetailSheet = ({ delivery, open, onOpenChange }: CitizenDeliveryDetailSheetProps) => {
  const { t } = useTranslation('postal');

  if (!delivery) return null;

  const getStatusBadgeVariant = (status: string) => {
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

  const getTimeWindowLabel = (window: string | null) => {
    if (!window) return null;
    const labels: Record<string, string> = {
      morning: t('timeWindow.morning', 'Morning (8AM-12PM)'),
      afternoon: t('timeWindow.afternoon', 'Afternoon (12PM-5PM)'),
      evening: t('timeWindow.evening', 'Evening (5PM-8PM)'),
      any: t('timeWindow.any', 'Any time'),
    };
    return labels[window] || window;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SheetTitle className="font-mono text-lg">{delivery.order_number}</SheetTitle>
            <Badge variant={getStatusBadgeVariant(delivery.status) as any}>
              {t(`status.${delivery.status}`)}
            </Badge>
            {delivery.priority_level <= 2 && (
              <Badge variant="destructive" className="text-xs">
                {getPriorityLabel(delivery.priority_level)}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('tracking.timeline', 'Status Timeline')}
            </h3>
            <div className="space-y-2">
              {delivery.status_logs.length > 0 ? (
                delivery.status_logs.map((log, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle2 className={`h-4 w-4 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{t(`status.${log.status}`)}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(log.changed_at), 'MMM d, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t('tracking.noUpdates', 'No status updates yet')}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Sender Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('sender.title', 'Sender')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{delivery.sender_name}</span>
              </div>
              {delivery.sender_address_uac && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{delivery.sender_address_uac}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Recipient Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('recipient.title', 'Recipient')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{delivery.recipient_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs">{delivery.recipient_address_uac}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Package Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('package.title', 'Package')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{t(`package.types.${delivery.package_type}`)}</Badge>
              </div>
              {delivery.weight_grams && (
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span>{delivery.weight_grams}g</span>
                </div>
              )}
              {delivery.dimensions_cm && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span>{delivery.dimensions_cm}</span>
                </div>
              )}
              {delivery.declared_value && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{t('package.declaredValue', 'Declared Value')}: {delivery.declared_value.toLocaleString()} XAF</span>
                </div>
              )}
            </div>
          </div>

          {/* COD Information */}
          {delivery.cod_required && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  {t('cod.title', 'Cash on Delivery')}
                </h3>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('cod.amount', 'Amount')}:</span>
                    <span className="font-bold text-lg">{delivery.cod_amount?.toLocaleString() || 0} XAF</span>
                  </div>
                  <Badge variant="warning" className="text-xs">
                    {t('cod.collectOnDelivery', 'Collect on Delivery')}
                  </Badge>
                </div>
              </div>
            </>
          )}

          {/* Delivery Requirements */}
          {(delivery.requires_signature || delivery.requires_id_verification || delivery.preferred_time_window) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {t('requirements.title', 'Delivery Requirements')}
                </h3>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                  {delivery.requires_signature && (
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-muted-foreground" />
                      <span>{t('requirements.signature', 'Signature Required')}</span>
                    </div>
                  )}
                  {delivery.requires_id_verification && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <span>{t('requirements.idVerification', 'ID Verification Required')}</span>
                    </div>
                  )}
                  {delivery.preferred_time_window && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getTimeWindowLabel(delivery.preferred_time_window)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Special Instructions */}
          {delivery.special_instructions && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {t('specialInstructions.title', 'Special Instructions')}
                </h3>
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p>{delivery.special_instructions}</p>
                </div>
              </div>
            </>
          )}

          {/* Delivery Proof */}
          {delivery.proof && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {t('proof.title', 'Delivery Proof')}
                </h3>
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant="outline">{t(`proof.types.${delivery.proof.proof_type}`, delivery.proof.proof_type)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(delivery.proof.captured_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  {delivery.proof.received_by_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('proof.receivedBy', 'Received by')}:</span>
                      <span className="font-medium">{delivery.proof.received_by_name}</span>
                    </div>
                  )}

                  {delivery.proof.photo_url && (
                    <img 
                      src={delivery.proof.photo_url} 
                      alt={t('proof.photoAlt', 'Delivery proof')}
                      className="w-full rounded-md border"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Timeline */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('timeline.title', 'Timeline')}
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('timeline.created', 'Created')}:</span>
                <span>{format(new Date(delivery.created_at), 'MMM d, yyyy HH:mm')}</span>
              </div>
              {delivery.scheduled_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('timeline.scheduled', 'Scheduled')}:</span>
                  <span>{format(new Date(delivery.scheduled_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              {delivery.completed_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('timeline.completed', 'Completed')}:</span>
                  <span>{format(new Date(delivery.completed_at), 'MMM d, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
