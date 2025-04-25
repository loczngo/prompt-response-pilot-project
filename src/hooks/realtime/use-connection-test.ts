
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/mockDb';

export const testDatabaseConnection = async (user: User | null) => {
  if (!user || user.role === 'guest') {
    console.log('Skipping connection test for guest user');
    return true;
  }

  try {
    console.log('Testing database connection...');
    
    // Try to fetch a simple count that typically requires minimal permissions
    const { error: testError } = await supabase
      .from('announcements')
      .select('count(*)')
      .limit(1)
      .single();
      
    if (testError) {
      console.warn('Database connection test error:', testError);
      
      // If it's a permission error, we can still consider the connection as working
      // The issue would be with Row Level Security, not the connection itself
      if (testError.code === 'PGRST301' || testError.code === '42501' || 
          testError.message.includes('permission denied') || testError.message.includes('JWT')) {
        console.log('Permission error detected, but connection is working');
        return true;
      }
      
      throw testError;
    }
    
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Error in connection test:', error);
    // We'll still return true for certain errors that indicate the connection itself is working
    // but there might be permission issues
    if (error instanceof Error && 
       (error.message.includes('permission denied') || error.message.includes('JWT'))) {
      return true;
    }
    return false;
  }
};
