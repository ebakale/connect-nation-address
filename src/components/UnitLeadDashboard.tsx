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
import { toast } from 'sonner';
import { UnitStatusManager } from './UnitStatusManager';
import { UnitMemberManager } from './UnitMemberManager';

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
  const [activeIncidents, setActiveIncidents] = useState<ActiveIncident[]>([]);
  const [unitStats, setUnitStats] = useState({
    totalMembers: 0,
    availableMembers: 0,
    activeIncidents: 0,
    responseTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnitData();
  }, [userUnit?.id]);

  const fetchUnitData = async () => {
    if (!userUnit?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch active incidents assigned to this unit (check both unit ID and unit code)
      const { data: incidents, error: incidentsError } = await supabase
        .from('emergency_incidents')
        .select('*')
        .or(`assigned_units.cs.{${userUnit.id}},assigned_units.cs.{${userUnit.unit_code}}`)
        .in('status', ['reported', 'dispatched', 'responded']);

      if (incidentsError) throw incidentsError;
      setActiveIncidents(incidents || []);

      // Calculate unit stats
      const totalMembers = userUnit.emergency_unit_members.length;
      const availableMembers = userUnit.emergency_unit_members.filter(m => 
        // Add logic here for checking member availability
        true
      ).length;

      setUnitStats({
        totalMembers,
        availableMembers,
        activeIncidents: incidents?.length || 0,
        responseTime: 0 // Calculate from recent incidents
      });

    } catch (error) {
      console.error('Error fetching unit data:', error);
      toast.error("Failed to fetch unit data");
    } finally {
      setLoading(false);
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="status">Unit Status</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        {/* Active Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Unit Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                  <Radio className="h-4 w-4" />
                  <span className="text-sm">Radio: {userUnit.radio_frequency || 'Not assigned'}</span>
                </div>
                
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Unit Message
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  Request Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};