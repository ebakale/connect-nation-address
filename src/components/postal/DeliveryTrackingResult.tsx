import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  XCircle,
  RotateCcw,
  ArrowLeft,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TrackingData {
  order_number: string;
  status: string;
  recipient_name: string;
  package_type: string;
  created_at: string;
  scheduled_date: string | null;
  completed_at: string | null;
  status_logs: Array<{
    status: string;
    changed_at: string;
  }>;
  proof?: {
    proof_type: string;
    photo_url: string | null;
    received_by_name: string | null;
    captured_at: string;
  };
}

interface DeliveryTrackingResultProps {
  data: TrackingData;
  onNewSearch: () => void;
}

const STATUS_FLOW = [
  'pending_intake',
  'ready_for_assignment',
  'assigned',
  'out_for_delivery',
  'delivered'
];

const TERMINAL_STATUSES = ['delivered', 'failed_delivery', 'address_not_found', 'returned_to_sender', 'cancelled'];

export const DeliveryTrackingResult: React.FC<DeliveryTrackingResultProps> = ({ data, onNewSearch }) => {
  const { t, i18n } = useTranslation('postal');

  const getStatusIcon = (status: string, isActive: boolean, isCompleted: boolean) => {
    const iconClass = isCompleted 
      ? 'text-primary' 
      : isActive 
        ? 'text-primary animate-pulse' 
        : 'text-muted-foreground';

    switch (status) {
      case 'pending_intake':
        return <Package className={`h-5 w-5 ${iconClass}`} />;
      case 'ready_for_assignment':
        return <Clock className={`h-5 w-5 ${iconClass}`} />;
      case 'assigned':
        return <User className={`h-5 w-5 ${iconClass}`} />;
      case 'out_for_delivery':
        return <Truck className={`h-5 w-5 ${iconClass}`} />;
      case 'delivered':
        return <CheckCircle2 className={`h-5 w-5 ${iconClass}`} />;
      case 'failed_delivery':
      case 'address_not_found':
        return <XCircle className={`h-5 w-5 text-destructive`} />;
      case 'returned_to_sender':
        return <RotateCcw className={`h-5 w-5 text-warning`} />;
      default:
        return <MapPin className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'out_for_delivery':
        return 'secondary';
      case 'failed_delivery':
      case 'address_not_found':
      case 'cancelled':
        return 'destructive';
      case 'returned_to_sender':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const currentStatusIndex = STATUS_FLOW.indexOf(data.status);
  const isTerminal = TERMINAL_STATUSES.includes(data.status);

  // Build timeline from status logs
  const getTimeForStatus = (status: string) => {
    const log = data.status_logs.find(l => l.status === status);
    return log ? format(new Date(log.changed_at), 'MMM d, yyyy h:mm a') : null;
  };

  return (
    <div className="space-y-6" key={i18n.resolvedLanguage}>
      {/* Back button */}
      <Button variant="ghost" onClick={onNewSearch} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('tracking.newSearch')}
      </Button>

      {/* Order Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg font-mono">{data.order_number}</CardTitle>
            <Badge variant={getStatusBadgeVariant(data.status)}>
              {t(`status.${data.status}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('tracking.recipient')}:</span>
              <span className="font-medium">{data.recipient_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('tracking.packageType')}:</span>
              <span className="font-medium">{t(`package.types.${data.package_type}`)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('tracking.created')}:</span>
              <span className="font-medium">
                {format(new Date(data.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            {data.scheduled_date && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('tracking.scheduledDate')}:</span>
                <span className="font-medium">
                  {format(new Date(data.scheduled_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('tracking.statusTimeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {STATUS_FLOW.map((status, index) => {
              const isCompleted = index < currentStatusIndex || (index === currentStatusIndex && isTerminal && data.status === 'delivered');
              const isActive = index === currentStatusIndex && !isTerminal;
              const isPending = index > currentStatusIndex;
              const statusTime = getTimeForStatus(status);

              return (
                <div key={status} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Vertical line */}
                  {index < STATUS_FLOW.length - 1 && (
                    <div 
                      className={`absolute left-[9px] top-6 w-0.5 h-full ${
                        isCompleted ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                  
                  {/* Icon */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-5 h-5 rounded-full
                    ${isCompleted ? 'bg-primary/10' : isActive ? 'bg-primary/20' : 'bg-muted'}
                  `}>
                    {getStatusIcon(status, isActive, isCompleted)}
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 min-w-0 ${isPending ? 'opacity-50' : ''}`}>
                    <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                      {t(`status.${status}`)}
                    </p>
                    {statusTime && (
                      <p className="text-sm text-muted-foreground">
                        {statusTime}
                      </p>
                    )}
                    {isPending && (
                      <p className="text-sm text-muted-foreground italic">
                        {t('tracking.pending')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Show terminal status if not delivered */}
            {isTerminal && data.status !== 'delivered' && (
              <div className="relative flex gap-4 pt-2 border-t mt-4">
                <div className="relative z-10 flex items-center justify-center w-5 h-5">
                  {getStatusIcon(data.status, true, false)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-destructive">
                    {t(`status.${data.status}`)}
                  </p>
                  {data.completed_at && (
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(data.completed_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Proof (if delivered) */}
      {data.status === 'delivered' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tracking.deliveryProof')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.proof ? (
              <>
                {data.proof.received_by_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tracking.receivedBy')}:</span>
                    <span className="font-medium">{data.proof.received_by_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('tracking.deliveredAt')}:</span>
                  <span className="font-medium">
                    {format(new Date(data.proof.captured_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                {data.proof.photo_url && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">{t('tracking.proofPhoto')}:</p>
                    <img 
                      src={data.proof.photo_url} 
                      alt="Delivery proof" 
                      className="rounded-lg max-w-xs border"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">{t('tracking.proofNotAvailable')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('tracking.proofPending')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
