
import { v4 as uuidv4 } from 'uuid';

// Define all interfaces
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
  tableNumber?: number; // Added for table admins
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

// Define role type for cleaner usage
export type Role = 'guest' | 'table-admin' | 'user-admin' | 'super-admin';

// Mock data arrays
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
    lastActive: '2023-04-01T10:00:00Z',
    tableNumber: 1
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
  },
  {
    id: 'user-4',
    firstName: 'Admin',
    lastName: 'Super',
    email: 'admin@example.com',
    role: 'super-admin',
    username: 'admin',
    password: 'admin123',
    status: 'active',
    lastActive: '2023-04-10T09:00:00Z'
  }
];

export const seats: Seat[] = [
  {
    id: 1,
    tableId: 1,
    code: 'A1',
    status: 'available',
    userId: null,
    isDealer: false,
    dealerHandsLeft: 0
  },
  {
    id: 2,
    tableId: 1,
    code: 'B1',
    status: 'occupied',
    userId: 'user-3',
    isDealer: false,
    dealerHandsLeft: 0
  },
  {
    id: 3,
    tableId: 2,
    code: 'A1',
    status: 'available',
    userId: null,
    isDealer: false,
    dealerHandsLeft: 0
  },
  {
    id: 4,
    tableId: 2,
    code: 'B1',
    status: 'unavailable',
    userId: null,
    isDealer: true,
    dealerHandsLeft: 10
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

export const announcements: Announcement[] = [
  {
    id: 'ann-1',
    text: 'Welcome to the Prompt and Response System demo!',
    targetTables: null,
    timestamp: '2023-04-01T10:00:00Z'
  },
  {
    id: 'ann-2',
    text: 'New Player-Dealer rotation will begin in 15 minutes.',
    targetTables: [1],
    timestamp: '2023-04-01T11:45:00Z'
  }
];

// Utility function to generate stats for the dashboard
export const getStats = () => {
  const activeTables = tables.filter(table => table.status === 'active').length;
  const activeSeats = seats.filter(seat => seat.status !== 'unavailable').length;
  const occupiedSeats = seats.filter(seat => seat.status === 'occupied').length;
  const serviceRequests = responses.filter(
    resp => resp.answer === 'SERVICE' && 
    new Date(resp.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  const satisfactionRate = Math.round(
    (responses.filter(resp => resp.answer === 'YES').length / responses.length) * 100
  );

  return {
    activeTables,
    activeSeats,
    occupiedSeats,
    serviceRequests,
    satisfactionRate
  };
};

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
export const getAnnouncements = (): Announcement[] => announcements;

// Authentication functions
export const authenticateUser = (username: string, password: string): User | null => {
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

export const authenticateGuest = (tableNumber: number, seatCode: string): User => {
  return createGuestUser(tableNumber, seatCode);
};

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

// Additional functions needed for the admin components
export const createAnnouncement = (data: { text: string, targetTables: number[] | null }): Announcement => {
  const announcement: Announcement = {
    id: uuidv4(),
    text: data.text,
    targetTables: data.targetTables,
    timestamp: new Date().toISOString()
  };
  announcements.push(announcement);
  return announcement;
};

export const updateTable = (tableId: number, data: Partial<Table>): Table | undefined => {
  const tableIndex = tables.findIndex(t => t.id === tableId);
  if (tableIndex !== -1) {
    tables[tableIndex] = { ...tables[tableIndex], ...data };
    return tables[tableIndex];
  }
  return undefined;
};

export const updateTableSeat = (tableId: number, seatCode: string, data: Partial<Seat>): Seat | undefined => {
  const seat = seats.find(s => s.tableId === tableId && s.code === seatCode);
  if (seat) {
    Object.assign(seat, data);
    return seat;
  }
  return undefined;
};

export const createResponse = (data: Omit<Response, 'id' | 'createdAt' | 'timestamp'>): Response => {
  const response: Response = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };
  responses.push(response);
  return response;
};

export const deleteResponse = (responseId: string): boolean => {
  const index = responses.findIndex(r => r.id === responseId);
  if (index !== -1) {
    responses.splice(index, 1);
    return true;
  }
  return false;
};

export const createUser = (userData: Omit<User, 'id'>): User => {
  const user: User = {
    id: uuidv4(),
    ...userData,
    lastActive: new Date().toISOString()
  };
  users.push(user);
  return user;
};

export const updateUser = (userId: string, data: Partial<User>): User | undefined => {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...data };
    return users[userIndex];
  }
  return undefined;
};

export const deleteUser = (userId: string): boolean => {
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users.splice(index, 1);
    return true;
  }
  return false;
};
