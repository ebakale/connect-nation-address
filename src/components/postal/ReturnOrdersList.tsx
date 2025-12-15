import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReturnOrders } from '@/hooks/useReturnOrders';
import { usePostalRole } from '@/hooks/usePostalRole';
import { ReturnStatus } from '@/types/postalEnhanced';
import { RotateCcw, Package, QrCode, CheckCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';

export const ReturnOrdersList = () => {
  const { t } = useTranslation('postal');
  const { returns: returnOrders, loading, updateStatus, generateReturnLabel } = useReturnOrders();
  const { isPostalSupervisor, isAdmin } = usePostalRole();
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'all'>('all');

  const canProcess = isPostalSupervisor || isAdmin;

  const filteredReturns = returnOrders.filter(
    (ret) => statusFilter === 'all' || ret.status === statusFilter
  );

  const getStatusColor = (status: ReturnStatus) => {
    switch (status) {
      case 'initiated':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'label_generated':
        return 'bg-info/10 text-info border-info/20';
      case 'in_transit':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'received':
        return 'bg-success/10 text-success border-success/20';
      case 'processed':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleGenerateLabel = async (returnId: string) => {
    await generateReturnLabel(returnId);
  };

  const handleUpdateStatus = async (returnId: string, newStatus: ReturnStatus) => {
    await updateStatus(returnId, newStatus);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            {t('returns.title')}
          </CardTitle>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReturnStatus | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
              <SelectItem value="initiated">{t('returns.status.initiated')}</SelectItem>
              <SelectItem value="label_generated">{t('returns.status.labelGenerated')}</SelectItem>
              <SelectItem value="in_transit">{t('returns.status.inTransit')}</SelectItem>
              <SelectItem value="received">{t('returns.status.received')}</SelectItem>
              <SelectItem value="processed">{t('returns.status.processed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('common:loading')}
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('returns.noReturns')}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredReturns.map((ret) => (
                <div
                  key={ret.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono font-medium">{ret.return_number}</p>
                      <Badge className={getStatusColor(ret.status as ReturnStatus)}>
                        {t(`returns.status.${ret.status}`)}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {format(new Date(ret.created_at), 'PP')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{t('returns.originalOrder')}: </span>
                    <span className="font-mono">{ret.original_order_id.slice(0, 8)}...</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('returns.reason')}: </span>
                    <span>{t(`returns.reasons.${ret.return_reason}`)}</span>
                  </div>

                  {ret.reason_details && (
                    <p className="text-sm text-muted-foreground border-l-2 pl-3">
                      {ret.reason_details}
                    </p>
                  )}

                  {ret.return_tracking_number && (
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                      {t('returns.trackingNumber')}: {ret.return_tracking_number}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t flex flex-wrap gap-2">
                    {ret.status === 'initiated' && !ret.return_tracking_number && (
                      <Button size="sm" variant="outline" onClick={() => handleGenerateLabel(ret.id)}>
                        <QrCode className="h-4 w-4 mr-1" />
                        {t('returns.generateLabel')}
                      </Button>
                    )}

                    {ret.status === 'label_generated' && canProcess && (
                      <Button size="sm" onClick={() => handleUpdateStatus(ret.id, 'in_transit')}>
                        <Truck className="h-4 w-4 mr-1" />
                        {t('returns.markInTransit')}
                      </Button>
                    )}

                    {ret.status === 'in_transit' && canProcess && (
                      <Button size="sm" onClick={() => handleUpdateStatus(ret.id, 'received')}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('returns.markReceived')}
                      </Button>
                    )}

                    {ret.status === 'received' && canProcess && (
                      <Button size="sm" onClick={() => handleUpdateStatus(ret.id, 'processed')}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('returns.markProcessed')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
