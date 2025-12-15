import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, Calendar, Clock, User, Phone, Mail, MapPin, 
  Scale, FileText, Truck, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { PickupRequest, PickupStatus } from '@/types/postalEnhanced';

interface PickupRequestDetailDialogProps {
  request: PickupRequest;
  open: boolean;
  onClose: () => void;
}

export const PickupRequestDetailDialog = ({
  request,
  open,
  onClose,
}: PickupRequestDetailDialogProps) => {
  const { t } = useTranslation('postal');

  const getStatusColor = (status: PickupStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'scheduled':
        return 'bg-info/10 text-info border-info/20';
      case 'assigned':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'en_route':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-muted text-muted-foreground border-muted';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const DetailRow = ({ 
    icon: Icon, 
    label, 
    value 
  }: { 
    icon: any; 
    label: string; 
    value: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('pickup.requestDetails')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and Request Number */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{request.request_number}</span>
            <Badge className={getStatusColor(request.status)}>
              {t(`pickup.status.${request.status}`)}
            </Badge>
          </div>

          <Separator />

          {/* Pickup Location */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('pickup.pickupLocation')}
            </h4>
            <p className="text-sm bg-muted/50 p-3 rounded-lg font-mono">
              {request.pickup_address_uac}
            </p>
          </div>

          <Separator />

          {/* Schedule */}
          <div>
            <h4 className="font-medium mb-2">{t('pickup.schedule')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                icon={Calendar}
                label={t('pickup.preferredDate')}
                value={format(new Date(request.preferred_date), 'PPP')}
              />
              <DetailRow
                icon={Clock}
                label={t('pickup.preferredTime')}
                value={t(`preferences.${request.preferred_time_window}`)}
              />
            </div>
          </div>

          <Separator />

          {/* Package Details */}
          <div>
            <h4 className="font-medium mb-2">{t('pickup.packageDetails')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                icon={Package}
                label={t('pickup.packageCount')}
                value={request.package_count}
              />
              <DetailRow
                icon={Scale}
                label={t('pickup.estimatedWeight')}
                value={request.estimated_weight_grams 
                  ? `${request.estimated_weight_grams}g`
                  : t('pickup.notSpecified')}
              />
            </div>
            {request.package_description && (
              <DetailRow
                icon={FileText}
                label={t('pickup.packageDescription')}
                value={request.package_description}
              />
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="font-medium mb-2">{t('pickup.contactInfo')}</h4>
            <DetailRow
              icon={User}
              label={t('pickup.contactName')}
              value={request.contact_name}
            />
            {request.contact_phone && (
              <DetailRow
                icon={Phone}
                label={t('pickup.contactPhone')}
                value={request.contact_phone}
              />
            )}
            {request.contact_email && (
              <DetailRow
                icon={Mail}
                label={t('pickup.contactEmail')}
                value={request.contact_email}
              />
            )}
          </div>

          {/* Notes */}
          {request.pickup_notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">{t('pickup.notes')}</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {request.pickup_notes}
                </p>
              </div>
            </>
          )}

          {/* Assignment Info (if assigned) */}
          {request.assigned_agent_id && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {t('pickup.assignmentInfo')}
                </h4>
                {request.agent && (
                  <DetailRow
                    icon={User}
                    label={t('pickup.assignedAgent')}
                    value={request.agent.full_name}
                  />
                )}
                {request.assigned_at && (
                  <DetailRow
                    icon={Calendar}
                    label={t('pickup.assignedAt')}
                    value={format(new Date(request.assigned_at), 'PPp')}
                  />
                )}
              </div>
            </>
          )}

          {/* Completion Info */}
          {request.completed_at && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {t('pickup.completionInfo')}
                </h4>
                <DetailRow
                  icon={Calendar}
                  label={t('pickup.completedAt')}
                  value={format(new Date(request.completed_at), 'PPp')}
                />
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t('pickup.createdAt')}: {format(new Date(request.created_at), 'PPp')}</p>
            <p>{t('pickup.updatedAt')}: {format(new Date(request.updated_at), 'PPp')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
