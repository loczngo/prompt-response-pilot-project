import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { Table } from '@/lib/mockDb';
import { supabase } from '@/integrations/supabase/client';

interface TableData {
  created_at: string;
  id: number;
  status: 'active' | 'inactive';
  seats: any[];
}

const convertToTable = (data: TableData): Table => {
  return {
    ...data,
    seats: data.seats || [],
    status: data.status as 'active' | 'inactive'
  };
};

export const useTableManagement = (fixedTableId?: string) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [tableNumber, setTableNumber] = useState(fixedTableId || '');
  const [selectedTable, setSelectedTable] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllTables().finally(() => {
      setRefreshing(false);
    });
  };

  const handleTableSelect = () => {
    setSelectedTable(tableNumber);
  };

  const handleTableStatusToggle = async (tableId: string) => {
    try {
      const table = tables.find(table => table.id.toString() === tableId);
      if (!table) {
        toast({
          title: "Error",
          description: "Table not found",
          variant: "destructive"
        });
        return;
      }

      const newStatus = table.status === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', table.id);

      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
          console.warn('Permission denied when updating table status. This might be an RLS policy restriction.');
          toast({
            title: "Permission Error",
            description: "You don't have permission to change table status. Please contact an administrator.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      fetchAllTables();

      toast({
        title: "Table Status Updated",
        description: `Table ${table.id} is now ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error toggling table status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update table status",
        variant: "destructive"
      });
    }
  };

  const handleSeatStatusToggle = async (tableId: string, seatCode: string) => {
    try {
      const table = tables.find(table => table.id.toString() === tableId);
      if (!table) {
        toast({
          title: "Error",
          description: "Table not found",
          variant: "destructive"
        });
        return;
      }

      const seat = table.seats.find(seat => seat.code === seatCode);
      if (!seat) {
        toast({
          title: "Error",
          description: "Seat not found",
          variant: "destructive"
        });
        return;
      }

      const newStatus = seat.status === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('seats')
        .update({ status: newStatus })
        .eq('table_id', table.id)
        .eq('code', seatCode);

      if (error) {
        throw error;
      }

      fetchAllTables();

      toast({
        title: "Seat Status Updated",
        description: `Seat ${seatCode} on Table ${table.id} is now ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error toggling seat status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update seat status",
        variant: "destructive"
      });
    }
  };

  const removeUserFromSeat = async (tableId: string, seatCode: string) => {
    try {
      const table = tables.find(table => table.id.toString() === tableId);
      if (!table) {
        toast({
          title: "Error",
          description: "Table not found",
          variant: "destructive"
        });
        return;
      }
  
      const seat = table.seats.find(seat => seat.code === seatCode);
      if (!seat) {
        toast({
          title: "Error",
          description: "Seat not found",
          variant: "destructive"
        });
        return;
      }
  
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ table_number: null, seat_code: null })
        .eq('id', seat.userId);
  
      if (profileError) {
        throw profileError;
      }
  
      const { error: seatError } = await supabase
        .from('seats')
        .update({ user_id: null })
        .eq('table_id', table.id)
        .eq('code', seatCode);
  
      if (seatError) {
        throw seatError;
      }
  
      fetchAllTables();
  
      toast({
        title: "User Removed",
        description: `User removed from Seat ${seatCode} on Table ${table.id}`,
      });
    } catch (error: any) {
      console.error('Error removing user from seat:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from seat",
        variant: "destructive"
      });
    }
  };

  const fetchAllTables = async () => {
    setLoadingData(true);
    try {
      console.log('Attempting to fetch tables from Supabase...');
      
      const { data: fetchedTables, error } = await supabase
        .from('tables')
        .select('*, seats(*)');

      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
          console.warn('Permission denied when fetching tables. This might be an RLS policy issue.');
          
          const cachedTables = localStorage.getItem('cached_tables');
          if (cachedTables) {
            console.log('Using cached tables data');
            const parsedTables = JSON.parse(cachedTables);
            setTables(parsedTables);
            setAllTables(parsedTables);
            setHasAttemptedFetch(true);
            return;
          }
          
          toast({
            title: "Permission Error",
            description: "You don't have permission to view tables. Please contact an administrator.",
            variant: "destructive"
          });
        }
        throw error;
      }

      const convertedTables = (fetchedTables as TableData[]).map(convertToTable);
      
      console.log('Tables fetched successfully:', convertedTables);
      localStorage.setItem('cached_tables', JSON.stringify(convertedTables));
      
      setTables(convertedTables);
      setAllTables(convertedTables);
      setHasAttemptedFetch(true);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tables. Please check your connection and permissions.",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (fixedTableId) {
      setSelectedTable(fixedTableId);
    }
    fetchAllTables();
    
    const channel = supabase
      .channel('table_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          console.log('Table update detected:', payload);
          fetchAllTables();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        (payload) => {
          console.log('Seat update detected:', payload);
          fetchAllTables();
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for table updates: ${status}`);
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fixedTableId]);

  return {
    tables,
    allTables,
    tableNumber,
    selectedTable,
    setTableNumber,
    setSelectedTable,
    handleRefresh,
    handleTableSelect: () => setSelectedTable(tableNumber),
    handleTableStatusToggle,
    handleSeatStatusToggle,
    removeUserFromSeat,
    fetchAllTables,
    loadingData,
    refreshing,
    hasAttemptedFetch
  };
};
