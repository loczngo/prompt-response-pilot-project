
import { useState, useEffect } from 'react';
import { useRealtimeBase } from './use-realtime-base';
import { Table } from '@/lib/mockDb';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTableManagement = (assignedTableNumber?: string) => {
  const [tableNumber, setTableNumber] = useState<string>(assignedTableNumber || '');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [allTables, setAllTables] = useState<Table[]>([]);
  const { toast } = useToast();
  
  const { 
    data: tables, 
    loadingData, 
    refreshing, 
    hasAttemptedFetch, 
    handleRefresh,
    isGuestUser 
  } = useRealtimeBase<Table>({
    tableName: 'tables',
    cacheKey: 'tables'
  });

  // Fetch all tables directly, not just active ones
  const fetchAllTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching all tables:', error);
        return;
      }
      
      if (data) {
        console.log(`Fetched ${data.length} total tables (including inactive)`);
        setAllTables(data);
      }
    } catch (err) {
      console.error('Error in fetchAllTables:', err);
    }
  };

  useEffect(() => {
    fetchAllTables();
    
    // Set up realtime subscription for table changes
    const channel = supabase
      .channel('tables_channel_' + Math.random().toString(36).substring(2, 7))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => {
          console.log('Tables updated, refreshing data');
          fetchAllTables();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTableSelect = () => {
    if (!tableNumber) {
      setSelectedTable('');
      return;
    }
    
    setSelectedTable(tableNumber);
  };

  const handleTableStatusToggle = async (tableId: string) => {
    try {
      const numericTableId = parseInt(tableId, 10);
      
      // First, get the current status
      const { data: currentTable, error: fetchError } = await supabase
        .from('tables')
        .select('status')
        .eq('id', numericTableId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      const newStatus = currentTable.status === 'active' ? 'inactive' : 'active';
      
      // Update the status
      const { error: updateError } = await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', numericTableId);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Table Updated",
        description: `Table ${tableId} is now ${newStatus}`,
      });
      
      // Refresh data after update
      fetchAllTables();
      handleRefresh();
    } catch (err) {
      console.error('Error toggling table status:', err);
      toast({
        title: "Error",
        description: "Failed to update table status",
        variant: "destructive"
      });
    }
  };

  const handleSeatStatusToggle = async (tableId: string, seatCode: string) => {
    try {
      const numericTableId = parseInt(tableId, 10);
      
      // First, get the current status
      const { data: currentSeat, error: fetchError } = await supabase
        .from('seats')
        .select('status, user_id')
        .eq('table_id', numericTableId)
        .eq('code', seatCode)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      const newStatus = currentSeat.status === 'active' ? 'inactive' : 'active';
      
      // If there's a user in the seat and we're making it inactive, remove the user
      if (currentSeat.user_id && newStatus === 'inactive') {
        // Update the profile to remove table/seat assignment
        await supabase
          .from('profiles')
          .update({
            table_number: null,
            seat_code: null
          })
          .eq('id', currentSeat.user_id);
      }
      
      // Update the status
      const { error: updateError } = await supabase
        .from('seats')
        .update({ 
          status: newStatus,
          user_id: newStatus === 'inactive' ? null : currentSeat.user_id 
        })
        .eq('table_id', numericTableId)
        .eq('code', seatCode);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Seat Updated",
        description: `Seat ${seatCode} is now ${newStatus}${newStatus === 'inactive' && currentSeat.user_id ? ' (user removed)' : ''}`,
      });
      
      handleRefresh();
    } catch (err) {
      console.error('Error toggling seat status:', err);
      toast({
        title: "Error",
        description: "Failed to update seat status",
        variant: "destructive"
      });
    }
  };

  // Add function to remove a user from a seat
  const removeUserFromSeat = async (tableId: string, seatCode: string) => {
    try {
      const numericTableId = parseInt(tableId, 10);
      
      // Get the seat with user info
      const { data: seat, error: fetchError } = await supabase
        .from('seats')
        .select('user_id')
        .eq('table_id', numericTableId)
        .eq('code', seatCode)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!seat.user_id) {
        toast({
          title: "Info",
          description: "This seat is not currently occupied",
        });
        return;
      }
      
      // Update the profile to remove table/seat assignment
      await supabase
        .from('profiles')
        .update({
          table_number: null,
          seat_code: null
        })
        .eq('id', seat.user_id);
        
      // Remove the user from the seat
      const { error: updateError } = await supabase
        .from('seats')
        .update({ user_id: null })
        .eq('table_id', numericTableId)
        .eq('code', seatCode);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "User Removed",
        description: `User has been removed from seat ${seatCode}`,
      });
      
      handleRefresh();
    } catch (err) {
      console.error('Error removing user from seat:', err);
      toast({
        title: "Error",
        description: "Failed to remove user from seat",
        variant: "destructive"
      });
    }
  };

  return {
    tables,
    allTables, // Added so we can access all tables including inactive ones
    tableNumber,
    setTableNumber,
    selectedTable,
    setSelectedTable,
    loadingData,
    refreshing,
    hasAttemptedFetch,
    handleRefresh,
    handleTableSelect,
    handleTableStatusToggle,
    handleSeatStatusToggle,
    removeUserFromSeat, // New function for admin to remove users
    isGuestUser,
    fetchAllTables
  };
};
