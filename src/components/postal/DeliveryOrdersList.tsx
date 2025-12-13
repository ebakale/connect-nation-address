import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { DeliveryStatus } from '@/types/postal';
import { DeliveryOrderDetail } from './DeliveryOrderDetail';
import { OrderAssignmentPanel } from './OrderAssignmentPanel';
import { Package, MapPin, Clock, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DeliveryOrdersListProps {
  showAssignmentPanel?: boolean;
}

export const DeliveryOrdersList = ({ showAssignmentPanel = false }: DeliveryOrdersListProps) => {
  const { t } = useTranslation('postal');
  const { orders, loading, fetchOrders } = useDeliveryOrders();
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Filter orders for assignment view - only show ready_for_assignment
  const displayOrders = showAssignmentPanel 
    ? orders.filter(o => o.status === 'ready_for_assignment')
    : orders;

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

  const handleOrderClick = (order: typeof orders[0]) => {
    if (showAssignmentPanel) return; // Don't open detail in assignment mode
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleCheckboxChange = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === displayOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(displayOrders.map(o => o.id));
    }
  };

  const handleAssignmentComplete = () => {
    setSelectedOrderIds([]);
    fetchOrders();
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

  if (displayOrders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {showAssignmentPanel 
              ? t('assignment.noOrdersToAssign', 'No orders ready for assignment')
              : t('order.noOrders')
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  const ordersList = (
    <div className="space-y-3">
      {/* Select All Header for Assignment Mode */}
      {showAssignmentPanel && displayOrders.length > 0 && (
        <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
          <Checkbox
            checked={selectedOrderIds.length === displayOrders.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {t('assignment.selectAll', 'Select all')} ({displayOrders.length})
          </span>
        </div>
      )}

      {displayOrders.map((order) => {
        const isSelected = selectedOrderIds.includes(order.id);

        return (
          <Card 
            key={order.id} 
            className={cn(
              'transition-all',
              showAssignmentPanel 
                ? 'cursor-default' 
                : 'hover:shadow-md cursor-pointer',
              isSelected && 'ring-2 ring-primary border-primary'
            )}
            onClick={() => handleOrderClick(order)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Checkbox for Assignment Mode */}
                {showAssignmentPanel && (
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange(order.id, checked as boolean)
                      }
                    />
                  </div>
                )}

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
                  {!showAssignmentPanel && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderClick(order);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Assignment mode with side panel
  if (showAssignmentPanel) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {ordersList}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <OrderAssignmentPanel
              selectedOrderIds={selectedOrderIds}
              onAssignmentComplete={handleAssignmentComplete}
              onClearSelection={() => setSelectedOrderIds([])}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {ordersList}
      <DeliveryOrderDetail 
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
};
