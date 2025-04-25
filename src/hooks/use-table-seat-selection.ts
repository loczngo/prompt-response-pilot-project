
import { useState, useEffect } from 'react';
import { useTableManagement } from './use-table-management';
import { useSeatManagement } from './use-seat-management';
import { useRealtimeSubscriber } from './realtime/use-realtime-subscriber';
import type { Table } from '@/lib/mockDb';

export const useTableSeatSelection = () => {
  const {
    tables,
    selectedTable: tableId,
    setSelectedTable: setTableId,
    loadingData,
    refreshing,
    hasAttemptedFetch,
    handleRefresh,
    fetchAllTables
  } = useTableManagement();

  const {
    selectedSeat,
    setSelectedSeat,
    availableSeats,
    loadingSeats,
    fetchSeats
  } = useSeatManagement(tableId);
  
  // Set up realtime subscriptions for tables and seats
  useRealtimeSubscriber('tables', () => {
    console.log('Table update detected, refreshing tables');
    fetchAllTables();
  });
  
  useRealtimeSubscriber('seats', () => {
    console.log('Seat update detected, refreshing seats');
    if (tableId) {
      fetchSeats(tableId);
    }
  });

  // Ensure we fetch seats when tableId changes
  useEffect(() => {
    if (tableId) {
      fetchSeats(tableId);
    }
  }, [tableId]);

  // Set up a polling interval as a fallback for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllTables();
      if (tableId) {
        fetchSeats(tableId);
      }
    }, 5000); // Poll every 5 seconds as a fallback
    
    return () => clearInterval(interval);
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
