
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useDataFetcher = (tableName: string, cacheKey: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'super-admin' || user?.role === 'table-admin';
  const isGuestUser = user?.role === 'guest';

  const fetchData = async () => {
    console.log(`Fetching ${tableName}...`);
    
    try {
      let query = supabase.from(tableName as any).select('*');
      
      if (!isAdmin || tableName !== 'tables') {
        query = query.eq('status', 'active');
      }

      const { data: fetchedData, error } = await query;

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        
        // If this is a permission error, try to use cached data
        if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
          console.warn(`Permission denied when fetching ${tableName}. This might be an RLS policy issue.`);
          const cachedData = localStorage.getItem(`cached_${cacheKey}`);
          
          if (cachedData) {
            console.log(`Using cached data for ${tableName}`);
            return JSON.parse(cachedData);
          } else {
            toast({
              title: `Error loading ${tableName}`,
              description: "Please try refreshing the page",
              variant: "destructive"
            });
            return [];
          }
        } else {
          const cachedData = localStorage.getItem(`cached_${cacheKey}`);
          if (cachedData) {
            console.log(`Using cached data for ${tableName}`);
            return JSON.parse(cachedData);
          } else {
            toast({
              title: `Error loading ${tableName}`,
              description: "Please try refreshing the page",
              variant: "destructive"
            });
            return [];
          }
        }
      }

      if (fetchedData && Array.isArray(fetchedData)) {
        console.log(`Successfully fetched ${fetchedData.length} ${tableName}`);
        localStorage.setItem(`cached_${cacheKey}`, JSON.stringify(fetchedData));
        return fetchedData;
      }

      return [];
    } catch (err) {
      console.error(`Unexpected error in fetch${tableName}:`, err);
      
      // Try to use cached data as a last resort
      const cachedData = localStorage.getItem(`cached_${cacheKey}`);
      if (cachedData) {
        console.log(`Using cached data for ${tableName} after error`);
        return JSON.parse(cachedData);
      }
      
      return [];
    }
  };

  return { fetchData };
};
