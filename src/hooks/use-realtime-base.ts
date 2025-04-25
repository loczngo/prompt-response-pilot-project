
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

  const fetchData = async () => {
    console.log(`Fetching ${tableName}...`);
    setLoadingData(true);
    setHasAttemptedFetch(true);
    
    try {
      // We need to cast tableName to any to avoid type issues with Supabase client
      const { data: fetchedData, error } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        if (error.code === '42501' || error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          console.log(`Permission denied for ${tableName}, using fallback approach`);
          const cachedData = localStorage.getItem(`cached_${cacheKey}`);
          if (cachedData) {
            setData(JSON.parse(cachedData) as T[]);
          }
          toast({
            title: "Using cached data",
            description: "Limited connectivity to server. Using available data.",
            variant: "default"
          });
        } else {
          toast({
            title: `Error fetching ${tableName}`,
            description: "Please try refreshing the data",
            variant: "destructive"
          });
        }
      } else if (fetchedData && Array.isArray(fetchedData)) {
        // Convert the returned data to the expected type using double casting to avoid type errors
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
    if (refreshing) return;
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
          () => {
            setTimeout(() => fetchData(), 1000);
          }
        )
        .subscribe();
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
