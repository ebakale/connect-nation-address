import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Home, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import type { HouseholdGroup, HouseholdMember, CitizenAddress } from '@/types/car';

interface HouseholdAddressSyncProps {
  household: HouseholdGroup;
  members: HouseholdMember[];
  onSync: () => void;
}

export function HouseholdAddressSync({ household, members, onSync }: HouseholdAddressSyncProps) {
  const { t } = useTranslation(['car', 'common']);
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, boolean>>({});
  const [memberAddresses, setMemberAddresses] = useState<Record<string, CitizenAddress[]>>({});

  useEffect(() => {
    fetchMemberAddresses();
  }, [members]);

  const fetchMemberAddresses = async () => {
    const addressMap: Record<string, CitizenAddress[]> = {};

    for (const member of members) {
      if (member.person_id) {
        const { data, error } = await supabase
          .from('citizen_address')
          .select('*')
          .eq('person_id', member.person_id)
          .eq('address_kind', 'PRIMARY')
          .is('effective_to', null);

        if (!error && data) {
          addressMap[member.id] = data;
        }
      } else if (member.dependent_id) {
        const { data, error } = await supabase
          .from('citizen_address')
          .select('*')
          .eq('dependent_id', member.dependent_id)
          .eq('address_kind', 'PRIMARY')
          .is('effective_to', null);

        if (!error && data) {
          addressMap[member.id] = data;
        }
      }
    }

    setMemberAddresses(addressMap);
    checkSyncStatus(addressMap);
  };

  const checkSyncStatus = (addressMap: Record<string, CitizenAddress[]>) => {
    const status: Record<string, boolean> = {};

    members.forEach(member => {
      const addresses = addressMap[member.id] || [];
      const primaryAddress = addresses.find(a => a.address_kind === 'PRIMARY' && !a.effective_to);

      if (primaryAddress) {
        const isSynced = 
          primaryAddress.uac === household.primary_uac &&
          (household.primary_unit_uac ? primaryAddress.unit_uac === household.primary_unit_uac : true);
        status[member.id] = isSynced;
      } else {
        status[member.id] = false;
      }
    });

    setSyncStatus(status);
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      for (const member of members) {
        if (!syncStatus[member.id]) {
          await syncMemberAddress(member);
        }
      }

      toast({
        title: t('common:success'),
        description: t('car:household.addresses.syncedFromHousehold'),
      });

      await fetchMemberAddresses();
      onSync();
    } catch (error: any) {
      console.error('Error syncing addresses:', error);
      toast({
        title: t('common:error'),
        description: error.message || 'Failed to sync addresses',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const syncMemberAddress = async (member: HouseholdMember) => {
    if (member.person_id) {
      // Sync adult member's address
      const { error } = await supabase.rpc('set_primary_address', {
        p_person_id: member.person_id,
        p_scope: household.primary_unit_uac ? 'UNIT' : 'BUILDING',
        p_uac: household.primary_uac,
        p_unit_uac: household.primary_unit_uac || null,
        p_effective_from: new Date().toISOString().split('T')[0],
        p_source: 'HOUSEHOLD_SYNC'
      });

      if (error) throw error;
    } else if (member.dependent_id) {
      // Sync dependent's address
      const { data: guardianPerson } = await supabase
        .from('household_dependents')
        .select('guardian_person_id')
        .eq('id', member.dependent_id)
        .single();

      if (guardianPerson) {
        // Close current primary address
        const { data: currentAddresses } = await supabase
          .from('citizen_address')
          .select('*')
          .eq('dependent_id', member.dependent_id)
          .eq('address_kind', 'PRIMARY')
          .is('effective_to', null);

        if (currentAddresses && currentAddresses.length > 0) {
          await supabase
            .from('citizen_address')
            .update({ effective_to: new Date().toISOString().split('T')[0] })
            .eq('id', currentAddresses[0].id);
        }

        // Create new primary address
        const { error } = await supabase
          .from('citizen_address')
          .insert({
            dependent_id: member.dependent_id,
            declared_by_guardian: true,
            guardian_person_id: guardianPerson.guardian_person_id,
            household_group_id: household.id,
            address_kind: 'PRIMARY',
            scope: household.primary_unit_uac ? 'UNIT' : 'BUILDING',
            uac: household.primary_uac,
            unit_uac: household.primary_unit_uac || null,
            source: 'HOUSEHOLD_SYNC',
            effective_from: new Date().toISOString().split('T')[0]
          });

        if (error) throw error;
      }
    }
  };

  const outOfSyncCount = Object.values(syncStatus).filter(synced => !synced).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Address Synchronization
        </CardTitle>
        <CardDescription>
          Ensure all household members have addresses synchronized with the household primary address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Household Address */}
          <div className="p-4 border rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-primary" />
              <p className="font-medium">Household Primary Address</p>
            </div>
            <p className="font-mono text-sm">{household.primary_uac}</p>
            {household.primary_unit_uac && (
              <p className="font-mono text-sm text-muted-foreground">
                Unit: {household.primary_unit_uac}
              </p>
            )}
          </div>

          {/* Sync Status */}
          {outOfSyncCount > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {outOfSyncCount} member(s) have addresses that don't match the household address
              </AlertDescription>
            </Alert>
          )}

          {/* Member List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Member Sync Status</p>
            {members.map((member) => {
              const addresses = memberAddresses[member.id] || [];
              const primaryAddress = addresses.find(a => a.address_kind === 'PRIMARY');
              const isSynced = syncStatus[member.id];

              return (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {member.dependent_id ? 'Dependent' : 'Adult Member'}
                    </p>
                    {primaryAddress ? (
                      <p className="text-xs text-muted-foreground font-mono">
                        {primaryAddress.uac}
                        {primaryAddress.unit_uac && ` - Unit: ${primaryAddress.unit_uac}`}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">No primary address</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isSynced ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Synced
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Out of Sync
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sync Action */}
          {outOfSyncCount > 0 && (
            <Button onClick={handleSyncAll} disabled={syncing} className="w-full">
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync All Member Addresses
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
