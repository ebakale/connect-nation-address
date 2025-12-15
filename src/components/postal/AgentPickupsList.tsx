import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, MapPin, Play, CheckCircle, XCircle, 
  Navigation, Clock, Phone, User, Loader2, Calendar
} from 'lucide-react';
import { usePickupRequests } from '@/hooks/usePickupRequests';
import { useAuth } from '@/hooks/useAuth';
import { PickupRequest, PickupStatus } from '@/types/postalEnhanced';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { openNavigation } from '@/lib/NavigationService';
import { format } from 'date-fns';

interface AgentPickupsListProps {
  onStatsUpdate?: (activeCount: number, completedCount: number) => void;
}

export const AgentPickupsList = ({ onStatsUpdate }: AgentPickupsListProps) => {
  const { t } = useTranslation('postal');
  const { user } = useAuth();
  const { requests, loading, fetchRequests, updateStatus } = usePickupRequests();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch only pickups assigned to current agent
  useEffect(() => {
    if (user) {
      fetchRequests(undefined, user.id);
    }
  }, [user, fetchRequests]);

  // Calculate stats and notify parent
  useEffect(() => {
    const activeStatuses: PickupStatus[] = ['assigned', 'en_route'];
    const completedStatuses: PickupStatus[] = ['completed'];
    
    const activeCount = requests.filter(r => activeStatuses.includes(r.status)).length;
    const completedCount = requests.filter(r => completedStatuses.includes(r.status)).length;
    
    onStatsUpdate?.(activeCount, completedCount);
  }, [requests, onStatsUpdate]);

  const activeStatuses: PickupStatus[] = ['assigned', 'en_route'];
  const completedStatuses: PickupStatus[] = ['completed', 'failed', 'cancelled'];

  const filteredPickups = requests.filter(p => {
    if (activeTab === 'active') return activeStatuses.includes(p.status);
    return completedStatuses.includes(p.status);
  });

  const handleStartPickup = async (pickup: PickupRequest) => {
    setActionLoading(pickup.id);
    const success = await updateStatus(pickup.id, 'en_route');
    if (success) {
      toast.success(t('agent.pickupStarted'));
    }
    setActionLoading(null);
  };

  const handleCompletePickup = async (pickup: PickupRequest) => {
    setActionLoading(pickup.id);
    // In a full implementation, this would open a proof capture dialog
    const success = await updateStatus(pickup.id, 'completed');
    if (success) {
      toast.success(t('agent.pickupCompleted'));
    }
    setActionLoading(null);
  };

  const handleMarkFailed = async (pickup: PickupRequest) => {
    setActionLoading(pickup.id);
    const success = await updateStatus(pickup.id, 'failed');
    if (success) {
      toast.success(t('agent.pickupFailed'));
    }
    setActionLoading(null);
  };

  const handleNavigate = async (pickup: PickupRequest) => {
    const uac = pickup.pickup_address_uac;
    setActionLoading(`nav-${pickup.id}`);
    
    try {
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

  const getStatusBadge = (status: PickupStatus) => {
    const config: Record<PickupStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: t('pickup.status.pending') },
      scheduled: { variant: 'outline', label: t('pickup.status.scheduled') },
      assigned: { variant: 'outline', label: t('pickup.status.assigned') },
      en_route: { variant: 'default', label: t('pickup.status.en_route') },
      completed: { variant: 'default', label: t('pickup.status.completed') },
      cancelled: { variant: 'secondary', label: t('pickup.status.cancelled') },
      failed: { variant: 'destructive', label: t('pickup.status.failed') }
    };
    const c = config[status];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getTimeWindowLabel = (window: string) => {
    return t(`pickup.timeWindows.${window}`) || window;
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
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('active')}
        >
          {t('agent.active')}
        </Button>
        <Button
          variant={activeTab === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('completed')}
        >
          {t('agent.completed')}
        </Button>
      </div>

      {/* Pickup Cards */}
      {filteredPickups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('agent.noAssignedPickups')}</p>
          </CardContent>
        </Card>
      ) : (
        filteredPickups.map((pickup) => (
          <Card key={pickup.id} className="overflow-hidden border-l-4 border-l-teal-500">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-medium">
                    {t('pickup.title')} #{pickup.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pickup.contact_name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(pickup.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">
              {/* Address */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="break-all">{pickup.pickup_address_uac}</span>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(pickup.preferred_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeWindowLabel(pickup.preferred_time_window)}</span>
                </div>
              </div>

              {/* Package Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{pickup.package_count} {t('pickup.packages')}</span>
                </div>
                {pickup.estimated_weight_grams && (
                  <span>{pickup.estimated_weight_grams}g</span>
                )}
              </div>

              {/* Contact Info */}
              {pickup.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${pickup.contact_phone}`} className="text-primary hover:underline">
                    {pickup.contact_phone}
                  </a>
                </div>
              )}

              {/* Notes */}
              {pickup.pickup_notes && (
                <div className="text-sm bg-muted/50 p-2 rounded">
                  <p className="break-words">{pickup.pickup_notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {pickup.status === 'assigned' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleStartPickup(pickup)}
                    disabled={actionLoading === pickup.id}
                    className="flex-1 min-w-[120px]"
                  >
                    {actionLoading === pickup.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {t('agent.startPickup')}
                  </Button>
                )}

                {pickup.status === 'en_route' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleNavigate(pickup)}
                      disabled={actionLoading === `nav-${pickup.id}`}
                      className="min-w-[44px]"
                      title={t('delivery.navigate')}
                    >
                      {actionLoading === `nav-${pickup.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleCompletePickup(pickup)}
                      disabled={actionLoading === pickup.id}
                      className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === pickup.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {t('agent.completePickup')}
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => handleMarkFailed(pickup)}
                      disabled={actionLoading === pickup.id}
                      className="flex-1 min-w-[100px]"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('agent.failed')}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
