import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Radio, Users, Plus, Edit, Trash2, UserPlus, UserMinus, MapPin, Activity } from 'lucide-react';

interface EmergencyUnit {
  id: string;
  unit_name: string;
  unit_code: string;
  unit_type: string;
  status: string;
  coverage_region: string;
  coverage_city: string;
  current_location: string;
  vehicle_id: string;
  radio_frequency: string;
  location_latitude: number;
  location_longitude: number;
  location_accuracy: number;
  location_updated_at: string;
  created_at: string;
  members?: UnitMember[];
}

interface UnitMember {
  id: string;
  officer_id: string;
  unit_id: string;
  role: string;
  is_lead: boolean;
  joined_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

interface Officer {
  user_id: string;
  full_name: string;
  email: string;
}

const UnitManagement: React.FC = () => {
  const [units, setUnits] = useState<EmergencyUnit[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<EmergencyUnit | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [officerRole, setOfficerRole] = useState<string>('officer');
  const [isLead, setIsLead] = useState(false);

  const [unitForm, setUnitForm] = useState({
    unit_name: '',
    unit_code: '',
    unit_type: 'patrol',
    coverage_region: '',
    coverage_city: '',
    vehicle_id: '',
    radio_frequency: ''
  });

  const unitTypes = ['patrol', 'emergency', 'traffic', 'dispatch', 'investigation', 'k9', 'swat'];
  const unitStatuses = ['available', 'busy', 'offline', 'maintenance'];
  const memberRoles = ['officer', 'sergeant', 'lieutenant', 'captain'];

  // Region to cities mapping for Equatorial Guinea
  const regionCities: Record<string, string[]> = {
    'Bioko Norte': ['Malabo', 'Baney', 'Rebola'],
    'Bioko Sur': ['Luba', 'Riaba'],
    'Litoral': ['Bata', 'Mbini', 'Kogo'],
    'Centro Sur': ['Evinayong', 'Acurenam', 'Niefang'],
    'Kié-Ntem': ['Ebebiyín', 'Mikomeseng', 'Nsonk Nsomo'],
    'Wele-Nzas': ['Mongomo', 'Añisoc', 'Aconibe', 'Nsork'],
    'Annobón': ['San Antonio de Palé'],
    'Djibloho': ['Ciudad de la Paz']
  };

  const getAvailableCities = (region: string) => {
    return regionCities[region] || [];
  };

  useEffect(() => {
    fetchUnits();
    fetchOfficers();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const { data: unitsData, error: unitsError } = await supabase
        .from('emergency_units')
        .select('*')
        .order('created_at', { ascending: false });

      if (unitsError) throw unitsError;

      const unitIds = (unitsData || []).map((u: any) => u.id);
      let membersByUnit: Record<string, any[]> = {};
      let profilesByUser: Record<string, any> = {};

      if (unitIds.length > 0) {
        const { data: members, error: membersError } = await supabase
          .from('emergency_unit_members')
          .select('*')
          .in('unit_id', unitIds);

        if (membersError) throw membersError;

        const officerIds = Array.from(new Set((members || []).map((m: any) => m.officer_id)));
        if (officerIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, full_name, email')
            .in('user_id', officerIds);

          if (profilesError) throw profilesError;
          profilesByUser = Object.fromEntries((profiles || []).map((p: any) => [p.user_id, p]));
        }

        membersByUnit = (members || []).reduce((acc: any, m: any) => {
          (acc[m.unit_id] ||= []).push({
            ...m,
            profile: profilesByUser[m.officer_id] || undefined,
          });
          return acc;
        }, {} as Record<string, any[]>);
      }

      const unitsWithMembers = (unitsData || []).map((u: any) => ({
        ...u,
        members: membersByUnit[u.id] || [],
      }));

      setUnits(unitsWithMembers);
    } catch (error) {
      console.error('Error fetching units:', error);
      toast.error('Failed to fetch emergency units');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const { data: roleRows, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['police_operator', 'police_supervisor', 'police_dispatcher']);

      if (rolesError) throw rolesError;

      const userIds = Array.from(new Set((roleRows || []).map((r: any) => r.user_id)));
      if (userIds.length === 0) {
        setOfficers([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const officers = (profilesData || []).map((p: any) => ({
        user_id: p.user_id,
        full_name: p.full_name || 'Unknown',
        email: p.email || 'No email'
      }));

      setOfficers(officers);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast.error('Failed to fetch officers');
    }
  };

  const createUnit = async () => {
    try {
      const { error } = await supabase
        .from('emergency_units')
        .insert({
          ...unitForm,
          status: 'available'
        });

      if (error) throw error;

      toast.success('Police unit created successfully');
      setShowCreateDialog(false);
      setUnitForm({
        unit_name: '',
        unit_code: '',
        unit_type: 'patrol',
        coverage_region: '',
        coverage_city: '',
        vehicle_id: '',
        radio_frequency: ''
      });
      fetchUnits();
    } catch (error) {
      console.error('Error creating unit:', error);
      toast.error('Failed to create police unit');
    }
  };

  const updateUnit = async () => {
    if (!selectedUnit) return;

    try {
      const { error } = await supabase
        .from('emergency_units')
        .update(unitForm)
        .eq('id', selectedUnit.id);

      if (error) throw error;

      toast.success('Police unit updated successfully');
      setShowEditDialog(false);
      setSelectedUnit(null);
      fetchUnits();
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Failed to update police unit');
    }
  };

  const deleteUnit = async () => {
    if (!selectedUnit) return;

    try {
      const { error } = await supabase
        .from('emergency_units')
        .delete()
        .eq('id', selectedUnit.id);

      if (error) throw error;

      toast.success('Police unit deleted successfully');
      setShowDeleteDialog(false);
      setSelectedUnit(null);
      fetchUnits();
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Failed to delete police unit');
    }
  };

  const assignOfficer = async () => {
    if (!selectedUnit || !selectedOfficerId) return;

    try {
      const { error } = await supabase
        .from('emergency_unit_members')
        .insert({
          unit_id: selectedUnit.id,
          officer_id: selectedOfficerId,
          role: officerRole,
          is_lead: isLead
        });

      if (error) throw error;

      toast.success('Officer assigned to unit successfully');
      setShowAssignDialog(false);
      setSelectedOfficerId('');
      setOfficerRole('officer');
      setIsLead(false);
      fetchUnits();
    } catch (error) {
      console.error('Error assigning officer:', error);
      toast.error('Failed to assign officer to unit');
    }
  };

  const removeOfficer = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_unit_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Officer removed from unit');
      fetchUnits();
    } catch (error) {
      console.error('Error removing officer:', error);
      toast.error('Failed to remove officer from unit');
    }
  };

  const updateUnitStatus = async (unitId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('emergency_units')
        .update({ status: newStatus })
        .eq('id', unitId);

      if (error) throw error;

      toast.success('Unit status updated');
      fetchUnits();
    } catch (error) {
      console.error('Error updating unit status:', error);
      toast.error('Failed to update unit status');
    }
  };

  const openEditDialog = (unit: EmergencyUnit) => {
    setSelectedUnit(unit);
    setUnitForm({
      unit_name: unit.unit_name,
      unit_code: unit.unit_code,
      unit_type: unit.unit_type,
      coverage_region: unit.coverage_region || '',
      coverage_city: unit.coverage_city || '',
      vehicle_id: unit.vehicle_id || '',
      radio_frequency: unit.radio_frequency || ''
    });
    setShowEditDialog(true);
  };

  const openAssignDialog = (unit: EmergencyUnit) => {
    setSelectedUnit(unit);
    setShowAssignDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-gray-500';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Police Unit Management</h2>
          <p className="text-muted-foreground">Manage police patrol units, rapid response teams, and specialized units</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Police Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Police Unit</DialogTitle>
              <DialogDescription>Create a new police unit (patrol, rapid response, traffic, investigation)</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_name">Unit Name</Label>
                <Input
                  id="unit_name"
                  value={unitForm.unit_name}
                  onChange={(e) => setUnitForm({ ...unitForm, unit_name: e.target.value })}
                  placeholder="Alpha Unit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_code">Unit Code</Label>
                <Input
                  id="unit_code"
                  value={unitForm.unit_code}
                  onChange={(e) => setUnitForm({ ...unitForm, unit_code: e.target.value })}
                  placeholder="UNIT-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_type">Police Unit Type</Label>
                <Select value={unitForm.unit_type} onValueChange={(value) => setUnitForm({ ...unitForm, unit_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patrol">Patrol Unit</SelectItem>
                    <SelectItem value="rapid_response">Rapid Response Team</SelectItem>
                    <SelectItem value="traffic">Traffic Enforcement</SelectItem>
                    <SelectItem value="investigation">Investigation Unit</SelectItem>
                    <SelectItem value="k9">K-9 Unit</SelectItem>
                    <SelectItem value="swat">SWAT Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverage_region">Coverage Region</Label>
                <Select 
                  value={unitForm.coverage_region} 
                  onValueChange={(value) => {
                    setUnitForm({ 
                      ...unitForm, 
                      coverage_region: value,
                      coverage_city: '' // Reset city when region changes
                    });
                  }}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="Annobón">Annobón</SelectItem>
                    <SelectItem value="Bioko Norte">Bioko Norte</SelectItem>
                    <SelectItem value="Bioko Sur">Bioko Sur</SelectItem>
                    <SelectItem value="Centro Sur">Centro Sur</SelectItem>
                    <SelectItem value="Djibloho">Djibloho</SelectItem>
                    <SelectItem value="Kié-Ntem">Kié-Ntem</SelectItem>
                    <SelectItem value="Litoral">Litoral</SelectItem>
                    <SelectItem value="Wele-Nzas">Wele-Nzas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverage_city">Coverage City</Label>
                <Select 
                  value={unitForm.coverage_city} 
                  onValueChange={(value) => setUnitForm({ ...unitForm, coverage_city: value })}
                  disabled={!unitForm.coverage_region}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue 
                      placeholder={
                        unitForm.coverage_region 
                          ? "Select city" 
                          : "Select region first"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {getAvailableCities(unitForm.coverage_region).map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_id">Vehicle ID</Label>
                <Input
                  id="vehicle_id"
                  value={unitForm.vehicle_id}
                  onChange={(e) => setUnitForm({ ...unitForm, vehicle_id: e.target.value })}
                  placeholder="POL-001"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="radio_frequency">Radio Frequency</Label>
                <Input
                  id="radio_frequency"
                  value={unitForm.radio_frequency}
                  onChange={(e) => setUnitForm({ ...unitForm, radio_frequency: e.target.value })}
                  placeholder="154.920 MHz"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={createUnit}>Create Unit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {units.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Radio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Police Units Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first police unit to start managing your emergency response teams.
              </p>
              <p className="text-sm text-muted-foreground">
                Once you create units, you'll be able to edit, delete, and assign officers to them.
              </p>
            </CardContent>
          </Card>
        ) : (
          units.map((unit) => (
          <Card key={unit.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(unit.status)}`} />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="h-5 w-5" />
                      {unit.unit_name} ({unit.unit_code})
                    </CardTitle>
                    <CardDescription>
                      {unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1)} Unit • 
                      {unit.coverage_city}, {unit.coverage_region}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={unit.status} onValueChange={(value) => updateUnitStatus(unit.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => openAssignDialog(unit)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(unit)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedUnit(unit);
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{unit.current_location || 'No location'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{unit.radio_frequency || 'No frequency'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{unit.vehicle_id || 'No vehicle'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{unit.members?.length || 0} members</span>
                </div>
              </div>

              {unit.members && unit.members.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Unit Members</h4>
                  <div className="space-y-2">
                    {unit.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.profile?.full_name}</span>
                            <Badge variant={member.is_lead ? "default" : "secondary"}>
                              {member.role}
                              {member.is_lead && " (Lead)"}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{member.profile?.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOfficer(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Police Unit</DialogTitle>
            <DialogDescription>Update police unit information and settings</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_unit_name">Unit Name</Label>
              <Input
                id="edit_unit_name"
                value={unitForm.unit_name}
                onChange={(e) => setUnitForm({ ...unitForm, unit_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_unit_code">Unit Code</Label>
              <Input
                id="edit_unit_code"
                value={unitForm.unit_code}
                onChange={(e) => setUnitForm({ ...unitForm, unit_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_unit_type">Police Unit Type</Label>
              <Select value={unitForm.unit_type} onValueChange={(value) => setUnitForm({ ...unitForm, unit_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patrol">Patrol Unit</SelectItem>
                  <SelectItem value="rapid_response">Rapid Response Team</SelectItem>
                  <SelectItem value="traffic">Traffic Enforcement</SelectItem>
                  <SelectItem value="investigation">Investigation Unit</SelectItem>
                  <SelectItem value="k9">K-9 Unit</SelectItem>
                  <SelectItem value="swat">SWAT Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_coverage_region">Coverage Region</Label>
              <Select 
                value={unitForm.coverage_region} 
                onValueChange={(value) => {
                  setUnitForm({ 
                    ...unitForm, 
                    coverage_region: value,
                    coverage_city: '' // Reset city when region changes
                  });
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="Annobón">Annobón</SelectItem>
                  <SelectItem value="Bioko Norte">Bioko Norte</SelectItem>
                  <SelectItem value="Bioko Sur">Bioko Sur</SelectItem>
                  <SelectItem value="Centro Sur">Centro Sur</SelectItem>
                  <SelectItem value="Djibloho">Djibloho</SelectItem>
                  <SelectItem value="Kié-Ntem">Kié-Ntem</SelectItem>
                  <SelectItem value="Litoral">Litoral</SelectItem>
                  <SelectItem value="Wele-Nzas">Wele-Nzas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_coverage_city">Coverage City</Label>
              <Select 
                value={unitForm.coverage_city} 
                onValueChange={(value) => setUnitForm({ ...unitForm, coverage_city: value })}
                disabled={!unitForm.coverage_region}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue 
                    placeholder={
                      unitForm.coverage_region 
                        ? "Select city" 
                        : "Select region first"
                    } 
                  />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {getAvailableCities(unitForm.coverage_region).map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_vehicle_id">Vehicle ID</Label>
              <Input
                id="edit_vehicle_id"
                value={unitForm.vehicle_id}
                onChange={(e) => setUnitForm({ ...unitForm, vehicle_id: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit_radio_frequency">Radio Frequency</Label>
              <Input
                id="edit_radio_frequency"
                value={unitForm.radio_frequency}
                onChange={(e) => setUnitForm({ ...unitForm, radio_frequency: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={updateUnit}>Update Unit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Officer Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Officer to Unit</DialogTitle>
            <DialogDescription>Assign an officer to {selectedUnit?.unit_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="officer_select">Select Officer</Label>
              <Select value={selectedOfficerId} onValueChange={setSelectedOfficerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an officer..." />
                </SelectTrigger>
                <SelectContent>
                  {officers.filter(officer => 
                    !selectedUnit?.members?.some(member => member.officer_id === officer.user_id)
                  ).map(officer => (
                    <SelectItem key={officer.user_id} value={officer.user_id}>
                      {officer.full_name} ({officer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role_select">Role</Label>
              <Select value={officerRole} onValueChange={setOfficerRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {memberRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_lead"
                checked={isLead}
                onChange={(e) => setIsLead(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_lead">Unit Leader</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={assignOfficer} disabled={!selectedOfficerId}>Assign Officer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Police Unit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete police unit "{selectedUnit?.unit_name}"? This action cannot be undone.
              All unit members will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUnit} className="bg-destructive hover:bg-destructive/90">
              Delete Unit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UnitManagement;