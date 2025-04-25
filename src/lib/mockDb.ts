export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  tableNumber?: number;
  seatCode?: string;
  username?: string;
  password?: string;
  status?: 'active' | 'inactive';
  lastActive?: string;
}

export type Role = 'super-admin' | 'table-admin' | 'guest' | 'user-admin';

export interface Seat {
  code: string;
  status: 'active' | 'inactive';
  userId?: string;
  isDealer?: boolean;
  dealerHandsLeft?: number;
}

export interface Table {
  id: number;
  status: 'active' | 'inactive';
  seats: Seat[];
  currentPromptId?: string;
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
  tableId: number;
  tableNumber: number;
  seatCode: string;
  userId?: string;
  promptId?: string;
  answer: 'YES' | 'NO' | 'SERVICE';
  response: 'YES' | 'NO' | 'SERVICE';
  createdAt: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  text: string;
  targetTables: number[] | null;
  timestamp: string;
}

const initialUsers: User[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', role: 'super-admin' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', role: 'table-admin', tableNumber: 1 },
  { id: '3', firstName: 'Alice', lastName: 'Johnson', role: 'guest', tableNumber: 1, seatCode: 'A' },
  { id: '4', firstName: 'Bob', lastName: 'Williams', role: 'guest', tableNumber: 1, seatCode: 'B' },
  { id: '5', firstName: 'Charlie', lastName: 'Brown', role: 'guest', tableNumber: 2, seatCode: 'A' },
  { id: '6', firstName: 'Diana', lastName: 'Miller', role: 'guest', tableNumber: 2, seatCode: 'B' },
  { id: '7', firstName: 'Eve', lastName: 'Davis', role: 'guest', tableNumber: 3, seatCode: 'A' },
  { id: '8', firstName: 'Frank', lastName: 'Garcia', role: 'guest', tableNumber: 3, seatCode: 'B' },
  { id: '9', firstName: 'Grace', lastName: 'Rodriguez', role: 'guest', tableNumber: 4, seatCode: 'A' },
  { id: '10', firstName: 'Henry', lastName: 'Wilson', role: 'guest', tableNumber: 4, seatCode: 'B' },
  { id: '11', firstName: 'Ivy', lastName: 'Martinez', role: 'guest', tableNumber: 5, seatCode: 'A' },
  { id: '12', firstName: 'Jack', lastName: 'Anderson', role: 'guest', tableNumber: 5, seatCode: 'B' },
  { id: '13', firstName: 'Karen', lastName: 'Thomas', role: 'guest', tableNumber: 6, seatCode: 'A' },
  { id: '14', firstName: 'Liam', lastName: 'Jackson', role: 'guest', tableNumber: 6, seatCode: 'B' },
  { id: '15', firstName: 'Mia', lastName: 'White', role: 'guest', tableNumber: 7, seatCode: 'A' },
  { id: '16', firstName: 'Noah', lastName: 'Harris', role: 'guest', tableNumber: 7, seatCode: 'B' },
  { id: '17', firstName: 'Olivia', lastName: 'Martin', role: 'guest', tableNumber: 8, seatCode: 'A' },
  { id: '18', firstName: 'Peter', lastName: 'Thompson', role: 'guest', tableNumber: 8, seatCode: 'B' },
  { id: '19', firstName: 'Quinn', lastName: 'Perez', role: 'guest', tableNumber: 9, seatCode: 'A' },
  { id: '20', firstName: 'Ryan', lastName: 'Hall', role: 'guest', tableNumber: 9, seatCode: 'B' },
  { id: '21', firstName: 'Sofia', lastName: 'Wright', role: 'guest', tableNumber: 10, seatCode: 'A' },
  { id: '22', firstName: 'Tom', lastName: 'Lee', role: 'guest', tableNumber: 10, seatCode: 'B' },
  { id: '23', firstName: 'Uma', lastName: 'Clark', role: 'guest', tableNumber: 11, seatCode: 'A' },
  { id: '24', firstName: 'Victor', lastName: 'Lewis', role: 'guest', tableNumber: 11, seatCode: 'B' },
  { id: '25', firstName: 'Wendy', lastName: 'Robinson', role: 'guest', tableNumber: 12, seatCode: 'A' },
  { id: '26', firstName: 'Xander', lastName: 'Walker', role: 'guest', tableNumber: 12, seatCode: 'B' },
];

