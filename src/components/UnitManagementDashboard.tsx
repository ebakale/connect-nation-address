import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, MapPin, Radio, Car, Crown, User, Plus, Edit, 
  Trash2, Clock, TrendingUp, AlertCircle, CheckCircle,
  Phone, Mail, Shield, Navigation, ArrowLeft, Star, Award
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
  const [units, setUnits] = useState<UnitWithMembers[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<Officer[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithMembers | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

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
          user_role_metadata(scope_type, scope_value)
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
            profiles(
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
        title: "Error",
        description: "Failed to fetch units",
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
          user_role_metadata(scope_type, scope_value)
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
        title: "Error",
        description: "Failed to create unit",
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
        title: "Error",
        description: "Failed to assign officer to unit",
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
        title: "Success",
        description: "Officer removed from unit"
      });
    } catch (error) {
      console.error('Error removing officer:', error);
      toast({
        title: "Error",
        description: "Failed to remove officer from unit",
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
        title: "Success",
        description: "Unit status updated"
      });
    } catch (error) {
      console.error('Error updating unit status:', error);
      toast({
        title: "Error",
        description: "Failed to update unit status",
        variant: "destructive"
      });
    }
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
      case 'officer': return 'Police Officer';
      case 'senior_officer': return 'Senior Officer';
      case 'corporal': return 'Corporal';
      case 'sergeant': return 'Sergeant';
      case 'lieutenant': return 'Lieutenant';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">Unit Management</h1>
            <p className="text-muted-foreground">Manage emergency units and officer assignments</p>
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Emergency Unit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="unit_code">Unit Code</Label>
                <Input
                  id="unit_code"
                  placeholder="e.g., POLICE-01"
                  value={newUnit.unit_code}
                  onChange={(e) => setNewUnit({...newUnit, unit_code: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="unit_name">Unit Name</Label>
                <Input
                  id="unit_name"
                  placeholder="e.g., Patrol Unit Alpha"
                  value={newUnit.unit_name}
                  onChange={(e) => setNewUnit({...newUnit, unit_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="unit_type">Unit Type</Label>
                <Select
                  value={newUnit.unit_type}
                  onValueChange={(value) => setNewUnit({...newUnit, unit_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patrol">Patrol</SelectItem>
                    <SelectItem value="response">Emergency Response</SelectItem>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="investigation">Investigation</SelectItem>
                    <SelectItem value="special">Special Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="radio_frequency">Radio Frequency (Optional)</Label>
                <Input
                  id="radio_frequency"
                  placeholder="e.g., 154.755"
                  value={newUnit.radio_frequency}
                  onChange={(e) => setNewUnit({...newUnit, radio_frequency: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="vehicle_id">Vehicle ID (Optional)</Label>
                <Input
                  id="vehicle_id"
                  placeholder="e.g., CAR-2024-001"
                  value={newUnit.vehicle_id}
                  onChange={(e) => setNewUnit({...newUnit, vehicle_id: e.target.value})}
                />
              </div>
              <Button onClick={createUnit} className="w-full">
                Create Unit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Units Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {units.map((unit) => (
          <Card key={unit.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{unit.unit_code}</CardTitle>
                  <p className="text-sm text-muted-foreground">{unit.unit_name}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(unit.status)}`} />
              </div>
              <Badge variant="outline" className="w-fit">
                {unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1)}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{unit.emergency_unit_members.length} officers</span>
              </div>
              
              {unit.radio_frequency && (
                <div className="flex items-center gap-2 text-sm">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <span>{unit.radio_frequency}</span>
                </div>
              )}
              
              {unit.vehicle_id && (
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>{unit.vehicle_id}</span>
                </div>
              )}

              {unit.current_location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{unit.current_location}</span>
                </div>
              )}

              <Separator />

              {/* Officer List with Chain of Command */}
              <div className="space-y-2">
                {unit.emergency_unit_members.length > 0 ? (
                  // Sort by lead status first, then by role priority
                  unit.emergency_unit_members
                    .sort((a, b) => {
                      if (a.is_lead && !b.is_lead) return -1;
                      if (!a.is_lead && b.is_lead) return 1;
                      return getRolePriority(b.role) - getRolePriority(a.role);
                    })
                    .map((member) => (
                    <div key={member.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role, member.is_lead)}
                        <div className="flex flex-col">
                          <span className="truncate font-medium">{member.profiles.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRoleTitle(member.role)}
                            {member.is_lead && " • Unit Lead"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOfficerFromUnit(member.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No officers assigned</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Select
                  value={unit.status}
                  onValueChange={(value) => updateUnitStatus(unit.id, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isAssignDialogOpen && selectedUnit?.id === unit.id} 
                        onOpenChange={(open) => {
                          setIsAssignDialogOpen(open);
                          if (open) setSelectedUnit(unit);
                        }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Officer to {unit.unit_code}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Available Officers</Label>
                        <Select
                          value={assignmentData.officer_id}
                          onValueChange={(value) => setAssignmentData({...assignmentData, officer_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an officer" />
                          </SelectTrigger>
                          <SelectContent>
                            {getUnassignedOfficers().map((officer) => (
                              <SelectItem key={officer.user_id} value={officer.user_id}>
                                {officer.full_name} ({officer.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Role</Label>
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
                        <Label htmlFor="is_lead">Assign as Unit Lead</Label>
                      </div>

                      {/* Chain of Command Information */}
                      <div className="bg-muted/30 rounded p-3 text-sm">
                        <h4 className="font-medium mb-2">Police Chain of Command:</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-blue-600" />
                            <span>Lieutenant (Unit Commander)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-3 w-3 text-green-600" />
                            <span>Sergeant (Squad Leader)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-purple-600" />
                            <span>Corporal (Team Leader)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-orange-600" />
                            <span>Senior Officer</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>Police Officer</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          <Crown className="h-3 w-3 text-yellow-600 inline mr-1" />
                          Unit Lead designation can be assigned to any rank
                        </div>
                      </div>

                      <Button 
                        onClick={() => assignOfficerToUnit(unit.id)} 
                        className="w-full"
                        disabled={!assignmentData.officer_id}
                      >
                        Assign Officer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{units.length}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Units</p>
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
                <p className="text-sm text-muted-foreground">On Duty</p>
                <p className="text-2xl font-bold text-blue-600">
                  {units.filter(u => ['dispatched', 'busy'].includes(u.status)).length}
                </p>
              </div>
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Officers</p>
                <p className="text-2xl font-bold">
                  {units.reduce((total, unit) => total + unit.emergency_unit_members.length, 0)}
                </p>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};