
import { useEffect } from 'react';
import { useTableData } from './table/use-table-data';
import { useTableStatus } from './table/use-table-status';
import { useSeatStatus } from './table/use-seat-status';
import { useTableSelection } from './table/use-table-selection';

export const useTableManagement = (userTableNumber?: number) => {
  const { tables, isLoading, fetchError, fetchTables } = useTableData();
  const { handleTableStatusToggle } = useTableStatus(fetchTables);
  const { handleSeatStatusToggle } = useSeatStatus(fetchTables);
  const {
    tableNumber,
    selectedTable,
    setTableNumber,
    handleTableSelect
  } = useTableSelection(tables);

  // Auto-select assigned table if user is a table admin
  useEffect(() => {
    if (userTableNumber) {
      setTableNumber(userTableNumber.toString());
      fetchTables(false).then(() => {
        // Find this table in our data
        const table = tables.find(t => t.id === userTableNumber);
        if (table) {
          handleTableSelect();
        }
      });
    }
  }, [userTableNumber, fetchTables, tables, setTableNumber, handleTableSelect]);

  // Initial data fetch
  useEffect(() => {
    // Initial fetch
    fetchTables(false);
    
    // Setup aggressive polling as backup for realtime updates
    const pollingInterval = setInterval(() => {
      fetchTables(false);
    }, 10000); // Poll every 10 seconds as a fallback
    
    return () => clearInterval(pollingInterval);
  }, [fetchTables]);

  return {
    tables,
    tableNumber,
    selectedTable,
    isLoading,
    fetchError,
    setTableNumber,
    refreshTables: fetchTables,
    handleTableSelect,
    handleTableStatusToggle,
    handleSeatStatusToggle
  };
};
