
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'guest' | 'table-admin' | 'user-admin' | 'super-admin';
  username?: string;
  password?: string;
  status?: 'active' | 'inactive';
  lastActive?: string;
  tableNumber?: number;
}

export interface Seat {
  id: number;
  tableId: number;
  code: string;
  status: 'available' | 'occupied' | 'unavailable';
  userId?: string;
  isDealer: boolean;
  dealerHandsLeft?: number;
}

export interface Prompt {
  id: string;
  text: string;
  targetTable: number | null;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface Response {
  id: string;
  promptId: string;
  userId?: string;
  tableId: number;
  tableNumber: number;
  seatCode: string;
  response: 'YES' | 'NO' | 'SERVICE';
  answer: 'YES' | 'NO' | 'SERVICE';
  createdAt: string;
  timestamp: string;
}

export interface Table {
  id: number;
  status: 'active' | 'inactive';
  name?: string;
  seats: Seat[];
  currentPromptId?: string;
}

export interface Announcement {
  id: string;
  text: string;
  targetTables: number[] | null;
  timestamp: string;
}

export type Role = 'guest' | 'table-admin' | 'user-admin' | 'super-admin';
