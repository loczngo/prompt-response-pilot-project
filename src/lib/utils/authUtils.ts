
import { User } from '@/types/models';
import { users } from '../mockData';

export const authenticateUser = (username: string, password: string): User | null => {
  console.log('Attempting to authenticate:', username);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    console.log('User authenticated:', user);
  } else {
    console.log('Authentication failed');
  }
  return user || null;
};

export const authenticateGuest = (tableNumber: number, seatCode: string): User => {
  console.log('Creating guest user for table:', tableNumber, 'seat:', seatCode);
  const guestUser = createGuestUser(tableNumber, seatCode);
  console.log('Guest user created:', guestUser);
  return guestUser;
};

export const createGuestUser = (tableNumber: number, seatCode: string): User => {
  return {
    id: `guest-${Date.now()}`,
    firstName: 'Guest',
    lastName: `${tableNumber}-${seatCode}`,
    email: '',
    role: 'guest',
    tableNumber: tableNumber,
    seatCode: seatCode
  };
};
