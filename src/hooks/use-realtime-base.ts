
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { useSharedState } from './use-shared-state';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeBaseProps {
  tableName: string;
  cacheKey: string;
}

export const useRealtimeBase = <T extends object>({ tableName, cacheKey }: UseRealtimeBaseProps) => {
  const { user } = useAuth();
  const [data, setData] = useSharedState<T[]>(cacheKey, []);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { toast } = useToast();
  
  const isGuestUser = user?.role === 'guest';
  const isAdmin = user?.role === 'super-admin' || user?.role === 'table-admin';

  const fetchData = async () => {
    console.log(`Fetching ${tableName}...`);
    setLoadingData(true);
    setHasAttemptedFetch(true);
    
    try {
      let query = supabase.from(tableName as any).select('*');
      
      // Only filter by active status for non-admin users or for tables other than 'tables'
      if (!isAdmin || tableName !== 'tables') {
        query = query.eq('status', 'active');
      }

      const { data: fetchedData, error } = await query;

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        // Try loading from cache if available
        const cachedData = localStorage.getItem(`cached_${cacheKey}`);
        if (cachedData) {
          console.log(`Using cached data for ${tableName}`);
          setData(JSON.parse(cachedData) as T[]);
        } else {
          toast({
            title: `Error loading ${tableName}`,
            description: "Please try refreshing the page",
            variant: "destructive"
          });
        }
      } else if (fetchedData && Array.isArray(fetchedData)) {
        console.log(`Successfully fetched ${fetchedData.length} ${tableName}`);
        // Convert the returned data to the expected type
        setData(fetchedData as unknown as T[]);
        localStorage.setItem(`cached_${cacheKey}`, JSON.stringify(fetchedData));
      }
    } catch (err) {
      console.error(`Unexpected error in fetch${tableName}:`, err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return Promise.resolve();
    setRefreshing(true);
    try {
      await fetchData();
      toast({
        title: "Data refreshed",
        description: `Latest ${tableName} information loaded`,
      });
    } catch (err) {
      console.error('Error during refresh:', err);
    } finally {
      setRefreshing(false);
    }
    return Promise.resolve();
  };

  useEffect(() => {
    fetchData();
    
    const channelId = `${tableName}_updates_${Math.random().toString(36).substring(2, 9)}`;
    
    let channel: RealtimeChannel | null = null;
    
    try {
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName as any },
          (payload) => {
            console.log(`Realtime update for ${tableName}:`, payload);
            setTimeout(() => fetchData(), 500);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${tableName}: ${status}`);
        });
    } catch (err) {
      console.error(`Error setting up realtime for ${tableName}:`, err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return {
    data,
    loadingData,
    refreshing,
    hasAttemptedFetch,
    handleRefresh,
    isGuestUser
  };
};
