
import { useState, useCallback } from 'react';
import { Table, SupabaseTable } from '@/types/table';
import { useSharedState } from '@/hooks/use-shared-state';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTableData = () => {
  const [tables, setTables] = useSharedState<Table[]>('tables', []);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTables = useCallback(async (showToastOnError = true) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      console.log('Fetching tables from Supabase...');
      const { data: tablesData, error } = await supabase
        .from('tables')
        .select('*, seats(*)')
        .order('id');
      
      if (error) {
        console.error('Error fetching tables:', error);
        setFetchError(error.message);
        if (showToastOnError) {
          toast({
            title: "Error Fetching Tables",
            description: "Could not retrieve tables. Please try again later.",
            variant: "destructive",
          });
        }
        return false;
      } else if (tablesData) {
        console.log(`Retrieved ${tablesData.length} tables from database:`, tablesData);
        
        const typedTables: Table[] = tablesData.map(table => {
          const supabaseTable = table as SupabaseTable;
          return {
            id: table.id,
            status: table.status === 'active' ? 'active' : 'inactive',
            seats: (table.seats || []).map(seat => ({
              code: seat.code,
              userId: seat.user_id || undefined,
              status: seat.status === 'active' ? 'active' : 'inactive',
              isDealer: seat.is_dealer || false,
              dealerHandsLeft: undefined
            })),
            currentPromptId: supabaseTable.current_prompt_id || undefined
          };
        });
        
        setTables(typedTables);
        setLastFetched(Date.now());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Exception while fetching tables:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error');
      if (showToastOnError) {
        toast({
          title: "Error Fetching Tables",
          description: "Could not retrieve tables. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setTables, toast]);

  return {
    tables,
    isLoading,
    fetchError,
    lastFetched,
    fetchTables
  };
};
