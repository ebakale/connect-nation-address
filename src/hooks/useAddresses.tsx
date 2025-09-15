import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { useToast } from '@/hooks/use-toast';
import { generateUAC } from '@/lib/uacGenerator';

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

  // UAC generation is now handled by the centralized UAC generator

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
      const uac = await generateUAC(addressData.country, addressData.region, addressData.city);
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

      // Check for duplicates before creating
      const { data: duplicateCheck, error: dupError } = await supabase.rpc('check_address_duplicates', {
        p_latitude: addressData.latitude,
        p_longitude: addressData.longitude,
        p_street: addressData.street,
        p_city: addressData.city,
        p_region: addressData.region,
        p_country: addressData.country
      });

      if (dupError) {
        console.warn('Duplicate check failed:', dupError);
      } else if (duplicateCheck && (duplicateCheck as any).has_duplicates) {
        const duplicateInfo = duplicateCheck as any;
        const coordinateDuplicates = duplicateInfo.coordinate_duplicates?.count || 0;
        const addressDuplicates = duplicateInfo.address_duplicates?.count || 0;
        
        const confirmMessage = `Warning: Potential duplicates found:\n- ${coordinateDuplicates} addresses with similar coordinates\n- ${addressDuplicates} addresses with identical street address\n\nDo you want to create this address anyway?`;
        
        if (!window.confirm(confirmMessage)) {
          toast({
            title: "Creation cancelled",
            description: "Address creation cancelled due to potential duplicates",
            variant: "destructive",
          });
          return null;
        }
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
      const { data, error } = await supabase
        .rpc('search_addresses_safely', { search_query: query });

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