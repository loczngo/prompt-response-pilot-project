
import { Table, Seat, User } from '@/lib/mockDb';

export interface TableManagementHook {
  tables: Table[];
  tableNumber: string;
  selectedTable: Table | null;
  setTableNumber: (value: string) => void;
  refreshTables: () => void;
  handleTableSelect: () => void;
  handleTableStatusToggle: (tableId: number) => void;
  handleSeatStatusToggle: (tableId: number, seatCode: string) => void;
}

// Supabase database types
export interface SupabaseTable {
  id: number;
  status: string;
  created_at?: string;
  current_prompt_id?: string;
}

export interface SupabasePrompt {
  id: string;
  text: string;
  target_table: number | null;
  status: string;
  created_at?: string;
}

export interface SupabaseSeat {
  id: number;
  table_id: number;
  code: string;
  status: string;
  user_id?: string;
  is_dealer: boolean;
  created_at?: string;
}

export interface SupabaseAnnouncement {
  id: string;
  text: string;
  target_table: number | null;
  created_at?: string;
}
