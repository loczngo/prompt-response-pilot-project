import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Table, Seat } from '@/lib/mockDb';
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

  // Function to fetch tables from Supabase
  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching tables from Supabase...');
      const { data: tablesData, error } = await supabase
        .from('tables')
        .select('*, seats(*)');
      
      if (error) {
        console.error('Error fetching tables:', error);
        toast({
          title: "Error Fetching Tables",
          description: "Could not retrieve tables. Please try again later.",
          variant: "destructive",
        });
      } else if (tablesData) {
        console.log(`Retrieved ${tablesData.length} tables from database`);
        
        // Transform and validate the data to match our Table type
        const typedTables: Table[] = tablesData.map(table => ({
          id: table.id,
          // Ensure status is either 'active' or 'inactive'
          status: table.status === 'active' ? 'active' : 'inactive',
          seats: (table.seats || []).map(seat => ({
            code: seat.code,
            userId: seat.user_id || undefined,
            // Ensure seat status is either 'active' or 'inactive'
            status: seat.status === 'active' ? 'active' : 'inactive',
            isDealer: seat.is_dealer || false,
            dealerHandsLeft: undefined
          })),
          // Handle the current_prompt_id field if it exists in the database
          currentPromptId: table.current_prompt_id || undefined
        }));
        
        setTables(typedTables);
        setLastFetched(Date.now());
      }
    } catch (error) {
      console.error('Exception while fetching tables:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setTables, toast]);

  // Auto-select assigned table if user is a table admin
  useEffect(() => {
    if (userTableNumber) {
      setTableNumber(userTableNumber.toString());
      fetchTables().then(() => {
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
    fetchTables();
  }, [fetchTables]);

  // Setup realtime subscription for tables
  useEffect(() => {
    const channel = supabase.channel('table-updates');
    
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tables' },
      () => {
        console.log('Table change detected, refreshing data');
        fetchTables();
      }
    ).on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'seats' },
      () => {
        console.log('Seat change detected, refreshing data');
        fetchTables();
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTables]);

  const refreshTables = () => {
    // Only fetch if last fetch was more than 2 seconds ago to prevent hammering the API
    if (Date.now() - lastFetched > 2000) {
      fetchTables();
    }
  };

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
    setTableNumber,
    refreshTables,
    handleTableSelect,
    handleTableStatusToggle,
    handleSeatStatusToggle
  };
};
