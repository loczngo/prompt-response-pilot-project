
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  authenticateUser, 
  authenticateGuest,
  getUsers
} from '@/lib/mockDb';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginAdmin: (username: string, password: string) => Promise<void>;
  loginGuest: (name: string, tableNumber: number, seatCode: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved authentication in session storage
    const savedUser = sessionStorage.getItem('prs_auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        sessionStorage.removeItem('prs_auth_user');
      }
    }
    
    // Check for Supabase auth session
    const checkSupabaseSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If we have a Supabase session but no local user, create one
        if (!savedUser) {
          const supabaseUser = data.session.user;
          const guestUser: User = {
            id: supabaseUser.id,
            firstName: supabaseUser.user_metadata.first_name || supabaseUser.user_metadata.username,
            username: supabaseUser.user_metadata.username,
            role: 'guest',
            status: 'active'
          };
          setUser(guestUser);
          sessionStorage.setItem('prs_auth_user', JSON.stringify(guestUser));
        }
      }
    };
    
    checkSupabaseSession();
    setIsLoading(false);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const supabaseUser = session.user;
          const guestUser: User = {
            id: supabaseUser.id,
            firstName: supabaseUser.user_metadata.first_name || supabaseUser.user_metadata.username,
            username: supabaseUser.user_metadata.username,
            role: 'guest',
            status: 'active'
          };
          setUser(guestUser);
          sessionStorage.setItem('prs_auth_user', JSON.stringify(guestUser));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          sessionStorage.removeItem('prs_auth_user');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      sessionStorage.removeItem('prs_auth_user');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "Failed to log out properly",
        variant: "destructive",
      });
    }
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
