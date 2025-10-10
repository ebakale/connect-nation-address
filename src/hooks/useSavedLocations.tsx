import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address_components: any;
  uac?: string;
  tags: string[];
  contact_name?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedLocationInput {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address_components?: any;
  uac?: string;
  tags?: string[];
  contact_name?: string;
  contact_phone?: string;
}

export const useSavedLocations = () => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load saved locations
  const loadSavedLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedLocations(data || []);
    } catch (error: any) {
      console.error('Error loading saved locations:', error);
      toast({
        title: "Error",
        description: "Failed to load saved locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new saved location
  const addSavedLocation = async (locationData: SavedLocationInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_locations')
        .insert({
          ...locationData,
          user_id: user.id,
          address_components: locationData.address_components || {},
          tags: locationData.tags || []
        })
        .select()
        .single();

      if (error) throw error;

      setSavedLocations(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Location saved successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: "Failed to save location",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update saved location
  const updateSavedLocation = async (id: string, updates: Partial<SavedLocationInput>) => {
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSavedLocations(prev => 
        prev.map(location => location.id === id ? data : location)
      );
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete saved location
  const deleteSavedLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedLocations(prev => prev.filter(location => location.id !== id));
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    }
  };

  // Get location by coordinates (for checking if already saved)
  const isLocationSaved = (latitude: number, longitude: number, tolerance = 0.0001) => {
    return savedLocations.some(location => 
      Math.abs(location.latitude - latitude) < tolerance &&
      Math.abs(location.longitude - longitude) < tolerance
    );
  };

  useEffect(() => {
    loadSavedLocations();
  }, []);

  return {
    savedLocations,
    loading,
    addSavedLocation,
    updateSavedLocation,
    deleteSavedLocation,
    isLocationSaved,
    refreshSavedLocations: loadSavedLocations
  };
};