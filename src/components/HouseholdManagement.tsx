import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Home, Plus, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePerson } from '@/hooks/useCAR';
import { useTranslation } from 'react-i18next';

export function HouseholdManagement() {
  const { t } = useTranslation(['common', 'address', 'car']);
  const { toast } = useToast();
  const { person, loading: personLoading } = usePerson();
  const [activeTab, setActiveTab] = useState('my-households');
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
    dependent_type: 'MINOR',
    dependency_reason: '',
    expected_dependency_end_date: '',
    disability_certificate_number: '',
    student_enrollment_number: '',
    university_name: '',
    health_card_number: '',
    school_id_number: '',
    notes: '',
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
          dependent_type: dependentForm.dependent_type as "MINOR" | "ADULT_STUDENT" | "ADULT_DISABLED" | "ELDERLY_PARENT" | "OTHER_ADULT",
          dependency_reason: dependentForm.dependency_reason || null,
          expected_dependency_end_date: dependentForm.expected_dependency_end_date || null,
          disability_certificate_number: dependentForm.disability_certificate_number || null,
          student_enrollment_number: dependentForm.student_enrollment_number || null,
          university_name: dependentForm.university_name || null,
          health_card_number: dependentForm.health_card_number || null,
          school_id_number: dependentForm.school_id_number || null,
          notes: dependentForm.notes || null,
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
        dependent_type: 'MINOR',
        dependency_reason: '',
        expected_dependency_end_date: '',
        disability_certificate_number: '',
        student_enrollment_number: '',
        university_name: '',
        health_card_number: '',
        school_id_number: '',
        notes: '',
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
          dependent_type: dependentForm.dependent_type as "MINOR" | "ADULT_STUDENT" | "ADULT_DISABLED" | "ELDERLY_PARENT" | "OTHER_ADULT",
          dependency_reason: dependentForm.dependency_reason || null,
          expected_dependency_end_date: dependentForm.expected_dependency_end_date || null,
          disability_certificate_number: dependentForm.disability_certificate_number || null,
          student_enrollment_number: dependentForm.student_enrollment_number || null,
          university_name: dependentForm.university_name || null,
          health_card_number: dependentForm.health_card_number || null,
          school_id_number: dependentForm.school_id_number || null,
          notes: dependentForm.notes || null,
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
          is_primary_household: false,
          membership_status: 'ACTIVE',
          household_role: 'DEPENDENT',
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
      await fetchHouseholds();
      
      // Switch to My Households tab to show the new household
      setActiveTab('my-households');
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-households">
            <Home className="h-4 w-4 mr-2" />
            {t('address:myHouseholds')}
          </TabsTrigger>
          <TabsTrigger value="create-household">
            <Plus className="h-4 w-4 mr-2" />
            {t('address:createHousehold')}
          </TabsTrigger>
          <TabsTrigger value="manage-dependents">
            <Users className="h-4 w-4 mr-2" />
            {t('address:manageDependents')}
          </TabsTrigger>
        </TabsList>

        {/* My Households Tab */}
        <TabsContent value="my-households" className="space-y-4 mt-6">
          {households.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {t('address:noHouseholds')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {households.map((household) => (
                <Card key={household.id}>
                  <CardContent className="pt-6">
                    <div className="p-4 border rounded-lg space-y-3">
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
                            {t('common:buttons.edit')}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Create Household Tab */}
        <TabsContent value="create-household" className="mt-6">
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
        </TabsContent>

        {/* Manage Dependents Tab */}
        <TabsContent value="manage-dependents" className="mt-6">
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
                          <Badge variant="outline">{t(`car:dependents.dependentTypes.${dependent.dependent_type}`)}</Badge>
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
                                dependent_type: dependent.dependent_type || 'MINOR',
                                dependency_reason: dependent.dependency_reason || '',
                                expected_dependency_end_date: dependent.expected_dependency_end_date || '',
                                disability_certificate_number: dependent.disability_certificate_number || '',
                                student_enrollment_number: dependent.student_enrollment_number || '',
                                university_name: dependent.university_name || '',
                                health_card_number: dependent.health_card_number || '',
                                school_id_number: dependent.school_id_number || '',
                                notes: dependent.notes || '',
                              });
                              setIsEditDependentDialogOpen(true);
                            }}
                          >
                            {t('common:buttons.edit')}
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
                        <Label htmlFor="fullName">{t('car:dependents.form.fullName')}</Label>
                        <Input
                          id="fullName"
                          value={dependentForm.full_name}
                          onChange={(e) => setDependentForm({...dependentForm, full_name: e.target.value})}
                          placeholder={t('car:dependents.form.fullNamePlaceholder')}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">{t('car:dependents.form.dateOfBirth')}</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={dependentForm.date_of_birth}
                          onChange={(e) => setDependentForm({...dependentForm, date_of_birth: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dependentType">{t('car:dependents.form.dependentType')}</Label>
                        <Select value={dependentForm.dependent_type} onValueChange={(value) => setDependentForm({...dependentForm, dependent_type: value})} required>
                          <SelectTrigger>
                            <SelectValue placeholder={t('car:dependents.form.selectDependentType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MINOR">{t('car:dependents.dependentTypes.MINOR')}</SelectItem>
                            <SelectItem value="ADULT_STUDENT">{t('car:dependents.dependentTypes.ADULT_STUDENT')}</SelectItem>
                            <SelectItem value="ADULT_DISABLED">{t('car:dependents.dependentTypes.ADULT_DISABLED')}</SelectItem>
                            <SelectItem value="ELDERLY_PARENT">{t('car:dependents.dependentTypes.ELDERLY_PARENT')}</SelectItem>
                            <SelectItem value="OTHER_ADULT">{t('car:dependents.dependentTypes.OTHER_ADULT')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {['ADULT_STUDENT', 'ADULT_DISABLED', 'ELDERLY_PARENT', 'OTHER_ADULT'].includes(dependentForm.dependent_type) && (
                        <div className="space-y-2">
                          <Label htmlFor="dependencyReason">{t('car:dependents.form.dependencyReason')}</Label>
                          <Textarea
                            id="dependencyReason"
                            value={dependentForm.dependency_reason}
                            onChange={(e) => setDependentForm({...dependentForm, dependency_reason: e.target.value})}
                            placeholder={t('car:dependents.form.dependencyReasonPlaceholder')}
                            required
                          />
                          <p className="text-xs text-muted-foreground">{t('car:dependents.form.dependencyReasonRequired')}</p>
                        </div>
                      )}

                      {dependentForm.dependent_type === 'ADULT_STUDENT' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="expectedEndDate">{t('car:dependents.form.expectedEndDate')}</Label>
                            <Input
                              id="expectedEndDate"
                              type="date"
                              value={dependentForm.expected_dependency_end_date}
                              onChange={(e) => setDependentForm({...dependentForm, expected_dependency_end_date: e.target.value})}
                              required
                            />
                            <p className="text-xs text-muted-foreground">{t('car:dependents.form.expectedEndDateHelper')}</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="studentEnrollment">{t('car:dependents.form.studentEnrollment')}</Label>
                            <Input
                              id="studentEnrollment"
                              value={dependentForm.student_enrollment_number}
                              onChange={(e) => setDependentForm({...dependentForm, student_enrollment_number: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="universityName">{t('car:dependents.form.universityName')}</Label>
                            <Input
                              id="universityName"
                              value={dependentForm.university_name}
                              onChange={(e) => setDependentForm({...dependentForm, university_name: e.target.value})}
                            />
                          </div>
                        </>
                      )}

                      {dependentForm.dependent_type === 'ADULT_DISABLED' && (
                        <div className="space-y-2">
                          <Label htmlFor="disabilityCertificate">{t('car:dependents.form.disabilityCertificate')}</Label>
                          <Input
                            id="disabilityCertificate"
                            value={dependentForm.disability_certificate_number}
                            onChange={(e) => setDependentForm({...dependentForm, disability_certificate_number: e.target.value})}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="relationship">{t('car:dependents.form.relationship')}</Label>
                        <Select value={dependentForm.relationship_to_guardian} onValueChange={(value) => setDependentForm({...dependentForm, relationship_to_guardian: value})} required>
                          <SelectTrigger>
                            <SelectValue placeholder={t('car:dependents.form.selectRelationship')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CHILD">{t('car:dependents.relationships.CHILD')}</SelectItem>
                            <SelectItem value="ADOPTED_CHILD">{t('car:dependents.relationships.ADOPTED_CHILD')}</SelectItem>
                            <SelectItem value="STEPCHILD">{t('car:dependents.relationships.STEPCHILD')}</SelectItem>
                            <SelectItem value="WARD">{t('car:dependents.relationships.WARD')}</SelectItem>
                            <SelectItem value="GRANDCHILD">{t('car:dependents.relationships.GRANDCHILD')}</SelectItem>
                            <SelectItem value="NIECE_NEPHEW">{t('car:dependents.relationships.NIECE_NEPHEW')}</SelectItem>
                            <SelectItem value="OTHER_RELATIVE">{t('car:dependents.relationships.OTHER_RELATIVE')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">{t('car:dependents.form.gender')}</Label>
                        <Select value={dependentForm.gender} onValueChange={(value) => setDependentForm({...dependentForm, gender: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('car:dependents.form.selectGender')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{t('car:dependents.form.genderOptions.male')}</SelectItem>
                            <SelectItem value="female">{t('car:dependents.form.genderOptions.female')}</SelectItem>
                            <SelectItem value="other">{t('car:dependents.form.genderOptions.other')}</SelectItem>
                            <SelectItem value="prefer_not_to_say">{t('car:dependents.form.genderOptions.prefer_not_to_say')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birthCertificate">{t('car:dependents.form.birthCertificate')}</Label>
                        <Input
                          id="birthCertificate"
                          value={dependentForm.birth_certificate_number}
                          onChange={(e) => setDependentForm({...dependentForm, birth_certificate_number: e.target.value})}
                          placeholder={t('car:dependents.form.birthCertificatePlaceholder')}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isCreatingDependent}>
                        {isCreatingDependent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('car:dependents.register')}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              {t('common:buttons.save')}
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
              {t('common:buttons.save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

