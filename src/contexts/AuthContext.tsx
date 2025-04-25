
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, getUsers } from '@/lib/mockDb';

// Define required functions for authentication
const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

const authenticateGuest = (tableNumber: number, seatCode: string): User | null => {
  // Simple function to create a guest user
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;  // Added isLoading property
  login: (username: string, password: string) => Promise<User | null>;
  loginAdmin: (username: string, password: string) => Promise<User | null>;
  loginGuest: (tableNumber: number, seatCode: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Added loading state

  const login = async (username: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const user = authenticateUser(username, password);
      if (user) {
        setUser(user);
        return user;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (username: string, password: string): Promise<User | null> => {
    return login(username, password);
  };

  const loginGuest = async (tableNumber: number, seatCode: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const guestUser = authenticateGuest(tableNumber, seatCode);
      if (guestUser) {
        setUser(guestUser);
        return guestUser;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    loginAdmin,
    loginGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
