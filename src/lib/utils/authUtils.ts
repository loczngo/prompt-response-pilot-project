
import { User } from '@/types/models';
import { users } from '../mockData';

export const authenticateUser = (username: string, password: string): User | null => {
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

export const authenticateGuest = (tableNumber: number, seatCode: string): User => {
  return createGuestUser(tableNumber, seatCode);
};

export const createGuestUser = (tableNumber: number, seatCode: string): User => {
  return {
    id: `guest-${Date.now()}`,
    firstName: 'Guest',
    lastName: `${tableNumber}-${seatCode}`,
    email: '',
    role: 'guest'
  };
};
