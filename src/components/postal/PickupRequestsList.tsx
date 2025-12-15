import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePickupRequests } from '@/hooks/usePickupRequests';
import { usePostalRole } from '@/hooks/usePostalRole';
import { usePostalAgents, PostalAgent } from '@/hooks/usePostalAgents';
import { PickupStatus } from '@/types/postalEnhanced';
import { Package, MapPin, Calendar, Clock, User, CheckCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';

export const PickupRequestsList = () => {
  const { t } = useTranslation('postal');
  const { requests: pickupRequests, loading, assignRequest, updateStatus } = usePickupRequests();
  const { isPostalDispatcher, isPostalSupervisor, isAdmin } = usePostalRole();
  const { agents } = usePostalAgents();
  const [statusFilter, setStatusFilter] = useState<PickupStatus | 'all'>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const canAssign = isPostalDispatcher || isPostalSupervisor || isAdmin;

  const filteredRequests = pickupRequests.filter(
    (req) => statusFilter === 'all' || req.status === statusFilter
  );

  const getStatusColor = (status: PickupStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'scheduled':
        return 'bg-info/10 text-info border-info/20';
      case 'assigned':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleAssign = async (pickupId: string) => {
    if (!selectedAgent) return;
    await assignRequest(pickupId, selectedAgent);
    setAssigningId(null);
    setSelectedAgent('');
  };

  const handleMarkCompleted = async (pickupId: string) => {
    await updateStatus(pickupId, 'completed');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('pickup.requests')}
          </CardTitle>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as PickupStatus | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
              <SelectItem value="pending">{t('pickup.status.pending')}</SelectItem>
              <SelectItem value="scheduled">{t('pickup.status.scheduled')}</SelectItem>
              <SelectItem value="assigned">{t('pickup.status.assigned')}</SelectItem>
              <SelectItem value="completed">{t('pickup.status.completed')}</SelectItem>
              <SelectItem value="cancelled">{t('pickup.status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('common:loading')}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('pickup.noRequests')}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono font-medium">{request.request_number}</p>
                      <Badge className={getStatusColor(request.status)}>
                        {t(`pickup.status.${request.status}`)}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(request.preferred_date), 'PP')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t(`preferences.${request.preferred_time_window}`)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs break-all">{request.pickup_address_uac}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p>{request.package_count} {t('pickup.packages')}</p>
                        {request.estimated_weight_grams && (
                          <p className="text-muted-foreground">{request.estimated_weight_grams}g</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.package_description && (
                    <p className="text-sm text-muted-foreground border-l-2 pl-3">
                      {request.package_description}
                    </p>
                  )}

                  {/* Actions */}
                  {canAssign && request.status === 'pending' && (
                    <div className="pt-2 border-t space-y-2">
                      {assigningId === request.id ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder={t('assignment.selectAgent')} />
                            </SelectTrigger>
                            <SelectContent>
                              {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.full_name} ({agent.activeAssignments} active)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAssign(request.id)} disabled={!selectedAgent}>
                              <Truck className="h-4 w-4 mr-1" />
                              {t('assignment.assign')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAssigningId(null)}
                            >
                              {t('common:buttons.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAssigningId(request.id)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          {t('pickup.assignAgent')}
                        </Button>
                      )}
                    </div>
                  )}

                  {request.status === 'assigned' && canAssign && (
                    <div className="pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleMarkCompleted(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('pickup.markCompleted')}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
