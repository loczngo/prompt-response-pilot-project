
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  authenticateUser, 
  authenticateGuest,
  getUsers
} from '@/lib/mockDb';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginAdmin: (username: string, password: string) => Promise<void>;
  loginGuest: (name: string, tableNumber: number, seatCode: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved authentication in session storage
    const savedUser = sessionStorage.getItem('prs_auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const loginAdmin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First try the standard authentication
      let authenticatedUser = authenticateUser(username, password);
      
      // If standard authentication fails, check if this is a case-sensitivity issue
      if (!authenticatedUser) {
        const allUsers = getUsers();
        // Find user with case-insensitive username match and matching password
        const matchedUser = allUsers.find(u => 
          u.username?.toLowerCase() === username.toLowerCase() && 
          u.password === password && 
          u.status === 'active'
        );
        
        if (matchedUser) {
          authenticatedUser = matchedUser;
        }
      }
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        sessionStorage.setItem('prs_auth_user', JSON.stringify(authenticatedUser));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${authenticatedUser.firstName}!`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginGuest = async (name: string, tableNumber: number, seatCode: string) => {
    try {
      setIsLoading(true);
      const guestUser = authenticateGuest(name, tableNumber, seatCode);
      
      if (guestUser) {
        setUser(guestUser);
        sessionStorage.setItem('prs_auth_user', JSON.stringify(guestUser));
        toast({
          title: "Welcome",
          description: `You've been assigned to Table ${tableNumber}, Seat ${seatCode}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to join table",
        variant: "destructive",
      });
      console.error('Guest login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('prs_auth_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAdmin, loginGuest, logout }}>
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
