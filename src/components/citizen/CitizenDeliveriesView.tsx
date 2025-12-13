import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Package, Truck, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCitizenDeliveries, CitizenDelivery } from '@/hooks/useCitizenDeliveries';
import { DeliveryTrackingResult } from '@/components/postal/DeliveryTrackingResult';

const CitizenDeliveriesView: React.FC = () => {
  const { t, i18n } = useTranslation('postal');
  const { deliveries, loading, error, filter, setFilter, refetch } = useCitizenDeliveries();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 text-secondary" />;
      case 'failed_delivery':
      case 'address_not_found':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'returned_to_sender':
        return <RotateCcw className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'out_for_delivery':
      case 'assigned':
        return 'secondary';
      case 'failed_delivery':
      case 'address_not_found':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{t('common:buttons.loading', 'Loading...')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <Button onClick={refetch} variant="outline" className="mt-4">
              {t('common:buttons.retry', 'Retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" key={i18n.resolvedLanguage}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {t('myDeliveries.title', 'My Deliveries')}
          </CardTitle>
          <CardDescription>
            {t('myDeliveries.description', 'Track packages being delivered to your registered addresses')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">{t('myDeliveries.all', 'All')}</TabsTrigger>
              <TabsTrigger value="active">{t('myDeliveries.active', 'Active')}</TabsTrigger>
              <TabsTrigger value="completed">{t('myDeliveries.completed', 'Completed')}</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-0">
              {deliveries.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t('myDeliveries.noDeliveries', 'No deliveries found')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <DeliveryListItem
                      key={delivery.id}
                      delivery={delivery}
                      isExpanded={expandedId === delivery.id}
                      onToggle={() => handleToggleExpand(delivery.id)}
                      getStatusIcon={getStatusIcon}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface DeliveryListItemProps {
  delivery: CitizenDelivery;
  isExpanded: boolean;
  onToggle: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadgeVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
}

const DeliveryListItem: React.FC<DeliveryListItemProps> = ({
  delivery,
  isExpanded,
  onToggle,
  getStatusIcon,
  getStatusBadgeVariant,
}) => {
  const { t } = useTranslation('postal');

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getStatusIcon(delivery.status)}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-medium">{delivery.order_number}</span>
              <Badge variant={getStatusBadgeVariant(delivery.status)} className="text-xs">
                {t(`status.${delivery.status}`)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
              <span>{t(`package.types.${delivery.package_type}`)}</span>
              <span>•</span>
              <span>{format(new Date(delivery.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t p-4 bg-muted/20">
          <DeliveryTrackingResult
            data={{
              order_number: delivery.order_number,
              status: delivery.status,
              recipient_name: delivery.recipient_name,
              package_type: delivery.package_type,
              created_at: delivery.created_at,
              scheduled_date: delivery.scheduled_date,
              completed_at: delivery.completed_at,
              status_logs: delivery.status_logs,
              proof: delivery.proof,
            }}
            onNewSearch={() => {}} // No-op since we're in list view
          />
        </div>
      )}
    </div>
  );
};

export { CitizenDeliveriesView };
export default CitizenDeliveriesView;
