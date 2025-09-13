import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Users, MapPin, Radio, Car, Crown, User, Plus, Edit, 
  Trash2, Clock, TrendingUp, AlertCircle, CheckCircle,
  Phone, Mail, Shield, Navigation, ArrowLeft, Star, Award, ChevronDown, ChevronRight
} from 'lucide-react';

interface EmergencyUnit {
  id: string;
  unit_code: string;
  unit_name: string;
  unit_type: string;
  status: string;
  radio_frequency?: string;
  vehicle_id?: string;
  current_location?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_updated_at?: string;
  created_at: string;
  updated_at: string;
}

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

interface UnitWithMembers extends EmergencyUnit {
  emergency_unit_members: UnitMember[];
}

interface Officer {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface UnitManagementDashboardProps {
  onClose?: () => void;
}

export const UnitManagementDashboard: React.FC<UnitManagementDashboardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'common']);
  const [units, setUnits] = useState<UnitWithMembers[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<Officer[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithMembers | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // Form states
  const [newUnit, setNewUnit] = useState({
    unit_code: '',
    unit_name: '',
    unit_type: 'patrol',
    radio_frequency: '',
    vehicle_id: ''
  });

  const [assignmentData, setAssignmentData] = useState({
    officer_id: '',
    role: 'officer',
    is_lead: false
  });

  const [editUnit, setEditUnit] = useState({
    unit_code: '',
    unit_name: '',
    unit_type: 'patrol',
    radio_frequency: '',
    vehicle_id: ''
  });

  useEffect(() => {
    fetchUnits();
    fetchAvailableOfficers();
  }, []);

  const fetchUnits = async () => {
    try {
      // Get current user's city scope
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role,
          user_role_metadata!fk_user_role_metadata_user_role(scope_type, scope_value)
        `)
        .eq('user_id', user?.id);

      if (roleError) throw roleError;

      // Find city assignment for supervisor
      const cityMetadata = roleData?.find(role => 
        role.user_role_metadata?.some(meta => meta.scope_type === 'city')
      );
      
      const userCity = cityMetadata?.user_role_metadata?.find(meta => meta.scope_type === 'city')?.scope_value || null;

      // Build query with city filter for supervisors
      let query = supabase
        .from('emergency_units')
        .select(`
          *,
          emergency_unit_members(
            id,
            officer_id,
            role,
            is_lead,
            joined_at,
            profiles!emergency_unit_members_officer_id_fkey(
              full_name,
              email,
              phone
            )
          )
        `)
        .order('unit_code');

      // Filter by user's assigned city if they have one
      if (userCity) {
        query = query.eq('coverage_city', userCity);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      toast({
        title: t('unitManagement.error'),
        description: t('unitManagement.failedToFetchUnits'),
        variant: "destructive"
      });
    }
  };

  const fetchAvailableOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          phone,
          user_roles!inner(role)
        `)
        .in('user_roles.role', ['police_operator']); // Only operators can be assigned to units

      if (error) throw error;
      setAvailableOfficers(data || []);
    } catch (error) {
      console.error('Error fetching officers:', error);
    }
  };

  const createUnit = async () => {
    try {
      // Get current user's city scope to assign to new unit
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role,
          user_role_metadata!fk_user_role_metadata_user_role(scope_type, scope_value)
        `)
        .eq('user_id', user?.id);

      if (roleError) throw roleError;

      const cityMetadata = roleData?.find(role => 
        role.user_role_metadata?.some(meta => meta.scope_type === 'city')
      );
      
      const userCity = cityMetadata?.user_role_metadata?.find(meta => meta.scope_type === 'city')?.scope_value || null;

      const { data, error } = await supabase
        .from('emergency_units')
        .insert({
          unit_code: newUnit.unit_code,
          unit_name: newUnit.unit_name,
          unit_type: newUnit.unit_type,
          radio_frequency: newUnit.radio_frequency || null,
          vehicle_id: newUnit.vehicle_id || null,
          coverage_city: userCity, // Set coverage city based on supervisor's scope
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchUnits();
      setIsCreateDialogOpen(false);
      setNewUnit({
        unit_code: '',
        unit_name: '',
        unit_type: 'patrol',
        radio_frequency: '',
        vehicle_id: ''
      });

      toast({
        title: "Success",
        description: `Unit ${newUnit.unit_code} created successfully${userCity ? ` for ${userCity}` : ''}`
      });
    } catch (error) {
      console.error('Error creating unit:', error);
      toast({
        title: t('unitManagement.error'),
        description: t('unitManagement.failedToCreateUnit'),
        variant: "destructive"
      });
    }
  };

  const assignOfficerToUnit = async (unitId: string) => {
    try {
      // Auto-assign lead role for senior positions if no lead exists
      const unit = units.find(u => u.id === unitId);
      const hasLead = unit?.emergency_unit_members?.some(member => member.is_lead);
      const isSeniorRole = ['sergeant', 'lieutenant', 'corporal'].includes(assignmentData.role);
      
      // If no lead exists and this is a senior role, suggest making them lead
      const shouldBeLead = !hasLead && isSeniorRole;

      const { error } = await supabase
        .from('emergency_unit_members')
        .insert({
          unit_id: unitId,
          officer_id: assignmentData.officer_id,
          role: assignmentData.role,
          is_lead: assignmentData.is_lead || shouldBeLead
        });

      if (error) throw error;

      await fetchUnits();
      setIsAssignDialogOpen(false);
      setAssignmentData({
        officer_id: '',
        role: 'officer',
        is_lead: false
      });

      const roleTitle = formatRoleTitle(assignmentData.role);
      const leadStatus = (assignmentData.is_lead || shouldBeLead) ? ' as Unit Lead' : '';

      toast({
        title: "Success",
        description: `${roleTitle} assigned to unit successfully${leadStatus}`
      });
    } catch (error) {
      console.error('Error assigning officer:', error);
      toast({
        title: t('unitManagement.error'),
        description: t('unitManagement.failedToAssignOfficer'),
        variant: "destructive"
      });
    }
  };

  const removeOfficerFromUnit = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_unit_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchUnits();
      toast({
        title: t('unitManagement.success'),
        description: t('unitManagement.officerRemovedSuccessfully')
      });
    } catch (error) {
      console.error('Error removing officer:', error);
      toast({
        title: t('unitManagement.error'),
        description: t('unitManagement.failedToRemoveOfficer'),
        variant: "destructive"
      });
    }
  };

  const updateUnitStatus = async (unitId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('emergency_units')
        .update({ status: newStatus })
        .eq('id', unitId);

      if (error) throw error;

      await fetchUnits();
      toast({
        title: t('unitManagement.success'),
        description: t('unitManagement.statusUpdatedSuccessfully')
      });
    } catch (error) {
      console.error('Error updating unit status:', error);
      toast({
        title: t('unitManagement.error'),
        description: t('unitManagement.failedToUpdateStatus'),
        variant: "destructive"
      });
    }
  };

  const updateUnit = async () => {
    try {
      const { error } = await supabase
        .from('emergency_units')
        .update({
          unit_code: editUnit.unit_code,
          unit_name: editUnit.unit_name,
          unit_type: editUnit.unit_type,
          radio_frequency: editUnit.radio_frequency || null,
          vehicle_id: editUnit.vehicle_id || null
        })
        .eq('id', selectedUnit?.id);

      if (error) throw error;

      await fetchUnits();
      setIsEditDialogOpen(false);
      setSelectedUnit(null);

      toast({
        title: t('unitManagement.success'),
        description: t('unitManagement.unitUpdatedSuccessfully')
      });
    } catch (error) {
      console.error('Error updating unit:', error);
      toast({
        title: t('unitManagement.error'),
        description: t('unitManagement.failedToUpdateUnit'),
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (unit: UnitWithMembers) => {
    setSelectedUnit(unit);
    setEditUnit({
      unit_code: unit.unit_code,
      unit_name: unit.unit_name,
      unit_type: unit.unit_type,
      radio_frequency: unit.radio_frequency || '',
      vehicle_id: unit.vehicle_id || ''
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'dispatched': return 'bg-blue-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUnassignedOfficers = () => {
    const assignedOfficerIds = units.flatMap(unit => 
      unit.emergency_unit_members.map(member => member.officer_id)
    );
    return availableOfficers.filter(officer => 
      !assignedOfficerIds.includes(officer.user_id)
    );
  };

  const formatRoleTitle = (role: string) => {
    switch (role) {
      case 'officer': return t('unitManagement.roles.officer');
      case 'senior_officer': return t('unitManagement.roles.senior_officer');
      case 'corporal': return t('unitManagement.roles.corporal');
      case 'sergeant': return t('unitManagement.roles.sergeant');
      case 'lieutenant': return t('unitManagement.roles.lieutenant');
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleIcon = (role: string, isLead: boolean) => {
    if (isLead) return <Crown className="h-3 w-3 text-yellow-600" />;
    
    switch (role) {
      case 'lieutenant': return <Star className="h-3 w-3 text-blue-600" />;
      case 'sergeant': return <Award className="h-3 w-3 text-green-600" />;
      case 'corporal': return <Shield className="h-3 w-3 text-purple-600" />;
      case 'senior_officer': return <User className="h-3 w-3 text-orange-600" />;
      default: return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRolePriority = (role: string) => {
    const priorities = {
      'lieutenant': 5,
      'sergeant': 4,
      'corporal': 3,
      'senior_officer': 2,
      'officer': 1
    };
    return priorities[role] || 0;
  };

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('unitManagement.title')}</h1>
        <p className="text-muted-foreground">{t('unitManagement.description')}</p>
      </div>
      
      <div className="flex justify-start">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('unitManagement.createNewUnit')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('unitManagement.createNewUnit')}</DialogTitle>
              <DialogDescription>{t('unitManagement.description')}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_name">{t('unitManagement.unitName')}</Label>
                <Input
                  id="unit_name"
                  value={newUnit.unit_name}
                  onChange={(e) => setNewUnit({ ...newUnit, unit_name: e.target.value })}
                  placeholder="Alpha Unit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_code">{t('unitManagement.unitCode')}</Label>
                <Input
                  id="unit_code"
                  value={newUnit.unit_code}
                  onChange={(e) => setNewUnit({ ...newUnit, unit_code: e.target.value })}
                  placeholder="UNIT-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_type">{t('unitManagement.unitType')}</Label>
                <Select
                  value={newUnit.unit_type}
                  onValueChange={(value) => setNewUnit({ ...newUnit, unit_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patrol">{t('unitManagement.unitTypes.patrol')}</SelectItem>
                    <SelectItem value="rapid_response">Rapid Response Team</SelectItem>
                    <SelectItem value="traffic">{t('unitManagement.unitTypes.traffic')}</SelectItem>
                    <SelectItem value="investigation">{t('unitManagement.unitTypes.investigation')}</SelectItem>
                    <SelectItem value="special">{t('unitManagement.unitTypes.special')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_id">{t('unitManagement.vehicleId')}</Label>
                <Input
                  id="vehicle_id"
                  value={newUnit.vehicle_id}
                  onChange={(e) => setNewUnit({ ...newUnit, vehicle_id: e.target.value })}
                  placeholder="POL-001"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="radio_frequency">{t('unitManagement.radioFrequency')}</Label>
                <Input
                  id="radio_frequency"
                  value={newUnit.radio_frequency}
                  onChange={(e) => setNewUnit({ ...newUnit, radio_frequency: e.target.value })}
                  placeholder="154.920 MHz"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t('unitManagement.cancel')}</Button>
              <Button onClick={createUnit}>{t('unitManagement.create')}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Unit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Unit Information</DialogTitle>
              <DialogDescription>Update the unit details and configuration</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_unit_name">Unit Name</Label>
                <Input
                  id="edit_unit_name"
                  value={editUnit.unit_name}
                  onChange={(e) => setEditUnit({ ...editUnit, unit_name: e.target.value })}
                  placeholder="Alpha Unit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_unit_code">Unit Code</Label>
                <Input
                  id="edit_unit_code"
                  value={editUnit.unit_code}
                  onChange={(e) => setEditUnit({ ...editUnit, unit_code: e.target.value })}
                  placeholder="UNIT-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_unit_type">Police Unit Type</Label>
                <Select
                  value={editUnit.unit_type}
                  onValueChange={(value) => setEditUnit({ ...editUnit, unit_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patrol">Patrol Unit</SelectItem>
                    <SelectItem value="rapid_response">Rapid Response Team</SelectItem>
                    <SelectItem value="traffic">Traffic Enforcement</SelectItem>
                    <SelectItem value="investigation">Investigation Unit</SelectItem>
                    <SelectItem value="special">Special Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_vehicle_id">Vehicle ID</Label>
                <Input
                  id="edit_vehicle_id"
                  value={editUnit.vehicle_id}
                  onChange={(e) => setEditUnit({ ...editUnit, vehicle_id: e.target.value })}
                  placeholder="POL-001"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit_radio_frequency">Radio Frequency</Label>
                <Input
                  id="edit_radio_frequency"
                  value={editUnit.radio_frequency}
                  onChange={(e) => setEditUnit({ ...editUnit, radio_frequency: e.target.value })}
                  placeholder="154.920 MHz"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={updateUnit}>Update Unit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{units.length}</p>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {units.filter(u => u.status === 'available').length}
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dispatched</p>
                <p className="text-2xl font-bold text-blue-600">
                  {units.filter(u => u.status === 'dispatched').length}
                </p>
              </div>
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Officers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {units.reduce((total, unit) => total + unit.emergency_unit_members.length, 0)}
                </p>
              </div>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Units
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {units.map((unit) => {
              const isExpanded = expandedUnits.has(unit.id);
              const leadOfficer = unit.emergency_unit_members.find(m => m.is_lead);
              
              return (
                <Collapsible key={unit.id} open={isExpanded} onOpenChange={() => toggleUnitExpansion(unit.id)}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {unit.unit_code.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{unit.unit_code}</h3>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(unit.status)}`} />
                          </div>
                          <p className="text-sm text-muted-foreground">{unit.unit_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{unit.emergency_unit_members.length}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4">
                      {/* Unit Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Unit Information</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span>Status: {unit.status}</span>
                            </div>
                            {unit.radio_frequency && (
                              <div className="flex items-center gap-2">
                                <Radio className="h-4 w-4 text-muted-foreground" />
                                <span>Radio: {unit.radio_frequency}</span>
                              </div>
                            )}
                            {unit.vehicle_id && (
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <span>Vehicle: {unit.vehicle_id}</span>
                              </div>
                            )}
                            {unit.current_location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>Location: {unit.current_location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Actions</h4>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(unit)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit Unit
                            </Button>
                            
                            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedUnit(unit)}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Assign Officer
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Officer to {selectedUnit?.unit_code}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="officer_select">Select Officer</Label>
                                    <Select
                                      value={assignmentData.officer_id}
                                      onValueChange={(value) => setAssignmentData({...assignmentData, officer_id: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choose an officer" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getUnassignedOfficers().map((officer) => (
                                          <SelectItem key={officer.user_id} value={officer.user_id}>
                                            {officer.full_name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="role_select">Role</Label>
                                    <Select
                                      value={assignmentData.role}
                                      onValueChange={(value) => setAssignmentData({...assignmentData, role: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="officer">Police Officer</SelectItem>
                                        <SelectItem value="senior_officer">Senior Officer</SelectItem>
                                        <SelectItem value="corporal">Corporal</SelectItem>
                                        <SelectItem value="sergeant">Sergeant</SelectItem>
                                        <SelectItem value="lieutenant">Lieutenant</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="is_lead"
                                      checked={assignmentData.is_lead}
                                      onChange={(e) => setAssignmentData({...assignmentData, is_lead: e.target.checked})}
                                    />
                                    <Label htmlFor="is_lead">Make Unit Lead</Label>
                                  </div>
                                  <Button onClick={() => selectedUnit && assignOfficerToUnit(selectedUnit.id)} className="w-full">
                                    Assign Officer
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Select
                              value={unit.status}
                              onValueChange={(value) => updateUnitStatus(unit.id, value)}
                            >
                              <SelectTrigger className="w-auto">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="dispatched">Dispatched</SelectItem>
                                <SelectItem value="busy">Busy</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Unit Members */}
                      {unit.emergency_unit_members.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Unit Members ({unit.emergency_unit_members.length})</h4>
                          <div className="space-y-2">
                            {unit.emergency_unit_members
                              .sort((a, b) => {
                                if (a.is_lead && !b.is_lead) return -1;
                                if (!a.is_lead && b.is_lead) return 1;
                                return getRolePriority(b.role) - getRolePriority(a.role);
                              })
                              .map((member) => (
                                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm bg-background rounded p-3 gap-3">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                      <AvatarFallback>
                                        {member.profiles.full_name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {getRoleIcon(member.role, member.is_lead)}
                                        <span className="font-medium truncate">{member.profiles.full_name}</span>
                                        {member.is_lead && (
                                          <Badge variant="outline" className="text-xs">Lead</Badge>
                                        )}
                                      </div>
                                      <div className="space-y-1 text-xs text-muted-foreground mt-1">
                                        <div className="flex items-center justify-between">
                                          <span className="whitespace-nowrap">{formatRoleTitle(member.role)}</span>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => removeOfficerFromUnit(member.id)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                          <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{member.profiles.email}</span>
                                          </div>
                                          {member.profiles.phone && (
                                            <div className="flex items-center gap-1">
                                              <Phone className="h-3 w-3" />
                                              <span className="truncate">{member.profiles.phone}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                           </div>
                         </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};