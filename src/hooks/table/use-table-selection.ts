
import { useState, useCallback } from 'react';
import { Table } from '@/types/table';
import { useToast } from '@/hooks/use-toast';

export const useTableSelection = (tables: Table[]) => {
  const [tableNumber, setTableNumber] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { toast } = useToast();

  const handleTableSelect = useCallback(() => {
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
  }, [tableNumber, tables, toast]);

  return {
    tableNumber,
    selectedTable,
    setTableNumber,
    handleTableSelect
  };
};
