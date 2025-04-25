
import { Table, Seat, User } from '@/lib/mockDb';

export type { Table, Seat, User };

export interface TableManagementHook {
  tables: Table[];
  tableNumber: string;
  selectedTable: Table | null;
  isLoading: boolean;
  fetchError?: string | null;
  setTableNumber: (value: string) => void;
  refreshTables: () => void;
  handleTableSelect: () => void;
  handleTableStatusToggle: (tableId: number) => void;
  handleSeatStatusToggle: (tableId: number, seatCode: string) => void;
}

// Update the Table interface to include currentPromptId
export interface SupabaseTable {
  id: number;
  status: string;
  current_prompt_id?: string;
  seats: SupabaseSeat[];
}

export interface SupabaseSeat {
  id: number;
  table_id: number;
  code: string;
  status: string;
  user_id?: string;
  is_dealer?: boolean;
  created_at?: string;
}
