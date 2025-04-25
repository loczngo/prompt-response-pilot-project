
import { useState } from 'react';
import { useRealtimeBase } from './use-realtime-base';

export const useTableManagement = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const { 
    data: tables, 
    loadingData, 
    refreshing, 
    hasAttemptedFetch, 
    handleRefresh,
    isGuestUser 
  } = useRealtimeBase({
    tableName: 'tables',
    cacheKey: 'tables'
  });

  return {
    tables,
    selectedTable,
    setSelectedTable,
    loadingData,
    refreshing,
    hasAttemptedFetch,
    handleRefresh,
    isGuestUser
  };
};
