import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from '@/hooks/use-toast';

export interface Address {
  id: string;
  uac: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  latitude: number;
  longitude: number;
  address_type: string;
  description?: string;
  verified: boolean;
  public: boolean;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  created_by_authority?: string;
  authority_type?: string;
  creation_source?: string;
}

export interface CreateAddressData {
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  latitude: number;
  longitude: number;
  address_type: string;
  description?: string;
  public?: boolean;
  photo?: File;
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { hasAdminAccess, hasVerifierAccess } = useUserRole();
  const { toast } = useToast();

  const fetchAddresses = async () => {
    if (!hasVerifierAccess && !hasAdminAccess) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('id, uac, country, region, city, street, building, latitude, longitude, address_type, description, verified, public, photo_url, created_at, updated_at, created_by_authority, authority_type, creation_source')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data as Address[] || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch addresses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async (addressData: CreateAddressData): Promise<boolean> => {
    if (!hasVerifierAccess && !hasAdminAccess) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to create addresses directly. Please submit an address request.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // For NAR addresses, they are created through the approval process
      // This is for direct NAR authority creation
      const { error } = await supabase.functions.invoke('request_nar_address_creation', {
        body: addressData
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Address creation request submitted',
      });

      await fetchAddresses();
      return true;
    } catch (error) {
      console.error('Error creating address:', error);
      toast({
        title: 'Error',
        description: 'Failed to create address',
        variant: 'destructive',
      });
      return false;
    }
  };

  const searchAddresses = async (query: string) => {
    try {
      const { data, error } = await supabase
        .rpc('search_addresses_safely', { search_query: query });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching addresses:', error);
      return [];
    }
  };

  const updateAddressStatus = async (addressId: string, updates: { verified?: boolean; public?: boolean }) => {
    if (!hasVerifierAccess) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to update addresses',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Address updated successfully',
      });

      await fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      toast({
        title: 'Error',
        description: 'Failed to update address',
        variant: 'destructive',
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!hasVerifierAccess) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to delete addresses',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });

      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user && (hasVerifierAccess || hasAdminAccess)) {
      fetchAddresses();
    }
  }, [user, hasVerifierAccess, hasAdminAccess]);

  return {
    addresses,
    loading,
    createAddress,
    searchAddresses,
    updateAddressStatus,
    deleteAddress,
    fetchAddresses
  };
};