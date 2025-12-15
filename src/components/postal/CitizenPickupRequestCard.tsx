import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Calendar, Clock, User, Phone, Eye, Pencil, X,
  MapPin, Scale
} from 'lucide-react';
import { format } from 'date-fns';
import type { PickupRequest, PickupStatus } from '@/types/postalEnhanced';
import { PickupRequestDetailDialog } from './PickupRequestDetailDialog';
import { PickupRequestEditDialog } from './PickupRequestEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CitizenPickupRequestCardProps {
  request: PickupRequest;
  onCancel: (id: string) => Promise<boolean>;
  onUpdate: (id: string, updates: any) => Promise<boolean>;
}

export const CitizenPickupRequestCard = ({ 
  request, 
  onCancel, 
  onUpdate 
}: CitizenPickupRequestCardProps) => {
  const { t } = useTranslation('postal');
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isPending = request.status === 'pending';

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

  const handleCancel = async () => {
    setCancelling(true);
    const success = await onCancel(request.id);
    setCancelling(false);
    if (success) {
      setCancelDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Header with request number and status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-medium truncate">
                  {request.request_number}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{request.pickup_address_uac}</span>
                </div>
              </div>
              <Badge className={getStatusColor(request.status)}>
                {t(`pickup.status.${request.status}`)}
              </Badge>
            </div>

            {/* Details row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {format(new Date(request.preferred_date), 'PP')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>{t(`preferences.${request.preferred_time_window}`)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="h-3.5 w-3.5 shrink-0" />
                <span>{request.package_count} {t('pickup.packages')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{request.contact_name}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailOpen(true)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                {t('pickup.viewDetails')}
              </Button>
              
              {isPending && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    {t('pickup.editRequest')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    {t('pickup.cancelRequest')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <PickupRequestDetailDialog
        request={request}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* Edit Dialog */}
      <PickupRequestEditDialog
        request={request}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdate={onUpdate}
      />

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pickup.cancelConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pickup.cancelConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              {t('common:buttons.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? t('common:loading') : t('pickup.confirmCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
