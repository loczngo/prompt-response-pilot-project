
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Table } from '@/types/table';
import { useSharedState } from '@/hooks/use-shared-state';
import { supabase } from '@/integrations/supabase/client';

export const useTableManagement = (userTableNumber?: number) => {
  // Use shared state for tables to sync across tabs
  const [tables, setTables] = useSharedState<Table[]>('tables', []);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Function to fetch tables from Supabase
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
        
        // Transform and validate the data to match our Table type
        const typedTables: Table[] = tablesData.map(table => ({
          id: table.id,
          status: table.status === 'active' ? 'active' : 'inactive',
          seats: (table.seats || []).map(seat => ({
            code: seat.code,
            userId: seat.user_id || undefined,
            status: seat.status === 'active' ? 'active' : 'inactive',
            isDealer: seat.is_dealer || false,
            dealerHandsLeft: undefined
          })),
          // Use type assertion to safely access the current_prompt_id
          currentPromptId: table.current_prompt_id || undefined
        }));
        
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

  // Auto-select assigned table if user is a table admin
  useEffect(() => {
    if (userTableNumber) {
      setTableNumber(userTableNumber.toString());
      fetchTables(false).then(() => {
        // Find this table in our data
        const table = tables.find(t => t.id === userTableNumber);
        if (table) {
          setSelectedTable(table);
        }
      });
    }
  }, [userTableNumber, fetchTables, tables]);

  // Initial data fetch
  useEffect(() => {
    // Initial fetch
    fetchTables(false);
    
    // Setup aggressive polling as backup for realtime updates
    // This ensures data is always available even if realtime fails
    const pollingInterval = setInterval(() => {
      fetchTables(false);
    }, 10000); // Poll every 10 seconds as a fallback
    
    return () => clearInterval(pollingInterval);
  }, [fetchTables]);

  // Setup realtime subscription for tables with automatic reconnection
  useEffect(() => {
    console.log('Setting up realtime subscription for tables and seats');
    
    // Create a unique channel name to avoid conflicts
    const channelName = `table-updates-${Math.random().toString(36).substring(2, 9)}`;
    
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          console.log('Table change detected, refreshing data:', payload);
          fetchTables(false);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        (payload) => {
          console.log('Seat change detected, refreshing data:', payload);
          fetchTables(false);
        }
      )
      .subscribe((status) => {
        console.log(`Realtime channel ${channelName} status:`, status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchTables]);

  const refreshTables = useCallback(() => {
    // Always fetch when manually requested
    fetchTables(true);
  }, [fetchTables]);

  const handleTableSelect = () => {
    if (!tableNumber) {
      setSelectedTable(null);
      return;
    }
    
    const table = tables.find(t => t.id === Number(tableNumber));
    setSelectedTable(table || null);
    
    if (!table) {
      toast({
        title: "Table Not Found",
        description: `Table ${tableNumber} does not exist.`,
        variant: "destructive",
      });
    }
  };

  const handleTableStatusToggle = async (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    const newStatus = table.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', tableId);
      
      if (error) {
        throw error;
      }
      
      refreshTables();
      
      toast({
        title: `Table ${tableId} ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `Table ${tableId} is now ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error toggling table status:', error);
      toast({
        title: "Error Updating Table",
        description: "Failed to update table status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSeatStatusToggle = async (tableId: number, seatCode: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    const seat = table.seats.find(s => s.code === seatCode);
    if (!seat) return;
    
    const newStatus = seat.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('seats')
        .update({ status: newStatus })
        .eq('table_id', tableId)
        .eq('code', seatCode);
      
      if (error) {
        throw error;
      }
      
      refreshTables();
      
      toast({
        title: `Seat ${seatCode} ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `Seat ${seatCode} is now ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error toggling seat status:', error);
      toast({
        title: "Error Updating Seat",
        description: "Failed to update seat status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    tables,
    tableNumber,
    selectedTable,
    isLoading,
    fetchError,
    setTableNumber,
    refreshTables,
    handleTableSelect,
    handleTableStatusToggle,
    handleSeatStatusToggle
  };
};
