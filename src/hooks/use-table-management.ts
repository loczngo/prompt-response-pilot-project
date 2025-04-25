import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { Table } from '@/lib/mockDb';
import { supabase } from '@/integrations/supabase/client';

interface TableData {
  created_at: string;
  id: number;
  status: string;
  seats: any[];  // Add the seats property to match Table type
}

const convertToTable = (data: TableData): Table => {
  return {
    ...data,
    seats: data.seats || []
  };
};

export const useTableManagement = (fixedTableId?: string) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [tableNumber, setTableNumber] = useState(fixedTableId || '');
  const [selectedTable, setSelectedTable] = useState('');
  const { toast } = useToast();

  const handleRefresh = () => {
    fetchAllTables();
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
  
      // First, update the user's profile to remove table and seat assignments
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ table_number: null, seat_code: null })
        .eq('id', seat.userId);
  
      if (profileError) {
        throw profileError;
      }
  
      // Then, update the seat to remove the user assignment
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
    try {
      const { data: fetchedTables, error } = await supabase
        .from('tables')
        .select('*');

      if (error) throw error;

      // Convert fetched data to Table type
      const convertedTables = (fetchedTables as TableData[]).map(convertToTable);
      setTables(convertedTables);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tables",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (fixedTableId) {
      setSelectedTable(fixedTableId);
    }
    fetchAllTables();
  }, [fixedTableId]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: fetchedTables, error } = await supabase
          .from('tables')
          .select('*');
  
        if (error) throw error;
  
        // Convert fetched data to Table type
        const convertedTables = (fetchedTables as TableData[]).map(convertToTable);
        setAllTables(convertedTables);
      } catch (error) {
        console.error('Error fetching all tables:', error);
        toast({
          title: "Error",
          description: "Failed to fetch all tables",
          variant: "destructive"
        });
      }
    };

    fetchAll();
  }, []);

  return {
    tables,
    allTables,
    tableNumber,
    selectedTable,
    setTableNumber,
    handleRefresh,
    handleTableSelect,
    handleTableStatusToggle,
    handleSeatStatusToggle,
    removeUserFromSeat,
    fetchAllTables
  };
};