const initialTables: Table[] = [
  {
    id: 1,
    status: 'active',
    seats: [
      { code: 'A', status: 'active', userId: '3' },
      { code: 'B', status: 'active', userId: '4' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
    currentPromptId: '1'
  },
  {
    id: 2,
    status: 'active',
    seats: [
      { code: 'A', status: 'active', userId: '5' },
      { code: 'B', status: 'active', userId: '6' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
    currentPromptId: '2'
  },
  {
    id: 3,
    status: 'inactive',
    seats: [
      { code: 'A', status: 'active', userId: '7' },
      { code: 'B', status: 'active', userId: '8' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 4,
    status: 'active',
    seats: [
      { code: 'A', status: 'active', userId: '9' },
      { code: 'B', status: 'active', userId: '10' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 5,
    status: 'active',
    seats: [
      { code: 'A', status: 'active', userId: '11' },
      { code: 'B', status: 'active', userId: '12' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 6,
    status: 'inactive',
    seats: [
      { code: 'A', status: 'active', userId: '13' },
      { code: 'B', status: 'active', userId: '14' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 7,
    status: 'active',
    seats: [
      { code: 'A', status: 'active', userId: '15' },
      { code: 'B', status: 'active', userId: '16' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 8,
    status: 'active',
    seats: [
      { code: 'A', status: 'active', userId: '17' },
      { code: 'B', status: 'active', userId: '18' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 9,
    status: 'inactive',
    seats: [
      { code: 'A', status: 'active', userId: '19' },
      { code: 'B', status: 'active', userId: '20' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 10,
    status: 'active',
    seats: [
      { code: 'A', status: 'active', userId: '21' },
      { code: 'B', status: 'active', userId: '22' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 11,
    status: 'active',
    seats: [
      { code: 'A', status: 'active', userId: '23' },
      { code: 'B', status: 'active', userId: '24' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
  {
    id: 12,
    status: 'inactive',
    seats: [
      { code: 'A', status: 'active', userId: '25' },
      { code: 'B', status: 'active', userId: '26' },
      { code: 'C', status: 'inactive' },
      { code: 'D', status: 'inactive' },
      { code: 'E', status: 'inactive' },
      { code: 'F', status: 'inactive' },
    ],
  },
];

const initialPrompts: Prompt[] = [
  {
    id: '1',
    text: 'Would you like a drink?',
    targetTable: null,
    status: 'active',
  },
  {
    id: '2',
    text: 'Are you enjoying the game?',
    targetTable: null,
    status: 'active',
  },
  {
    id: '3',
    text: 'Do you need assistance?',
    targetTable: 1,
    status: 'active',
  },
];

const initialResponses: Response[] = [
  {
    id: '1',
    tableId: 1,
    seatCode: 'A',
    response: 'YES',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    tableId: 1,
    seatCode: 'B',
    response: 'NO',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    tableId: 2,
    seatCode: 'A',
    response: 'SERVICE',
    createdAt: new Date().toISOString(),
  },
];

export const getTables = (): Table[] => {
  const storedTables = localStorage.getItem('prs_tables');
  return storedTables ? JSON.parse(storedTables) : initialTables;
};

export const getTable = (id: number): Table | undefined => {
  const tables = getTables();
  return tables.find((table) => table.id === id);
};

export const updateTable = (id: number, updates: Partial<Table>): void => {
  const tables = getTables();
  const updatedTables = tables.map((table) => (table.id === id ? { ...table, ...updates } : table));
  localStorage.setItem('prs_tables', JSON.stringify(updatedTables));
};

export const updateTableSeat = (tableId: number, seatCode: string, updates: Partial<Seat>): void => {
  const tables = getTables();
  const updatedTables = tables.map((table) => {
    if (table.id === tableId) {
      const updatedSeats = table.seats.map((seat) => (seat.code === seatCode ? { ...seat, ...updates } : seat));
      return { ...table, seats: updatedSeats };
    }
    return table;
  });
  localStorage.setItem('prs_tables', JSON.stringify(updatedTables));
};

export const getPrompts = (): Prompt[] => {
  const storedPrompts = localStorage.getItem('prs_prompts');
  return storedPrompts ? JSON.parse(storedPrompts) : initialPrompts;
};

export const createPrompt = (prompt: Omit<Prompt, 'id'>): void => {
  const prompts = getPrompts();
  const newPrompt = { ...prompt, id: generateId() };
  localStorage.setItem('prs_prompts', JSON.stringify([...prompts, newPrompt]));
};

export const updatePrompt = (id: string, updates: Partial<Prompt>): void => {
  const prompts = getPrompts();
  const updatedPrompts = prompts.map((prompt) => (prompt.id === id ? { ...prompt, ...updates } : prompt));
  localStorage.setItem('prs_prompts', JSON.stringify(updatedPrompts));
};

export const deletePrompt = (id: string): void => {
  const prompts = getPrompts();
  const updatedPrompts = prompts.filter((prompt) => prompt.id !== id);
  localStorage.setItem('prs_prompts', JSON.stringify(updatedPrompts));
};

export const getResponses = (): Response[] => {
  const storedResponses = localStorage.getItem('prs_responses');
  return storedResponses ? JSON.parse(storedResponses) : initialResponses;
};

export const createResponse = (response: Omit<Response, 'id'>): void => {
  const responses = getResponses();
  const newResponse = { ...response, id: generateId() };
  localStorage.setItem('prs_responses', JSON.stringify([...responses, newResponse]));
};

export const deleteResponse = (id: string): void => {
  const responses = getResponses();
  const updatedResponses = responses.filter((response) => response.id !== id);
  localStorage.setItem('prs_responses', JSON.stringify(updatedResponses));
};

export const getUsers = (): User[] => {
  const storedUsers = localStorage.getItem('prs_users');
  return storedUsers ? JSON.parse(storedUsers) : initialUsers;
};

export const getStats = () => {
  const tables = getTables();
  const activeTables = tables.filter(t => t.status === 'active').length;
  
  let activeSeats = 0;
  let occupiedSeats = 0;
  let serviceRequests = 0;
  const responses = getResponses();
  
  tables.forEach(table => {
    const tableActiveSeats = table.seats.filter(s => s.status === 'active').length;
    activeSeats += tableActiveSeats;
    
    const tableOccupiedSeats = table.seats.filter(s => s.status === 'active' && s.userId).length;
    occupiedSeats += tableOccupiedSeats;
  });
  
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  serviceRequests = responses.filter(r => 
    r.response === 'SERVICE' && 
    new Date(r.timestamp) > oneDayAgo
  ).length;
  
  return {
    activeTables,
    activeSeats,
    occupiedSeats,
    serviceRequests,
    satisfactionRate: 85,
  };
};

export const getAnnouncements = (): Announcement[] => {
  const storedAnnouncements = localStorage.getItem('prs_announcements');
  return storedAnnouncements ? JSON.parse(storedAnnouncements) : [
    {
      id: '1',
      text: 'Welcome to the Prompt and Response System demo!',
      targetTables: null,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      text: 'New Player-Dealer rotation will begin in 15 minutes.',
      targetTables: [1],
      timestamp: new Date(Date.now() - 300000).toISOString()
    }
  ];
};

export const createAnnouncement = (announcement: Omit<Announcement, 'id' | 'timestamp'>): void => {
  const announcements = getAnnouncements();
  const newAnnouncement = { 
    ...announcement, 
    id: generateId(), 
    timestamp: new Date().toISOString() 
  };
  localStorage.setItem('prs_announcements', JSON.stringify([...announcements, newAnnouncement]));
};

export const createUser = (userData: Partial<User>): User => {
  const users = getUsers();
  const newUser: User = {
    id: generateId(),
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    role: userData.role || 'guest',
    tableNumber: userData.tableNumber,
    seatCode: userData.seatCode,
    username: userData.username,
    password: userData.password,
    status: userData.status || 'active',
    lastActive: new Date().toISOString()
  };
  
  localStorage.setItem('prs_users', JSON.stringify([...users, newUser]));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): void => {
  const users = getUsers();
  const updatedUsers = users.map(user => 
    user.id === id ? { ...user, ...updates } : user
  );
  localStorage.setItem('prs_users', JSON.stringify(updatedUsers));
};

export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  localStorage.setItem('prs_users', JSON.stringify(filteredUsers));
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => 
    u.username === username && 
    u.password === password &&
    u.role !== 'guest'
  );
  
  if (user) {
    updateUser(user.id, { lastActive: new Date().toISOString() });
    return user;
  }
  
  return null;
};

export const authenticateGuest = (tableNumber: number, seatCode: string): User | null => {
  const users = getUsers();
  const user = users.find(u => 
    u.tableNumber === tableNumber && 
    u.seatCode === seatCode &&
    u.role === 'guest'
  );
  
  if (user) {
    updateUser(user.id, { lastActive: new Date().toISOString() });
    return user;
  }
  
  return null;
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
