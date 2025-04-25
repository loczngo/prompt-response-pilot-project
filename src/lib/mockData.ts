
import { User, Seat, Prompt, Response, Table, Announcement } from '@/types/models';

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
    code: 'A',
    status: 'available',
    userId: undefined,
    isDealer: false,
    dealerHandsLeft: 0
  },
  {
    id: 2,
    tableId: 1,
    code: 'B',
    status: 'occupied',
    userId: 'user-3',
    isDealer: false,
    dealerHandsLeft: 0
  },
  {
    id: 3,
    tableId: 2,
    code: 'A',
    status: 'available',
    userId: undefined,
    isDealer: false,
    dealerHandsLeft: 0
  },
  {
    id: 4,
    tableId: 2,
    code: 'B',
    status: 'unavailable',
    userId: undefined,
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
    seatCode: 'A',
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
    seatCode: 'B',
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
    seatCode: 'A',
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
    seats: [],
    currentPromptId: 'prompt-1'
  },
  {
    id: 2,
    status: 'inactive',
    name: 'Table 2',
    seats: [],
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
