// Custom hooks for Citizen Address Repository (CAR) operations
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { 
  Person, 
  CitizenAddress, 
  AddressInput,
  AddressKind,
  AddressScope,
  AddressStatus,
  HouseholdDependent,
  HouseholdGroup,
  HouseholdMember,
  DependentType,
  CustodyType,
  HouseholdStatus,
  MembershipStatus,
  HouseholdRole
} from '@/types/car';

export const usePerson = () => {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPerson = async () => {
      if (!user) {
        setPerson(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch person record; create one if missing
        const { data, error } = await supabase
          .from('person')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          const { data: inserted, error: insertError } = await supabase
            .from('person')
            .insert({ auth_user_id: user.id })
            .select('*')
            .single();

          if (insertError) throw insertError;
          setPerson(inserted as any);
        } else {
          setPerson(data);
        }
      } catch (error: any) {
        console.error('Error ensuring person record:', error);
        toast({
          title: 'Error',
          description: 'Could not initialize your profile. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [user, toast]);

  return { person, loading };
};

export const useCitizenAddresses = () => {
  const [addresses, setAddresses] = useState<CitizenAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const { person } = usePerson();
  const { toast } = useToast();

  const fetchAddresses = async () => {
    if (!person) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('citizen_address')
        .select('*')
        .eq('person_id', person.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setAddresses(data || []);
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load addresses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [person]);

  const setPrimaryAddress = async (input: AddressInput & { effective_from?: string }) => {
    if (!person) throw new Error('Person not found');

    try {
      const { data, error } = await supabase.rpc('set_primary_address', {
        p_person_id: person.id,
        p_scope: input.scope,
        p_uac: input.uac,
        p_unit_uac: input.unit_uac || null,
        p_effective_from: input.effective_from || new Date().toISOString().split('T')[0],
        p_source: 'SELF_SERVICE'
      });

      if (error) throw error;

      await fetchAddresses();
      
      toast({
        title: 'Success',
        description: 'Primary address updated successfully'
      });

      return data;
    } catch (error: any) {
      console.error('Error setting primary address:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update primary address',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const addSecondaryAddress = async (input: AddressInput) => {
    if (!person) throw new Error('Person not found');

    try {
      const { data, error } = await supabase.rpc('add_secondary_address', {
        p_person_id: person.id,
        p_scope: input.scope,
        p_uac: input.uac,
        p_unit_uac: input.unit_uac || null,
        p_source: 'SELF_SERVICE'
      });

      if (error) throw error;

      await fetchAddresses();
      
      toast({
        title: 'Success',
        description: 'Secondary address added successfully'
      });

      return data;
    } catch (error: any) {
      console.error('Error adding secondary address:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add secondary address',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const retireAddress = async (addressId: string, reason?: string) => {
    try {
      const { error } = await supabase.rpc('retire_address', {
        p_address_id: addressId,
        p_when: new Date().toISOString().split('T')[0],
        p_reason: reason || null
      });

      if (error) throw error;

      await fetchAddresses();
      
      toast({
        title: 'Success',
        description: 'Address retired successfully'
      });
    } catch (error: any) {
      console.error('Error retiring address:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to retire address',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Lookup address by UAC
  const lookupAddressByUAC = async (uac: string) => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('uac', uac)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - address not found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error looking up address:', error);
      return null;
    }
  };

  // Helper functions
  const getCurrentAddresses = () => addresses.filter(addr => !addr.effective_to);
  const getPrimaryAddress = () => getCurrentAddresses().find(addr => addr.address_kind === 'PRIMARY');
  const getSecondaryAddresses = () => getCurrentAddresses().filter(addr => addr.address_kind === 'SECONDARY');
  const getAddressHistory = () => addresses.filter(addr => addr.effective_to);

  return {
    addresses,
    loading,
    refetch: fetchAddresses,
    setPrimaryAddress,
    addSecondaryAddress,
    retireAddress,
    lookupAddressByUAC,
    // Helper getters
    currentAddresses: getCurrentAddresses(),
    primaryAddress: getPrimaryAddress(),
    secondaryAddresses: getSecondaryAddresses(),
    addressHistory: getAddressHistory()
  };
};

// Address events hook for audit trail
export const useAddressEvents = (citizenAddressId?: string) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('citizen_address_event')
        .select('*')
        .order('at', { ascending: false })
        .limit(100);

      if (citizenAddressId) {
        query = query.eq('citizen_address_id', citizenAddressId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching address events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load address events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const logEvent = async (
    personId: string,
    eventType: string,
    payload?: any,
    addressId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('citizen_address_event')
        .insert({
          person_id: personId,
          citizen_address_id: addressId || citizenAddressId,
          event_type: eventType,
          actor_id: (await supabase.auth.getUser()).data.user?.id,
          payload
        });

      if (error) throw error;

      await fetchEvents();
    } catch (error: any) {
      console.error('Error logging address event:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [citizenAddressId]);

  return {
    events,
    loading,
    refetch: fetchEvents,
    logEvent
  };
};

// Admin hooks for verifiers/registrars
export const useAddressReviewQueue = () => {
  const [addresses, setAddresses] = useState<CitizenAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQueue = async (filters?: { 
    status?: AddressStatus;
    kind?: AddressKind;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('citizen_address')
        .select('*, person!inner(*)')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.kind) {
        query = query.eq('address_kind', filters.kind);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAddresses(data || []);
    } catch (error: any) {
      console.error('Error fetching review queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to load review queue',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAddressStatus = async (addressId: string, status: AddressStatus) => {
    try {
      const { error } = await supabase.rpc('set_citizen_address_status', {
        p_address_id: addressId,
        p_status: status
      });

      if (error) throw error;

      await fetchQueue();
      
      toast({
        title: 'Success',
        description: `Address ${status.toLowerCase()} successfully`
      });
    } catch (error: any) {
      console.error('Error updating address status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update address status',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return {
    addresses,
    loading,
    refetch: fetchQueue,
    updateAddressStatus
  };
};

// Household hooks
export const useHouseholdGroups = () => {
  const [households, setHouseholds] = useState<HouseholdGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { person } = usePerson();
  const { toast } = useToast();

  const fetchHouseholds = async () => {
    if (!person) {
      setHouseholds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('household_groups')
        .select('*')
        .eq('household_head_person_id', person.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHouseholds(data || []);
    } catch (error: any) {
      console.error('Error fetching households:', error);
      toast({
        title: 'Error',
        description: 'Failed to load households',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, [person]);

  return {
    households,
    loading,
    refetch: fetchHouseholds
  };
};

export const useHouseholdMembers = (householdId: string) => {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!householdId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          dependent:household_dependents(
            full_name,
            date_of_birth,
            relationship_to_guardian,
            dependent_type
          )
        `)
        .eq('household_group_id', householdId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching household members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load household members',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [householdId]);

  return {
    members,
    loading,
    refetch: fetchMembers
  };
};

export const useDependents = () => {
  const [dependents, setDependents] = useState<HouseholdDependent[]>([]);
  const [loading, setLoading] = useState(true);
  const { person } = usePerson();
  const { toast } = useToast();

  const fetchDependents = async () => {
    if (!person) {
      setDependents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('household_dependents')
        .select('*')
        .eq('guardian_person_id', person.id)
        .eq('is_active', true)
        .order('date_of_birth', { ascending: false });

      if (error) throw error;

      setDependents(data || []);
    } catch (error: any) {
      console.error('Error fetching dependents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dependents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependents();
  }, [person]);

  return {
    dependents,
    loading,
    refetch: fetchDependents
  };
};