
import { useTableManagement } from './use-table-management';
import { useSeatManagement } from './use-seat-management';

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
    loadingSeats
  } = useSeatManagement(tableId);

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
    handleRefresh
  };
};
