
import { v4 as uuidv4 } from 'uuid';
import { Prompt, Response, User, Seat, Table, Announcement } from '@/types/models';
import { users, prompts, responses, seats, tables, announcements } from '../mockData';

// Table operations
export const getTables = () => tables;
export const getTable = (tableId: number) => tables.find(table => table.id === tableId);
export const updateTable = (tableId: number, data: Partial<Table>) => {
  const tableIndex = tables.findIndex(t => t.id === tableId);
  if (tableIndex !== -1) {
    tables[tableIndex] = { ...tables[tableIndex], ...data };
    return tables[tableIndex];
  }
  return undefined;
};

// Seat operations
export const getSeatByCode = (tableId: number, seatCode: string) => 
  seats.find(seat => seat.tableId === tableId && seat.code === seatCode);
export const updateTableSeat = (tableId: number, seatCode: string, data: Partial<Seat>) => {
  const seat = seats.find(s => s.tableId === tableId && s.code === seatCode);
  if (seat) {
    Object.assign(seat, data);
    return seat;
  }
  return undefined;
};

// Prompt operations
export const getPrompts = () => prompts;
export const getPrompt = (promptId: string) => prompts.find(prompt => prompt.id === promptId);
export const addPrompt = (text: string, targetTable: number | null): Prompt => {
  const newPrompt: Prompt = {
    id: uuidv4(),
    text,
    targetTable,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  prompts.push(newPrompt);
  return newPrompt;
};
export const updatePromptStatus = (promptId: string, status: 'active' | 'inactive') => {
  const prompt = prompts.find(p => p.id === promptId);
  if (prompt) {
    prompt.status = status;
  }
};

// Response operations
export const getResponses = () => responses;
export const getResponsesByTable = (tableId: number) => 
  responses.filter(response => response.tableId === tableId);
export const addResponse = (promptId: string, tableNumber: number, seatCode: string, responseValue: 'YES' | 'NO' | 'SERVICE'): Response => {
  const newResponse: Response = {
    id: uuidv4(),
    promptId,
    tableId: tableNumber,
    tableNumber,
    seatCode,
    response: responseValue,
    answer: responseValue,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };
  responses.push(newResponse);
  return newResponse;
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

// User operations
export const getUsers = () => users;
export const createUser = (userData: Omit<User, 'id' | 'lastActive'>): User => {
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

// Announcement operations
export const getAnnouncements = () => announcements;
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
