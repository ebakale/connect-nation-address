import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecentSearch {
  id: string;
  user_id: string;
  search_query: string;
  search_type: string;
  results_count: number;
  searched_at: string;
  metadata: any;
}

export interface SearchInput {
  search_query: string;
  search_type?: string;
  results_count?: number;
  metadata?: any;
}

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load recent searches
  const loadRecentSearches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recent_searches')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(50); // Limit to last 50 searches

      if (error) throw error;
      setRecentSearches(data || []);
    } catch (error: any) {
      console.error('Error loading recent searches:', error);
      toast({
        title: "Error",
        description: "Failed to load recent searches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new search to history
  const addSearch = async (searchData: SearchInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Don't track if user not authenticated

      // Check if this exact search already exists recently (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: existingSearch } = await supabase
        .from('recent_searches')
        .select('id')
        .eq('user_id', user.id)
        .eq('search_query', searchData.search_query.trim())
        .eq('search_type', searchData.search_type || 'address')
        .gte('searched_at', oneHourAgo)
        .maybeSingle();

      // If search already exists recently, don't add duplicate
      if (existingSearch) {
        return;
      }

      const { data, error } = await supabase
        .from('recent_searches')
        .insert({
          user_id: user.id,
          search_query: searchData.search_query.trim(),
          search_type: searchData.search_type || 'address',
          results_count: searchData.results_count || 0,
          metadata: searchData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Add to the beginning of the list
      setRecentSearches(prev => [data, ...prev.slice(0, 49)]); // Keep only 50 most recent
    } catch (error: any) {
      console.error('Error adding search to history:', error);
      // Don't show toast error for search tracking to avoid disrupting UX
    }
  };

  // Delete a specific search
  const deleteSearch = async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('recent_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;

      setRecentSearches(prev => prev.filter(search => search.id !== searchId));
      toast({
        title: "Search removed",
        description: "Search has been removed from your history",
      });
    } catch (error: any) {
      console.error('Error deleting search:', error);
      toast({
        title: "Error",
        description: "Failed to remove search from history",
        variant: "destructive",
      });
    }
  };

  // Clear all recent searches
  const clearAllSearches = async () => {
    try {
      const { error } = await supabase
        .from('recent_searches')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      setRecentSearches([]);
      toast({
        title: "Search history cleared",
        description: "All recent searches have been removed",
      });
    } catch (error: any) {
      console.error('Error clearing search history:', error);
      toast({
        title: "Error",
        description: "Failed to clear search history",
        variant: "destructive",
      });
    }
  };

  // Get unique recent search queries (for autocomplete/suggestions)
  const getUniqueQueries = () => {
    const uniqueQueries = Array.from(
      new Set(recentSearches.map(search => search.search_query))
    );
    return uniqueQueries.slice(0, 10); // Return top 10 unique queries
  };

  useEffect(() => {
    loadRecentSearches();
  }, []);

  return {
    recentSearches,
    loading,
    addSearch,
    deleteSearch,
    clearAllSearches,
    getUniqueQueries,
    refreshRecentSearches: loadRecentSearches
  };
};