import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, MapPin, Play, CheckCircle, XCircle, 
  RotateCcw, Navigation, Clock, AlertTriangle, Loader2, Route
} from 'lucide-react';
import { useAgentDeliveries, AgentDelivery } from '@/hooks/useAgentDeliveries';
import { DeliveryProofCapture, ProofData } from './DeliveryProofCapture';
import { RouteMapView } from './RouteMapView';
import { DeliveryStatus } from '@/types/postal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { openNavigation } from '@/lib/NavigationService';

export const DeliveryAgentView = () => {
  const { t } = useTranslation('postal');
  const { deliveries, loading, stats, updateOrderStatus, captureProof } = useAgentDeliveries();
  const [activeTab, setActiveTab] = useState('active');
  const [proofDialog, setProofDialog] = useState<{ open: boolean; delivery: AgentDelivery | null }>({
    open: false,
    delivery: null
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [routeMapDelivery, setRouteMapDelivery] = useState<AgentDelivery | null>(null);

  const activeStatuses: DeliveryStatus[] = ['assigned', 'out_for_delivery'];
  const completedStatuses: DeliveryStatus[] = ['delivered', 'failed_delivery', 'returned_to_sender', 'address_not_found'];

  const filteredDeliveries = deliveries.filter(d => {
    if (activeTab === 'active') return activeStatuses.includes(d.order.status);
    if (activeTab === 'completed') return completedStatuses.includes(d.order.status);
    return true;
  });

  const handleStartDelivery = async (delivery: AgentDelivery) => {
    setActionLoading(delivery.order.id);
    const result = await updateOrderStatus(delivery.order.id, 'out_for_delivery');
    if (result.success) {
      toast.success(t('agent.deliveryStarted'));
    } else {
      toast.error(t('messages.errorUpdating'));
    }
    setActionLoading(null);
  };

  const handleMarkDelivered = (delivery: AgentDelivery) => {
    setProofDialog({ open: true, delivery });
  };

  const handleProofSubmit = async (data: ProofData) => {
    if (!proofDialog.delivery) return { success: false };

    const proofResult = await captureProof(
      proofDialog.delivery.order.id,
      data.proof_type,
      data
    );

    if (proofResult.success) {
      const statusResult = await updateOrderStatus(
        proofDialog.delivery.order.id,
        'delivered'
      );
      return statusResult;
    }
    return proofResult;
  };

  const handleMarkFailed = async (delivery: AgentDelivery, reason: string) => {
    setActionLoading(delivery.order.id);
    const result = await updateOrderStatus(delivery.order.id, 'failed_delivery', reason);
    if (result.success) {
      toast.success(t('agent.markedFailed'));
    } else {
      toast.error(t('messages.errorUpdating'));
    }
    setActionLoading(null);
  };

  const handleNavigate = async (delivery: AgentDelivery) => {
    const uac = delivery.order.recipient_address_uac;
    setActionLoading(`nav-${delivery.order.id}`);
    
    try {
      // Lookup address coordinates from UAC
      const { data: address, error } = await supabase
        .from('addresses')
        .select('latitude, longitude, street, city')
        .eq('uac', uac)
        .single();
      
      if (error || !address?.latitude || !address?.longitude) {
        toast.error(t('agent.addressNotFound'));
        setActionLoading(null);
        return;
      }
      
      // Open native maps app
      const label = `${address.street}, ${address.city}`;
      const success = await openNavigation({
        latitude: Number(address.latitude),
        longitude: Number(address.longitude),
        label
      });
      
      if (success) {
        toast.info(`${t('agent.navigatingTo')} ${uac}`);
      } else {
        toast.error(t('agent.navigationFailed'));
      }
    } catch (err) {
      toast.error(t('agent.navigationFailed'));
    }
    
    setActionLoading(null);
  };

  const handleShowRoute = (delivery: AgentDelivery) => {
    setRouteMapDelivery(delivery);
  };

  const getPriorityBadge = (priority: number) => {
    if (priority <= 1) return <Badge variant="destructive">{t('priority.urgent')}</Badge>;
    if (priority === 2) return <Badge className="bg-orange-500">{t('priority.high')}</Badge>;
    return <Badge variant="secondary">{t('priority.normal')}</Badge>;
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    const config: Record<DeliveryStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending_intake: { variant: 'secondary', label: t('status.pending_intake') },
      ready_for_assignment: { variant: 'secondary', label: t('status.ready_for_assignment') },
      assigned: { variant: 'outline', label: t('status.assigned') },
      out_for_delivery: { variant: 'default', label: t('status.out_for_delivery') },
      delivered: { variant: 'default', label: t('status.delivered') },
      failed_delivery: { variant: 'destructive', label: t('status.failed_delivery') },
      address_not_found: { variant: 'destructive', label: t('status.address_not_found') },
      returned_to_sender: { variant: 'secondary', label: t('status.returned_to_sender') },
      cancelled: { variant: 'secondary', label: t('status.cancelled') }
    };
    const c = config[status];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">{t('common:loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.active}</p>
            <p className="text-xs text-muted-foreground">{t('agent.activeDeliveries')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
            <p className="text-xs text-muted-foreground">{t('agent.completedToday')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{t('agent.totalAssigned')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">{t('agent.active')}</TabsTrigger>
          <TabsTrigger value="completed">{t('agent.completed')}</TabsTrigger>
          <TabsTrigger value="all">{t('agent.all')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filteredDeliveries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('messages.noOrdersFound')}</p>
              </CardContent>
            </Card>
          ) : (
            filteredDeliveries.map((delivery) => (
              <Card key={delivery.assignment_id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-medium truncate">
                        {delivery.order.order_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {delivery.order.recipient_name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getPriorityBadge(delivery.order.priority_level)}
                      {getStatusBadge(delivery.order.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="break-all">{delivery.order.recipient_address_uac}</span>
                  </div>

                  {/* Package Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{t(`package.types.${delivery.order.package_type}`)}</span>
                    </div>
                    {delivery.route_sequence && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>#{delivery.route_sequence}</span>
                      </div>
                    )}
                  </div>

                  {/* Special Instructions */}
                  {delivery.order.special_instructions && (
                    <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="break-words">{delivery.order.special_instructions}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {delivery.order.status === 'assigned' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStartDelivery(delivery)}
                        disabled={actionLoading === delivery.order.id}
                        className="flex-1 min-w-[120px]"
                      >
                        {actionLoading === delivery.order.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {t('agent.startDelivery')}
                      </Button>
                    )}

                    {delivery.order.status === 'out_for_delivery' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShowRoute(delivery)}
                          className="min-w-[44px]"
                          title={t('delivery.showRoute')}
                        >
                          <Route className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleNavigate(delivery)}
                          disabled={actionLoading === `nav-${delivery.order.id}`}
                          className="min-w-[44px]"
                          title={t('delivery.navigate')}
                        >
                          {actionLoading === `nav-${delivery.order.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Navigation className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleMarkDelivered(delivery)}
                          className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t('agent.delivered')}
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => handleMarkFailed(delivery, 'recipient_absent')}
                          className="flex-1 min-w-[100px]"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {t('agent.failed')}
                        </Button>
                      </>
                    )}

                    {delivery.order.status === 'failed_delivery' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartDelivery(delivery)}
                        disabled={actionLoading === delivery.order.id}
                        className="flex-1"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t('agent.retry')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Proof Capture Dialog */}
      {proofDialog.delivery && (
        <DeliveryProofCapture
          open={proofDialog.open}
          onClose={() => setProofDialog({ open: false, delivery: null })}
          onSubmit={handleProofSubmit}
          orderNumber={proofDialog.delivery.order.order_number}
          recipientName={proofDialog.delivery.order.recipient_name}
          orderId={proofDialog.delivery.order.id}
        />
      )}

      {/* Route Map View */}
      {routeMapDelivery && (
        <RouteMapView
          deliveryUAC={routeMapDelivery.order.recipient_address_uac}
          recipientName={routeMapDelivery.order.recipient_name}
          recipientAddress={routeMapDelivery.order.recipient_address_uac}
          onClose={() => setRouteMapDelivery(null)}
        />
      )}
    </div>
  );
};
