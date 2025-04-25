
import { useTableManagement } from './use-table-management';
import { useSeatManagement } from './use-seat-management';

export const useTableSeatSelection = () => {
  const {
    tables,
    selectedTable,
    setSelectedTable,
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
  } = useSeatManagement(selectedTable);

  return {
    tables,
    selectedTable,
    selectedSeat,
    availableSeats,
    loadingData: loadingData || loadingSeats,
    refreshing,
    hasAttemptedFetch,
    setSelectedTable,
    setSelectedSeat,
    handleRefresh
  };
};
