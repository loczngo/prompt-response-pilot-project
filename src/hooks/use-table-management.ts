
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Table, getTable, getTables, updateTable, updateTableSeat } from '@/lib/mockDb';

export const useTableManagement = () => {
  const [tables, setTables] = useState<Table[]>(getTables());
  const [tableNumber, setTableNumber] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { toast } = useToast();

  const refreshTables = () => {
    setTables(getTables());
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
