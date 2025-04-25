import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'guest' | 'table-admin' | 'user-admin';
  username?: string;
  password?: string;
  status?: 'active' | 'inactive';
  lastActive?: string;
}

export interface Seat {
  id: number;
  tableId: number;
  code: string;
  status: 'available' | 'occupied' | 'unavailable';
  userId?: string;
  isDealer: boolean;
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
  tableNumber: number; // Adding this as it's used in components
  seatCode: string;
  response: 'YES' | 'NO' | 'SERVICE';
  answer: 'YES' | 'NO' | 'SERVICE'; // Adding this as it's used in components
  createdAt: string;
  timestamp: string; // Adding this as it's used in components
}

export interface Table {
  id: number;
  status: 'active' | 'inactive';
  name?: string;
  seats: Seat[];
  currentPromptId?: string; // This is needed for GuestInterface
}

export const users: User[] = [
  {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'table-admin',
    username: 'johndoe',
    password: 'password123',
    status: 'active',
    lastActive: '2023-04-01T10:00:00Z'
  },
  {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'user-admin',
    username: 'janesmith',
    password: 'password456',
    status: 'inactive',
    lastActive: '2023-03-15T14:30:00Z'
  },
  {
    id: 'user-3',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    role: 'guest',
    username: 'alicejohnson',
    password: 'password789',
    status: 'active',
    lastActive: '2023-04-05T16:45:00Z'
  }
];

export const seats: Seat[] = [
  {
    id: 1,
    tableId: 1,
    code: 'A1',
    status: 'available',
    userId: null,
    isDealer: false
  },
  {
    id: 2,
    tableId: 1,
    code: 'B1',
    status: 'occupied',
    userId: 'user-3',
    isDealer: false
  },
  {
    id: 3,
    tableId: 2,
    code: 'A1',
    status: 'available',
    userId: null,
    isDealer: false
  },
  {
    id: 4,
    tableId: 2,
    code: 'B1',
    status: 'unavailable',
    userId: null,
    isDealer: true
  }
];

export const prompts: Prompt[] = [
  {
    id: 'prompt-1',
    text: 'Do you need assistance?',
    targetTable: 1,
    status: 'active',
    createdAt: '2023-04-01T09:00:00Z'
  },
  {
    id: 'prompt-2',
    text: 'Would you like a drink?',
    targetTable: 2,
    status: 'inactive',
    createdAt: '2023-03-28T13:00:00Z'
  }
];

export const responses: Response[] = [
  {
    id: 'resp-1',
    promptId: 'prompt-1',
    userId: 'user-1',
    tableId: 1,
    tableNumber: 1,
    seatCode: 'A1',
    response: 'YES',
    answer: 'YES',
    createdAt: '2023-04-01T12:00:00Z',
    timestamp: '2023-04-01T12:00:00Z'
  },
  {
    id: 'resp-2',
    promptId: 'prompt-1',
    userId: 'user-2',
    tableId: 1,
    tableNumber: 1,
    seatCode: 'B1',
    response: 'NO',
    answer: 'NO',
    createdAt: '2023-04-01T12:01:00Z',
    timestamp: '2023-04-01T12:01:00Z'
  },
  {
    id: 'resp-3',
    promptId: 'prompt-2',
    userId: 'user-3',
    tableId: 2,
    tableNumber: 2,
    seatCode: 'A1',
    response: 'SERVICE',
    answer: 'SERVICE',
    createdAt: '2023-04-01T12:02:00Z',
    timestamp: '2023-04-01T12:02:00Z'
  }
];

export const tables: Table[] = [
  {
    id: 1,
    status: 'active',
    name: 'Table 1',
    seats: seats.filter(seat => seat.tableId === 1),
    currentPromptId: 'prompt-1'
  },
  {
    id: 2,
    status: 'inactive',
    name: 'Table 2',
    seats: seats.filter(seat => seat.tableId === 2),
    currentPromptId: 'prompt-2'
  }
];

// Mock data functions
export const getUsers = (): User[] => users;
export const getTable = (tableId: number): Table | undefined =>
  tables.find(table => table.id === tableId);
export const getTables = (): Table[] => tables;
export const getPrompts = (): Prompt[] => prompts;
export const getPrompt = (promptId: string): Prompt | undefined =>
  prompts.find(prompt => prompt.id === promptId);
export const getResponses = (): Response[] => responses;
export const getResponsesByTable = (tableId: number): Response[] =>
  responses.filter(response => response.tableId === tableId);
export const getSeatByCode = (tableId: number, seatCode: string): Seat | undefined =>
  seats.find(seat => seat.tableId === tableId && seat.code === seatCode);

// Function to create a guest user
export const createGuestUser = (tableNumber: number, seatCode: string): User => {
  return {
    id: `guest-${Date.now()}`,
    firstName: 'Guest',
    lastName: `${tableNumber}-${seatCode}`,
    email: '',
    role: 'guest'
  };
};

// Function to add a new prompt
export const addPrompt = (text: string, targetTable: number | null): Prompt => {
  const newPrompt: Prompt = {
    id: uuidv4(),
    text: text,
    targetTable: targetTable,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  prompts.push(newPrompt);
  return newPrompt;
};

// Function to update a prompt's status
export const updatePromptStatus = (promptId: string, status: 'active' | 'inactive'): void => {
  const prompt = prompts.find(p => p.id === promptId);
  if (prompt) {
    prompt.status = status;
  }
};

// Function to add a new response
export const addResponse = (promptId: string, tableNumber: number, seatCode: string, responseValue: 'YES' | 'NO' | 'SERVICE'): Response => {
  const newResponse: Response = {
    id: uuidv4(),
    promptId: promptId,
    tableId: tableNumber,
    tableNumber: tableNumber,
    seatCode: seatCode,
    response: responseValue,
    answer: responseValue,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };
  responses.push(newResponse);
  return newResponse;
};

// Update the user interface if needed to include username, status, and other required fields
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'guest' | 'table-admin' | 'user-admin';
  username?: string;
  password?: string;
  status?: 'active' | 'inactive';
  lastActive?: string;
}
