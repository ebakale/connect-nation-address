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
  AddressStatus 
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
        const { data, error } = await supabase
          .from('person')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        setPerson(data);
      } catch (error: any) {
        console.error('Error fetching person:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile information',
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

      if (error) throw error;

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
    // Helper getters
    currentAddresses: getCurrentAddresses(),
    primaryAddress: getPrimaryAddress(),
    secondaryAddresses: getSecondaryAddresses(),
    addressHistory: getAddressHistory()
  };
};

// TODO: Add address events functionality later
// export const useAddressEvents = () => { ... };

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