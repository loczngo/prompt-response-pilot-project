
import { useState, useEffect } from 'react';
import { useTableManagement } from './use-table-management';
import { useSeatManagement } from './use-seat-management';
import type { Table } from '@/lib/mockDb';

export const useTableSeatSelection = () => {
  const {
    tables,
    selectedTable: tableId,
    setSelectedTable: setTableId,
    loadingData,
    refreshing,
    hasAttemptedFetch,
    handleRefresh
  } = useTableManagement();

  const {
    selectedSeat,
    setSelectedSeat,
    availableSeats,
    loadingSeats,
    fetchSeats
  } = useSeatManagement(tableId);

  // Ensure we fetch seats when tableId changes
  useEffect(() => {
    if (tableId) {
      fetchSeats(tableId);
    }
  }, [tableId]);

  const handleRefreshWithSeats = async () => {
    await handleRefresh();
    if (tableId) {
      await fetchSeats(tableId);
    }
    return Promise.resolve();
  };

  return {
    tables,
    selectedTable: tableId,
    selectedSeat,
    availableSeats,
    loadingData: loadingData || loadingSeats,
    refreshing,
    hasAttemptedFetch,
    setSelectedTable: setTableId,
    setSelectedSeat,
    handleRefresh: handleRefreshWithSeats
  };
};
