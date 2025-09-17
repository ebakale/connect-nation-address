import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { offlineStorage } from '@/lib/offlineStorage';
import { useOffline } from './useOffline';

export interface SearchPattern {
  id: string;
  query: string;
  searchType: 'address' | 'uac' | 'coordinates' | 'proximity';
  resultCount: number;
  timestamp: string;
  userLocation?: { lat: number; lng: number };
  successful: boolean;
  executionTime: number;
  filters?: Record<string, any>;
  userAgent?: string;
  sessionId: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  avgExecutionTime: number;
  successRate: number;
  popularQueries: { query: string; count: number }[];
  searchTypeDistribution: Record<string, number>;
  timeBasedPatterns: { hour: number; count: number }[];
  locationHotspots: { lat: number; lng: number; count: number }[];
}

export const useSearchAnalytics = () => {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const { isOnline } = useOffline();
  const [sessionId] = useState(() => crypto.randomUUID());

  // Track a search pattern
  const trackSearch = async (pattern: Omit<SearchPattern, 'id' | 'timestamp' | 'sessionId'>) => {
    try {
      const searchPattern: SearchPattern = {
        ...pattern,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId,
        userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
      };

      if (isOnline) {
        // Try to send to backend immediately
        try {
          await supabase.functions.invoke('track-search-pattern', {
            body: { pattern: searchPattern }
          });
        } catch (error) {
          console.log('Failed to send analytics online, storing offline:', error);
          await offlineStorage.set('search_patterns', searchPattern);
        }
      } else {
        // Store offline for later sync
        await offlineStorage.set('search_patterns', searchPattern);
      }
    } catch (error) {
      console.error('Failed to track search pattern:', error);
    }
  };

  // Track search quality feedback
  const trackSearchQuality = async (searchId: string, feedback: {
    helpful: boolean;
    resultAccuracy: number; // 1-5 scale
    comments?: string;
  }) => {
    try {
      const qualityData = {
        searchId,
        ...feedback,
        timestamp: new Date().toISOString(),
        sessionId
      };

      if (isOnline) {
        await supabase.functions.invoke('track-search-quality', {
          body: { quality: qualityData }
        });
      } else {
        await offlineStorage.set('search_quality', qualityData);
      }
    } catch (error) {
      console.error('Failed to track search quality:', error);
    }
  };

  // Get analytics data
  const getAnalytics = async (dateRange: string = '7d') => {
    setLoading(true);
    try {
      if (isOnline) {
        const { data, error } = await supabase.functions.invoke('get-search-analytics', {
          body: { dateRange }
        });
        
        if (error) throw error;
        setAnalytics(data);
      } else {
        // Return cached analytics if available
        const cached = await offlineStorage.getCachedData('search_analytics');
        if (cached) {
          setAnalytics(cached);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync offline patterns when online
  const syncOfflinePatterns = async () => {
    if (!isOnline) return;

    try {
      const offlinePatterns = await offlineStorage.get('search_patterns');
      const offlineQuality = await offlineStorage.get('search_quality');
      
      if (offlinePatterns?.length > 0) {
        await supabase.functions.invoke('sync-search-patterns', {
          body: { patterns: offlinePatterns }
        });
        await offlineStorage.set('search_patterns', []); // Clear synced data
      }

      if (offlineQuality?.length > 0) {
        await supabase.functions.invoke('sync-search-quality', {
          body: { quality: offlineQuality }
        });
        await offlineStorage.set('search_quality', []); // Clear synced data
      }
    } catch (error) {
      console.error('Failed to sync offline analytics:', error);
    }
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncOfflinePatterns();
    }
  }, [isOnline]);

  return {
    analytics,
    loading,
    trackSearch,
    trackSearchQuality,
    getAnalytics,
    syncOfflinePatterns
  };
};