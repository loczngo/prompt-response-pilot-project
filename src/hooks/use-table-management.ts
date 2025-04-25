
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Table, getTable, getTables, updateTable, updateTableSeat } from '@/lib/mockDb';
import { useSharedState } from '@/hooks/use-shared-state';

export const useTableManagement = (userTableNumber?: number) => {
  // Use shared state for tables to sync across tabs
  const [tables, setTables] = useSharedState<Table[]>('tables', getTables());
  const [tableNumber, setTableNumber] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { toast } = useToast();

  // Auto-select assigned table if user is a table admin
  useEffect(() => {
    if (userTableNumber) {
      setTableNumber(userTableNumber.toString());
      const table = getTable(userTableNumber);
      if (table) {
        setSelectedTable(table);
      }
    }
  }, [userTableNumber]);

  // Set up polling for real-time updates
  useEffect(() => {
    const refreshData = () => {
      const freshTables = getTables();
      setTables(freshTables);
      
      // Also update selected table if we have one
      if (selectedTable) {
        const updatedTable = getTable(selectedTable.id);
        if (updatedTable) {
          setSelectedTable(updatedTable);
        }
      }
    };
    
    // Check for updates every 1 second for more responsive updates
    const interval = setInterval(refreshData, 1000);
    
    return () => clearInterval(interval);
  }, [selectedTable, setTables]);

  const refreshTables = () => {
    const freshTables = getTables();
    setTables(freshTables);
    if (selectedTable) {
      setSelectedTable(getTable(selectedTable.id));
    }
  };

  const handleTableSelect = () => {
    if (!tableNumber) {
      setSelectedTable(null);
      return;
    }
    
    const table = getTable(Number(tableNumber));
    setSelectedTable(table || null);
    
    if (!table) {
      toast({
        title: "Table Not Found",
        description: `Table ${tableNumber} does not exist.`,
        variant: "destructive",
      });
    }
  };

  const handleTableStatusToggle = (tableId: number) => {
    const table = getTable(tableId);
    if (!table) return;
    
    const newStatus = table.status === 'active' ? 'inactive' : 'active';
    
    updateTable(tableId, { status: newStatus });
    refreshTables();
    
    toast({
      title: `Table ${tableId} ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      description: `Table ${tableId} is now ${newStatus}.`,
    });
  };

  const handleSeatStatusToggle = (tableId: number, seatCode: string) => {
    const table = getTable(tableId);
    if (!table) return;
    
    const seat = table.seats.find(s => s.code === seatCode);
    if (!seat) return;
    
    const newStatus = seat.status === 'active' ? 'inactive' : 'active';
    
    updateTableSeat(tableId, seatCode, { status: newStatus });
    refreshTables();
    
    toast({
      title: `Seat ${seatCode} ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      description: `Seat ${seatCode} is now ${newStatus}.`,
    });
  };

  return {
    tables,
    tableNumber,
    selectedTable,
    setTableNumber,
    setSelectedTable,
    refreshTables,
    handleTableSelect,
    handleTableStatusToggle,
    handleSeatStatusToggle
  };
};
