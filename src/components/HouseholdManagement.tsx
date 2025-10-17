import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Home, Plus, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePerson } from '@/hooks/useCAR';
import { useTranslation } from 'react-i18next';

export function HouseholdManagement() {
  const { t } = useTranslation(['common', 'address']);
  const { toast } = useToast();
  const { person, loading: personLoading } = usePerson();
  const [householdName, setHouseholdName] = useState('');
  const [householdDescription, setHouseholdDescription] = useState('');
  const [primaryUac, setPrimaryUac] = useState('');
  const [unitUac, setUnitUac] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [households, setHouseholds] = useState<any[]>([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [dependents, setDependents] = useState<any[]>([]);
  const [selectedDependentId, setSelectedDependentId] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isCreateDependentDialogOpen, setIsCreateDependentDialogOpen] = useState(false);
  const [isCreatingDependent, setIsCreatingDependent] = useState(false);
  const [dependentForm, setDependentForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    relationship_to_guardian: '',
    birth_certificate_number: '',
  });
  const [householdMembers, setHouseholdMembers] = useState<Record<string, any[]>>({});
  const [isEditHouseholdDialogOpen, setIsEditHouseholdDialogOpen] = useState(false);
  const [isEditDependentDialogOpen, setIsEditDependentDialogOpen] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState<any>(null);
  const [editingDependent, setEditingDependent] = useState<any>(null);

  // Fetch user's dependents
  const fetchDependents = async () => {
    if (!person?.id) return;

    try {
      const { data, error } = await supabase
        .from('household_dependents')
        .select('*')
        .eq('guardian_person_id', person.id)
        .eq('is_active', true)
        .eq('claimed_own_account', false);

      if (error) throw error;
      setDependents(data || []);
    } catch (error) {
      console.error('Error fetching dependents:', error);
    }
  };

  // Fetch household members for a specific household
  const fetchHouseholdMembers = async (householdId: string) => {
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          dependent:household_dependents(full_name, relationship_to_guardian),
          person(id)
        `)
        .eq('household_group_id', householdId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching household members:', error);
      return [];
    }
  };

  // Fetch user's households
  const fetchHouseholds = async () => {
    if (!person?.id) return;

    try {
      const { data, error } = await supabase
        .from('household_groups')
        .select('*')
        .eq('household_head_person_id', person.id)
        .eq('is_active', true);

      if (error) throw error;
      setHouseholds(data || []);

      // Fetch members for each household
      if (data && data.length > 0) {
        const membersMap: Record<string, any[]> = {};
        for (const household of data) {
          membersMap[household.id] = await fetchHouseholdMembers(household.id);
        }
        setHouseholdMembers(membersMap);
      }
    } catch (error) {
      console.error('Error fetching households:', error);
    } finally {
      setLoadingHouseholds(false);
    }
  };

  useEffect(() => {
    if (person?.id) {
      fetchHouseholds();
      fetchDependents();
    }
  }, [person?.id]);

  const handleCreateDependent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!person?.id || !person?.auth_user_id) {
      toast({
        title: t('common:error'),
        description: "User information not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingDependent(true);

      const { error } = await supabase
        .from('household_dependents')
        .insert([{
          guardian_person_id: person.id,
          guardian_user_id: person.auth_user_id,
          full_name: dependentForm.full_name,
          date_of_birth: dependentForm.date_of_birth,
          gender: dependentForm.gender || null,
          relationship_to_guardian: dependentForm.relationship_to_guardian as "CHILD" | "GRANDCHILD" | "OTHER_RELATIVE",
          birth_certificate_number: dependentForm.birth_certificate_number || null,
          created_by: person.auth_user_id,
        }]);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: "Dependent created successfully",
      });

      setIsCreateDependentDialogOpen(false);
      setDependentForm({
        full_name: '',
        date_of_birth: '',
        gender: '',
        relationship_to_guardian: '',
        birth_certificate_number: '',
      });
      
      fetchDependents();
    } catch (error: any) {
      console.error('Error creating dependent:', error);
      toast({
        title: t('common:error'),
        description: error.message || "Failed to create dependent",
        variant: "destructive",
      });
    } finally {
      setIsCreatingDependent(false);
    }
  };

  const handleUpdateDependent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDependent) return;

    try {
      const { error } = await supabase
        .from('household_dependents')
        .update({
          full_name: dependentForm.full_name,
          date_of_birth: dependentForm.date_of_birth,
          gender: dependentForm.gender || null,
          relationship_to_guardian: dependentForm.relationship_to_guardian as "CHILD" | "GRANDCHILD" | "OTHER_RELATIVE",
          birth_certificate_number: dependentForm.birth_certificate_number || null,
        })
        .eq('id', editingDependent.id);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: "Dependent updated successfully",
      });

      setIsEditDependentDialogOpen(false);
      setEditingDependent(null);
      fetchDependents();
    } catch (error: any) {
      console.error('Error updating dependent:', error);
      toast({
        title: t('common:error'),
        description: error.message || "Failed to update dependent",
        variant: "destructive",
      });
    }
  };

  const handleUpdateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingHousehold) return;

    try {
      const { error } = await supabase
        .from('household_groups')
        .update({
          household_name: householdName,
          description: householdDescription,
          primary_uac: primaryUac,
          primary_unit_uac: unitUac || null,
        })
        .eq('id', editingHousehold.id);

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: "Household updated successfully",
      });

      setIsEditHouseholdDialogOpen(false);
      setEditingHousehold(null);
      setHouseholdName('');
      setHouseholdDescription('');
      setPrimaryUac('');
      setUnitUac('');
      fetchHouseholds();
    } catch (error: any) {
      console.error('Error updating household:', error);
      toast({
        title: t('common:error'),
        description: error.message || "Failed to update household",
        variant: "destructive",
      });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHouseholdId || !selectedDependentId || !person?.auth_user_id) {
      toast({
        title: t('common:error'),
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingMember(true);

      // Get the dependent's relationship to use it
      const dependent = dependents.find(d => d.id === selectedDependentId);
      if (!dependent) {
        throw new Error("Dependent not found");
      }

      // Map relationship_to_guardian to relationship_to_head
      // Both enums share these values: CHILD, GRANDCHILD, OTHER_RELATIVE
      const relationshipToHead = dependent.relationship_to_guardian;

      const { error } = await supabase
        .from('household_members')
        .insert([{
          household_group_id: selectedHouseholdId,
          dependent_id: selectedDependentId,
          relationship_to_head: relationshipToHead,
          is_primary_resident: false,
          added_by: person.auth_user_id,
        }]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast({
        title: t('common:success'),
        description: "Member added to household successfully",
      });

      setIsAddMemberDialogOpen(false);
      setSelectedDependentId('');
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast({
        title: t('common:error'),
        description: error.message || "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!person?.id || !person?.auth_user_id) {
      toast({
        title: "Error",
        description: "User information not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      const { data, error } = await supabase
        .from('household_groups')
        .insert({
          household_name: householdName,
          description: householdDescription,
          household_head_person_id: person.id,
          household_head_user_id: person.auth_user_id,
          primary_uac: primaryUac,
          primary_unit_uac: unitUac || null,
          created_by: person.auth_user_id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t('common:success'),
        description: "Household created successfully",
      });

      // Reset form
      setHouseholdName('');
      setHouseholdDescription('');
      setPrimaryUac('');
      setUnitUac('');
      
      // Refresh households list
      fetchHouseholds();
    } catch (error: any) {
      console.error('Error creating household:', error);
      toast({
        title: t('common:error'),
        description: error.message || "Failed to create household",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (personLoading || loadingHouseholds) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Manage Dependents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('address:manageDependents')}
          </CardTitle>
          <CardDescription>
            {t('address:manageDependentsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dependents.length > 0 && (
              <div className="space-y-2">
                {dependents.map((dependent) => (
                  <div
                    key={dependent.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{dependent.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(dependent.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{dependent.relationship_to_guardian}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingDependent(dependent);
                          setDependentForm({
                            full_name: dependent.full_name,
                            date_of_birth: dependent.date_of_birth,
                            gender: dependent.gender || '',
                            relationship_to_guardian: dependent.relationship_to_guardian,
                            birth_certificate_number: dependent.birth_certificate_number || '',
                          });
                          setIsEditDependentDialogOpen(true);
                        }}
                      >
                        {t('common:edit')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Dialog open={isCreateDependentDialogOpen} onOpenChange={setIsCreateDependentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('address:createDependent')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('address:createDependent')}</DialogTitle>
                  <DialogDescription>
                    {t('address:createDependentDescription')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDependent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('address:fullName')}</Label>
                    <Input
                      id="fullName"
                      value={dependentForm.full_name}
                      onChange={(e) => setDependentForm({...dependentForm, full_name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t('address:dateOfBirth')}</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dependentForm.date_of_birth}
                      onChange={(e) => setDependentForm({...dependentForm, date_of_birth: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('address:gender')} ({t('common:optional')})</Label>
                    <Select value={dependentForm.gender} onValueChange={(value) => setDependentForm({...dependentForm, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('address:selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship">{t('address:relationshipToGuardian')}</Label>
                    <Select value={dependentForm.relationship_to_guardian} onValueChange={(value) => setDependentForm({...dependentForm, relationship_to_guardian: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t('address:selectRelationship')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHILD">{t('address:relationshipChild')}</SelectItem>
                        <SelectItem value="GRANDCHILD">{t('address:relationshipGrandchild')}</SelectItem>
                        <SelectItem value="OTHER_RELATIVE">{t('address:relationshipOtherRelative')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthCert">{t('address:birthCertificate')} ({t('common:optional')})</Label>
                    <Input
                      id="birthCert"
                      value={dependentForm.birth_certificate_number}
                      onChange={(e) => setDependentForm({...dependentForm, birth_certificate_number: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isCreatingDependent}>
                    {isCreatingDependent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('address:createDependent')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Existing Households */}
      {households.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('address:myHouseholds')}
            </CardTitle>
            <CardDescription>
              {t('address:householdsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {households.map((household) => (
                <div
                  key={household.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{household.household_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {household.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="font-mono">
                          {household.primary_uac}
                        </Badge>
                        {household.primary_unit_uac && (
                          <Badge variant="secondary" className="font-mono">
                            {t('address:unitLabel')}: {household.primary_unit_uac}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingHousehold(household);
                          setHouseholdName(household.household_name);
                          setHouseholdDescription(household.description || '');
                          setPrimaryUac(household.primary_uac);
                          setUnitUac(household.primary_unit_uac || '');
                          setIsEditHouseholdDialogOpen(true);
                        }}
                      >
                        {t('common:edit')}
                      </Button>
                      <Dialog open={isAddMemberDialogOpen && selectedHouseholdId === household.id} onOpenChange={(open) => {
                        setIsAddMemberDialogOpen(open);
                        if (open) setSelectedHouseholdId(household.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            {t('address:addMember')}
                          </Button>
                        </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('address:addMember')}</DialogTitle>
                        <DialogDescription>
                          Add a dependent to this household
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddMember} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dependent">{t('address:selectDependent')}</Label>
                          <Select value={selectedDependentId} onValueChange={setSelectedDependentId} required>
                            <SelectTrigger>
                              <SelectValue placeholder={t('address:selectDependentPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {dependents.map((dependent) => (
                                <SelectItem key={dependent.id} value={dependent.id}>
                                  {dependent.full_name} ({dependent.relationship_to_guardian})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={isAddingMember}>
                          {isAddingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('address:addMember')}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                    </div>
                  </div>

                  {/* Household Members List */}
                  {householdMembers[household.id] && householdMembers[household.id].length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2">{t('address:members')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {householdMembers[household.id].map((member) => (
                          <Badge key={member.id} variant="secondary">
                            {member.dependent?.full_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Household */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('address:createHousehold')}
          </CardTitle>
          <CardDescription>
            {t('address:createHouseholdDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateHousehold} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="householdName">{t('address:householdName')}</Label>
              <Input
                id="householdName"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder={t('address:householdNamePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('common:description')}</Label>
              <Textarea
                id="description"
                value={householdDescription}
                onChange={(e) => setHouseholdDescription(e.target.value)}
                placeholder={t('address:householdDescriptionPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryUac">{t('address:primaryUac')}</Label>
              <Input
                id="primaryUac"
                value={primaryUac}
                onChange={(e) => setPrimaryUac(e.target.value)}
                placeholder={t('address:uacPlaceholder')}
                className="font-mono"
                required
              />
              <p className="text-sm text-muted-foreground">
                {t('address:householdUacDescription')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitUac">{t('address:unitUac')} ({t('common:optional')})</Label>
              <Input
                id="unitUac"
                value={unitUac}
                onChange={(e) => setUnitUac(e.target.value)}
                placeholder={t('address:unitUacPlaceholder')}
                className="font-mono"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Home className="mr-2 h-4 w-4" />
              {t('address:createHousehold')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Edit Household Dialog */}
      <Dialog open={isEditHouseholdDialogOpen} onOpenChange={setIsEditHouseholdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('address:editHousehold')}</DialogTitle>
            <DialogDescription>
              {t('address:editHouseholdDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateHousehold} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editHouseholdName">{t('address:householdName')}</Label>
              <Input
                id="editHouseholdName"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">{t('common:description')}</Label>
              <Textarea
                id="editDescription"
                value={householdDescription}
                onChange={(e) => setHouseholdDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPrimaryUac">{t('address:primaryUac')}</Label>
              <Input
                id="editPrimaryUac"
                value={primaryUac}
                onChange={(e) => setPrimaryUac(e.target.value)}
                className="font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editUnitUac">{t('address:unitUac')} ({t('common:optional')})</Label>
              <Input
                id="editUnitUac"
                value={unitUac}
                onChange={(e) => setUnitUac(e.target.value)}
                className="font-mono"
              />
            </div>

            <Button type="submit" className="w-full">
              {t('common:save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dependent Dialog */}
      <Dialog open={isEditDependentDialogOpen} onOpenChange={setIsEditDependentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('address:editDependent')}</DialogTitle>
            <DialogDescription>
              {t('address:editDependentDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateDependent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">{t('address:fullName')}</Label>
              <Input
                id="editFullName"
                value={dependentForm.full_name}
                onChange={(e) => setDependentForm({...dependentForm, full_name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDateOfBirth">{t('address:dateOfBirth')}</Label>
              <Input
                id="editDateOfBirth"
                type="date"
                value={dependentForm.date_of_birth}
                onChange={(e) => setDependentForm({...dependentForm, date_of_birth: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editGender">{t('address:gender')} ({t('common:optional')})</Label>
              <Select value={dependentForm.gender} onValueChange={(value) => setDependentForm({...dependentForm, gender: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('address:selectGender')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRelationship">{t('address:relationshipToGuardian')}</Label>
              <Select value={dependentForm.relationship_to_guardian} onValueChange={(value) => setDependentForm({...dependentForm, relationship_to_guardian: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder={t('address:selectRelationship')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHILD">{t('address:relationshipChild')}</SelectItem>
                  <SelectItem value="GRANDCHILD">{t('address:relationshipGrandchild')}</SelectItem>
                  <SelectItem value="OTHER_RELATIVE">{t('address:relationshipOtherRelative')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editBirthCert">{t('address:birthCertificate')} ({t('common:optional')})</Label>
              <Input
                id="editBirthCert"
                value={dependentForm.birth_certificate_number}
                onChange={(e) => setDependentForm({...dependentForm, birth_certificate_number: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full">
              {t('common:save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

