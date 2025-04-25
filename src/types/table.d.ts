
import { Table } from '@/lib/mockDb';

export interface TableManagementHook {
  tables: Table[];
  tableNumber: string;
  selectedTable: string;
  setTableNumber: (value: string) => void;
  handleRefresh: () => void;
  handleTableSelect: () => void;
  handleTableStatusToggle: (tableId: string) => void;
  handleSeatStatusToggle: (tableId: string, seatCode: string) => void;
}
