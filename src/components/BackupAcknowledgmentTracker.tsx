import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Truck, MapPin, CheckCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Acknowledgment {
  id: string;
  acknowledged_by: string;
  acknowledgment_type: 'receipt' | 'en_route' | 'on_scene' | 'all_clear';
  acknowledged_at: string;
  unit_id: string | null;
  estimated_arrival_minutes: number | null;
  notes: string | null;
  acknowledger_name?: string;
  unit_code?: string;
}

interface BackupAcknowledgmentTrackerProps {
  incidentId: string;
  className?: string;
}

export const BackupAcknowledgmentTracker: React.FC<BackupAcknowledgmentTrackerProps> = ({
  incidentId,
  className
}) => {
  const { t } = useTranslation('emergency');
  const [acknowledgments, setAcknowledgments] = useState<Acknowledgment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcknowledgments();

    // Real-time subscription
    const subscription = supabase
      .channel(`backup-acks-${incidentId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'backup_acknowledgments',
          filter: `incident_id=eq.${incidentId}`
        },
        () => {
          fetchAcknowledgments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [incidentId]);

  const fetchAcknowledgments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('backup_acknowledgments')
        .select(`
          *,
          profiles:acknowledged_by(full_name),
          emergency_units:unit_id(unit_code)
        `)
        .eq('incident_id', incidentId)
        .order('acknowledged_at', { ascending: true });

      if (error) throw error;

      const enriched = (data || []).map((ack: any) => ({
        ...ack,
        acknowledger_name: ack.profiles?.full_name || t('backupAcknowledgment.unknownUser'),
        unit_code: ack.emergency_units?.unit_code
      }));

      setAcknowledgments(enriched);
    } catch (error) {
      console.error('Error fetching acknowledgments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'en_route':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'on_scene':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'all_clear':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'receipt':
        return <Badge variant="outline" className="text-blue-600">{t('backupAcknowledgment.types.receipt')}</Badge>;
      case 'en_route':
        return <Badge variant="outline" className="text-orange-600">{t('backupAcknowledgment.types.enRoute')}</Badge>;
      case 'on_scene':
        return <Badge variant="outline" className="text-green-600">{t('backupAcknowledgment.types.onScene')}</Badge>;
      case 'all_clear':
        return <Badge className="bg-green-100 text-green-800">{t('backupAcknowledgment.types.allClear')}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {t('backupAcknowledgment.loading')}
      </div>
    );
  }

  if (acknowledgments.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {t('backupAcknowledgment.noAcknowledgments')}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {t('backupAcknowledgment.title')} ({acknowledgments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {acknowledgments.map((ack) => (
          <div 
            key={ack.id} 
            className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
          >
            {getTypeIcon(ack.acknowledgment_type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {getTypeBadge(ack.acknowledgment_type)}
                {ack.unit_code && (
                  <Badge variant="secondary" className="text-xs">
                    {ack.unit_code}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{ack.acknowledger_name}</span>
                <span>•</span>
                <span>{format(new Date(ack.acknowledged_at), 'HH:mm:ss')}</span>
              </div>
              {ack.estimated_arrival_minutes && (
                <div className="text-xs text-muted-foreground mt-1">
                  {t('backupAcknowledgment.eta', { minutes: ack.estimated_arrival_minutes })}
                </div>
              )}
              {ack.notes && (
                <p className="text-xs text-muted-foreground mt-1">{ack.notes}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
