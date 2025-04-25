
import { Table, Seat, User } from '@/lib/mockDb';

export interface TableManagementHook {
  tables: Table[];
  tableNumber: string;
  selectedTable: Table | null;
  isLoading: boolean;
  setTableNumber: (value: string) => void;
  refreshTables: () => void;
  handleTableSelect: () => void;
  handleTableStatusToggle: (tableId: number) => void;
  handleSeatStatusToggle: (tableId: number, seatCode: string) => void;
}
