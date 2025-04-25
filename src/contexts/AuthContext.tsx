
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, getUsers } from '@/lib/mockDb';
import { Role } from '@/lib/mockDb';
import { useToast } from '@/hooks/use-toast';
import { authenticateUser, authenticateGuest } from '@/lib/mockDb';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  guestLogin: (tableNumber: string, seatCode: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('prs_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, using mock authenticateUser function
      const user = await authenticateUser(username, password);
      
      if (user && user.status !== 'inactive') {
        setUser(user);
        localStorage.setItem('prs_current_user', JSON.stringify(user));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.firstName}!`,
        });
        setIsLoading(false);
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "There was a problem logging in.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };
  
  const guestLogin = async (tableNumber: string, seatCode: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, using mock authenticateGuest function
      const user = await authenticateGuest(parseInt(tableNumber), seatCode);
      
      if (user) {
        setUser(user);
        localStorage.setItem('prs_current_user', JSON.stringify(user));
        toast({
          title: "Login Successful",
          description: `Welcome, ${user.firstName}!`,
        });
        setIsLoading(false);
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid table number or seat code.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Guest login error:', error);
      toast({
        title: "Login Error",
        description: "There was a problem logging in.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prs_current_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      guestLogin, 
      logout, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
