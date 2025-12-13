import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { DeliveryStatus } from '@/types/postal';
import { Package, MapPin, Clock, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface DeliveryOrdersListProps {
  showAssignmentPanel?: boolean;
}

export const DeliveryOrdersList = ({ showAssignmentPanel = false }: DeliveryOrdersListProps) => {
  const { t } = useTranslation('postal');
  const { orders, loading } = useDeliveryOrders();

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{t('messages.loadingOrders')}</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('order.noOrders')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Order Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {order.order_number}
                  </span>
                  <Badge variant={getStatusBadgeVariant(order.status) as any}>
                    {t(`status.${order.status}`)}
                  </Badge>
                  {order.priority_level <= 2 && (
                    <Badge variant="destructive" className="text-xs">
                      {getPriorityLabel(order.priority_level)}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">{order.recipient_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="font-mono truncate">{order.recipient_address_uac}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>

              {/* Package Type */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {t(`package.types.${order.package_type}`)}
                </Badge>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
