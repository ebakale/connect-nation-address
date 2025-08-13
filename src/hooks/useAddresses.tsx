import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
  const searchAddresses = async (query: string): Promise<Partial<Address>[]> => {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .rpc('search_addresses_safely', { search_query: query });

      if (error) throw error;
      
      // The function returns a subset of Address fields, so we return them as partial
      return (data || []).map((item: any) => ({
        uac: item.uac,
        country: item.country,
        region: item.region,
        city: item.city,
        street: item.street,
        building: item.building,
        latitude: item.latitude,
        longitude: item.longitude,
        address_type: item.address_type,
        description: item.description,
        verified: item.verified,
        public: item.public,
        created_at: item.created_at,
        // Add default values for required fields not returned by the search function
        id: '', // Not exposed in search for security
        user_id: '', // Not exposed in search for security  
        updated_at: item.created_at, // Use created_at as fallback
      }));
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
      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', user.id);

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
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

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
    if (user) {
      fetchAddresses();
    }
  }, [user]);

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