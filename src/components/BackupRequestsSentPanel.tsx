import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, User, Calendar, ChevronRight, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface BackupRequest {
  id: string;
  incident_id: string;
  title: string;
  message: string;
  type: string;
  priority_level: number;
  created_at: string;
  read: boolean;
  backup_status?: 'pending' | 'fulfilled' | 'partially_fulfilled';
  assigned_units?: string[];
  units_added_after_request?: string[];
  metadata: {
    requesting_unit?: string;
    requesting_unit_name?: string;
    incident_number?: string;
    location?: string;
    reason?: string;
    request_timestamp?: string;
    requesting_user_id?: string;
  };
}

interface BackupRequestsSentPanelProps {
  className?: string;
}

export function BackupRequestsSentPanel({ className }: BackupRequestsSentPanelProps) {
  const [sentRequests, setSentRequests] = useState<BackupRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BackupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isPoliceSupervisor, isPoliceDispatcher, isAdmin } = useUserRole();
  const { toast } = useToast();
  const { t } = useTranslation(['emergency']);

  const pageSize = 5;
  const [sentPage, setSentPage] = useState(1);

  useEffect(() => {
    if (user && (isPoliceSupervisor || isPoliceDispatcher || isAdmin)) {
      fetchBackupRequests();
    }
  }, [user, isPoliceSupervisor, isPoliceDispatcher, isAdmin]);

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('backup-requests-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_notifications' },
        () => {
          fetchBackupRequests();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emergency_incidents' },
        () => {
          // Refresh when incidents change (e.g., units assigned), to update fulfillment status
          fetchBackupRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchBackupRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Fetch SENT backup requests (where user is the one who sent them)
      const { data: sentData, error: sentError } = await supabase
        .from('emergency_notifications')
        .select('*')
        .eq('type', 'backup_request')
        .contains('metadata', { requesting_user_id: user.id })
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      const sentMap = new Map();
      const sentItems = (sentData || []) as BackupRequest[];
      sentItems.forEach((item) => {
        const key = `${item.incident_id}-${item.metadata?.requesting_unit || 'unknown'}`;
        if (!sentMap.has(key)) sentMap.set(key, item);
      });
      const uniqueSent = Array.from(sentMap.values());

      // Enrich SENT items with live incident data to compute backup status
      if (uniqueSent.length > 0) {
        const sentIds = uniqueSent.map((i) => i.incident_id);
        const { data: sentIncidents, error: sentErr } = await supabase
          .from('emergency_incidents')
          .select('id, assigned_units, backup_requesting_unit, incident_number, incident_uac')
          .in('id', sentIds);

        if (!sentErr && sentIncidents) {
          const sentIncMap = new Map(sentIncidents.map((inc: any) => [inc.id, inc]));
          const enrichedSent = uniqueSent.map((item) => {
            const inc = sentIncMap.get(item.incident_id);
            if (!inc) return item;

            const currentUnits: string[] = inc.assigned_units || [];
            const requestingUnit: string | undefined = item.metadata?.requesting_unit || inc.backup_requesting_unit;

            let unitsAddedAfterRequest: string[] = [];
            if (requestingUnit && currentUnits.length > 1 && currentUnits.includes(requestingUnit)) {
              unitsAddedAfterRequest = currentUnits.filter((u: string) => u !== requestingUnit);
            }

            let backupStatus: 'pending' | 'fulfilled' | 'partially_fulfilled' = 'pending';
            if (unitsAddedAfterRequest.length > 0) {
              backupStatus = unitsAddedAfterRequest.length >= 2 ? 'fulfilled' : 'partially_fulfilled';
            }

            return {
              ...item,
              assigned_units: currentUnits,
              units_added_after_request: unitsAddedAfterRequest,
              backup_status: backupStatus,
              metadata: {
                ...item.metadata,
                incident_number: inc.incident_number || item.metadata?.incident_number,
                location: inc.incident_uac || item.metadata?.location,
              }
            } as BackupRequest;
          });
          setSentRequests(enrichedSent);
        } else {
          setSentRequests(uniqueSent);
        }
      } else {
        setSentRequests(uniqueSent);
      }

    } catch (error) {
      console.error('Error fetching backup requests:', error);
      toast({
        title: t('backupRequests.errorTitle'),
        description: t('backupRequests.failedToLoadRequests'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (level: number) => {
    switch (level) {
      case 1: return t('backupRequests.critical');
      case 2: return t('backupRequests.high');
      case 3: return t('backupRequests.medium');
      case 4: return t('backupRequests.low');
      default: return t('backupRequests.unknown');
    }
  };

  const getBackupStatusBadge = (status?: string) => {
    switch (status) {
      case 'fulfilled':
        return <Badge variant="secondary"><ShieldCheck className="h-3 w-3 mr-1" />{t('backupRequests.fulfilled')}</Badge>;
      case 'partially_fulfilled':
        return <Badge variant="default"><Shield className="h-3 w-3 mr-1" />{t('backupRequests.partial')}</Badge>;
      case 'pending':
        return <Badge variant="outline"><ShieldX className="h-3 w-3 mr-1" />{t('backupRequests.pending')}</Badge>;
      default:
        return null;
    }
  };

  const RequestListItem = ({ request, onClick }: { request: BackupRequest; onClick: () => void }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
        !request.read ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getPriorityColor(request.priority_level)}>
              {getPriorityLabel(request.priority_level)}
            </Badge>
            {getBackupStatusBadge(request.backup_status)}
          </div>
          
          <h4 className="font-medium text-sm truncate">{request.title}</h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{request.message}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {request.metadata?.incident_number && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{request.metadata.incident_number}</span>
              </div>
            )}
            {request.metadata?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{request.metadata.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(request.created_at), 'MMM d, HH:mm')}</span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );

  const displayedSentRequests = sentRequests.slice(0, sentPage * pageSize);
  const hasMoreSent = sentRequests.length > sentPage * pageSize;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8 text-muted-foreground">
          {t('backupRequests.loadingSentRequests')}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sent Requests */}
      <div className="space-y-3">
        {displayedSentRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t('backupRequests.noBackupRequestsSent')}</p>
          </div>
        ) : (
          <>
            {displayedSentRequests.map((request) => (
              <RequestListItem
                key={request.id}
                request={request}
                onClick={() => setSelectedRequest(request)}
              />
            ))}
            
            {hasMoreSent && (
              <Button
                variant="outline"
                onClick={() => setSentPage(prev => prev + 1)}
                className="w-full"
              >
                {t('backupRequests.loadMore', { remaining: sentRequests.length - displayedSentRequests.length })}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              {t('backupRequests.backupRequestDetails')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getPriorityColor(selectedRequest.priority_level)}>
                  {getPriorityLabel(selectedRequest.priority_level)} {t('backupRequests.priority')}
                </Badge>
                {getBackupStatusBadge(selectedRequest.backup_status)}
              </div>

              <div>
                <h3 className="font-semibold mb-2">{selectedRequest.title}</h3>
                <p className="text-muted-foreground">{selectedRequest.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedRequest.metadata?.incident_number && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('backupRequests.incident')}:</span>
                    <span>{selectedRequest.metadata.incident_number}</span>
                  </div>
                )}
                
                {selectedRequest.metadata?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('backupRequests.location')}:</span>
                    <span>{selectedRequest.metadata.location}</span>
                  </div>
                )}
                
                {selectedRequest.metadata?.requesting_unit_name && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('backupRequests.requestingUnit')}:</span>
                    <span>{selectedRequest.metadata.requesting_unit_name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{t('backupRequests.sent')}:</span>
                  <span>{format(new Date(selectedRequest.created_at), 'MMM d, yyyy HH:mm')}</span>
                </div>

                {selectedRequest.metadata?.reason && (
                  <div className="col-span-full">
                    <span className="font-medium">{t('backupRequests.reason')}:</span>
                    <p className="text-muted-foreground mt-1">{selectedRequest.metadata.reason}</p>
                  </div>
                )}

                {selectedRequest.backup_status !== 'pending' && selectedRequest.units_added_after_request && selectedRequest.units_added_after_request.length > 0 && (
                  <div className="col-span-full">
                    <span className="font-medium">{t('backupRequests.additionalUnitsAssigned')}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRequest.units_added_after_request.map((unit, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {unit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}