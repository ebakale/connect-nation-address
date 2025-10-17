import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
    } catch (error) {
      console.error('Error fetching households:', error);
    } finally {
      setLoadingHouseholds(false);
    }
  };

  useEffect(() => {
    if (person?.id) {
      fetchHouseholds();
    }
  }, [person?.id]);

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
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
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
                          Unit: {household.primary_unit_uac}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('address:addMember')}
                  </Button>
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
    </div>
  );
}

