import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from '@/hooks/use-toast';

export interface Address {
  id: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
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
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { hasAdminAccess } = useUserRole();
  const { toast } = useToast();

  // Generate a unique address code
  const generateUAC = (country: string, region: string, city: string): string => {
    const countryCode = country.substring(0, 2).toUpperCase();
    const regionCode = region.substring(0, 2).toUpperCase();
    const cityCode = city.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${countryCode}-${regionCode}-${cityCode}-${timestamp}${random}`.toUpperCase();
  };

  // Fetch user's addresses
  const fetchAddresses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is not admin, only fetch their own addresses
      if (!hasAdminAccess) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new address
  const createAddress = async (addressData: CreateAddressData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create addresses",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const uac = generateUAC(addressData.country, addressData.region, addressData.city);
      
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...addressData,
          user_id: user.id,
          uac,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Address registered successfully! UAC: ${uac}`,
      });

      // Refresh the addresses list
      fetchAddresses();
      return data;
    } catch (error: any) {
      console.error('Error creating address:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create address",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search addresses using the secure function
  const searchAddresses = async (query: string): Promise<any[]> => {
    if (!query.trim()) return [];

    try {
      console.log('Searching for:', query);
      console.log('User authenticated:', !!user);
      
      const { data, error } = await supabase
        .rpc('search_addresses_safely', { search_query: query });

      console.log('Search response:', { data, error });

      if (error) throw error;
      
      // Return the raw data from the RPC function
      return data || [];
    } catch (error) {
      console.error('Error searching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to search addresses",
        variant: "destructive",
      });
      return [];
    }
  };

  // Update address verification and public status (admin function)
  const updateAddressStatus = async (addressId: string, updates: { verified?: boolean; public?: boolean }) => {
    if (!user) return;

    try {
      let query = supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressId);

      // If user is not admin, only allow updating their own addresses
      if (!hasAdminAccess) {
        query = query.eq('user_id', user.id);
      }

      const { error } = await query;

      if (error) throw error;

      const statusText = updates.verified !== undefined 
        ? `Address ${updates.verified ? 'verified' : 'unverified'}` 
        : '';
      const publicText = updates.public !== undefined 
        ? `Address made ${updates.public ? 'public' : 'private'}` 
        : '';
      
      toast({
        title: "Success",
        description: [statusText, publicText].filter(Boolean).join(' and ') + ' successfully',
      });

      // Refresh the addresses list
      fetchAddresses();
    } catch (error: any) {
      console.error('Error updating address status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update address status",
        variant: "destructive",
      });
    }
  };

  // Delete an address
  const deleteAddress = async (addressId: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      // If user is not admin, only allow deleting their own addresses
      if (!hasAdminAccess) {
        query = query.eq('user_id', user.id);
      }

      const { error } = await query;

      if (error) throw error;

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });

      // Refresh the addresses list
      fetchAddresses();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Only fetch addresses if user is authenticated and role is loaded
    if (user && hasAdminAccess !== undefined) {
      fetchAddresses();
    }
  }, [user, hasAdminAccess]);

  return {
    addresses,
    loading,
    createAddress,
    searchAddresses,
    updateAddressStatus,
    deleteAddress,
    fetchAddresses,
  };
};