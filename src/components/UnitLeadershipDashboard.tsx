import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Users, Shield, Activity, TrendingUp, MapPin, Radio,
  UserPlus, UserMinus, Clock, AlertTriangle, CheckCircle,
  FileText, Send, Calendar, Target, Award, Settings,
  BarChart3, PieChart, Download, Upload, RefreshCw,
  MessageSquare, Bell, Star, Flag, Navigation, Car
} from 'lucide-react';

interface UnitMember {
  id: string;
  officer_id: string;
  role: string;
  is_lead: boolean;
  joined_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface UnitInfo {
  id: string;
  unit_code: string;
  unit_name: string;
  unit_type: string;
  status: string;
  current_location?: string;
  coverage_city?: string;
  coverage_region?: string;
  location_latitude?: number;
  location_longitude?: number;
}

interface IncidentAssignment {
  id: string;
  incident_number: string;
  emergency_type: string;
  priority_level: number;
  status: string;
  location_address?: string;
  incident_message?: string;
  dispatched_at?: string;
  responded_at?: string;
  resolved_at?: string;
  assigned_units: string[];
}

interface PerformanceMetrics {
  total_incidents: number;
  resolved_incidents: number;
  average_response_time: number;
  completion_rate: number;
  active_members: number;
}

export const UnitLeadershipDashboard: React.FC = () => {
  const { user } = useAuth();
  const { roleMetadata } = useUserRole();
  const { toast } = useToast();
  const { t } = useTranslation('emergency');
  const [selectedUnit, setSelectedUnit] = useState<UnitInfo | null>(null);
  const [managedUnits, setManagedUnits] = useState<UnitInfo[]>([]);
  const [unitMembers, setUnitMembers] = useState<UnitMember[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<any[]>([]);
  const [unitIncidents, setUnitIncidents] = useState<IncidentAssignment[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showIncidentAssignDialog, setShowIncidentAssignDialog] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [memberRole, setMemberRole] = useState<string>('officer');
  const [availableIncidents, setAvailableIncidents] = useState<any[]>([]);
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<string[]>([]);
  const [teamMessage, setTeamMessage] = useState('');
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchManagedUnits();
      fetchAvailableOfficers();
      fetchAvailableIncidents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUnit) {
      fetchUnitMembers();
      fetchUnitIncidents();
      calculatePerformanceMetrics();
    }
  }, [selectedUnit]);

  const fetchManagedUnits = async () => {
    try {
      // Get units where user is assigned as a lead or if they're a supervisor
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id);

      const isSupervisor = userRoles?.some(r => ['police_supervisor', 'police_admin', 'admin'].includes(r.role));

      let query = supabase.from('emergency_units').select('*');

      if (!isSupervisor) {
        // For non-supervisors, only show units they lead
        const { data: leadUnits } = await supabase
          .from('emergency_unit_members')
          .select('unit_id')
          .eq('officer_id', user?.id)
          .eq('is_lead', true);

        const unitIds = leadUnits?.map(u => u.unit_id) || [];
        if (unitIds.length === 0) {
          setManagedUnits([]);
          return;
        }
        query = query.in('id', unitIds);
      } else {
        // For supervisors, filter units by their geographic scope
        const geographicMetadata = roleMetadata.find(m => m.scope_type === 'geographic');
        if (geographicMetadata?.scope_value) {
          // Check if scope value is a region or city and filter accordingly
          const scopeValue = geographicMetadata.scope_value;
          
          // Try filtering by region first, then by city
          const regionQuery = supabase.from('emergency_units')
            .select('*')
            .eq('coverage_region', scopeValue);
          
          const { data: regionUnits } = await regionQuery;
          
          if (regionUnits && regionUnits.length > 0) {
            query = query.eq('coverage_region', scopeValue);
          } else {
            query = query.eq('coverage_city', scopeValue);
          }
        }
      }

      const { data, error } = await query.order('unit_code');

      if (error) throw error;
      setManagedUnits(data || []);
      
      if (data && data.length > 0 && !selectedUnit) {
        setSelectedUnit(data[0]);
      }
    } catch (error) {
      console.error('Error fetching managed units:', error);
      toast({ title: 'Error', description: 'Failed to fetch units', variant: 'destructive' });
    }
  };

  const fetchUnitMembers = async () => {
    if (!selectedUnit) return;

    try {
      const { data, error } = await supabase
        .from('emergency_unit_members')
        .select(`
          *,
          profiles!emergency_unit_members_officer_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .eq('unit_id', selectedUnit.id);

      if (error) throw error;
      setUnitMembers(data || []);
    } catch (error) {
      console.error('Error fetching unit members:', error);
      toast({ title: 'Error', description: 'Failed to fetch unit members', variant: 'destructive' });
    }
  };

  const fetchAvailableOfficers = async () => {
    try {
      // Get officers who are not assigned to any unit or are available for assignment
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          phone,
          user_roles!inner (role)
        `)
        .eq('user_roles.role', 'police_operator');

      if (error) throw error;
      setAvailableOfficers(data || []);
    } catch (error) {
      console.error('Error fetching available officers:', error);
    }
  };

  const fetchUnitIncidents = async () => {
    if (!selectedUnit) return;

    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('*')
        .contains('assigned_units', [selectedUnit.unit_code])
        .order('priority_level', { ascending: false })
        .order('reported_at', { ascending: false });

      if (error) throw error;
      setUnitIncidents(data || []);
    } catch (error) {
      console.error('Error fetching unit incidents:', error);
    }
  };

  const fetchAvailableIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('*')
        .in('status', ['reported', 'dispatched'])
        .is('assigned_units', null)
        .order('priority_level', { ascending: false })
        .order('reported_at', { ascending: false });

      if (error) throw error;
      setAvailableIncidents(data || []);
    } catch (error) {
      console.error('Error fetching available incidents:', error);
    }
  };

  const calculatePerformanceMetrics = async () => {
    if (!selectedUnit) return;

    try {
      const { data: incidents, error } = await supabase
        .from('emergency_incidents')
        .select('*')
        .contains('assigned_units', [selectedUnit.unit_code]);

      if (error) throw error;

      const totalIncidents = incidents?.length || 0;
      const resolvedIncidents = incidents?.filter(i => i.status === 'resolved').length || 0;
      const completionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0;

      // Calculate average response time
      const incidentsWithTimes = incidents?.filter(i => i.dispatched_at && i.responded_at) || [];
      let averageResponseTime = 0;
      
      if (incidentsWithTimes.length > 0) {
        const totalResponseTime = incidentsWithTimes.reduce((sum, incident) => {
          const dispatched = new Date(incident.dispatched_at);
          const responded = new Date(incident.responded_at);
          return sum + (responded.getTime() - dispatched.getTime());
        }, 0);
        averageResponseTime = totalResponseTime / incidentsWithTimes.length / (1000 * 60); // Convert to minutes
      }

      setPerformanceMetrics({
        total_incidents: totalIncidents,
        resolved_incidents: resolvedIncidents,
        average_response_time: averageResponseTime,
        completion_rate: completionRate,
        active_members: unitMembers.length
      });
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
    }
  };

  const addUnitMember = async () => {
    if (!selectedUnit || !selectedOfficerId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('emergency_unit_members')
        .insert({
          unit_id: selectedUnit.id,
          officer_id: selectedOfficerId,
          role: memberRole,
          is_lead: memberRole === 'lead'
        });

      if (error) throw error;

      toast({ title: t('common:success'), description: t('unitManagement.messages.officerAssignedSuccessfully') });
      setShowAddMemberDialog(false);
      setSelectedOfficerId('');
      setMemberRole('officer');
      fetchUnitMembers();
    } catch (error) {
      console.error('Error adding unit member:', error);
      toast({ title: t('common:error'), description: t('unitManagement.messages.failedToAssignOfficer'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const removeUnitMember = async (memberId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('emergency_unit_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({ title: t('common:success'), description: t('unitManagement.messages.officerRemovedFromUnit') });
      fetchUnitMembers();
    } catch (error) {
      console.error('Error removing unit member:', error);
      toast({ title: t('common:error'), description: t('unitManagement.messages.failedToRemoveOfficer'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const assignIncidentsToUnit = async () => {
    if (!selectedUnit || selectedIncidentIds.length === 0) return;

    setIsLoading(true);
    try {
      // Update each selected incident to include this unit
      for (const incidentId of selectedIncidentIds) {
        const { error } = await supabase
          .from('emergency_incidents')
          .update({
            assigned_units: [selectedUnit.unit_code],
            status: 'dispatched',
            dispatched_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', incidentId);

        if (error) throw error;
      }

      toast({ 
        title: t('common:success'), 
        description: `${selectedIncidentIds.length} ${t('incident')}(s) ${t('assigned')} ${t('to')} ${selectedUnit.unit_code}` 
      });
      
      setShowIncidentAssignDialog(false);
      setSelectedIncidentIds([]);
      fetchUnitIncidents();
      fetchAvailableIncidents();
    } catch (error) {
      console.error('Error assigning incidents:', error);
      toast({ title: t('common:error'), description: t('failedToAssignIncidents'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTeamMessage = async () => {
    if (!selectedUnit || !teamMessage.trim()) return;

    setIsLoading(true);
    try {
      // Send message to all unit members
      const notifications = unitMembers.map(member => ({
        user_id: member.officer_id,
        title: `Team Message from ${selectedUnit.unit_code}`,
        message: teamMessage,
        type: 'team_communication',
        priority_level: 2,
        metadata: {
          unit_code: selectedUnit.unit_code,
          from_user_id: user?.id,
          message_type: 'team_broadcast'
        }
      }));

      const { error } = await supabase
        .from('emergency_notifications')
        .insert(notifications);

      if (error) throw error;

      toast({ title: t('common:success'), description: t('messageSentToTeam') });
      setShowMessageDialog(false);
      setTeamMessage('');
    } catch (error) {
      console.error('Error sending team message:', error);
      toast({ title: t('common:error'), description: t('failedToSendMessage'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnitStatus = async (newStatus: string) => {
    if (!selectedUnit) return;

    try {
      const { error } = await supabase
        .from('emergency_units')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUnit.id);

      if (error) throw error;

      setSelectedUnit({ ...selectedUnit, status: newStatus });
      toast({ title: t('common:success'), description: t('unitManagement.messages.unitStatusUpdated') });
    } catch (error) {
      console.error('Error updating unit status:', error);
      toast({ title: t('common:error'), description: t('unitManagement.messages.failedToUpdateUnitStatus'), variant: 'destructive' });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return t('unitLeadershipDashboard.available');
      case 'busy': return t('unitLeadershipDashboard.busy');
      case 'dispatched': return t('unitLeadershipDashboard.dispatched');
      case 'maintenance': return t('unitLeadershipDashboard.maintenance');
      default: return status;
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'dispatched': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (managedUnits.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('unitLeadershipDashboard.noUnitsToManage')}</h3>
            <p className="text-muted-foreground">
              {t('unitLeadershipDashboard.noPermissionsText')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{t('unitLeadershipDashboard.title')}</h1>
        <p className="text-muted-foreground">{t('unitLeadershipDashboard.description')}</p>
      </div>
      <div className="flex items-center gap-4">
        <Select value={selectedUnit?.id || ''} onValueChange={(value) => {
          const unit = managedUnits.find(u => u.id === value);
          setSelectedUnit(unit || null);
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('unitLeadershipDashboard.selectUnit')} />
          </SelectTrigger>
          <SelectContent>
            {managedUnits.map(unit => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.unit_code} - {unit.unit_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('unitLeadershipDashboard.refresh')}
        </Button>
      </div>

      {selectedUnit && (
        <>
          {/* Unit Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('unitLeadershipDashboard.unitStatus')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(selectedUnit.status)}>
                        {getStatusLabel(selectedUnit.status)}
                      </Badge>
                      <Select onValueChange={updateUnitStatus}>
                        <SelectTrigger className="w-24 h-6 text-xs">
                          <Settings className="h-3 w-3" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">{t('unitLeadershipDashboard.available')}</SelectItem>
                          <SelectItem value="busy">{t('unitLeadershipDashboard.busy')}</SelectItem>
                          <SelectItem value="dispatched">{t('unitLeadershipDashboard.dispatched')}</SelectItem>
                          <SelectItem value="maintenance">{t('unitLeadershipDashboard.maintenance')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Shield className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('unitLeadershipDashboard.activeMembers')}</p>
                    <p className="text-2xl font-bold">{performanceMetrics?.active_members || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('unitLeadershipDashboard.activeIncidents')}</p>
                    <p className="text-2xl font-bold">{unitIncidents.filter(i => !['resolved', 'closed'].includes(i.status)).length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('unitLeadershipDashboard.completionRate')}</p>
                    <p className="text-2xl font-bold">{Math.round(performanceMetrics?.completion_rate || 0)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">{t('unitLeadershipDashboard.teamManagement')}</TabsTrigger>
              <TabsTrigger value="incidents">{t('unitLeadershipDashboard.incidentOversight')}</TabsTrigger>
              <TabsTrigger value="performance">{t('unitLeadershipDashboard.performance')}</TabsTrigger>
              <TabsTrigger value="communications">{t('unitLeadershipDashboard.communications')}</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('unitLeadershipDashboard.unitMembers')}</CardTitle>
                    <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t('unitLeadershipDashboard.addMember')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('unitLeadershipDashboard.addUnitMember')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="officer">{t('unitLeadershipDashboard.selectOfficer')}</Label>
                            <Select value={selectedOfficerId} onValueChange={setSelectedOfficerId}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('unitLeadershipDashboard.chooseAnOfficer')} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOfficers.map(officer => (
                                  <SelectItem key={officer.user_id} value={officer.user_id}>
                                    {officer.full_name} ({officer.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="role">{t('unitLeadershipDashboard.role')}</Label>
                            <Select value={memberRole} onValueChange={setMemberRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="officer">{t('unitLeadershipDashboard.officers')}</SelectItem>
                                <SelectItem value="senior_officer">{t('unitLeadershipDashboard.seniorOfficer')}</SelectItem>
                                <SelectItem value="lead">{t('unitLeadershipDashboard.unitLead')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={addUnitMember} 
                            disabled={!selectedOfficerId || isLoading}
                            className="w-full"
                          >
                            {t('unitLeadershipDashboard.addToUnit')}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unitMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{member.profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{member.role}</Badge>
                              {member.is_lead && <Badge variant="outline">{t('unitLeadershipDashboard.teamLead')}</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeUnitMember(member.id)}
                            disabled={isLoading}
                          >
                            <UserMinus className="h-4 w-4" />
                            {t('unitLeadershipDashboard.remove')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('unitLeadershipDashboard.incidentManagement')}</h3>
                <Dialog open={showIncidentAssignDialog} onOpenChange={setShowIncidentAssignDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Target className="h-4 w-4 mr-2" />
                      {t('unitLeadershipDashboard.assignIncidents')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('unitLeadershipDashboard.assignIncidentsTo')} {selectedUnit.unit_code}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {availableIncidents.map(incident => (
                          <div key={incident.id} className="flex items-center space-x-2 p-3 border rounded">
                            <input
                              type="checkbox"
                              id={incident.id}
                              checked={selectedIncidentIds.includes(incident.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIncidentIds([...selectedIncidentIds, incident.id]);
                                } else {
                                  setSelectedIncidentIds(selectedIncidentIds.filter(id => id !== incident.id));
                                }
                              }}
                              className="rounded"
                            />
                            <label htmlFor={incident.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{incident.incident_number}</p>
                                  <p className="text-sm text-muted-foreground">{incident.incident_message}</p>
                                </div>
                                <Badge className={getPriorityColor(incident.priority_level)}>
                                  {t('unitLeadershipDashboard.priority')} {incident.priority_level}
                                </Badge>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                      <Button 
                        onClick={assignIncidentsToUnit}
                        disabled={selectedIncidentIds.length === 0 || isLoading}
                        className="w-full"
                      >
                        {t('assign')} {selectedIncidentIds.length} {t('incident')}(s)
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {unitIncidents.map(incident => (
                  <Card key={incident.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge className={getPriorityColor(incident.priority_level)}>
                            P{incident.priority_level}
                          </Badge>
                          <div>
                            <p className="font-medium">{incident.incident_number}</p>
                            <p className="text-sm text-muted-foreground">{incident.incident_message}</p>
                            {incident.location_address && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {incident.location_address}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{incident.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {incident.dispatched_at && new Date(incident.dispatched_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('unitLeadershipDashboard.performanceMetrics')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>{t('unitLeadershipDashboard.incidentCompletionRate')}</span>
                        <span>{Math.round(performanceMetrics?.completion_rate || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${performanceMetrics?.completion_rate || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('unitLeadershipDashboard.averageResponseTime')}</p>
                      <p className="text-2xl font-bold">
                        {Math.round(performanceMetrics?.average_response_time || 0)} {t('common:min')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('unitLeadershipDashboard.totalIncidentsHandled')}</p>
                      <p className="text-2xl font-bold">{performanceMetrics?.total_incidents || 0}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('unitLeadershipDashboard.recentActivity')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unitIncidents.slice(0, 5).map(incident => (
                        <div key={incident.id} className="flex items-center gap-3 text-sm">
                          <div className={`h-2 w-2 rounded-full ${getPriorityColor(incident.priority_level)}`} />
                          <span className="flex-1">{incident.incident_number}</span>
                          <Badge variant="outline" className="text-xs">
                            {incident.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="communications" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('unitLeadershipDashboard.teamCommunications')}</CardTitle>
                    <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="text-xs whitespace-nowrap">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {t('unitLeadershipDashboard.sendMessage')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('unitLeadershipDashboard.sendMessageToTeam')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="message">{t('unitLeadershipDashboard.message')}</Label>
                            <Textarea
                              id="message"
                              placeholder={t('unitLeadershipDashboard.enterMessagePlaceholder')}
                              value={teamMessage}
                              onChange={(e) => setTeamMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <Button 
                            onClick={sendTeamMessage}
                            disabled={!teamMessage.trim() || isLoading}
                            className="w-full"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {t('unitLeadershipDashboard.sendMessage')}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('unitLeadershipDashboard.communicationComingSoon')}</p>
                    <p className="text-sm">{t('unitLeadershipDashboard.realTimeMessaging')}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};