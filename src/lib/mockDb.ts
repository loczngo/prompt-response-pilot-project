
// Mock database implementation using localStorage

// Define types for our data model
export type Role = 'super-admin' | 'user-admin' | 'table-admin' | 'guest';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  password?: string;
  role: Role;
  tableNumber?: number;
  seatCode?: string;
  isDealer?: boolean;
  status: 'active' | 'inactive';
  lastActive: string;
}

export interface Prompt {
  id: string;
  text: string;
  targetTable: number | null; // null means all tables
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Response {
  id: string;
  userId: string;
  promptId: string;
  tableNumber: number;
  seatCode: string;
  answer: 'YES' | 'NO' | 'SERVICE';
  timestamp: string;
}

export interface Table {
  id: number;
  status: 'active' | 'inactive';
  seats: Seat[];
  currentPromptId?: string;
}

export interface Seat {
  code: string;
  userId?: string;
  status: 'active' | 'inactive';
  isDealer: boolean;
  dealerHandsLeft?: number;
}

export interface Announcement {
  id: string;
  text: string;
  targetTables: number[] | null; // null means all tables
  timestamp: string;
}

// Initialize mock data if not exists
const initMockData = () => {
  // Check if data already exists
  if (!localStorage.getItem('prs_users')) {
    // Create admin users
    const users: User[] = [
      {
        id: '1',
        firstName: 'Super',
        lastName: 'Admin',
        username: 'super',
        password: 'super123',
        role: 'super-admin',
        status: 'active',
        lastActive: new Date().toISOString()
      },
      {
        id: '2',
        firstName: 'User',
        lastName: 'Admin',
        username: 'user',
        password: 'user123',
        role: 'user-admin',
        status: 'active',
        lastActive: new Date().toISOString()
      },
      {
        id: '3',
        firstName: 'Table',
        lastName: 'Admin',
        username: 'table',
        password: 'table123',
        role: 'table-admin',
        tableNumber: 1,
        status: 'active',
        lastActive: new Date().toISOString()
      }
    ];
    
    // Create sample prompts
    const prompts: Prompt[] = [
      {
        id: '1',
        text: 'Would you like to be the player-dealer for the next round?',
        targetTable: 1,
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        text: 'Are you satisfied with the service today?',
        targetTable: null,
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        text: 'Do you need a break?',
        targetTable: 1,
        status: 'inactive',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Create sample tables with seats
    const tables: Table[] = [
      {
        id: 1,
        status: 'active',
        seats: [
          { code: 'A', status: 'active', isDealer: false },
          { code: 'B', status: 'active', isDealer: false },
          { code: 'C', status: 'active', isDealer: false },
          { code: 'D', status: 'inactive', isDealer: false },
          { code: 'E', status: 'inactive', isDealer: false },
          { code: 'F', status: 'inactive', isDealer: false }
        ],
        currentPromptId: '1'
      },
      {
        id: 2,
        status: 'inactive',
        seats: [
          { code: 'A', status: 'inactive', isDealer: false },
          { code: 'B', status: 'inactive', isDealer: false },
          { code: 'C', status: 'inactive', isDealer: false },
          { code: 'D', status: 'inactive', isDealer: false }
        ]
      }
    ];
    
    // Create sample responses
    const responses: Response[] = [
      {
        id: '1',
        userId: '4', // Guest
        promptId: '1',
        tableNumber: 1,
        seatCode: 'A',
        answer: 'YES',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
      },
      {
        id: '2',
        userId: '5', // Guest
        promptId: '2',
        tableNumber: 1,
        seatCode: 'B',
        answer: 'NO',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
      }
    ];
    
    // Create sample announcements
    const announcements: Announcement[] = [
      {
        id: '1',
        text: 'Welcome to our new Prompt and Response System!',
        targetTables: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
      },
      {
        id: '2',
        text: 'Table 1 will close in 30 minutes.',
        targetTables: [1],
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      }
    ];
    
    // Save to localStorage
    localStorage.setItem('prs_users', JSON.stringify(users));
    localStorage.setItem('prs_prompts', JSON.stringify(prompts));
    localStorage.setItem('prs_tables', JSON.stringify(tables));
    localStorage.setItem('prs_responses', JSON.stringify(responses));
    localStorage.setItem('prs_announcements', JSON.stringify(announcements));
  }
};

// User operations
export const getUsers = (): User[] => {
  const users = localStorage.getItem('prs_users');
  return users ? JSON.parse(users) : [];
};

export const createUser = (user: Omit<User, 'id' | 'lastActive'>): User => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: Date.now().toString(),
    lastActive: new Date().toISOString()
  };
  localStorage.setItem('prs_users', JSON.stringify([...users, newUser]));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return null;
  
  const updatedUser = { ...users[userIndex], ...updates, lastActive: new Date().toISOString() };
  users[userIndex] = updatedUser;
  localStorage.setItem('prs_users', JSON.stringify(users));
  return updatedUser;
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== id);
  if (filteredUsers.length === users.length) return false;
  
