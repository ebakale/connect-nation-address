import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, Users, MapPin, Radio, Activity, Clock, 
  AlertTriangle, CheckCircle, Settings, MessageSquare,
  TrendingUp, Shield, Navigation
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { UnitStatusManager } from './UnitStatusManager';
import { UnitMemberManager } from './UnitMemberManager';
import { SendUnitMessageDialog } from './SendUnitMessageDialog';
import { RequestBackupDialog } from './RequestBackupDialog';

interface UnitInfo {
  id: string;
  unit_code: string;
  unit_name: string;
  unit_type: string;
  status: string;
  location_latitude?: number;
  location_longitude?: number;
  current_location?: string;
  radio_frequency?: string;
  vehicle_id?: string;
  emergency_unit_members: Array<{
    id: string;
    officer_id: string;
    role: string;
    is_lead: boolean;
    profiles: {
      full_name: string;
      email: string;
      phone?: string;
    };
  }>;
}

interface ActiveIncident {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  reported_at: string;
  location_address?: string;
}

interface UnitLeadDashboardProps {
  userUnit: UnitInfo;
  onRefresh?: () => void;
}

export const UnitLeadDashboard: React.FC<UnitLeadDashboardProps> = ({ userUnit, onRefresh }) => {
  const { user } = useAuth();
  const { t } = useTranslation('emergency');
  const [activeIncidents, setActiveIncidents] = useState<ActiveIncident[]>([]);
  const [unitStats, setUnitStats] = useState({
    totalMembers: 0,
    availableMembers: 0,
    activeIncidents: 0,
    responseTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnitData();
    fetchRecentMessages();
  }, [userUnit?.id]);

  const fetchUnitData = async () => {
    if (!userUnit?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch active incidents assigned to this unit (by unit code)
      const { data: incidents, error: incidentsError } = await supabase
        .from('emergency_incidents')
        .select('*')
        .contains('assigned_units', [userUnit.unit_code])
        .in('status', ['reported', 'dispatched', 'responding', 'responded']);

      if (incidentsError) throw incidentsError;
      setActiveIncidents(incidents || []);

      // Calculate unit stats
      const totalMembers = userUnit.emergency_unit_members?.length || 0;
      
      // For available members, assume members not currently assigned to active incidents are available
      const busyMembers = incidents?.reduce((acc, incident) => {
        return acc + (incident.assigned_units?.length || 0);
      }, 0) || 0;
      const availableMembers = Math.max(0, totalMembers - Math.min(busyMembers, totalMembers));
      
      // Calculate average response time from recent incidents
      const respondedIncidents = incidents?.filter(i => i.responded_at && i.dispatched_at) || [];
      const avgResponseTime = respondedIncidents.length > 0 
        ? respondedIncidents.reduce((acc, incident) => {
            const dispatchTime = new Date(incident.dispatched_at).getTime();
            const responseTime = new Date(incident.responded_at).getTime();
            return acc + ((responseTime - dispatchTime) / (1000 * 60)); // minutes
          }, 0) / respondedIncidents.length
        : 0;

      setUnitStats({
        totalMembers,
        availableMembers,
        activeIncidents: incidents?.length || 0,
        responseTime: Math.round(avgResponseTime)
      });

    } catch (error) {
      console.error('Error fetching unit data:', error);
      toast({
        title: t('common:error'),
        description: t('failedToFetchUnitData'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'get_messages'
        }
      });

      if (error) throw error;

      setRecentMessages(data.messages || []);
      
      // Count unread messages (not acknowledged)
      const unread = (data.messages || []).filter((msg: any) => !msg.acknowledged && msg.type === 'incoming').length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const acknowledgeMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.functions.invoke('unit-communications', {
        body: { 
          action: 'acknowledge_message',
          message_id: messageId
        }
      });

      if (error) throw error;

      // Update local state
      setRecentMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : msg
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      toast({
        title: t('messageAcknowledged'),
        description: t('messageMarkedAsAcknowledged')
      });
    } catch (error) {
      console.error('Error acknowledging message:', error);
      toast({
        title: t('common:error'),
        description: t('failedToAcknowledgeMessage'),
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'dispatched': return 'bg-orange-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unit Lead Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Unit Lead Dashboard</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {userUnit.unit_code} - {userUnit.unit_name}
                </CardDescription>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full ${getStatusColor(userUnit.status)}`} />
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{unitStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{unitStats.availableMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold">{unitStats.activeIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{unitStats.responseTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="incidents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="incidents">{t('activeIncidents')}</TabsTrigger>
          <TabsTrigger value="team">{t('teamManagement')}</TabsTrigger>
          <TabsTrigger value="status">{t('unitStatus')}</TabsTrigger>
          <TabsTrigger value="communications">{t('communications')}</TabsTrigger>
        </TabsList>

        {/* Active Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Active Incidents Assigned to Your Unit
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeIncidents.length > 0 ? (
                <div className="space-y-3">
                  {activeIncidents.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(incident.priority_level)}`} />
                          <div>
                            <p className="font-medium">{incident.incident_number}</p>
                            <p className="text-sm text-muted-foreground">{incident.emergency_type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{incident.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(incident.reported_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {incident.location_address && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {incident.location_address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No active incidents assigned to your unit</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team">
          <UnitMemberManager 
            unit={userUnit} 
            onUpdate={() => {
              fetchUnitData();
              onRefresh?.();
            }} 
          />
        </TabsContent>

        {/* Unit Status Tab */}
        <TabsContent value="status">
          <UnitStatusManager 
            unit={userUnit} 
            onUpdate={() => {
              fetchUnitData();
              onRefresh?.();
            }} 
          />
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Leadership Communications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Command Actions */}
              <div className="grid grid-cols-2 gap-3">
                <SendUnitMessageDialog unitId={userUnit.id} unitCode={userUnit.unit_code}>
                  <Button className="w-full text-xs" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Unit Message
                  </Button>
                </SendUnitMessageDialog>
                
                <RequestBackupDialog unitId={userUnit.id} unitCode={userUnit.unit_code}>
                  <Button className="w-full text-xs" variant="outline">
                    <Navigation className="h-4 w-4 mr-2" />
                    Request Backup
                  </Button>
                </RequestBackupDialog>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                <Radio className="h-4 w-4" />
                <span className="text-sm">Radio: {userUnit.radio_frequency || 'Not assigned'}</span>
              </div>

              {/* Recent Messages with Acknowledgment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Recent Communications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
                
                {recentMessages.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {recentMessages.map((comm) => (
                      <div key={comm.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              comm.type === 'incoming' ? 'bg-blue-500' : 'bg-green-500'
                            }`} />
                            <span className="font-medium text-sm">
                              {comm.type === 'incoming' ? 'Dispatch' : 'Unit'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comm.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {comm.acknowledged && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="mt-2">
                          {comm.is_radio_code && (
                            <div className="flex items-center gap-2 mb-1">
                              <Radio className="h-3 w-3" />
                              <span className="text-xs font-mono bg-muted px-1 rounded">
                                {comm.radio_code}
                              </span>
                            </div>
                          )}
                          <p className="text-sm">{comm.message_content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              {comm.priority_level <= 2 && (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                            {comm.type === 'incoming' && !comm.acknowledged && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                onClick={() => acknowledgeMessage(comm.id)}
                              >
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent communications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};