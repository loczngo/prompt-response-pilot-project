
import { useState } from 'react';
import { useSharedState } from '../use-shared-state';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeStateProps<T> {
  cacheKey: string;
  initialState: T[];
}

export const useRealtimeState = <T extends object>({ 
  cacheKey, 
  initialState 
}: UseRealtimeStateProps<T>) => {
  const [data, setData] = useSharedState<T[]>(cacheKey, initialState);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    if (refreshing) return Promise.resolve();
    setRefreshing(true);
    try {
      await Promise.resolve();  // Placeholder for actual refresh logic
      toast({
        title: "Data refreshed",
        description: "Latest information loaded",
      });
    } catch (err) {
      console.error('Error during refresh:', err);
    } finally {
      setRefreshing(false);
    }
    return Promise.resolve();
  };

  return {
    data,
    setData,
    loadingData,
    setLoadingData,
    refreshing,
    setRefreshing,
    hasAttemptedFetch,
    setHasAttemptedFetch,
    handleRefresh
  };
};