  localStorage.setItem('prs_users', JSON.stringify(filteredUsers));
  return true;
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password && u.status === 'active');
  if (user) {
    updateUser(user.id, { lastActive: new Date().toISOString() });
    return user;
  }
  return null;
};

export const authenticateGuest = (name: string, tableNumber: number, seatCode: string): User => {
  const tables = getTables();
  const table = tables.find(t => t.id === tableNumber);
  
  if (!table || table.status !== 'active') {
    throw new Error('Invalid table number or table is inactive');
  }
  
  const seat = table.seats.find(s => s.code === seatCode);
  if (!seat || seat.status !== 'active' || seat.userId) {
    throw new Error('Invalid seat code, seat is occupied, or seat is inactive');
  }
  
  // Create a new guest user
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  const newUser = createUser({
    firstName,
    lastName,
    role: 'guest',
    tableNumber,
    seatCode,
    status: 'active'
  });
  
  // Assign user to seat
  updateTableSeat(tableNumber, seatCode, { userId: newUser.id });
  
  return newUser;
};

// Prompt operations
export const getPrompts = (): Prompt[] => {
  const prompts = localStorage.getItem('prs_prompts');
  return prompts ? JSON.parse(prompts) : [];
};

export const createPrompt = (prompt: Omit<Prompt, 'id' | 'createdAt'>): Prompt => {
  const prompts = getPrompts();
  const newPrompt = {
    ...prompt,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('prs_prompts', JSON.stringify([...prompts, newPrompt]));
  return newPrompt;
};

export const updatePrompt = (id: string, updates: Partial<Prompt>): Prompt | null => {
  const prompts = getPrompts();
  const promptIndex = prompts.findIndex(p => p.id === id);
  if (promptIndex === -1) return null;
  
  const updatedPrompt = { ...prompts[promptIndex], ...updates };
  prompts[promptIndex] = updatedPrompt;
  localStorage.setItem('prs_prompts', JSON.stringify(prompts));
  return updatedPrompt;
};

export const deletePrompt = (id: string): boolean => {
  const prompts = getPrompts();
  const filteredPrompts = prompts.filter(p => p.id !== id);
  if (filteredPrompts.length === prompts.length) return false;
  
  localStorage.setItem('prs_prompts', JSON.stringify(filteredPrompts));
  return true;
};

// Table operations
export const getTables = (): Table[] => {
  const tables = localStorage.getItem('prs_tables');
  return tables ? JSON.parse(tables) : [];
};

export const getTable = (id: number): Table | undefined => {
  const tables = getTables();
  return tables.find(t => t.id === id);
};

export const updateTable = (id: number, updates: Partial<Table>): Table | null => {
  const tables = getTables();
  const tableIndex = tables.findIndex(t => t.id === id);
  if (tableIndex === -1) return null;
  
  const updatedTable = { ...tables[tableIndex], ...updates };
  tables[tableIndex] = updatedTable;
  localStorage.setItem('prs_tables', JSON.stringify(tables));
  return updatedTable;
};

export const updateTableSeat = (
  tableId: number, 
  seatCode: string, 
  updates: Partial<Seat>
): Seat | null => {
  const tables = getTables();
  const tableIndex = tables.findIndex(t => t.id === tableId);
  if (tableIndex === -1) return null;
  
  const seatIndex = tables[tableIndex].seats.findIndex(s => s.code === seatCode);
  if (seatIndex === -1) return null;
  
  const updatedSeat = { ...tables[tableIndex].seats[seatIndex], ...updates };
  tables[tableIndex].seats[seatIndex] = updatedSeat;
  localStorage.setItem('prs_tables', JSON.stringify(tables));
  return updatedSeat;
};

// Response operations
export const getResponses = (): Response[] => {
  const responses = localStorage.getItem('prs_responses');
  return responses ? JSON.parse(responses) : [];
};

export const getResponsesByTable = (tableNumber: number): Response[] => {
  const responses = getResponses();
  return responses.filter(r => r.tableNumber === tableNumber);
};

export const createResponse = (response: Omit<Response, 'id' | 'timestamp'>): Response => {
  const responses = getResponses();
  const newResponse = {
    ...response,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('prs_responses', JSON.stringify([...responses, newResponse]));
  return newResponse;
};

export const deleteResponse = (id: string): boolean => {
  const responses = getResponses();
  const filteredResponses = responses.filter(r => r.id !== id);
  if (filteredResponses.length === responses.length) return false;
  
  localStorage.setItem('prs_responses', JSON.stringify(filteredResponses));
  return true;
};

// Announcement operations
export const getAnnouncements = (): Announcement[] => {
  const announcements = localStorage.getItem('prs_announcements');
  return announcements ? JSON.parse(announcements) : [];
};

export const getAnnouncementsForTable = (tableNumber: number): Announcement[] => {
  const announcements = getAnnouncements();
  return announcements.filter(a => a.targetTables === null || a.targetTables.includes(tableNumber));
};

export const createAnnouncement = (announcement: Omit<Announcement, 'id' | 'timestamp'>): Announcement => {
  const announcements = getAnnouncements();
  const newAnnouncement = {
    ...announcement,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('prs_announcements', JSON.stringify([...announcements, newAnnouncement]));
  return newAnnouncement;
};

// Stats and metrics
export const getStats = () => {
  const tables = getTables();
  const responses = getResponses();
  
  const activeTables = tables.filter(t => t.status === 'active').length;
  const totalSeats = tables.reduce((sum, table) => sum + table.seats.length, 0);
  const activeSeats = tables.reduce((sum, table) => 
    sum + table.seats.filter(seat => seat.status === 'active').length, 0);
  
  const serviceRequests = responses.filter(r => r.answer === 'SERVICE').length;
  
  // Calculate response rate (percentage of active seats that have responded)
  const uniqueResponders = new Set(responses.map(r => r.userId)).size;
  const responseRate = activeSeats > 0 ? (uniqueResponders / activeSeats) * 100 : 0;
  
  // Count yes/no answers for satisfaction calculation
  const yesResponses = responses.filter(r => r.answer === 'YES').length;
  const noResponses = responses.filter(r => r.answer === 'NO').length;
  const totalResponses = yesResponses + noResponses;
  const satisfactionRate = totalResponses > 0 ? (yesResponses / totalResponses) * 100 : 0;
  
  return {
    activeTables,
    totalSeats,
    activeSeats,
    occupiedSeats: uniqueResponders,
    serviceRequests,
    responseRate,
    satisfactionRate
  };
};

// Initialize mock data
initMockData();

// Export a function to reset the database (for testing)
export const resetDatabase = () => {
  localStorage.removeItem('prs_users');
  localStorage.removeItem('prs_prompts');
  localStorage.removeItem('prs_tables');
  localStorage.removeItem('prs_responses');
  localStorage.removeItem('prs_announcements');
  initMockData();
};
