import { useState, useEffect, useCallback } from 'react';
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
  photo_url?: string;
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
  photo?: File;
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { hasAdminAccess, hasVerifierAccess, canVerifyAddresses, canPublishAddresses } = useUserRole();
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
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: false });

      // If user doesn't have staff access, only fetch their own addresses
      if (!hasVerifierAccess) {
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
  }, [user?.id, hasVerifierAccess, toast]);

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
      let photoUrl: string | undefined = undefined;

      // Upload photo if provided
      if (addressData.photo) {
        const fileExt = addressData.photo.name.split('.').pop();
        const fileName = `${user.id}/${uac}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('address-photos')
          .upload(fileName, addressData.photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          throw new Error('Failed to upload photo');
        }

        // Get the public URL for the uploaded photo
        const { data: urlData } = supabase.storage
          .from('address-photos')
          .getPublicUrl(fileName);
        
        photoUrl = urlData.publicUrl;
      }

      // Prepare address data without the photo file
      const { photo, ...addressDataWithoutPhoto } = addressData;
      
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...addressDataWithoutPhoto,
          user_id: user.id,
          uac,
          photo_url: photoUrl,
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

      // Verification updates require verifier access
      if (updates.verified !== undefined && !canVerifyAddresses) {
        toast({
          title: "Error",
          description: "You don't have permission to verify addresses",
          variant: "destructive",
        });
        return;
      }

      // Publishing updates require registrar access  
      if (updates.public !== undefined && !canPublishAddresses) {
        toast({
          title: "Error", 
          description: "You don't have permission to publish addresses",
          variant: "destructive",
        });
        return;
      }

      // If user doesn't have staff access, only allow updating their own addresses
      if (!hasVerifierAccess) {
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

      // If user doesn't have staff access, only allow deleting their own addresses
      if (!hasVerifierAccess) {
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
    if (user && hasVerifierAccess !== undefined) {
      fetchAddresses();
    }
  }, [fetchAddresses, user, hasVerifierAccess]);

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