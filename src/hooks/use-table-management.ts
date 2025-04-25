
import { useState } from 'react';
import { useRealtimeBase } from './use-realtime-base';
import { Table } from '@/lib/mockDb';

export const useTableManagement = (assignedTableNumber?: string) => {
  const [tableNumber, setTableNumber] = useState<string>(assignedTableNumber || '');
  const [selectedTable, setSelectedTable] = useState<string>('');
  
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

  const handleTableSelect = () => {
    if (!tableNumber) {
      setSelectedTable('');
      return;
    }
    
    setSelectedTable(tableNumber);
  };

  const handleTableStatusToggle = (tableId: string) => {
    // This would typically call an API to toggle the table status
    console.log(`Toggling status for table ${tableId}`);
    // After toggle, refresh tables
    handleRefresh();
  };

  const handleSeatStatusToggle = (tableId: string, seatCode: string) => {
    // This would typically call an API to toggle the seat status
    console.log(`Toggling status for table ${tableId}, seat ${seatCode}`);
    // After toggle, refresh tables
    handleRefresh();
  };

  return {
    tables,
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
    isGuestUser
  };
};
