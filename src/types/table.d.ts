
import { Table, Seat, User, Response, Prompt } from '@/lib/mockDb';

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

export interface SupabaseResponse {
  id: string;
  prompt_id: string;
  user_id?: string;
  table_number: number;
  seat_code: string;
  response: 'YES' | 'NO' | 'SERVICE';
  created_at?: string;
}

export interface SupabaseAnnouncement {
  id: string;
  text: string;
  target_table: number | null;
  created_at?: string;
}

// Helper functions to convert Supabase types to local types
export function convertSupabasePromptToPrompt(supabasePrompt: SupabasePrompt): Prompt {
  return {
    id: supabasePrompt.id,
    text: supabasePrompt.text,
    targetTable: supabasePrompt.target_table,
    status: supabasePrompt.status,
    createdAt: supabasePrompt.created_at
  };
}

export function convertSupabaseTableToTable(supabaseTable: SupabaseTable): Partial<Table> {
  return {
    id: supabaseTable.id,
    status: supabaseTable.status as 'active' | 'inactive',
    currentPromptId: supabaseTable.current_prompt_id
  };
}

export function convertSupabaseResponseToResponse(supabaseResponse: SupabaseResponse): Response {
  return {
    id: supabaseResponse.id,
    promptId: supabaseResponse.prompt_id,
    userId: supabaseResponse.user_id,
    tableId: supabaseResponse.table_number,
    tableNumber: supabaseResponse.table_number,
    seatCode: supabaseResponse.seat_code,
    response: supabaseResponse.response,
    answer: supabaseResponse.response,
    createdAt: supabaseResponse.created_at || new Date().toISOString(),
    timestamp: supabaseResponse.created_at || new Date().toISOString()
  };
}
