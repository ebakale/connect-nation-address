import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Clock, TrendingDown, TrendingUp, Target } from 'lucide-react';

interface ResponseMetrics {
  incident_id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  dispatched_at: string;
  responded_at?: string;
  resolved_at?: string;
  response_time_minutes?: number;
  resolution_time_minutes?: number;
  assigned_units: string[];
}

interface ResponseTimeTrackerProps {
  className?: string;
  showRecentOnly?: boolean;
}

export const ResponseTimeTracker: React.FC<ResponseTimeTrackerProps> = ({ 
  className, 
  showRecentOnly = false 
}) => {
  const [metrics, setMetrics] = useState<ResponseMetrics[]>([]);
  const [averages, setAverages] = useState<{
    avgResponse: number;
    avgResolution: number;
    targetResponse: number;
  }>({
    avgResponse: 0,
    avgResolution: 0,
    targetResponse: 15 // 15 minutes target
  });

  useEffect(() => {
    fetchResponseMetrics();
    
    // Set up real-time subscription for incident updates
    const channel = supabase
      .channel('response-time-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emergency_incidents'
        },
        () => {
          fetchResponseMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showRecentOnly]);

  const fetchResponseMetrics = async () => {
    try {
      let query = supabase
        .from('emergency_incidents')
        .select(`
          id,
          incident_number,
          emergency_type,
          priority_level,
          dispatched_at,
          responded_at,
          resolved_at,
          assigned_units
        `)
        .not('dispatched_at', 'is', null)
        .order('dispatched_at', { ascending: false });

      if (showRecentOnly) {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        query = query.gte('dispatched_at', twentyFourHoursAgo.toISOString());
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const processedMetrics = data?.map(incident => {
        const dispatched = new Date(incident.dispatched_at);
        const responded = incident.responded_at ? new Date(incident.responded_at) : null;
        const resolved = incident.resolved_at ? new Date(incident.resolved_at) : null;

        const responseTime = responded 
          ? Math.round((responded.getTime() - dispatched.getTime()) / 60000)
          : undefined;

        const resolutionTime = resolved 
          ? Math.round((resolved.getTime() - dispatched.getTime()) / 60000)
          : undefined;

        return {
          ...incident,
          response_time_minutes: responseTime,
          resolution_time_minutes: resolutionTime
        };
      }) || [];

      setMetrics(processedMetrics);
      calculateAverages(processedMetrics);
    } catch (error) {
      console.error('Error fetching response metrics:', error);
    }
  };

  const calculateAverages = (data: ResponseMetrics[]) => {
    const responseTimes = data
      .filter(m => m.response_time_minutes !== undefined)
      .map(m => m.response_time_minutes!);

    const resolutionTimes = data
      .filter(m => m.resolution_time_minutes !== undefined)
      .map(m => m.resolution_time_minutes!);

    const avgResponse = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    const avgResolution = resolutionTimes.length > 0
      ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
      : 0;

    setAverages({
      avgResponse,
      avgResolution,
      targetResponse: 15
    });
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getResponseBadgeColor = (minutes?: number): string => {
    if (!minutes) return 'secondary';
    if (minutes <= 10) return 'default'; // Excellent
    if (minutes <= 15) return 'secondary'; // Good
    if (minutes <= 30) return 'outline'; // Acceptable
    return 'destructive'; // Poor
  };

  const getTrendIcon = (current: number, target: number) => {
    if (current <= target) {
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    }
    return <TrendingUp className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{formatTime(averages.avgResponse)}</p>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(averages.avgResponse, averages.targetResponse)}
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{formatTime(averages.avgResolution)}</p>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Target Response</p>
                <p className="text-2xl font-bold">{formatTime(averages.targetResponse)}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                averages.avgResponse <= averages.targetResponse ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {showRecentOnly ? 'Recent Response Times (24h)' : 'Response Time History'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No response data available
              </p>
            ) : (
              metrics.map((metric) => (
                <div key={metric.incident_id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{metric.incident_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {metric.emergency_type.toUpperCase()} - Priority {metric.priority_level}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {metric.response_time_minutes && (
                        <Badge variant={getResponseBadgeColor(metric.response_time_minutes)}>
                          Response: {formatTime(metric.response_time_minutes)}
                        </Badge>
                      )}
                      {metric.resolution_time_minutes && (
                        <Badge variant="outline">
                          Total: {formatTime(metric.resolution_time_minutes)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>
                      Dispatched: {new Date(metric.dispatched_at).toLocaleString()}
                    </span>
                    {metric.assigned_units && metric.assigned_units.length > 0 && (
                      <span>
                        Units: {metric.assigned_units.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};